import Soundfont from 'soundfont-player';
import { eventTicks, isRest, TICKS_PER_BEAT, type Dynamic, type Passage } from './types';

export const BB_CLARINET = { name: 'B-flat clarinet', transposition: -2 } as const;
export function writtenToSounding(midi: number, instrument: { transposition: number } = BB_CLARINET): number { return midi + instrument.transposition; }
export const DYNAMIC_GAIN: Record<Dynamic, number> = { pp: 0.25, p: 0.36, mp: 0.48, mf: 0.62, f: 0.78, ff: 0.92 };
export interface GainPoint { time: number; gain: number; linear: boolean; }
export interface ScheduledNote { midi: number; time: number; duration: number; soundingDuration?: number; gain?: number; gainAutomation?: GainPoint[]; }
export function createSchedule(passage: Passage, tempo: number): { notes: ScheduledNote[]; duration: number } {
  if (!Number.isFinite(tempo) || tempo < 20 || tempo > 300) throw new Error('Tempo must be between 20 and 300 BPM.');
  const events = passage.bars.flat();
  const starts: number[] = [];
  let totalTicks = 0;
  for (const event of events) {
    starts.push(totalTicks); totalTicks += eventTicks(event);
    if (!isRest(event) && (!Number.isInteger(event.midi) || event.midi < 2 || event.midi > 127)) throw new Error('Invalid MIDI pitch.');
    if (event.tieToNext) {
      const next = events[starts.length];
      if (isRest(event) || !next || isRest(next) || next.midi !== event.midi) throw new Error('Ties must join adjacent notes of the same written pitch.');
    }
  }
  const gains: (number | undefined)[] = [];
  const contours: { start: number; end: number; from: number; to: number }[] = [];
  let dynamic: number | undefined;
  for (const event of events) { if (event.dynamic) dynamic = DYNAMIC_GAIN[event.dynamic]; gains.push(dynamic); }
  for (let i = 0; i < events.length; i++) {
    const direction = events[i].hairpinStart;
    if (!direction) continue;
    let end = i + 1;
    while (end < events.length && !events[end].hairpinEnd) end++;
    if (end === events.length) throw new Error('Hairpin requires an ending.');
    const from = gains[i] ?? DYNAMIC_GAIN.mf;
    const to = events[end].dynamic ? DYNAMIC_GAIN[events[end].dynamic!] : Math.max(0.1, Math.min(1, from + (direction === 'crescendo' ? 0.2 : -0.2)));
    const span = starts[end] - starts[i];
    contours.push({ start: starts[i], end: starts[end], from, to });
    for (let j = i; j <= end; j++) gains[j] = from + (to - from) * (starts[j] - starts[i]) / span;
  }
  const secondsPerTick = 60 / tempo / TICKS_PER_BEAT;
  const notes: ScheduledNote[] = [];
  let slurred = false;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.slurStart) slurred = true;
    const inSlur = slurred;
    if (event.slurEnd) slurred = false;
    if (isRest(event)) continue;
    let ticks = eventTicks(event);
    let end = i;
    while (events[end].tieToNext) { end++; ticks += eventTicks(events[end]); }
    const duration = ticks * secondsPerTick;
    const note: ScheduledNote = { midi: writtenToSounding(event.midi), time: starts[i] * secondsPerTick, duration };
    const articulation = event.articulation;
    if (articulation || inSlur) {
      const factor = articulation === 'staccato' ? 0.5 : articulation === 'marcato' ? 0.75 : articulation === 'tenuto' || articulation === 'legato' || inSlur ? 1 : 0.94;
      note.soundingDuration = duration * factor;
    }
    if (gains[i] !== undefined || articulation === 'accent' || articulation === 'marcato') {
      note.gain = Math.min(1, (gains[i] ?? DYNAMIC_GAIN.mf) * (articulation === 'accent' ? 1.2 : articulation === 'marcato' ? 1.35 : 1));
    }
    const endTick = starts[i] + ticks;
    const overlapping = contours.filter(c => c.start < endTick && c.end > starts[i]);
    if (overlapping.length || events.slice(i + 1, end + 1).some(e => e.dynamic)) {
      const at = (tick: number) => {
        const contour = contours.find(c => tick >= c.start && tick <= c.end);
        if (contour) return contour.from + (contour.to - contour.from) * (tick - contour.start) / (contour.end - contour.start);
        let value = DYNAMIC_GAIN.mf;
        for (let j = 0; j <= end && starts[j] <= tick; j++) if (events[j].dynamic) value = DYNAMIC_GAIN[events[j].dynamic!];
        return value;
      };
      const points = new Set([starts[i], endTick]);
      for (const c of overlapping) { if (c.start > starts[i]) points.add(c.start); if (c.end < endTick) points.add(c.end); }
      for (let j = i + 1; j <= end; j++) if (events[j].dynamic) points.add(starts[j]);
      const accent = articulation === 'accent' ? 1.2 : articulation === 'marcato' ? 1.35 : 1;
      note.gainAutomation = [...points].sort((a, b) => a - b).map((tick, index, all) => ({
        time: (tick - starts[i]) * secondsPerTick,
        gain: Math.min(1, at(tick === endTick ? tick - 1e-6 : tick) * accent),
        linear: index > 0 && overlapping.some(c => c.start <= all[index - 1] && c.end >= tick),
      }));
    }
    notes.push(note);
    for (let j = i + 1; j <= end; j++) { if (events[j].slurStart) slurred = true; if (events[j].slurEnd) slurred = false; }
    i = end;
  }
  return { notes, duration: totalTicks * secondsPerTick };
}

