export type KeyName = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'C#' | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb' | 'Cb';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Articulation = 'unmarked' | 'staccato' | 'staccatissimo' | 'tenuto' | 'accent' | 'marcato' | 'portato' | 'legato';
export type Dynamic = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff';
export type Emphasis = 'sfz' | 'sf' | 'fp' | 'subito p' | 'subito f';
export type MeterName = '2/4' | '3/4' | '4/4' | '2/2' | '3/2' | '3/8' | '6/8' | '9/8' | '12/8' | '5/8' | '7/8' | '5/4' | '7/4';
export type Tonality = 'major' | 'natural-minor' | 'harmonic-minor' | 'melodic-minor' | 'chromatic' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';
export type ExerciseType = 'sight-reading' | 'scales' | 'rhythm' | 'arpeggios' | 'crossing-break' | 'finger-coordination' | 'chromatic' | 'intervals' | 'repeated-notes' | 'register-leaps' | 'endurance' | 'breath-control' | 'fast-articulation';
export type RegisterFocus = 'all' | 'chalumeau' | 'throat' | 'clarion' | 'altissimo' | 'transitions';
export type TempoWord = 'Largo' | 'Adagio' | 'Andante' | 'Moderato' | 'Allegro' | 'Vivace' | 'Presto';
export interface ExerciseOptions {
  key: KeyName; meter: 3 | 4; measures: number; difficulty: Difficulty; tempo: number;
  timeSignature?: MeterName; grouping?: number[]; tonality?: Tonality;
  rhythm?: 'auto' | 'simple' | 'mixed' | 'complex';
  articulation?: Articulation | 'mixed'; articulationComplexity?: 'none' | 'simple' | 'patterned'; articulationProbability?: number;
  dynamics?: 'none' | 'gentle' | 'expressive'; dynamicMin?: Dynamic; dynamicMax?: Dynamic;
  restFrequency?: 'none' | 'low' | 'medium' | 'high'; exerciseType?: ExerciseType;
  pitchLow?: number; pitchHigh?: number; intervalSize?: 2 | 3 | 4 | 5 | 6 | 7 | 8; intervalComplexity?: 'stepwise' | 'balanced' | 'wide';
  registerFocus?: RegisterFocus; ornamentFrequency?: 'none' | 'low' | 'medium'; phrasing?: 'simple' | 'developed' | 'long';
  tempoWord?: TempoWord; tempoExpression?: 'none' | 'musical'; changingMeters?: boolean; keyChanges?: boolean;
}
export interface PitchSpelling { letter: 'C'|'D'|'E'|'F'|'G'|'A'|'B'; accidental: number; octave: number; }
export interface Tuplet { actual: 3 | 6; normal: 2 | 4; writtenTicks: number; group: string; start?: boolean; }
export type Ornament = 'grace' | 'appoggiatura' | 'acciaccatura' | 'trill' | 'mordent' | 'turn';
/** ticks is canonical; beats remains an exact quarter-note equivalent for V2 compatibility. */
export interface NoteEvent {
  kind?: 'note' | 'rest'; midi: number; beats: number; ticks?: number; spelling?: PitchSpelling; courtesy?: boolean;
  tieToNext?: boolean; slurStart?: boolean; slurEnd?: boolean;
  articulation?: Articulation; dynamic?: Dynamic; emphasis?: Emphasis;
  hairpinStart?: 'crescendo' | 'diminuendo'; hairpinEnd?: boolean; expressionText?: 'cresc.' | 'dim.';
  tuplet?: Tuplet; breath?: boolean; fermata?: number;
  ornament?: Ornament; ornamentMidi?: number; ornamentSpelling?: PitchSpelling;
}
export interface MeterDefinition { name: MeterName; numerator: number; denominator: number; groups: number[]; barTicks: number; beatTicks: number; groupTicks: number[]; }
export interface TempoEvent { tick: number; bpm: number; label: TempoWord | 'rit.' | 'rall.' | 'accel.' | 'a tempo'; endTick?: number; targetBpm?: number; }
export interface Phrase { startBar: number; endBar: number; role: 'call' | 'response' | 'contrast' | 'resolution'; }
export interface Passage { options: ExerciseOptions; bars: NoteEvent[][]; version?: number; meters?: MeterDefinition[]; keys?: KeyName[]; tempoEvents?: TempoEvent[]; phrases?: Phrase[]; }
export const DEFAULT_OPTIONS: ExerciseOptions = { key:'C',meter:4,measures:4,difficulty:'beginner',tempo:80 };
export const TICKS_PER_BEAT = 96;
export function eventTicks(note: NoteEvent): number {
  const ticks = note.ticks ?? note.beats * TICKS_PER_BEAT;
  if (!Number.isInteger(ticks) || ticks <= 0 || Math.abs(ticks-note.beats*TICKS_PER_BEAT)>1e-8) throw new Error('Invalid or inconsistent rhythmic duration.');
  return ticks;
}
export function isRest(note: NoteEvent): boolean { return note.kind === 'rest' || note.midi === -1; }
