# PROJECT: Interactive Music Practice Platform

## 1. Product Vision

Build a polished, interactive, web-based music practice application inspired by Duolingo's structured learning experience.

The application should help musicians improve their instrumental abilities through an unlimited supply of procedurally generated musical exercises.

The initial target instrument is the B-flat clarinet, but the software architecture should accommodate additional instruments in the future.

The central concept is simple:

**Users practice real sheet music that is generated specifically for their ability level, goals, and technical weaknesses.**

Rather than requiring musicians to purchase exercise books or repeat the same études, the application should continually create fresh passages using music theory, controlled randomness, and educational principles.

It should combine two experiences:

1. **Guided Learning:** A structured, gamified curriculum with lessons, skill trees, levels, achievements, and progressively more challenging exercises.
2. **Free Practice:** A customizable passage generator that allows users to practice specific musical techniques without following a curriculum.

The experience should be engaging enough to encourage daily practice but serious enough to be useful to advanced musicians.

## 2. Target Users

The application should support:

- Beginners learning to read music and play their first notes.
- Intermediate musicians improving sight-reading, scales, articulation, rhythm, and technical fluency.
- Advanced musicians preparing for auditions, improving challenging techniques, and maintaining proficiency.

Design the system so players can start at an appropriate proficiency level instead of forcing experienced musicians to complete beginner lessons.

## 3. Core Feature: Procedural Music Generation

This is the most important component of the entire application.

Develop a music-generation engine capable of creating unlimited, musically coherent, playable exercises.

Generated passages must be displayed as real sheet music using conventional notation.

Each exercise should be configurable based on:

- Instrument
- Difficulty level
- Key signature
- Time signature
- Tempo
- Number of measures
- Pitch range
- Rhythmic complexity
- Interval complexity
- Articulation
- Exercise type

### Musical correctness

Generated exercises must obey music theory and notation rules.

Requirements:

1. Every measure must contain the correct rhythmic duration.
2. Pitches must remain within the instrument's configured range.
3. Key signatures and accidentals must be represented correctly.
4. Rhythms must become more complex as difficulty increases.
5. Pitch selection should favor musically useful patterns rather than completely arbitrary note sequences.
6. Exercises should include appropriate mixtures of stepwise motion, leaps, repeated notes, scales, and arpeggios.
7. Passages should exhibit recognizable musical phrasing and variation.
8. The difficulty of an exercise should reflect its technical demands.
9. Generated music must be reproducible from a stored exercise definition or random seed.
10. Written pitch and sounding pitch must be handled correctly for transposing instruments.

For B-flat clarinet, the displayed notation should use written pitches. Audio playback must account for the instrument's transposition.

The generation engine should be independent of the user interface so it can eventually support additional instruments.

### Exercise categories

Support the following categories through a modular system:

**Sight-Reading**

- Generate unfamiliar musical passages.
- Progressively increase rhythmic, melodic, and technical complexity.
- Encourage reading fluency and musical continuity.

**Scales and Arpeggios**

- Major and minor scales.
- Arpeggios and broken chords.
- Different rhythmic patterns and articulations.
- Exercises that combine multiple scale fragments.

**Rhythm**

- Exercises emphasizing rhythmic accuracy.
- Progress from simple note values to syncopation, dotted rhythms, triplets, and complicated meters.
- Support metronome accompaniment.

**Interval Training**

- Target specific interval sizes.
- Progress from seconds and thirds to larger leaps.
- Include exercises involving register transitions.

**Articulation**

- Slurred and tongued passages.
- Staccato, legato, accents, and mixed articulations.
- Introduce more demanding articulation patterns progressively.

**Technical Challenges**

- Rapid note transitions.
- Wide register changes.
- Complex finger combinations.
- Combinations of multiple advanced techniques.

Not every category needs to be fully implemented in the first version. Design the architecture to support them, then implement the most important categories first.

## 4. Guided Learning: Duolingo-Style Progression

Create a structured educational progression system.

Users should have a clear path through exercises that become increasingly difficult.

### Learning structure

Organize progression into:

Curriculum → Units → Lessons → Exercises

Example:

**Unit 1: Basic Notes and Rhythms**
- Lesson 1: Quarter Notes
- Lesson 2: Half Notes
- Lesson 3: Simple Melodies
- Lesson 4: Introduction to Eighth Notes
- Lesson 5: Unit Challenge