/** Approximate sustain region: matching positive-going zero crossings away from
 * the recorded attack/tail. This sustains recorded audio, not an oscillator;
 * it is not a substitute for authored loop points or expressive sample layers. */
export function sustainLoop(buffer: AudioBuffer): { start: number; end: number } {
  const data = buffer.getChannelData(0);
  const crossing = (fraction: number) => {
    const center = Math.floor(data.length * fraction);
    const radius = Math.min(Math.floor(buffer.sampleRate * 0.025), Math.floor(data.length * 0.08));
    let best = center;
    let distance = Infinity;
    for (let i = Math.max(1, center - radius); i < Math.min(data.length, center + radius); i++) {
      if (data[i - 1] <= 0 && data[i] > 0 && Math.abs(i - center) < distance) { best = i; distance = Math.abs(i - center); }
    }
    return best / buffer.sampleRate;
  };
  return { start: crossing(0.35), end: crossing(0.7) };
}

function expressionAt(note: ScheduledNote, time: number): number {
  const points = note.gainAutomation;
  if (!points?.length) return note.gain ?? DYNAMIC_GAIN.mf;
  let previous = points[0];
  for (const point of points.slice(1)) {
    if (time < point.time) return point.linear ? previous.gain + (point.gain - previous.gain) * Math.max(0, time - previous.time) / (point.time - previous.time) : previous.gain;
    previous = point;
  }
  return previous.gain;
}

/** Soundfont supplies decoded recorded clarinet buffers. Own sources avoid the upstream
 * sample-player's permanent historical-node registry, while caching decoded samples. */
