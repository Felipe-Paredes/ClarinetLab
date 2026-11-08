import type { ExerciseOptions, KeyName, Passage } from './types';

const KEYS: Record<KeyName, { tonic: number; names: string[] }> = {
  C: { tonic: 0, names: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  G: { tonic: 7, names: ['G', 'A', 'B', 'C', 'D', 'E', 'F'] },
  D: { tonic: 2, names: ['D', 'E', 'F', 'G', 'A', 'B', 'C'] },
  F: { tonic: 5, names: ['F', 'G', 'A', 'B', 'C', 'D', 'E'] },
  Bb: { tonic: 10, names: ['B', 'C', 'D', 'E', 'F', 'G', 'A'] },
};
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** Mulberry32: identical seeds reproduce the complete exercise. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let n = Math.imul(state ^ (state >>> 15), 1 | state);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePassage(options: ExerciseOptions, random = Math.random): Passage {
  if (!(options.key in KEYS) || ![3, 4].includes(options.meter) || !Number.isInteger(options.measures) || options.measures < 1 || options.measures > 32 || !Number.isFinite(options.tempo) || options.tempo < 30 || options.tempo > 240 || !['beginner', 'intermediate'].includes(options.difficulty)) {
    throw new Error('Invalid exercise settings.');
  }
  const tonic = KEYS[options.key].tonic;
  const pitches = Array.from({ length: 37 }, (_, i) => i + 48)
    .filter(midi => midi >= 52 && MAJOR.includes((midi - tonic + 12) % 12));
  // Beginner passages remain in the comfortable written G3–G5 register.
  const scale = options.difficulty === 'beginner' ? pitches.filter(n => n >= 55 && n <= 79) : pitches;
  const pick = (length: number) => Math.min(length - 1, Math.max(0, Math.floor(random() * length)));
  let position = scale.findIndex(n => n >= 60 && n % 12 === tonic);
  const bars: Passage['bars'] = [];
  for (let bar = 0; bar < options.measures; bar++) {
    let remaining = options.meter;
    const notes: Passage['bars'][number] = [];
    while (remaining > 0) {
      const durations = (options.difficulty === 'beginner' ? [1, 1, 2] : [0.5, 0.5, 1, 1, 2]).filter(n => n <= remaining);
      let beats = durations[pick(durations.length)];
      if (bar === options.measures - 1 && remaining <= 2) {
        // Settle the phrase on the nearest tonic with a sustained final note.
        const tonicPositions = scale.map((n, i) => n % 12 === tonic ? i : -1).filter(i => i >= 0);
        position = tonicPositions.reduce((best, i) => Math.abs(i - position) < Math.abs(best - position) ? i : best);
        beats = remaining;
      } else if (bar !== 0 || notes.length !== 0) {
        const steps = options.difficulty === 'beginner' ? [-1, 0, 1] : [-2, -1, -1, 0, 1, 1, 2];
        position = Math.max(0, Math.min(scale.length - 1, position + steps[pick(steps.length)]));
      }
      notes.push({ midi: scale[position], beats });
      remaining -= beats;
    }
    bars.push(notes);
  }
  return { options: { ...options }, bars };
}

function abcPitch(midi: number, key: KeyName): string {
  if (midi === -1) return 'z';
  const degree = MAJOR.indexOf((midi - KEYS[key].tonic + 12) % 12);
  if (degree < 0) throw new Error('Pitch is outside the selected major key.');
  const name = KEYS[key].names[degree];
  const octave = Math.floor(midi / 12) - 1;
  return octave >= 5 ? name.toLowerCase() + "'".repeat(octave - 5) : name + ','.repeat(4 - octave);
}

export function passageToAbc(passage: Passage): string {
  const { options, bars } = passage;
  const lines: string[] = [];
  const serializeBar = (bar: Passage['bars'][number]): string => {
    let elapsed = 0;
    return bar.map((note, index) => {
      const previous = bar[index - 1];
      // Adjacent eighths share a beam only within the same quarter-note beat.
      const beam = previous && previous.beats === 0.5 && note.beats === 0.5
        && previous.midi !== -1 && note.midi !== -1 && elapsed % 1 !== 0;
      const separator = index === 0 || beam ? '' : ' ';
      elapsed += note.beats;
      return `${separator}${abcPitch(note.midi, options.key)}${note.beats * 2}`;
    }).join('');
  };
  for (let i = 0; i < bars.length; i += 4) {
    lines.push(bars.slice(i, i + 4).map(serializeBar).join(' | ') + (i + 4 >= bars.length ? ' |]' : ' |'));
  }
  return ['X:1', 'T:Daily clarinet study', `M:${options.meter}/4`, 'L:1/8', `Q:1/4=${options.tempo}`, '%%stretchlast 1', `K:${options.key} clef=treble`, ...lines].join('\n');
}
