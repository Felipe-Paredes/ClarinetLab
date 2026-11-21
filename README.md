# ClarinetLab

**Procedurally generated music practice for clarinetists.**

ClarinetLab is an interactive, browser-based music practice application that generates customizable sheet music exercises for B♭ clarinet players.

Inspired by the structured progression of language-learning platforms, ClarinetLab aims to make instrumental practice more accessible, engaging, and personalized.

Instead of repeatedly practicing a fixed collection of études, musicians can generate new exercises tailored to their skill level, technical objectives, and musical preferences.

**Project Status:** Active Development — Version 3

## Features

### Procedural Music Generation

- Generate unique, reproducible musical passages using deterministic random seeds.
- Choose from Beginner, Intermediate, Advanced, and Expert difficulty levels.
- Customize key, tonality, time signature, tempo, and passage length.
- Generate exercises using melodic motifs, rhythmic variation, and phrase-aware musical structures.
- Focus on specific clarinet registers and technical challenges.

### Musical Notation

ClarinetLab supports a growing range of conventional notation, including:

- **Rhythm:** Whole through thirty-second notes, dotted rhythms, double-dotted rhythms, rests, ties, and supported tuplets.
- **Meter:** 13 time signatures, including simple, compound, and asymmetric meters.
- **Articulation:** Slurs, staccato, staccatissimo, tenuto, accents, marcato, and portato.
- **Dynamics:** ppp through fff, dynamic accents, crescendos, and diminuendos.
- **Expression:** Breath marks, fermatas, tempo changes, and ornaments.
- **Tonality:** Major and minor scales, chromatic passages, and modal exercises.

Notation is rendered in the browser using abcjs.

### Realistic Clarinet Playback

Unlike basic music generators that rely on electronic oscillator sounds, ClarinetLab uses recorded clarinet samples for playback.

The audio engine provides:

- Sample-based clarinet sound using FluidR3.
- B♭ clarinet written-to-sounding pitch transposition.
- Tempo-adjustable playback.
- Play, pause, resume, and stop controls.
- Metronome accompaniment.
- Playback interpretation of rhythmic and expressive markings.

The playback engine shares musical data with the notation system to maintain consistency between the displayed score and its performance.

Expressive playback currently uses approximations such as gain and note-envelope adjustments rather than fully sampled articulation transitions.

### Customizable Practice

Users can configure exercises around individual practice goals, including rhythmic complexity, articulation, dynamics, pitch range, register focus, and technical difficulty.

The objective is to provide meaningful musical practice rather than unrestricted random note generation.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| TypeScript | Application logic and musical data models |
| Vite | Development environment and production builds |
| abcjs | Music notation rendering |
| Web Audio API | Audio scheduling and playback |
| soundfont-player | Loading recorded clarinet samples |
| Vitest | Automated testing |
| pnpm | Package management |

ClarinetLab currently operates as a client-side application without requiring user accounts or a backend service.

## Getting Started

### Prerequisites

Install:

- Node.js
- pnpm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Felipe-Paredes/ClarinetLab.git
cd ClarinetLab
```

For the current Version 3 implementation, switch to its development branch:

```bash
git switch feature/version-3
```

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Start the development server:

```bash
pnpm dev
```

Open the local URL displayed in your terminal.

### Testing

Run the automated test suite:

```bash
pnpm test
```

Create a production build:

```bash
pnpm build
```

The tests cover musical generation constraints, rhythmic correctness, pitch handling, audio scheduling, and other core functionality.

Automated tests do not replace manual evaluation of engraving quality, clarinet sound realism, or musical usefulness.

## How It Works

ClarinetLab separates exercise generation, notation, and audio into independent systems.

**1. Exercise Configuration**

The user specifies musical parameters such as difficulty, key, meter, tempo, and technical focus.

**2. Procedural Generation**

The music engine constructs a passage using musical constraints, rhythmic patterns, melodic motifs, and difficulty rules.

**3. Validation**

Generated material is checked against timing, pitch-range, and other musical constraints.

**4. Notation Rendering**

The validated exercise is converted into standard musical notation and displayed in the browser.

**5. Audio Playback**

The same musical data is interpreted by the playback engine and performed using sampled clarinet sounds with appropriate B♭ transposition.

This modular design allows the notation system, generator, and playback engine to evolve independently.

## Roadmap

### Version 1 — Initial Prototype
- Basic procedural passage generation
- Sheet music rendering
- Clarinet sample playback
- Tempo and metronome controls

### Version 2 — Expanded Music Engine
- Additional rhythmic values
- Rests and ties
- Articulations and dynamics
- Expert difficulty
- Longer exercises

### Version 3 — Comprehensive Musical Generation
- Expanded meter and rhythmic vocabulary
- Richer dynamic and articulation notation
- Musical phrasing and expression
- Ornamentation and tempo changes
- Clarinet-specific technical exercises
- Improved notation and playback consistency

### Future Development

- Structured, Duolingo-style learning paths
- Lessons and skill-based progression
- Experience points, achievements, and practice streaks
- Saved exercises and practice history
- Adaptive difficulty recommendations
- Additional instruments
- Optional performance assessment

The long-term goal is to develop ClarinetLab into a comprehensive platform for personalized instrumental practice.

## Current Limitations

ClarinetLab remains under active development.

- The musical generation engine uses heuristics and does not guarantee that every exercise will exhibit professional compositional quality.
- Clarinet playback approximates expressive performance and does not reproduce every nuance of a live instrumentalist.
- Some advanced rhythmic and engraving conventions remain unsupported.
- Sample loading requires an internet connection.
- The guided curriculum, user progress system, and automatic performance assessment are not yet implemented.
- Mobile-browser compatibility and musical usability require continued testing.

## Audio Attribution

ClarinetLab uses clarinet samples from the FluidR3_GM SoundFont, attributed to Frank Wen, with browser-compatible conversions distributed through the midi-js-soundfonts project.

The sample library is published under Creative Commons Attribution 3.0.

See [AUDIO_LICENSE.md](AUDIO_LICENSE.md) for attribution, licensing information, and playback implementation details.

## Project Documentation

- [Product Specification](PRODUCT_SPEC.md) — Overall product vision and requirements.
- [Version 3 Specification](VERSION_3_SPEC.md) — Expanded musical feature requirements.
- [Version 3 Architecture](VERSION_3_ARCHITECTURE.md) — Music engine architecture and design decisions.
- [Version 3 Quality Assurance](VERSION_3_QA.md) — Testing evidence, known limitations, and acceptance procedures.

## License

No general-purpose software license has been specified for this repository.

Third-party dependencies and audio assets remain subject to their respective licenses.

---

**ClarinetLab — Practice without running out of music.**