**Unit 2:** Scales and Intervals

**Unit 3:** Expanding Rhythmic Complexity

**Unit 4:** Articulation and Phrasing

**Unit 5:** Advanced Sight-Reading

Each lesson should contain freshly generated exercises appropriate to its learning objectives.

Completing lessons should unlock additional content.

### Gamification

Implement or plan for:

- Experience points (XP)
- User levels
- Daily practice streaks
- Progress indicators
- Skill mastery
- Achievements
- Daily practice goals
- Lesson completion records
- Personalized difficulty recommendations

Gamification should encourage useful practice rather than rewarding meaningless button presses.

### Assessment

Microphone-based performance detection is NOT required.

Initially, users should evaluate their own performance using options such as:

- Completed Successfully
- Needs More Practice
- Try Again

This feedback should influence future exercise recommendations.

Do not claim to measure pitch or rhythmic accuracy without actual performance analysis.

Design the architecture so automatic performance assessment can be introduced later if desired.

## 5. Free Practice Mode

Create a separate practice interface for musicians who want direct control.

The user should be able to:

1. Choose an exercise category.
2. Customize generation parameters.
3. Generate an exercise immediately.
4. View the resulting sheet music.
5. Adjust playback tempo.
6. Listen to the exercise performed using a realistic clarinet sound.
7. Practice with a metronome.
8. Generate another variation.
9. Save useful exercises.
10. Review previous practice sessions.

The interface should make generating a new passage fast and convenient.

## 6. Sheet Music and Realistic Clarinet Audio

### 6.1 Music Notation

Display professional-quality notation using VexFlow or another suitable web notation library.

The notation system should support:

- Treble clef
- Key signatures
- Time signatures
- Notes and rests
- Beams
- Accidentals
- Multiple measures
- Line breaks
- Articulations
- Ties and dotted notes as needed
- Responsive layouts for different screen sizes

### 6.2 Realistic Instrument Playback

**IMPORTANT: The application must use realistic sampled clarinet audio instead of generic synthesized or 8-bit instrument sounds.**

Implement a sample-based playback system that reproduces the sound of a real B-flat clarinet.

The preferred initial approach is to use a clarinet SoundFont or a comparable sampled instrument library.

Evaluate suitable solutions, including:

- FluidR3_GM clarinet samples
- MusyngKite clarinet samples
- Other properly licensed clarinet sample libraries
- Browser-compatible sample playback solutions such as soundfont-player

Select a solution based on sound quality, licensing, browser compatibility, download size, and ease of integration.

Use actual recorded instrument samples rather than basic oscillator-generated waveforms as the primary playback sound.

The audio engine must support:

1. Playing the exact notes generated by the music engine.
2. Accurate note durations.
3. Correct timing between notes.
4. Rests and silence.
5. Adjustable playback tempo.
6. Play, pause, resume, and stop controls.
7. Optional count-in before playback.
8. Metronome accompaniment.
9. Appropriate note attacks and releases.
10. Basic articulation differences, including staccato and legato.
11. Efficient sample loading and caching.
12. Playback on modern desktop and mobile browsers.

Audio should sound recognizably like a clarinet.

Avoid robotic, excessively abrupt note endings where possible.

The initial implementation does not need to reproduce every nuance of professional clarinet performance, but it should offer a significant improvement over basic MIDI-style electronic tones.

### 6.3 B-flat Clarinet Transposition

The application must correctly distinguish between written pitch and sounding pitch.

B-flat clarinet sounds a major second lower than written.

For example:

- Written C5 produces concert B-flat4.
- Written G4 produces concert F4.
- Written E3 produces concert D3.

The displayed notation must remain in the instrument's written pitch.

The playback engine must transpose the notes to their correct sounding pitches.

Use a centralized, instrument-aware transposition system rather than hardcoding transposition throughout the application.

For the initial B-flat clarinet implementation, subtract two semitones from the written MIDI pitch when calculating sounding pitch.

Ensure the system can eventually support non-transposing instruments and other transposing instruments.

### 6.4 Synchronization Between Notation and Playback

The sheet music renderer and the audio engine must operate on the same underlying exercise data.

Do not independently generate the visual notes and audio notes.