export class ClarinetPlayer {
  private context?: AudioContext;
  private bank?: Awaited<ReturnType<typeof Soundfont.instrument>>;
  private loading?: Promise<Awaited<ReturnType<typeof Soundfont.instrument>>>;
  private timer?: ReturnType<typeof setInterval>;
  private sources = new Map<AudioScheduledSourceNode, GainNode>();
  private version = 0;
  private disposed = false;
  async play(passage: Passage, tempo: number, metronome: boolean, onEnd: () => void, onError?: (error: Error) => void): Promise<void> {
    if (this.disposed) throw new Error('Audio player has been disposed.');
    this.stop();
    const version = this.version;
    const schedule = createSchedule(passage, tempo);
    this.context ??= new AudioContext();
    const context = this.context;
    await context.resume();
    if (version !== this.version) return;
    if (!this.bank) {
      this.loading ??= Soundfont.instrument(context, 'clarinet', {
        soundfont: 'FluidR3_GM', format: 'mp3', nameToUrl: () => 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3.js',
      });
      try { const bank = await this.loading; if (this.disposed) return; this.bank = bank; }
      catch { this.loading = undefined; throw new Error('Clarinet samples could not load. Check your internet connection and try Play again.'); }
    }
    if (version !== this.version) return;
    const buffers = this.bank.buffers;
    const sampleName = (midi: number) => ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'][midi % 12] + (Math.floor(midi / 12) - 1);
    const bufferFor = (midi: number) => buffers?.[midi] ?? buffers?.[sampleName(midi)];
    if (schedule.notes.some(note => !bufferFor(note.midi))) throw new Error('A required clarinet sample is missing. Please reload and try again.');
    const start = context.currentTime + 0.08;
    let nextNote = 0;
    let nextBeat = 0;
    const beatDuration = 60 / tempo;
    const track = (source: AudioScheduledSourceNode, gain: GainNode) => {
      this.sources.set(source, gain);
      source.onended = () => { source.disconnect(); gain.disconnect(); this.sources.delete(source); };
    };
    const pump = () => {
      if (version !== this.version || context.state === 'suspended') return;
      const horizon = context.currentTime + 0.5;
      while (nextNote < schedule.notes.length && start + schedule.notes[nextNote].time <= horizon) {
        const note = schedule.notes[nextNote++];
        const when = start + note.time;
        const duration = note.soundingDuration ?? note.duration;
        // A throttled background tab must not burst overdue notes on return.
        if (when + duration <= context.currentTime) continue;
        const source = context.createBufferSource();
        source.buffer = bufferFor(note.midi)!;
        if (duration > source.buffer.duration) {
          const loop = sustainLoop(source.buffer);
          source.loop = true; source.loopStart = loop.start; source.loopEnd = loop.end;
        }
        const gain = context.createGain();
        const attack = Math.min(0.008, duration / 4);
        const release = Math.min(0.04, duration / 4);
        const onset = Math.max(when, context.currentTime);
        const end = when + duration;
        gain.gain.setValueAtTime(0, onset);
        const attackEnd = Math.min(end, onset + attack);
        const releaseStart = Math.max(attackEnd, end - release);
        gain.gain.linearRampToValueAtTime(expressionAt(note, attackEnd - when), attackEnd);
        for (const point of note.gainAutomation ?? []) if (when + point.time > attackEnd && when + point.time < releaseStart) {
          if (point.linear) gain.gain.linearRampToValueAtTime(point.gain, when + point.time);
          else gain.gain.setValueAtTime(point.gain, when + point.time);
        }
        gain.gain.linearRampToValueAtTime(expressionAt(note, releaseStart - when), releaseStart);
        gain.gain.linearRampToValueAtTime(0, end);
        source.connect(gain).connect(context.destination);
        track(source, gain);
        source.start(onset, Math.max(0, onset - when)); source.stop(end);
      }
      if (metronome) while (nextBeat * beatDuration < schedule.duration - 0.001 && start + nextBeat * beatDuration <= horizon) {
        const beat = nextBeat++;
        const when = start + beat * beatDuration;
        if (when < context.currentTime) continue;
        const source = context.createOscillator();
        const gain = context.createGain();
        source.frequency.value = beat % passage.options.meter === 0 ? 1200 : 850;
        gain.gain.setValueAtTime(0.075, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.035);
        source.connect(gain).connect(context.destination);
        track(source, gain); source.start(when); source.stop(when + 0.04);
      }
      if (context.currentTime >= start + schedule.duration + 0.06) { this.stop(); onEnd(); }
    };
    try { pump(); } catch (error) { this.stop(); throw error; }
    this.timer = setInterval(() => {
      try { pump(); }
      catch (error) { this.stop(); if (onError) onError(error instanceof Error ? error : new Error('Audio playback failed.')); else onEnd(); }
    }, 25);
  }
  async dispose(): Promise<void> {
    this.stop(); this.disposed = true; this.bank = undefined; this.loading = undefined;
    if (this.context?.state !== 'closed') { try { await this.context?.close(); } catch { /* Already closing. */ } }
  }
  async pause(): Promise<void> { await this.context?.suspend(); }
  async resume(): Promise<void> { await this.context?.resume(); }
  stop(): void {
    this.version++;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    for (const [source, gain] of this.sources) { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); gain.disconnect(); }
    this.sources.clear();
  }
}
