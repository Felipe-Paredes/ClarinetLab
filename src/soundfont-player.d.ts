declare module 'soundfont-player' {
  interface Player { buffers?: Record<string | number, AudioBuffer>; play(note: number, when?: number, options?: { duration?: number; release?: number; gain?: number }): unknown; stop(): unknown; }
  const Soundfont: { instrument(context: AudioContext, name: string, options?: { soundfont?: string; format?: string; gain?: number; attack?: number; release?: number; nameToUrl?: () => string }): Promise<Player> };
  export default Soundfont;
}
