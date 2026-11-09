# Core engine implementation

The follow-up requirements in CORE_ENGINE_SPEC.md extend the original Phase 1 scope. PRODUCT_SPEC.md remains the master vision. No accounts, subscriptions, microphone analysis, history or gamification are part of this work.

## Shared model
- Written MIDI pitches remain the source of truth. New generated events have kind (note/rest), integer ticks and beats=ticks/96. Legacy beats-only fixtures are supported through eventTicks, which rejects inconsistent values.
- 96 ticks per quarter supports binary and dotted values exactly; future triplets can use 32-tick eighth triplets without changing the clock. Tuplet generation/notation is not implemented in this task.
- Ties connect equal adjacent pitches into one attack. Slur endpoints group distinct notes. Neither changes written duration.
- Dynamics and hairpins belong to the same score consumed by notation and playback. Articulation modifies sounding envelopes, not the score clock.
- Generated score version identifies changed seed interpretation. Reproducibility is within the same generator version and complete options.

## Ownership and sequence
1. Preserve the Phase 1 audit checkpoint and shared contracts.
2. Music agent: phrase/motif generator, exact rhythms, rests and difficulty constraints; generation/batch tests.
3. Notation agent: ABC conversion, expression symbols and long-score pagination; parser regression tests.
4. Audio agent: tie merging, articulation envelopes, dynamic gain and resource lifecycle; playback regressions.
5. Lead: user controls, shared interfaces, integration, browser review, documentation, Git and PR.

Agents own disjoint files. Shared contracts change only through the lead. The app remains React/TypeScript/Vite with abcjs and recorded FluidR3 clarinet samples.
