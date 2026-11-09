export type KeyName = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Articulation = 'unmarked' | 'staccato' | 'tenuto' | 'accent' | 'marcato' | 'legato';
export type Dynamic = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';
export interface ExerciseOptions {
  key: KeyName; meter: 3 | 4; measures: number; difficulty: Difficulty; tempo: number;
  rhythm?: 'auto' | 'simple' | 'mixed' | 'complex';
  articulation?: Articulation | 'mixed';
  articulationComplexity?: 'none' | 'simple' | 'patterned';
  dynamics?: 'none' | 'gentle' | 'expressive';
  restFrequency?: 'none' | 'low' | 'medium' | 'high';
  exerciseType?: 'sight-reading' | 'scales' | 'rhythm';
}
/** Written pitches. -1 is the legacy rest sentinel; generated events also carry kind.
 * ticks is canonical for new events; beats is its exact quarter-note equivalent.
 * tieToNext joins equal pitches into ONE attack. Slurs group different attacks. */
export interface NoteEvent {
  kind?: 'note' | 'rest'; midi: number; beats: number; ticks?: number;
  tieToNext?: boolean; slurStart?: boolean; slurEnd?: boolean;
  articulation?: Articulation; dynamic?: Dynamic;
  hairpinStart?: 'crescendo' | 'diminuendo'; hairpinEnd?: boolean;
}
export interface Passage { options: ExerciseOptions; bars: NoteEvent[][]; version?: number; }
export const DEFAULT_OPTIONS: ExerciseOptions = { key: 'C', meter: 4, measures: 4, difficulty: 'beginner', tempo: 80 };
export const TICKS_PER_BEAT = 96;
export function eventTicks(note: NoteEvent): number {
  const ticks = note.ticks ?? note.beats * TICKS_PER_BEAT;
  if (!Number.isInteger(ticks) || ticks <= 0 || ticks !== note.beats * TICKS_PER_BEAT) throw new Error('Invalid or inconsistent rhythmic duration.');
  return ticks;
}
export function isRest(note: NoteEvent): boolean { return note.kind === 'rest' || note.midi === -1; }
