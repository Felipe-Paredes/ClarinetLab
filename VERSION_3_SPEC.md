# PROJECT: Interactive Music Practice Platform
# VERSION 3 — Comprehensive Musical Notation and Generation Expansion

## Mission

You are the lead engineering agent responsible for upgrading the existing Interactive Music Practice Platform from Version 2 to Version 3.

The application currently generates clarinet passages, but its musical vocabulary remains severely limited.

Known limitations include:

- Only `mp` and `mf` dynamics are generated.
- Articulations are largely limited to slurs and staccato.
- Only two time signatures are available.
- Rhythmic variety, phrasing, and expression require further development.
- The generator still behaves too much like a random note generator instead of a sophisticated musical exercise generator.

Your objective is to transform the existing application into a musically comprehensive, expressive, technically accurate practice platform capable of producing realistic clarinet études.

**Do not rebuild the application from scratch. Extend and improve the existing architecture.**

Review the current codebase and `PRODUCT_SPEC.md` before beginning.

Use specialized subagents where available, with clearly separated responsibilities.

Prioritize musical correctness, notation quality, and instrument-specific usefulness over cosmetic features.

---

## 1. Comprehensive Dynamic Markings

Expand the dynamics system to support the complete standard range:

### Standard dynamics

- ppp — pianississimo
- pp — pianissimo
- p — piano
- mp — mezzo-piano
- mf — mezzo-forte
- f — forte
- ff — fortissimo
- fff — fortississimo

### Sudden dynamic changes and emphasis

- sfz — sforzando
- sf — sforzato
- fp — fortepiano
- subito p
- subito f

### Gradual dynamics

- Crescendo hairpins
- Diminuendo hairpins
- Written crescendo and diminuendo indications

### Musical generation rules

Dynamic markings must have musical intent.

Implement a phrase-aware dynamic contour system capable of:

- Gradually increasing intensity toward a melodic climax.
- Decreasing intensity near phrase endings.
- Creating contrasting musical sections.
- Introducing sudden changes when musically appropriate.
- Avoiding excessive or contradictory markings.
- Scaling dynamic complexity by difficulty.

Dynamic changes must be reflected in the shared musical data model and rendered correctly.

Where possible, the clarinet playback engine should respond to these markings using velocity, sample layers, or gain automation.

Do not confuse volume changes with realistic timbral changes.

---

## 2. Comprehensive Articulation System

Expand articulation support to include:

- Staccato
- Staccatissimo
- Tenuto
- Accent
- Marcato
- Portato
- Legato slurs
- Mixed articulation patterns
- Unmarked or ordinarily tongued notes

### Articulation generation

Generate meaningful articulation combinations such as:

- Two slurred notes followed by two tongued notes.
- Alternating staccato and tenuto.
- Groups of four slurred sixteenth notes.
- Accented downbeats.
- Long slurred phrases interrupted by articulated passages.
- Staccato passages involving register changes.
- Mixed articulation studies designed for clarinet.

Articulation probability and complexity must be configurable.

Do not distribute articulation markings randomly without considering musical structure.

### Playback requirements

- Staccato notes should have shortened sounding durations.
- Staccatissimo notes should be more detached than ordinary staccato.
- Tenuto notes should sustain nearly their full written value.
- Accents should influence attacks.
- Marcato notes should have stronger emphasis.
- Slurred notes should minimize separation where feasible.

Do not alter the underlying written rhythmic duration to simulate articulation.

Slurs and ties must remain distinct structures.

---

## 3. Expanded Time Signature Support

The application must support at least:

### Simple meter

- 2/4
- 3/4
- 4/4
- 2/2
- 3/2

### Compound meter

- 3/8
- 6/8
- 9/8
- 12/8

### Asymmetric meter

- 5/8
- 7/8
- 5/4
- 7/4

Support changing time signatures within an exercise as an advanced capability.

### Critical musical requirements

The system must understand beat grouping, not merely calculate total measure duration.

Examples:

- 6/8 commonly groups as 3+3 eighth notes.
- 9/8 commonly groups as 3+3+3.
- 12/8 commonly groups as 3+3+3+3.
- 5/8 may group as 2+3 or 3+2.
- 7/8 may group as 2+2+3, 2+3+2, or 3+2+2.

