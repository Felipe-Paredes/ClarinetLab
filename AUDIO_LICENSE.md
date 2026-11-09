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

## Core engine playback update
The player now uses soundfont-player only to load/cache decoded recorded buffers, then creates and cleans up its own WebAudio sources with bounded lookahead. This avoids the upstream playback registry retaining historical nodes. Ties create one source/attack. Staccato and marcato shorten the sounding envelope; tenuto/legato sustain it; accents increase gain. Dynamics and hairpins automate gain across and within notes, without changing written rhythmic time or claiming timbral dynamic layers.

Long notes use inferred positive-going zero crossings in the recorded sample body as loop points, with a scheduled release envelope. This is an approximate recorded sustain, not an oscillator and not authored seamless loop metadata. Listen for seams or tonal changes on long notes at slow tempos. Slurs approximate reduced separation, not a true sampled legato transition. First-load network, mobile audio activation and subjective realism still require device/listening checks.
