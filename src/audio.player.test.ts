import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Soundfont from 'soundfont-player';
import { ClarinetPlayer, sustainLoop } from './audio';
import { DEFAULT_OPTIONS, type Passage } from './types';
vi.mock('soundfont-player', () => ({ default: { instrument: vi.fn() } }));
const load = vi.mocked(Soundfont.instrument);
const passage: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1 }, { midi: -1, beats: 1 }, { midi: 67, beats: 2 }]] };
function sourceNode() { return { buffer: undefined as unknown, loop: false, loopStart: 0, loopEnd: 0, frequency: { value: 0 }, connect: vi.fn((g) => g), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn(), onended: null as null | (() => void) }; }
class FakeContext {
  currentTime = 10;
  destination = {};
  state = 'running';
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  close = vi.fn(async () => { this.state = 'closed'; });
  oscillators: ReturnType<typeof sourceNode>[] = [];
  sources: ReturnType<typeof sourceNode>[] = [];
  createOscillator() { const node = sourceNode(); this.oscillators.push(node); return node; }
  createBufferSource() { const node = sourceNode(); this.sources.push(node); return node; }
  gains: { gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  createGain() { const node = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }; this.gains.push(node); return node; }
}
let context: FakeContext;
let player: ClarinetPlayer;
const samples = Float32Array.from({ length: 1000 }, (_, i) => Math.sin(i * Math.PI / 10));
const buffer = { duration: 1, sampleRate: 1000, length: 1000, getChannelData: () => samples } as unknown as AudioBuffer;
const bank = { buffers: { 70: buffer, 65: buffer }, play: vi.fn(), stop: vi.fn() };
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks();
  context = new FakeContext();
  vi.stubGlobal('AudioContext', class { constructor() { return context; } });
  load.mockResolvedValue(bank);
  player = new ClarinetPlayer();
});
afterEach(async () => { await player.dispose(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('sample playback transport with mocked Web Audio', () => {
  it('uses the clarinet bank and decoded buffer sources, caching the bank across plays', async () => {
    await player.play(passage, 60, false, vi.fn());
    expect(load.mock.calls[0][1]).toBe('clarinet');
    expect(load.mock.calls[0][2]!.nameToUrl!()).toContain('/FluidR3_GM/clarinet-mp3.js');
    expect(context.sources).toHaveLength(1);
    expect(context.sources[0].buffer).toBe(bank.buffers[70]);
    expect(context.sources[0].start).toHaveBeenCalledWith(10.08, 0);
    expect(context.sources[0].stop).toHaveBeenCalledWith(11.08);
    expect(context.oscillators).toHaveLength(0);
    context.currentTime = 11.7; vi.advanceTimersByTime(25);
    expect(context.sources).toHaveLength(2);
    expect(context.sources[1].start).toHaveBeenCalledWith(12.08, 0);
    await player.play(passage, 120, false, vi.fn());
    expect(load).toHaveBeenCalledTimes(1);
    expect(bank.play).not.toHaveBeenCalled();
  });
  it('pauses and resumes without new attacks while the clock is stopped', async () => {
    const done = vi.fn();
    await player.play(passage, 60, false, done);
    await player.pause();
    vi.advanceTimersByTime(10000);
    expect(context.sources).toHaveLength(1);
    expect(done).not.toHaveBeenCalled();
    await player.resume();
    context.currentTime = 14.2; vi.advanceTimersByTime(25);
    expect(done).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000); expect(done).toHaveBeenCalledTimes(1);
  });
  it('uses bounded lookahead and cancels metronome and notes on stop', async () => {
    await player.play(passage, 120, true, vi.fn());
    expect(context.oscillators).toHaveLength(1);
    expect(context.oscillators[0].frequency.value).toBe(1200);
    player.stop();
    expect(context.oscillators[0].stop).toHaveBeenCalledTimes(2);
    expect(context.sources[0].stop).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not play after stopping during sample loading', async () => {
    let finish!: (value: typeof bank) => void;
    load.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const pending = player.play(passage, 80, false, vi.fn());
    await Promise.resolve(); player.stop(); finish(bank); await pending;
    expect(context.sources).toHaveLength(0);
  });
  it('retries load failures and fails clearly for missing samples', async () => {
    load.mockRejectedValueOnce(new Error('network'));
    await expect(player.play(passage, 80, false, vi.fn())).rejects.toThrow('could not load');
    load.mockResolvedValueOnce({ ...bank, buffers: {} });
    await expect(player.play(passage, 80, false, vi.fn())).rejects.toThrow('sample is missing');
    expect(load).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('closes context on disposal and prevents reuse', async () => {
    await player.play(passage, 80, false, vi.fn()); await player.dispose();
    expect(context.close).toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
    await expect(player.play(passage, 80, false, vi.fn())).rejects.toThrow('disposed');
  });
});


it('sustains long ties with recorded sample loops and automates a crescendo inside one attack', async () => {
  const tied: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 4, tieToNext: true, dynamic: 'pp', hairpinStart: 'crescendo' }], [{ midi: 72, beats: 4, dynamic: 'ff', hairpinEnd: true }]] };
  await player.play(tied, 30, false, vi.fn());
  expect(context.sources).toHaveLength(1);
  const source = context.sources[0];
  expect(source.loop).toBe(true);
  expect(source.loopStart).toBeGreaterThan(0.25);
  expect(source.loopEnd).toBeLessThan(0.8);
  expect(source.loopEnd).toBeGreaterThan(source.loopStart);
  expect(source.stop).toHaveBeenCalledWith(26.08);
  expect(context.gains[0].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.92, 18.08);
  expect(context.oscillators).toHaveLength(0);
});
it('selects positive-going zero crossings in the sample sustain region', () => {
  const loop = sustainLoop(buffer);
  for (const time of [loop.start, loop.end]) {
    const i = Math.round(time * buffer.sampleRate);
    expect(samples[i - 1]).toBeLessThanOrEqual(0);
    expect(samples[i]).toBeGreaterThan(0);
  }
});
it('reports later scheduling failures and clears the timer and active sources', async () => {
  const failed = vi.fn();
  await player.play(passage, 60, false, vi.fn(), failed);
  vi.spyOn(context, 'createBufferSource').mockImplementationOnce(() => { throw new Error('audio device failed'); });
  context.currentTime = 11.7;
  vi.advanceTimersByTime(25);
  expect(failed).toHaveBeenCalledWith(expect.objectContaining({ message: 'audio device failed' }));
  expect(vi.getTimerCount()).toBe(0);
});
