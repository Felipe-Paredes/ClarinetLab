# Clarinet audio and licensing

The application loads the FluidR3_GM clarinet MP3 sample bank on first playback, using soundfont-player (MIT). Samples are retained in the AudioContext for subsequent playback. Only clarinet is requested, not the full 148 MB source bank. A network connection is required on initial load; download failure is surfaced to the user.

Attribution: FluidR3 soundfont by Frank Wen; browser sample conversion and hosting by Benjamin Gleitzman / midi-js-soundfonts. The publisher identifies FluidR3_GM as Creative Commons Attribution 3.0. The app uses the provided samples without asset modification. Playback pitch is transposed for B-flat clarinet. Preserve this attribution and the license link when redistributing.

- Sample publisher and license declaration: https://gleitz.github.io/midi-js-soundfonts/
- License: https://creativecommons.org/licenses/by/3.0/
- Clarinet sample bank: https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/clarinet-mp3.js
- Player documentation and MIT license: https://github.com/danigb/soundfont-player

FluidR3 was selected for its attribution-only license and smaller source bank than MusyngKite. The latter is published under CC BY-SA 3.0. The player is archived upstream; its small isolated adapter can be replaced later.

The clarinet uses sampled audio only. Short oscillator clicks are used solely for the metronome. Written C5 (MIDI 72) schedules sounding Bb4 (MIDI 70). Pause suspends the dedicated audio context, preserving scheduled note positions and sustained notes. Resume continues that clock. Stop cancels samples and clicks.

Manual verification: click Play with network enabled, listen for a recognizable clarinet, pause midway through a note, resume, stop, then replay at two tempos with the metronome enabled. Test desktop and mobile browser audio activation. Unit tests verify pitch and time calculations, not subjective realism or physical speaker output. Browser/device listening remains necessary. Advanced articulation and dynamic sample layers are outside Phase 1.
