# Phase 1 quality review

## Scope and architecture

The shared `Passage` data feeds both ABC notation and sampled playback. Pitch values are written MIDI notes, and beat durations use quarter-note units. The generator is UI-independent. Transposition is centralized in the audio module. ABCJS is the notation alternative permitted by specification section 6.1; Web Audio scheduling is the alternative to Tone.js. Later-phase progression, saved exercises and assessment are intentionally deferred.

## Automated checks

Run the project test command and production build. Generation tests cover exact rhythmic totals, key membership, range, meters, both difficulty levels, deterministic seeds and invalid parameters. Audio tests cover written C5 → sounding Bb4, other sample transpositions, exact schedule timestamps, rest silence, tempo scaling, source immutability and invalid tempo/duration input.

These pure-data tests do not establish browser sample decoding, audible sound quality, real device timing, browser pause/resume behavior, accessibility or rendering quality. The lead's final report should state which integration checks were actually performed.

## Manual acceptance procedure

1. Open the development URL in a current desktop browser. Confirm actual staff notation, clef, time signature, key signature and four measures render without errors.
2. Select each of C, G, D, F and Bb major; generate at 3/4 and 4/4, at both difficulty levels and at four and eight measures. Count each measure's beats; check sharps/flats and line breaks.
3. Keep the same settings and seed, generate twice and confirm identical notation. Select New variation and confirm a different seed and passage. Repeat generation at least twenty times.
4. Click Listen with an internet connection. Confirm sampled clarinet sound rather than a generic oscillator. Compare the opening written C5, if present, to concert Bb4 on a reference instrument or tuner. Automated scheduling tests independently verify this exact mapping.
5. Pause midway through a sustained note and midway through a rest if a rest fixture is used. Wait several seconds, then resume. Confirm passage continues without skipped notes or duplicate audio. Stop; confirm all notes/clicks end and replay starts at the beginning.
6. Enable metronome. Confirm click beats align with note events, with a higher click on each measure's first beat. Disable it and confirm clicks stop.
7. Change tempo from 60 to 120 BPM. Confirm playback takes half the time while rhythmic notation is unchanged. Check the displayed tempo indication matches the intended behavior.
8. On a fresh page load, block the sample URL or disable network, then Listen. Confirm a useful error and retry behavior after reconnecting. After successful sample loading, replay and confirm the bank is reused.
9. Test narrow phone, tablet and desktop widths. Ensure settings and transport remain usable and the notation stays legible. Test keyboard navigation and visible focus.
10. Repeat audio startup, pause/resume and stop on current Chrome/Edge, Firefox and Safari, including one iOS or Android browser. These cross-browser tests require actual browser access and are not implied by a passing build.

## Known initial boundaries

- Two difficulty levels, five major keys, 3/4 and 4/4, and four/eight measures are exposed. Minor keys, advanced rhythmic vocabulary, dedicated categories and custom range/interval/articulation controls are not yet present.
- Generation uses stepwise movement, small leaps, repeats and tonic endings; extended motif development and explicit arpeggio patterns are later improvements.
- Audio uses externally hosted FluidR3 samples, so first load requires connectivity. Subjective realism must be evaluated by listening.
- The initial generator produces no rests or articulation markings. The audio scheduler accepts negative MIDI values as rests; notation support must be added before introducing generated rests.
- Check eighth-note beaming visually: the initial ABC serializer separates every token with spaces, potentially preventing conventional beam groups.
- Printed tempo initially comes from the generated exercise while the playback slider can change independently; check for misleading displayed tempo after adjustment.
- No saved exercises, history, XP, curriculum, recording, automated performance scores, backend or accounts are claimed in Phase 1.

## Next phase

After verified Phase 1 acceptance, implement Phase 2 practice experience: category modules, saved exercises, session completion and self-assessment, local practice history, richer phrasing/articulation and optional playback highlighting.
