export type KeyName = 'C' | 'G' | 'D' | 'F' | 'Bb';
export interface ExerciseOptions { key: KeyName; meter: 3 | 4; measures: number; difficulty: 'beginner' | 'intermediate'; tempo: number; }
export interface NoteEvent { midi: number; beats: number; }
export interface Passage { options: ExerciseOptions; bars: NoteEvent[][]; }
export const DEFAULT_OPTIONS: ExerciseOptions = { key: 'C', meter: 4, measures: 4, difficulty: 'beginner', tempo: 80 };