Time signature and beat grouping must influence:

- Rhythmic generation
- Note beaming
- Accents
- Rest grouping
- Metronome behavior
- Musical phrasing

Expose beat-grouping options for asymmetric meters.

Ensure that metronome tempo is interpreted using the appropriate beat unit.

Do not treat all eighth-note denominators as equivalent metric structures.

---

## 4. Complete Rhythmic Vocabulary

Audit and expand the current rhythm generation system.

Support:

- Whole notes
- Half notes
- Quarter notes
- Eighth notes
- Sixteenth notes
- Thirty-second notes
- Dotted notes
- Double-dotted notes
- Ties
- Ties across barlines
- Syncopation
- Triplets
- Sixteenth-note triplets
- Other standard tuplets where supported

Also implement rests with equivalent rhythmic values where musically appropriate.

### Rhythmic correctness

Use exact fractional or integer-tick representations.

Every measure must have the correct total duration.

Tuplets, dotted notes, ties, and rests must be mathematically valid.

Rhythm notation must follow conventional engraving and beat-grouping practices.

Avoid unusual rhythmic spellings when a simpler conventional notation would communicate the same timing more clearly.

### Difficulty scaling

Beginner:
- Simple rhythmic values.
- Strong, obvious beats.
- Limited syncopation.

Intermediate:
- Eighths, sixteenths, dotted rhythms.
- Basic syncopation.
- Occasional triplets.

Advanced:
- Complex rhythmic combinations.
- Syncopation.
- Mixed subdivisions.
- More frequent tuplets.

Expert:
- Rapid thirty-second-note passages where appropriate.
- Complex tuplets.
- Advanced syncopation.
- Irregular meters.
- Dense rhythmic combinations.

Difficulty must remain musically sensible rather than simply increasing randomness.

---

## 5. Comprehensive Rest Generation

Treat rests as first-class musical events.

Support standard rests, dotted rests, and appropriate grouping.

Rests should serve musical purposes:

- Separating phrases.
- Creating rhythmic contrast.
- Introducing syncopation.
- Supporting breath opportunities.
- Developing rhythmic independence.

Allow rest frequency to be adjusted.

A scale exercise should generally have fewer rests than a rhythm study.

Ensure the playback engine remains silent during rests.

Avoid placing rests where they conflict with required phrase structures or slurs.

---

## 6. Tempo and Expressive Timing

Add support for:

- Largo
- Adagio
- Andante
- Moderato
- Allegro
- Vivace
- Presto
- Ritardando
- Rallentando
- Accelerando
- A tempo
- Fermatas

Tempo markings should include appropriate numerical BPM values when necessary.

Implement a tempo-event model capable of representing changes during an exercise.

The audio playback engine must interpret tempo changes correctly.

Fermatas should extend playback duration without changing the written note value.

Tempo changes should appear at musically meaningful locations.

Do not generate constant arbitrary tempo changes.

---

## 7. Phrasing and Breath Marks

Introduce musical phrase structures.

Support:

- Two-measure phrases
- Four-measure phrases
- Eight-measure phrases
- Longer linked phrases
- Breath marks
- Phrase endings
- Musical punctuation

For clarinet, breathing is a fundamental technical consideration.

Generate reasonable phrase lengths based on tempo, rhythmic density, difficulty, and available breath opportunities.

Avoid requiring unrealistically long uninterrupted passages.

Breath marks should appear where they make musical sense.

Do not automatically place breath marks after every fixed number of measures.

Allow exercises specifically focused on long phrases and breath control.

---

## 8. Ornamentation

Introduce standard ornaments:

- Grace notes
- Appoggiaturas
- Acciaccaturas
- Trills
- Mordents
- Turns

Ornamentation should be limited by difficulty and exercise objectives.

Beginner exercises should rarely include ornaments.

Advanced and Expert exercises may use them more frequently.

Ensure ornaments are displayed using conventional notation.

Implement reasonable playback interpretations where supported.

Do not claim complete ornament playback if only the notation is implemented.