The data flow should be:

**Generated Exercise → Shared Musical Data Model → Sheet Music Rendering + Audio Playback**

Every note displayed should correspond to the correct sounded note.

Audio should follow the generated rhythm precisely.

Changing playback tempo must not alter the notated rhythmic values.

If practical, visually highlight the currently playing note or measure during playback.

### 6.5 Audio Quality and Extensibility

Design the playback system so that the instrument sound can be replaced without modifying the passage generator.

Initially, support realistic clarinet playback.

In the future, allow separate instrument sample sets for flute, saxophone, oboe, trumpet, violin, and other instruments.

The long-term design should support:

- Multiple sampled dynamic layers
- More realistic note transitions
- Different instrument articulations
- Expressive dynamics
- Improved attack and release behavior
- Alternative instrument sound libraries

These advanced audio capabilities are not required for the initial version.

### 6.6 Licensing and Performance

Before including a SoundFont or sample library, verify its licensing terms, redistribution requirements, and attribution obligations.

Do not assume a publicly downloadable SoundFont is freely redistributable.

Prefer samples that can legally be distributed with the application.

Load audio assets efficiently.

Handle missing samples, playback failures, and browser audio initialization requirements gracefully.

Use a playback implementation that works without requiring a backend audio-rendering service.

## 7. User Interface and Experience

Build a professional, polished, modern web application.

The aesthetic should combine the accessibility and motivation of Duolingo with the seriousness of a professional music education tool.

Avoid a generic dashboard full of unrelated cards.

Prioritize musical notation and practice interactions.

### Main application sections

**Dashboard**
- Continue practicing
- Current level and progress
- Daily practice goal
- Streak and XP
- Recommended exercises

**Learning Path**
- Visual curriculum progression
- Unlockable lessons
- Skill-specific challenges
- Clear completion indicators

**Practice Studio**
- Large, readable musical staff
- Exercise settings
- Generate button
- Realistic clarinet playback
- Playback tempo controls
- Metronome
- Optional playback highlighting
- Completion and self-assessment controls

**Progress**
- Practice history
- Exercises completed
- Time practiced, when measurable
- Areas requiring additional practice
- Skill mastery indicators

**Settings**
- Instrument configuration
- Default tempo
- Preferred difficulty
- Notation preferences
- Playback volume
- Metronome preferences
- Audio playback settings

The application must work on desktop browsers and adapt to tablets and phones.

## 8. Technical Requirements

Use the following stack unless there is a strong technical reason to propose an alternative:

- React
- TypeScript
- Vite
- VexFlow for music notation
- Tone.js or another appropriate audio scheduling system
- A browser-compatible sample playback library for realistic clarinet audio
- Local browser storage initially
- Vitest for unit tests
- A suitable modern styling approach

Do not use Swift, SwiftUI, or native mobile frameworks.

Do not introduce a backend, account system, subscriptions, or external AI APIs unless required by a later development phase.

The exercise generator should operate locally in the browser without per-exercise API costs.

Keep the architecture modular.

Separate the following concerns:

1. Musical domain models
2. Passage-generation engine
3. Music theory and validation
4. Sheet music rendering
5. Instrument sound libraries
6. Audio scheduling and playback
7. Instrument transposition
8. Curriculum logic
9. Progress tracking
10. User interface components

Use structured data to represent pitch, duration, articulations, measure placement, and performance timing.

Avoid tightly coupling VexFlow to the music generator or audio engine.

## 9. Multi-Agent Development Instructions

You are the lead architect and engineering coordinator.

Use specialized agents when the environment supports them.

Delegate the following responsibilities:

### Agent A: Music Theory and Generation

- Define the musical data model.
- Implement rhythm and pitch generation.
- Enforce musical constraints.
- Implement difficulty scaling.
- Design extensible exercise generation.
- Handle transposing-instrument notation requirements.

### Agent B: Frontend and UX

- Develop the React application.
- Build the dashboard and practice studio.
- Integrate notation rendering.
- Implement responsive layouts.
- Implement user-facing playback controls.
- Display playback state and optional notation highlighting.

### Agent C: Learning and Gamification

- Design the learning path.
- Define difficulty progression.
- Implement self-assessment.
- Implement local progress tracking and XP.
- Ensure educational features integrate with the generator.

