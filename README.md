# ClarinetLab
Phase 1 local React + TypeScript + Vite practice studio.

## Run
With Node.js installed: pnpm install, then pnpm dev. Open http://127.0.0.1:5173.
Build: pnpm build. Tests: pnpm test.
This machine also has bundled Node and pnpm under C:/Users/felip/.cache/codex-runtimes/codex-primary-runtime/dependencies/.

## Architecture
types.ts defines written MIDI pitches and quarter-note beat durations.
music.ts generates seeded major-key passages and converts the same data to ABC.
Notation.tsx renders ABC with abcjs, a suitable notation-library alternative.
audio.ts schedules recorded FluidR3 clarinet samples on Web Audio and applies centralized instrument transposition.
App.tsx owns exercise settings and transport state. No backend or accounts.

## Scope
Two difficulty levels, five major keys, 3/4 and 4/4, four/eight measures, seed reproduction, tempo, metronome and play/pause/resume/stop.
Internet is needed for the first sample load. See AUDIO_LICENSE.md for attribution and QA.md for manual tests. Curriculum, saved exercises and progress tracking belong to later phases.