---

## 9. Key Signatures and Tonality

Verify complete support for:

- All major key signatures
- Natural minor
- Harmonic minor
- Melodic minor
- Chromatic passages
- Modal exercises

Support standard accidental notation:

- Sharps
- Flats
- Naturals
- Courtesy accidentals where appropriate
- Double sharps and double flats where necessary

Respect proper accidental persistence within measures.

Avoid incorrect enharmonic spelling.

Pitch spelling must be determined by musical context, not simply MIDI pitch numbers.

Support key changes within longer exercises as an advanced capability.

---

## 10. Clarinet-Specific Technique Generation

The application initially targets B-flat clarinet.

Expand the generator to recognize and deliberately practice clarinet-specific technical challenges.

### Registers

Support exercises concentrating on:

- Chalumeau register
- Throat tones
- Clarion register
- Altissimo register
- Transitions between registers

### Technical categories

Create generation strategies for:

- Crossing the break
- Rapid finger coordination
- Chromatic scales
- Major and minor scales
- Arpeggios
- Thirds, fourths, fifths, sixths, sevenths, and octaves
- Wide interval leaps
- Repeated-note articulation
- Register leaps
- Technical endurance
- Breath control
- Fast articulated passages

The generator should understand the difference between a difficult interval and a difficult fingering transition.

Use instrument-specific technique metadata where available.

Do not assume large intervals are always more difficult than smaller intervals.

Keep passages within valid written-pitch ranges.

Maintain correct B-flat clarinet transposition during playback.

---

## 11. Musical Structure and Coherence

This is a critical improvement.

The generator must begin producing structured musical passages rather than unrelated collections of valid notes.

Implement a hierarchical generation strategy:

1. Select the educational objective.
2. Establish key, meter, tempo, and difficulty.
3. Generate an overall phrase structure.
4. Create rhythmic motifs.
5. Develop melodic motifs.
6. Introduce controlled repetition and variation.
7. Add appropriate articulation.
8. Generate a coherent dynamic contour.
9. Insert appropriate rests and breath opportunities.
10. Validate the completed passage.

### Musical development techniques

Support:

- Motif repetition
- Rhythmic variation
- Melodic sequencing
- Stepwise development
- Controlled interval expansion
- Call-and-response phrasing
- Tonal tension and resolution
- Cadential patterns
- Contrasting sections

For tonal exercises, prefer purposeful harmonic and melodic movement over arbitrary pitch selection.

Not every passage needs to resemble a classical composition, but it should have a recognizable musical objective and internal structure.

---

## 12. Advanced Generation Controls

Update the Practice Studio to expose the expanded musical capabilities.

Users should be able to control:

- Difficulty
- Key signature
- Time signature
- Beat grouping
- Tempo
- Passage length
- Pitch range
- Rhythmic complexity
- Articulation complexity
- Dynamic range
- Rest frequency
- Interval complexity
- Register focus
- Exercise category
- Ornamentation frequency
- Musical phrasing complexity

Add an Expert difficulty setting if it is not already implemented.

Do not overwhelm users with every setting simultaneously.

Provide difficulty presets and an expandable Advanced Settings section.

All controls must affect actual generation behavior.

Do not implement decorative controls that have no functionality.

---

## 13. Sample-Based Clarinet Playback

Preserve the existing realistic clarinet playback system.

Extend it to account for:

- Expanded rhythmic values
- Tuplets
- Rests
- Articulation
- Dynamic changes
- Tempo changes
- Fermatas
- Grace notes and ornaments where supported
- Accurate note durations
- Correct B-flat clarinet transposition

The renderer and playback engine must use the same shared musical representation.

Written C5 must continue to sound concert B-flat4.

Do not replace sampled clarinet audio with generic oscillator synthesis.

If the current audio library cannot reproduce a feature accurately, document the limitation rather than silently ignoring the notation.

---

## 14. Multi-Agent Architecture

Use specialized agents where available.

### Agent A — Rhythm and Meter
Implement advanced rhythms, rests, tuplets, beat grouping, and time signatures.

### Agent B — Expression and Articulation
Implement dynamics, articulations, phrasing, breath marks, and tempo expression.

