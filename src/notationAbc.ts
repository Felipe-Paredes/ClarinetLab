import { eventTicks, isRest, TICKS_PER_BEAT, type KeyName, type NoteEvent, type Passage } from './types';

const SIGNATURES: Record<KeyName, Record<string, number>> = {
  C: {}, G: {F:1}, D:{F:1,C:1}, A:{F:1,C:1,G:1}, E:{F:1,C:1,G:1,D:1},
  B:{F:1,C:1,G:1,D:1,A:1}, 'F#':{F:1,C:1,G:1,D:1,A:1,E:1},
  F:{B:-1}, Bb:{B:-1,E:-1}, Eb:{B:-1,E:-1,A:-1}, Ab:{B:-1,E:-1,A:-1,D:-1},
  Db:{B:-1,E:-1,A:-1,D:-1,G:-1}, Gb:{B:-1,E:-1,A:-1,D:-1,G:-1,C:-1},
};
const NATURALS: Record<string, number> = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pitch(midi: number, key: KeyName, state: Map<string, number>): string {
  if (!Number.isInteger(midi) || midi < 0 || midi > 127) throw new Error('Invalid written MIDI pitch.');
  const signature = SIGNATURES[key];
  if (!signature) throw new Error('Unknown key signature.');
  let letter = Object.keys(NATURALS).find(name => (NATURALS[name] + (signature[name] ?? 0) + 12) % 12 === midi % 12);
  let accidental = letter ? signature[letter] ?? 0 : 0;
  let prefix = '';
  if (!letter) {
    // Explicit accidentals also reset accidental state for following notes in the bar.
    const flatKey = Object.values(signature).some(value => value < 0);
    const spellings = flatKey ? ['C','D','D','E','E','F','G','G','A','A','B','B'] : ['C','C','D','D','E','F','F','G','G','A','A','B'];
    letter = spellings[midi % 12];
    accidental = midi % 12 - NATURALS[letter];
    prefix = accidental > 0 ? '^' : accidental < 0 ? '_' : '=';
  }

  const octave = Math.floor((midi - accidental) / 12) - 1;
  const stateKey = letter + octave;
  const previous = state.get(stateKey) ?? signature[letter] ?? 0;
  prefix = accidental === previous ? '' : accidental > 0 ? '^' : accidental < 0 ? '_' : '=';
  state.set(stateKey, accidental);
  return prefix + (octave >= 5 ? letter.toLowerCase() + "'".repeat(octave - 5) : letter + ','.repeat(4 - octave));
}
function length(ticks: number): string {
  const eighths = ticks / (TICKS_PER_BEAT / 2);
  return Number.isInteger(eighths) ? String(eighths) : String(eighths * 4) + '/4';
}
const decorations: Partial<Record<NonNullable<NoteEvent['articulation']>, string>> = {
  staccato: '.', tenuto: '!tenuto!', accent: '!accent!', marcato: '!marcato!',
};

/** Serialize written pitch only. Audio applies instrument transposition separately. */
export function passageToAbc(passage: Passage, barsPerLine = 4): string {
  const { options, bars } = passage;
  const lines: string[] = [];
  let hairpin: 'crescendo' | 'diminuendo' | undefined;
  const encoded = bars.map(bar => {
    let elapsed = 0;
    const accidentals = new Map<string, number>();
    return bar.map((note, index) => {
      const ticks = eventTicks(note);
      const previous = bar[index - 1];
      const beam = previous && eventTicks(previous) < TICKS_PER_BEAT && ticks < TICKS_PER_BEAT
        && !isRest(previous) && !isRest(note) && elapsed % TICKS_PER_BEAT !== 0
        && Math.floor((elapsed - eventTicks(previous)) / TICKS_PER_BEAT) === Math.floor(elapsed / TICKS_PER_BEAT);
      let marks = '';
      if (note.hairpinEnd && hairpin) { marks += '!' + hairpin + ')!'; hairpin = undefined; }
      if (note.dynamic) marks += '!' + note.dynamic + '!';
      if (note.hairpinStart) { hairpin = note.hairpinStart; marks += '!' + hairpin + '(!'; }
      if (!isRest(note)) marks += decorations[note.articulation ?? 'unmarked'] ?? '';
      if (note.slurStart) marks += '(';
      const wholeBarRest = isRest(note) && bar.length === 1 && ticks === options.meter * TICKS_PER_BEAT;
      const body = wholeBarRest ? 'Z' : (isRest(note) ? 'z' : pitch(note.midi, options.key, accidentals)) + length(ticks);
      elapsed += ticks;
      return (index === 0 || beam ? '' : ' ') + marks + body + (note.tieToNext ? '-' : '') + (note.slurEnd ? ')' : '');
    }).join('');
  });
  const count = Math.max(1, Math.floor(barsPerLine));
  for (let index = 0; index < encoded.length; index += count) {
    lines.push(encoded.slice(index, index + count).join(' | ') + (index + count >= encoded.length ? ' |]' : ' |'));
  }
  return ['X:1', 'T:Daily clarinet study', `M:${options.meter}/4`, 'L:1/8', `Q:1/4=${options.tempo}`, '%%stretchlast 1', `K:${options.key} clef=treble`, ...lines].join('\n');
}


