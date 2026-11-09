# ClarinetLab
A local React + TypeScript + Vite music-practice studio. Existing app expanded under CORE_ENGINE_SPEC.md; master vision remains PRODUCT_SPEC.md.

## Run and verify
With Node.js and pnpm: pnpm install --frozen-lockfile, pnpm dev, then open the printed local URL. pnpm test runs automated regressions; pnpm build type-checks and produces dist/.
The active task preview uses http://127.0.0.1:5175/.
This computer also has bundled Node/pnpm under C:/Users/felip/.cache/codex-runtimes/codex-primary-runtime/dependencies/.

## Features
Four difficulty levels,13 major keys,3/4 and4/4,1–128 measures, reproducible seeds, exact integer-tick rhythms, rests, ties, slurs, articulations and dynamics. Expand Musical expression to customize rhythm/rest/articulation/dynamics and sight-reading/scale-fragment/rhythm focus. Settings apply on Generate; tempo applies to playback without changing rhythmic values.

Notation uses abcjs. Audio uses actual recorded FluidR3 clarinet buffers, centralized B-flat transposition, WebAudio timing/envelopes and approximate recorded sustain loops for long notes. Dynamics are gain-based, not timbral layers. Initial samples need internet.

See ENGINE_ARCHITECTURE.md for module/data ownership, QA.md for audit evidence and manual acceptance checks, and AUDIO_LICENSE.md for attribution and expressive limitations. Tuplets, accounts, microphone analysis, history and guided learning are not implemented.
