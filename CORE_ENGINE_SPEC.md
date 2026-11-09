# TASK: Complete the Core Music Generation Engine

The initial implementation of the Interactive Music Practice Platform is functional but significantly incomplete.

Currently, the application primarily generates basic notes. It lacks fundamental musical notation and exercise-generation features, including articulations, dotted rhythms, sixteenth notes, rests, dynamics, expert difficulty, and extended passage lengths.

These are core requirements, not optional enhancements.

Review PRODUCT_SPEC.md and the existing implementation, then expand the music generation, notation rendering, and playback systems accordingly.

Do not rebuild the application from scratch.

## 1. Comprehensive Rhythmic Generation

Expand the procedural rhythm engine to support:

- Whole notes
- Half notes
- Quarter notes
- Eighth notes
- Sixteenth notes
- Dotted half notes
- Dotted quarter notes
- Dotted eighth notes
- Dotted sixteenth notes where appropriate
- Mixed rhythmic patterns
- Syncopation
- Tied notes
- Ties across barlines
- Triplets and other tuplets as a subsequent capability

The generated rhythms must be appropriate for the selected difficulty level.

Ensure that:

1. Every measure contains exactly the correct rhythmic duration.
2. Dotted rhythms are calculated accurately.
3. Ties preserve correct rhythmic values.
4. Beaming follows appropriate metric grouping.
5. Unnecessarily awkward notation is avoided.
6. Increasing difficulty produces genuinely greater rhythmic complexity.
7. The rhythm engine supports all existing time signatures.

Use exact rhythmic representations, such as integer ticks or rational durations, to prevent floating-point timing errors.

## 2. Rest Generation

Implement rests as first-class musical events, not as a visual afterthought.

Support:

- Whole rests
- Half rests
- Quarter rests
- Eighth rests
- Sixteenth rests
- Dotted rests where appropriate

Rest generation should consider musical phrasing, rhythmic complexity, and the selected exercise type.

Rests should contribute correctly to the duration of each measure.

The audio engine must remain silent during rests.

Rest frequency should vary by exercise category and difficulty. For example, scale exercises should generally have fewer interruptions than rhythm studies.

## 3. Articulation Generation

Implement a comprehensive articulation system.

Support at minimum:

- Staccato
- Tenuto
- Accents
- Marcato
- Slurs
- Legato phrasing
- Unmarked articulation

Articulations should be represented in the shared musical data model and displayed using proper notation.

Allow users to configure articulation complexity and select specific articulation types for practice.

Generate intentional, musically sensible articulation patterns instead of distributing markings completely at random.

Examples:

- Two slurred eighth notes followed by two tongued eighth notes.
- Alternating staccato and legato passages.
- Accented notes on selected beats.
- Longer slurred phrases.
- Mixed articulation exercises.

Important: Slurs and ties are different musical structures and must be modeled separately.

### Playback integration

Articulations should influence sample-based clarinet playback where feasible.

Examples:

- Staccato: shorter sounding duration.
- Tenuto: sustained duration.
- Accents: increased attack or volume.
- Slurs: reduced separation between consecutive notes where supported.

Do not change the written rhythmic duration to simulate articulation.

Document any expressive limitations imposed by the selected sample library.

## 4. Dynamics and Expression

Add dynamic markings, including:

- pp
- p
- mp
- mf
- f
- ff
- Crescendo
- Diminuendo

Dynamics must be integrated into the generated musical structure.

Generate meaningful dynamic contours rather than arbitrarily placing markings.

For example:

- Begin a phrase at mezzo-piano.
- Gradually crescendo toward the melodic climax.
- Diminuendo near the end of the phrase.

Dynamics should influence playback volume using gain control, velocity, or sample layers where supported.

Crescendos and diminuendos should interpolate volume across their specified musical span.

Do not claim that playback reproduces realistic clarinet timbral changes if the audio library only adjusts gain.

## 5. Expert Difficulty

Add a fourth difficulty level:

1. Beginner
2. Intermediate
3. Advanced
4. Expert

Expert should represent technically demanding music appropriate for experienced clarinetists.

