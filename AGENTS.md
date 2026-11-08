# ClarinetLab agent guidelines

## Product and scope
Read PRODUCT_SPEC.md as the authoritative master specification. Implement only the phase requested by the user; preserve working features. Phase 1 is the current baseline. Do not claim performance assessment without actual analysis.

## Architecture and standards
- Use React, strict TypeScript and Vite. Keep musical models, generation, notation, transposition, audio scheduling and UI separate.
- src/types.ts is the shared contract. Agree on interface changes before parallel implementation; assign exclusive file ownership to agents.
- Store written MIDI pitches and quarter-note beat durations. Both notation and audio consume the same Passage. Apply instrument transposition centrally in audio.ts; B-flat clarinet sounds two semitones below written pitch.
- Generation must be seeded, rhythmically exact, within playable ranges and musically coherent. Keep it independent of React and notation libraries.
- Use recorded, properly licensed instrument samples. Preserve attribution and document loading failures. Oscillators are appropriate for metronome clicks, not the clarinet voice.
- Keep UI responsive and accessible. Handle async loading, cancellation and errors. Avoid unnecessary dependencies and backend services.

## Verification
Run pnpm test and pnpm build before committing meaningful code milestones. Cover measure totals, range, keys, difficulty, seeds, rests, notation consistency, transposition (C5 -> Bb4), scheduling durations and tempo. Test playback controls and sample loading in the browser when available. Clearly distinguish automated results from unverified listening/visual checks. Do not claim tests or browser verification that did not run.

## Git workflow
- main is the stable baseline. Use feature branches for substantial changes and pull requests for review before merging.
- Make descriptive commits after meaningful tested milestones. Inspect staged diffs and preserve existing work.
- Never force-push or delete branches without explicit user approval.
- Never commit secrets, credentials, private keys, local environment files, dependencies, build output or test artifacts. Track the dependency lockfile.
- Verify pushes succeed before claiming GitHub backup. If remote history exists, inspect and integrate safely; never overwrite it.