### Agent D: Audio and Instrument Playback

- Evaluate sampled clarinet playback libraries.
- Verify the licensing of selected audio assets.
- Implement realistic sample-based clarinet playback.
- Implement correct B-flat clarinet transposition.
- Integrate audio scheduling with generated musical data.
- Implement tempo adjustment and metronome behavior.
- Handle sample loading, caching, and browser audio initialization.
- Design the playback engine for future instrument expansion.

### Agent E: Quality Assurance

- Write automated tests.
- Test measure durations and note ranges.
- Verify generation reliability.
- Test pitch transposition and rhythmic playback scheduling.
- Test UI behavior and application integration.
- Identify errors and edge cases.
- Test performance under repeated passage generation.

### Lead Architect

- Establish shared interfaces before delegation.
- Define clear module ownership.
- Coordinate dependencies.
- Prevent conflicting file modifications.
- Integrate agent contributions.
- Execute the application and tests.
- Review architecture and maintainability.
- Ensure generated notation and sampled playback use the same musical data.

Have agents independently review critical design decisions where useful.

If true subagent execution is unavailable, follow the same staged responsibilities sequentially. Do not pretend independent agents were launched.

## 10. Development Phases

### Phase 1: Functional Music Generator and Clarinet Playback

Implement:

- Working React application
- Configurable passage generator
- B-flat clarinet notation
- Multiple difficulty levels
- Sheet music display
- Generate and Regenerate actions
- Tempo controls
- Realistic sample-based clarinet audio
- Correct instrument transposition
- Play, pause, and stop functionality
- Basic metronome
- Automated generation and playback tests

This phase must produce a genuinely functional application, not a static mockup.

### Phase 2: Practice Experience

Implement:

- Multiple exercise categories
- Saved exercises
- Session completion
- Self-assessment
- Practice history
- Improved generation quality
- Improved articulation playback
- Optional note highlighting during playback

### Phase 3: Guided Learning

Implement:

- Structured curriculum
- Units and lessons
- XP and level progression
- Achievements
- Daily goals
- Skill-specific recommendations

### Phase 4: Expansion

Consider:

- Additional instruments
- Improved adaptive difficulty
- More advanced music generation
- Exporting sheet music
- Higher-quality instrument samples
- More expressive playback and articulation
- Optional microphone feedback
- Optional accounts and synchronization

Do not implement every phase simultaneously.

## 11. Quality Standards

All visible controls must perform their intended functions.

Do not substitute hardcoded sheet music for procedural generation.

Do not fabricate performance scores.

Do not substitute generic oscillator sounds for the required clarinet samples and claim that realistic playback has been implemented.

Avoid unnecessary dependencies.

Write maintainable, understandable code with clear module boundaries.

Include tests for:

- Exact rhythmic totals per measure
- Valid pitch ranges
- Correct time signatures
- Correct written-to-sounding-pitch transposition
- Correct audio note scheduling
- Accurate note durations
- Proper handling of rests
- Playback tempo adjustment
- Exercise reproducibility
- Generation across difficulty levels
- Common and edge-case parameter combinations
- Consistency between displayed notes and played notes

Test that written C5 on B-flat clarinet produces concert B-flat4 during playback.

Where automated audio tests cannot verify subjective sound quality, document the limitation and provide a clear manual listening test.

Verify that the chosen samples load successfully in supported browsers.

Make sure the app builds and runs.

## 12. Immediate Instructions

Begin by analyzing this product specification.

Create:

1. A concise software architecture.
2. Shared musical data models and interfaces.
3. A prioritized implementation plan.
4. Clear responsibilities for each available agent.
5. A proposed approach for realistic sample-based clarinet playback.

Then begin implementing Phase 1.

Do not stop after producing a plan. Continue to a working application.

Ensure the music-generation agent and audio-playback agent agree on shared pitch, timing, and articulation representations before implementation.

Prioritize functional musical generation, readable notation, and realistic playback over decorative interface features.

After implementation, report what works, what was tested, what remains incomplete, and which phase should be implemented next.

**Primary success criterion:** A user can open the web application, choose a difficulty, generate a new playable clarinet passage displayed as real sheet music, hear that passage performed using realistic sampled clarinet audio with correct transposition and rhythm, and generate another distinct passage without errors.