It should support combinations of:

- Wide interval leaps
- Rapid sixteenth-note passages
- Complex rhythmic combinations
- Syncopation
- Dotted rhythms
- Challenging articulation patterns
- Extended register changes
- Complex key signatures
- Longer phrases
- Increased technical density
- Higher tempos
- Advanced musical expression

Expert difficulty must not simply increase randomness or tempo.

It should generate passages with intentional technical challenges and realistic playability.

Maintain the instrument's valid written range.

Review the difficulty-generation architecture so each level has clearly defined musical constraints and probabilities.

## 6. Extended Passage Length

Remove the current hard limit of 12 measures.

Support at least:

- 4 measures
- 8 measures
- 12 measures
- 16 measures
- 24 measures
- 32 measures
- 64 measures

Allow a custom measure count within reasonable performance limits.

Larger exercises should render across multiple staff systems with appropriate line breaks.

Implement responsive notation layout and avoid excessively small or cramped notation.

Consider pagination or incremental rendering for particularly long exercises.

Ensure longer generated passages remain structurally and musically coherent.

## 7. Musical Phrasing

Improve the generation engine so the resulting music resembles a genuine technical étude rather than a collection of unrelated notes.

Introduce:

- Repeating rhythmic motifs
- Melodic motifs and variations
- Phrase structures
- Logical phrase endings
- Controlled interval movement
- Dynamic contours
- Articulation patterns
- Appropriate use of rests
- Difficulty-specific technical challenges

The goal is controlled musical randomness, not completely unrestricted randomness.

Preserve the ability to generate unlimited unique passages.

## 8. User Interface

Update the Practice Studio to expose the new functionality.

Include controls for:

- Difficulty, including Expert
- Passage length
- Rhythmic complexity
- Articulation complexity
- Dynamic variation
- Rest frequency
- Tempo
- Existing key signature and time signature settings

Avoid cluttering the interface.

Use sensible defaults, with advanced customization available through expandable controls.

Ensure all settings actually influence the generator.

## 9. Architecture and Multi-Agent Implementation

Use specialized agents if supported.

Suggested responsibilities:

Music Engine Agent:
- Rhythm generation
- Rests
- Difficulty scaling
- Musical phrasing

Notation Agent:
- Dotted rhythms
- Beaming
- Articulation notation
- Dynamic markings
- Extended score rendering

Audio Agent:
- Accurate note durations
- Rests
- Articulation effects
- Dynamic expression
- Synchronization

QA Agent:
- Rhythmic validation
- Generation testing
- Renderer consistency
- Playback verification

Define shared data interfaces before beginning parallel implementation.

Prevent conflicting file modifications.

## 10. Testing Requirements

Implement automated tests that verify:

1. Every generated measure has the correct total duration.
2. Dotted notes have mathematically correct durations.
3. Rests contribute correctly to measure duration.
4. Ties do not cause duplicated note attacks.
5. Articulation symbols are represented correctly in the notation model.
6. Dynamics are stored and mapped to playback controls.
7. Expert exercises exhibit greater technical complexity than Advanced exercises.
8. Passages exceeding 12 measures generate and render successfully.
9. Generated pitches remain within instrument constraints.
10. Playback timing agrees with displayed notation.

Test large batches of procedurally generated passages with varied configurations and deterministic seeds.

Include visual and listening checks for features that cannot be conclusively verified through unit tests.

## 11. Implementation Instructions

Start by auditing the existing music-generation architecture.

Identify which shared data structures must change to support these features correctly.

Implement the enhancements in logical stages, with tests after each stage.

Use the existing Git workflow and a dedicated feature branch.

Preserve working functionality, especially B-flat clarinet transposition and sampled clarinet playback.

Do not begin accounts, subscriptions, microphone input, or unrelated expansion features.

Do not stop after planning. Implement the missing features, run tests, resolve failures, and launch the updated application.

When complete, summarize the changes, identify any remaining limitations, and provide a manual acceptance checklist.

The objective is to transform the current basic note generator into a fully functional, expressive, musically useful passage-generation engine.