### Agent C — Music Theory and Clarinet Technique
Improve harmonic coherence, melodic generation, register handling, and instrument-specific technique generation.

### Agent D — Notation and Frontend
Integrate all new symbols and generation controls into the VexFlow renderer and React interface.

### Agent E — Audio Playback
Extend sample-based clarinet playback to support rhythmic and expressive changes.

### Agent F — Quality Assurance
Develop automated tests and integration validation.

### Lead Agent
Own the architecture, shared interfaces, task coordination, integration, and final acceptance.

Define all shared musical event types before parallel implementation.

Use isolated branches or worktrees where supported.

Avoid conflicting modifications.

Do not claim that subagents were used unless they actually ran.

---

## 15. Testing and Verification

Build comprehensive automated tests.

Test at least 1,000 generated exercises across varied settings and deterministic random seeds.

Verify:

1. Correct measure durations.
2. Correct compound and asymmetric meter grouping.
3. Correct rendering of dotted rhythms.
4. Correct triplet and tuplet mathematics.
5. Correct rest durations.
6. Valid slur placement.
7. Proper separation of ties and slurs.
8. Correct articulation representation.
9. Correct dynamic event placement.
10. Correct instrument transposition.
11. Proper playback synchronization.
12. Valid pitch ranges.
13. Correct key signatures and accidentals.
14. Correct notation of tempo changes.
15. Valid rendering of extended passages.
16. Correct implementation of Expert difficulty.
17. Consistency between configured difficulty and generated complexity.
18. Generation stability across all supported meters.

Verify feature coverage rather than merely checking that the application does not crash.

For example, if the generator claims to support `ff`, tenuto, 7/8, and triplets, tests should verify that these features can actually appear in generated exercises under the appropriate conditions.

Add regression tests for previously working features.

Perform manual visual and listening checks where automated testing is insufficient.

---

## 16. Git and Development Workflow

Use the existing repository and preserve the existing working application.

Create a dedicated Version 3 development branch.

Do not rewrite Git history or force-push.

Implement the expansion in independently testable stages:

1. Shared musical data model and meter handling.
2. Complete rhythm and rest vocabulary.
3. Articulation and dynamic notation.
4. Expression, phrasing, and tempo changes.
5. Clarinet-specific generation.
6. User interface integration.
7. Audio playback integration.
8. Comprehensive validation.

Commit tested milestones.

Do not merge into `main` until the expanded functionality has been reviewed and validated.

---

## 17. Completion Criteria

Version 3 should be capable of generating a musically coherent, fully notated, technically useful clarinet étude.

As an acceptance demonstration, generate a 32-measure Advanced or Expert B-flat clarinet étude using:

- Written A major
- 6/8 time
- Dotted-quarter tempo of 72 BPM
- Eighth notes, sixteenth notes, dotted notes, and triplets
- Appropriate rests
- Slurs, staccato, tenuto, accents, and marcato
- Dynamics ranging from piano to fortissimo
- Crescendo and diminuendo hairpins
- Recognizable phrase structures
- Appropriate breath marks
- Controlled register transitions
- At least two developed rhythmic motifs
- Correct beaming and musical spacing
- Accurate sample-based clarinet playback

The generator should be capable of creating multiple distinct exercises satisfying these constraints.

This demonstration must be generated procedurally, not hardcoded.

---

## 18. Immediate Instructions

Begin with a comprehensive audit of Version 2.

Identify which of these musical capabilities are already implemented, which are partially implemented, and which are absent.

Produce a concise implementation plan and assign independent tasks to specialized agents where supported.

Then proceed with implementation.

**Do not stop after planning.**

Implement the musical expansion, run automated tests, fix integration problems, and launch the updated application.

Do not add authentication, payments, microphone analysis, or unrelated features.

When finished, report:

- Features implemented
- Features partially implemented
- Features not yet implemented
- Test results
- Manual verification requirements
- Known limitations
- Git branch and commit information

**Primary objective: Transform the application from a basic procedural note generator into a comprehensive music practice engine capable of producing expressive, realistic, technically meaningful clarinet études.**