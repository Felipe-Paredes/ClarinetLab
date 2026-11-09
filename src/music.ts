import { TICKS_PER_BEAT, type Difficulty, type ExerciseOptions, type KeyName, type NoteEvent, type Passage, type Dynamic } from './types';
export { passageToAbc } from './notationAbc';
const TONICS: Record<KeyName, number> = { C: 0, G: 7, D: 2, A: 9, E: 4, B: 11, 'F#': 6, F: 5, Bb: 10, Eb: 3, Ab: 8, Db: 1, Gb: 6 };
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
export const DIFFICULTY_RULES: Record<Difficulty, { low: number; high: number; step: number; rhythm: number }> = {
  beginner: { low: 55, high: 74, step: 1, rhythm: 0 },
  intermediate: { low: 52, high: 79, step: 2, rhythm: 1 },
  advanced: { low: 52, high: 84, step: 4, rhythm: 2 },
  expert: { low: 52, high: 91, step: 7, rhythm: 3 },
};
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => { state = (state + 0x6D2B79F5) | 0; let n = Math.imul(state ^ (state >>> 15), 1 | state); n ^= n + Math.imul(n ^ (n >>> 7), 61 | n); return ((n ^ (n >>> 14)) >>> 0) / 4294967296; };
}

export function generatePassage(options: ExerciseOptions, random = Math.random): Passage {
  if (!Object.hasOwn(TONICS, options.key) || !Object.hasOwn(DIFFICULTY_RULES, options.difficulty) || ![3, 4].includes(options.meter)
    || !Number.isInteger(options.measures) || options.measures < 1 || options.measures > 128 || !Number.isFinite(options.tempo) || options.tempo < 30 || options.tempo > 300) throw new Error('Invalid exercise settings.');
  const allowed = { rhythm: ['auto', 'simple', 'mixed', 'complex'], articulation: ['unmarked', 'staccato', 'tenuto', 'accent', 'marcato', 'legato', 'mixed'], articulationComplexity: ['none', 'simple', 'patterned'], dynamics: ['none', 'gentle', 'expressive'], restFrequency: ['none', 'low', 'medium', 'high'], exerciseType: ['sight-reading', 'scales', 'rhythm'] };
  for (const field of Object.keys(allowed) as (keyof typeof allowed)[]) if (options[field] !== undefined && !allowed[field].includes(options[field]!)) throw new Error(`Invalid ${field}.`);
  const roll = () => { const n = random(); if (!Number.isFinite(n) || n < 0 || n >= 1) throw new Error('Random source must return a finite value in [0, 1).'); return n; };
  const pick = <T,>(values: T[]): T => values[Math.floor(roll() * values.length)];
  const rules = DIFFICULTY_RULES[options.difficulty];
  const level = options.rhythm === 'simple' ? 0 : options.rhythm === 'mixed' ? Math.min(1, rules.rhythm) : rules.rhythm;
  const tonic = TONICS[options.key];
  const scale = Array.from({ length: rules.high - rules.low + 1 }, (_, i) => rules.low + i).filter(midi => MAJOR.includes((midi - tonic + 12) % 12));
  let position = scale.findIndex(midi => midi >= 60 && midi % 12 === tonic);
  const home = position;
  const beatPatterns = level === 0 ? [[96]] : level === 1 ? [[96], [48, 48], [48, 48], [72, 24]] : level === 2 ? [[48, 48], [24, 24, 24, 24], [72, 24], [24, 48, 24], [96]] : [[24, 24, 24, 24], [24, 24, 24, 24], [36, 12, 24, 24], [24, 48, 24], [72, 24]];
  const complex = options.rhythm === 'complex';
  const chooseBeat = () => pick(complex ? beatPatterns.filter(pattern => pattern.length >= (level >= 2 ? 3 : 2)) : beatPatterns);
  const makeRhythm = (): number[] => {
    if (level === 0 && complex) return options.meter === 4 ? pick([[96, 96, 96, 96], [96, 96, 192]]) : [96, 96, 96];
    if (level === 0) return pick(options.meter === 4 ? [[384], [192, 192], [96, 96, 96, 96], [288, 96], [96, 96, 192]] : [[288], [192, 96], [96, 96, 96], [96, 192]]);
    const result: number[] = [];
    for (let beat = 0; beat < options.meter; beat++) {
      if (!complex && level <= 2 && beat === 0 && roll() < 0.18) { result.push(144, 48); beat++; }
      else result.push(...chooseBeat());
    }
    return result;
  };
  const rhythmMotifs = [makeRhythm(), makeRhythm()];
  const melodicMotif = Array.from({ length: 8 }, (_, i) => level === 3 && i % 4 === 2 ? pick([-7, 7]) : pick([-rules.step, -1, 1, rules.step]));
  const bars: NoteEvent[][] = [];
  const restRate = { none: 0, low: 0.035, medium: 0.12, high: 0.3 }[options.restFrequency ?? 'low'] * (options.exerciseType === 'scales' ? 0.2 : options.exerciseType === 'rhythm' ? 1.5 : 1);
  let melodyIndex = 0;
  for (let barIndex = 0; barIndex < options.measures; barIndex++) {
    // Repeat a two-bar rhythmic idea, with a fresh variation in every fourth bar.
    const rhythm = barIndex % 4 === 3 ? makeRhythm() : rhythmMotifs[barIndex % 2];
    const notes: NoteEvent[] = [];
    for (let i = 0; i < rhythm.length; i++) {
      const ending = (barIndex % 4 === 3 || barIndex === options.measures - 1) && i === rhythm.length - 1;
      if (options.exerciseType === 'rhythm') position = home;
      else if (barIndex !== 0 || i !== 0) {
        const step = options.exerciseType === 'scales' ? (Math.floor(melodyIndex / 7) % 2 === 0 ? 1 : -1) : melodicMotif[melodyIndex % melodicMotif.length] * (Math.floor(barIndex / 4) % 2 === 0 ? 1 : -1);
        // Reflect at the playable register boundary rather than repeatedly
        // clipping wide leaps to the same extreme note.
        const top = scale.length - 1;
        const folded = ((position + step) % (2 * top) + 2 * top) % (2 * top);
        position = folded > top ? 2 * top - folded : folded;
      }
      if (ending) position = scale.reduce((best, midi, index) => midi % 12 === tonic && Math.abs(index - position) < Math.abs(best - position) ? index : best, home);
      const rest = !ending && !(barIndex === 0 && i === 0) && roll() < restRate * (i === rhythm.length - 1 ? 1.7 : 1);
      const ticks = rhythm[i];
      notes.push({ kind: rest ? 'rest' : 'note', midi: rest ? -1 : scale[position], ticks, beats: ticks / TICKS_PER_BEAT });
      melodyIndex++;
    }
    bars.push(notes);
  }
  const flat = bars.flat();
  // Syncopated ties are explicit same-pitch connections, including barline ties.
  if (level >= 2) for (let b = 0; b < bars.length - 1; b++) {
    if (b % 4 === 1) {
      const tail = bars[b].at(-1)!; const head = bars[b + 1][0];
      if (tail.kind === 'note' && head.kind === 'note') { tail.tieToNext = true; head.midi = tail.midi; }
    }
    if (b % 4 === 0 && bars[b].length > 2) {
      const a = bars[b][1], next = bars[b][2];
      if (a.kind === 'note' && next.kind === 'note') { a.tieToNext = true; next.midi = a.midi; }
    }
  }
  const complexity = options.articulationComplexity ?? 'simple';
  const articulation = options.articulation ?? 'mixed';
  if (complexity !== 'none') for (const bar of bars) {
    for (let i = 0; i < bar.length; i++) {
      const note = bar[i]; if (note.kind === 'rest') continue;
      note.articulation = articulation === 'mixed' ? (Math.floor(i / 2) % 2 === 0 ? 'legato' : 'staccato') : articulation;
      if ((articulation === 'accent' || articulation === 'marcato') && i > 0) note.articulation = 'unmarked';
      if (complexity === 'patterned' && articulation === 'mixed' && i === 0) note.articulation = 'accent';
    }
    // Close every slur within a contiguous run; rests never live inside a slur.
    for (let i = 0; i < bar.length; i++) if (bar[i].articulation === 'legato' && bar[i].kind === 'note') {
      let end = i;
      while (end + 1 < bar.length && bar[end + 1].kind === 'note' && bar[end + 1].articulation === 'legato' && (complexity !== 'patterned' || end - i < 3)) end++;
      if (end > i) { bar[i].slurStart = true; bar[end].slurEnd = true; }
      i = end;
    }
  }
  const dynamics = options.dynamics ?? 'gentle';
  if (dynamics !== 'none') for (let b = 0; b < bars.length; b += 4) {
    const phrase = bars.slice(b, b + 4).flat().filter(note => note.kind === 'note');
    if (!phrase.length) continue;
    const soft: Dynamic = dynamics === 'expressive' ? pick(['pp', 'p', 'mp']) : 'mp';
    const loud: Dynamic = dynamics === 'expressive' ? pick(['mf', 'f', 'ff']) : 'mf';
    phrase[0].dynamic = soft;
    if (phrase.length >= 4) {
      const midpoint = Math.floor((phrase.length - 1) / 2);
      phrase[0].hairpinStart = 'crescendo'; phrase[midpoint].hairpinEnd = true; phrase[midpoint].dynamic = loud;
      phrase[midpoint + 1].hairpinStart = 'diminuendo'; phrase.at(-1)!.hairpinEnd = true; phrase.at(-1)!.dynamic = soft;
    }
  }
  // Continuations do not carry a new articulation attack.
  for (let i = 1; i < flat.length; i++) if (flat[i - 1].tieToNext) flat[i].articulation = 'unmarked';
  return { options: { rhythm: 'auto', articulation: 'mixed', articulationComplexity: 'simple', dynamics: 'gentle', restFrequency: 'low', exerciseType: 'sight-reading', ...options }, bars, version: 2 };
}
