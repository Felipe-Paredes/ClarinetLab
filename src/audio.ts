import Soundfont from 'soundfont-player';
import type { Passage } from './types';

export const BB_CLARINET = { name: 'B-flat clarinet', transposition: -2 } as const;
export function writtenToSounding(midi: number, instrument: { transposition: number } = BB_CLARINET): number {
  return midi + instrument.transposition;
}
export interface ScheduledNote { midi: number; time: number; duration: number; }
export function createSchedule(passage: Passage, tempo: number): { notes: ScheduledNote[]; duration: number } {
  if (!Number.isFinite(tempo) || tempo < 20 || tempo > 300) throw new Error('Tempo must be between 20 and 300 BPM.');
  let time = 0;
  const notes: ScheduledNote[] = [];
  for (const bar of passage.bars) for (const note of bar) {
    if (!Number.isFinite(note.beats) || note.beats <= 0) throw new Error('Note duration must be positive.');
    const duration = note.beats * 60 / tempo;
    if (!Number.isInteger(note.midi) || (note.midi !== -1 && (note.midi < 2 || note.midi > 127))) throw new Error('Pitch must be valid MIDI or -1 for a rest.');
    // -1 represents a rest; its duration still advances the clock.
    if (note.midi >= 0) notes.push({ midi: writtenToSounding(note.midi), time, duration });
    time += duration;
  }
  return { notes, duration: time };
}

export class ClarinetPlayer {
  private context?: AudioContext;
  private instrument?: Awaited<ReturnType<typeof Soundfont.instrument>>;
  private loading?: Promise<Awaited<ReturnType<typeof Soundfont.instrument>>>;
  private timer?: ReturnType<typeof setInterval>;
  private clicks: OscillatorNode[] = [];
  private version = 0;
  private disposed = false;
  async play(passage: Passage, tempo: number, metronome: boolean, onEnd: () => void): Promise<void> {
    if (this.disposed) throw new Error('Audio player has been disposed.');
    this.stop();
    const version = this.version;
    const schedule = createSchedule(passage, tempo);
    this.context ??= new AudioContext();
    const context = this.context;
    await context.resume();
    if (version !== this.version) return;
    if (!this.instrument) {
      this.loading ??= Soundfont.instrument(context, 'clarinet', {
        soundfont: 'FluidR3_GM', format: 'mp3', gain: 0.65,
        nameToUrl: () => 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3.js',
        attack: 0.008, release: 0.04,
      });
      try {
        const instrument = await this.loading;
        if (this.disposed) return;
        this.instrument = instrument;
      }
      catch { this.loading = undefined; throw new Error('Clarinet samples could not load. Check your internet connection and try Play again.'); }
    }
    if (version !== this.version) return;
    const start = context.currentTime + 0.08;
    for (const note of schedule.notes) {
      const node = this.instrument.play(note.midi, start + note.time, { duration: note.duration, release: 0.04 });
      if (!node) { this.stop(); throw new Error('A required clarinet sample is missing. Please reload and try again.'); }
    }
    if (metronome) {
      const beat = 60 / tempo;
      for (let i = 0; i * beat < schedule.duration - 0.001; i++) {
        const when = start + i * beat;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = i % passage.options.meter === 0 ? 1200 : 850;
        gain.gain.setValueAtTime(0.075, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.035);
        oscillator.connect(gain).connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(when); oscillator.stop(when + 0.04);
        this.clicks.push(oscillator);
      }
    }
    this.timer = setInterval(() => {
      if (context.currentTime >= start + schedule.duration + 0.06) { this.stop(); onEnd(); }
    }, 40);
  }
  async dispose(): Promise<void> {
    this.stop();
    this.disposed = true;
    this.instrument = undefined;
    this.loading = undefined;
    await this.context?.close();
  }
  async pause(): Promise<void> { await this.context?.suspend(); }
  async resume(): Promise<void> { await this.context?.resume(); }
  stop(): void {
    this.version++;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.instrument?.stop();
    for (const click of this.clicks) { try { click.stop(); } catch { /* Already ended. */ } }
    this.clicks = [];
  }
}

