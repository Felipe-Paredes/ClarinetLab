# Version 3 architecture and initial audit

Version 2 already supported exact integer ticks, pp–ff, mixed articulations, ties, slurs, gain hairpins, first-class rests, seeded motifs, four difficulty levels and 1–128 measures. The old UI defaulted to gentle mp/mf; that was not the full dynamic vocabulary. Missing: meter/grouping beyond3/4 and4/4, tuplets, tempo ramps/fermatas, ornaments, contextual modes/minor keys and targeted clarinet technique strategies.

## Contract and staged plan
1. Shared types, meter and theory functions (lead): preserve96 ticks per quarter; introduce explicit performed/written tuplet ratio, contextual pitch spelling, per-bar meters/keys, tempo events and phrase metadata. Legacy V2 fields remain accepted.
2. Generation agent: rhythm/rest patterns respecting group boundaries; hierarchy of objectives/phrases/motifs/variation; register/fingering targets; expression and breaths. Final validatePassage invariant gate.
3. Notation/frontend agent: extend existing abcjs renderer and controls, with explicit beat-unit labels and an acceptance recipe. Do not replace the renderer or rebuild the app.
4. Audio agent: exact performed ticks, analytic tempo timeline, fermata stretches, grouped metronome and ornament interpretation using the existing recorded sample system.
5. Lead integration: feature-coverage batches, parser/audio roundtrip, procedural demo artifacts, browser checks, documentation and review branch.

## Timing semantics
All ticks and tempo event positions are score time, before fermata stretching. Tempo is per metrical beat: half note for2/2 and3/2, dotted quarter for6/8,9/8,12/8, eighth note for3/8 and asymmetric eighth meters, quarter otherwise. Asymmetric meter groups control accent/beaming; equal underlying eighth/quarter units avoid misleading unequal pulse BPM. Meter changes retain the numeric beat BPM and change its beat unit.
Tuplets encode actual/normal ratio and writtenTicks; performed ticks remain integer. Current supported ratios are3:2 and6:4; quintuplets/septuplets are not claimed.
Ornaments consume time inside their host event; they do not add beats. Fermatas extend performed time without changing the written value. Breath marks indicate phrasing; rests/gates provide the gap.

## Pitch semantics
MIDI remains written pitch. Explicit letter/accidental/octave spelling is authoritative in notation and must reconstruct MIDI exactly. Playback alone applies B-flat transposition. Minor raised scale degrees and directional melodic minor spelling are separate from the natural-minor key signature.

## Ownership
Lead owns types.ts, meter.ts, theory.ts, validation.ts, acceptance.ts and integration tests/docs. Generation owns music.ts/rhythm.ts/expression.ts/technique.ts and generation tests. Notation owns notationAbc.ts/Notation.tsx/App.tsx/styles.css and notation tests. Audio owns audio.ts/timing.ts/declaration and audio/timing tests. No shared-file edits without coordination.

## References
- ABC syntax and explicit tuplet ratios: https://abcnotation.com/wiki/abc:standard:v2.2
- Clarinet throat-tone pitches and resonance fingering: https://clarinet.org/tip-of-the-day-throat-tones/
- B-flat clarinet sounding transposition and registers: https://isfee.music.indiana.edu/clarinetRS
Technique difficulty remains a pedagogical heuristic, not a universal fingering-difficulty score.
