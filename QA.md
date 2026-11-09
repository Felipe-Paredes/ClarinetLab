# Audit and core-engine verification

## Scope and history
The original Phase 1 audit was preserved in commit 60dfc6b (branch fix/phase1-audit). The user's subsequent CORE_ENGINE_SPEC.md explicitly authorized the expressive engine expansion on feature/expressive-music-engine. No accounts, subscriptions, microphone analysis, saved-exercise history or gamification were added. PRODUCT_SPEC.md is preserved.

## Findings and resolution
| Area | Original finding | Current result |
| --- | --- | --- |
| Rhythm | Only quarters/halves/eighths; offbeat long values obscured beats | Integer 96-tick clock; whole through sixteenth, dotted values, dotted-sixteenth/32nd complements, beat patterns and syncopated ties |
| Pitch and difficulty | Two levels, five keys, largely random walk | Four explicit profiles, 13 major keys, repeated/varied motifs, four-bar cadences, controlled register movement; boundary reflection avoids repeated clipped extremes |
| Rests | Scheduler/notation sentinel existed, generator never emitted rests | Generated first-class rests with frequency and exercise-focus controls; exact silence and bar totals tested |
| Articulation | No shared expression data | Separate articulation, tie and slur fields; staccato/tenuto/accent/marcato/legato and phrase patterns in notation and audio |
| Dynamics | Absent | pp/p/mp/mf/f/ff, phrase crescendo/diminuendo, gain interpolation across attacks and within sustained ties |
| Length | UI only 4/8 bars; generator limit32 | Presets4–64 and custom1–128; continuous multisystem score; denser scores use fewer bars per line |
| Audio | Upstream player retained historical audio-node registry | Cached decoded recorded clarinet buffers, own bounded-lookahead WebAudio sources with cleanup, pause/resume/stop and cancellation/error handling |
| Long notes | Finite samples could end before written duration | Recorded sustain loops using approximate positive zero crossings; exact scheduled release. Loop seam quality remains a listening check |
| Interface | Pause/resume races and hidden mobile status; redundant SVG redraws | Guarded async transport updates; memoized notation data; visible status, clearer text contrast and keyboard-scrollable score; transport/error above long score |
| Transposition | Correct basic -2 math, limited integration tests | Real abcjs parser compared against actual schedule for every key, difficulty and meter; written C5 -> concert Bb4 retained |

## Automated evidence
- Baseline before audit: 31 tests passed. Audit checkpoint: 53 tests, including1,200 deterministic generation/notation/playback cases.
- Final validation: 109 tests passed across 7 files; TypeScript and production build passed.
- Expanded generator batch:1,248 configurations (13 keys ×4 levels ×2 meters ×12 seeds), lengths1/4/8/12/16/24/32/64/128, multiple tempos. Validates exact tick totals, ranges, key membership, seed repeatability, closed expression spans, ties and phrase ending.
-104 real-parser integration configurations compare note attacks, written pitch, timing and tied durations with transposed audio. Separate fixtures verify rest silence, accidentals, F#/Gb octave spelling and tie/slur differences.
- Rhythm coverage tests include384/288/192/144/96/72/48/36/24/12 ticks. Statistical tests require Expert density and wide leaps to exceed Advanced across fixed seed batches.
- Audio tests use mocked WebAudio to inspect actual recorded-buffer selection, caching, scheduled starts/stops, bounded lookahead, pause/resume, stop during loading, missing samples, failures, disposal, expression ramps and sustain loops. They cannot prove physical speaker output.
- Long-score parser test handles128 measures /2,048 notes; full visual layout and device performance are separate checks.

## Browser observations
A fresh Vite server on port5175 resolved the prior blank preview. The in-app browser displayed all four levels, expanded key/length controls and a64-bar Expert F# study. Score inspection showed readable staff systems, beams, dots, slurs/ties, rests and hairpins. Clarinet loading advanced to Playing clarinet without a displayed sample error. Browser automation was intermittently unavailable; final cached replay, Pause → Resume → Stop transitions were verified in the browser. A full mobile-device matrix was not completed. These observations do not constitute subjective listening approval.

## Samples and licensing
Verified bank at https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3.js contains88 embedded MP3 sample entries (~2.95MB JavaScript payload). Runtime explicitly loads this bank and plays decoded AudioBufferSources; oscillators are only metronome clicks. Publisher declares FluidR3 CC BY3.0: https://gleitz.github.io/midi-js-soundfonts/. Attribution remains visible. See AUDIO_LICENSE.md.

## Remaining limitations
- Tuplet generation/notation is explicitly deferred by the new request. The clock can represent triplets, but the UI does not claim support.
- Dynamics adjust gain only; no timbral dynamic layers or true legato transition recordings. Sustain loops are inferred, not authored sample loops; listen for seams, especially at30BPM.
- Educational quality is heuristic. Phrases use motifs, variation and tonic endpoints; dynamic peaks follow phrase position rather than analyzed melodic climax. Expert means a constraint profile, not certified pedagogical grading.
- Major keys only; written ranges are difficulty presets rather than user-configurable limits. Expert reaches written G6; users should select a suitable level/tempo.
- Scores render continuously, with horizontal scrolling where needed on small screens; no pagination, full note-by-note screen-reader equivalent, or exhaustive Safari/iOS/Android verification.
- First sample load needs network. The upstream soundfont loader is archived. Current adapter isolates its use to decoding; no new dependency was added.
- Audio uses a short scheduling horizon. Severe background-tab throttling can skip overdue notes rather than burst them; practice in an active tab.
- The production notation/player bundle is comparatively large. No arbitrary framework or additional rendering abstraction was introduced just to hide this cost.
- Seeds reproduce this generator version and identical settings. Older version1 seeds will not reproduce their former melodies after the requested algorithm changes.

## Manual acceptance checklist
- [ ] Open the running studio; test Beginner through Expert, C/F#/Gb keys and3/4 and4/4. Confirm clef/key/meter and exact bar counts.
- [ ] Generate12/16/32/64 bars and custom128. Inspect the final system and barline; confirm scrolling, spacing and readable marks on desktop and a phone.
- [ ] Same seed/settings reproduces the score; New variation changes it. Invalid custom length0 or129 displays an error without destroying the previous score.
- [ ] Expand Musical expression. Compare Simple/Complex rhythms, None/High rests, unmarked/staccato/tenuto/accent/marcato/legato/mixed, and None/Gentle/Expressive dynamics. Generate after each change.
- [ ] Listen with metronome. Rests are silent; dots extend correctly; ties sustain without reattacks; slurred different notes retain pitch changes. Written C sounds a whole tone lower.
- [ ] Compare staccato with tenuto/legato and pp with ff. Crescendo/diminuendo should change loudness smoothly, including tied notes; listen for sustain-loop seams at30BPM.
- [ ] Pause, resume, stop and replay. Stop during initial sample loading; no delayed ghost playback. Change tempo; notation rhythm stays unchanged. Regenerate during playback safely stops it.
- [ ] Use keyboard only to reach controls and scroll the score. Verify focus visibility/status/error messages at phone width. Reload offline to check a useful sample-load error, then retry online.
