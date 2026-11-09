import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { passageToAbc } from './notationAbc';
import { DEFAULT_OPTIONS, TICKS_PER_BEAT, type KeyName, type NoteEvent, type Passage } from './types';
const note = (midi: number, beats: number, extra: Partial<NoteEvent> = {}): NoteEvent => ({ midi, beats, ticks: beats * TICKS_PER_BEAT, ...extra });
function parsed(source: Passage) {
  const tune = abcjs.parseOnly(passageToAbc(source))[0];
  expect(tune.warnings ?? []).toEqual([]);
  return tune;
}

describe('expressive notation serialization', () => {
  it('preserves spelling octaves for sharp and flat signatures', () => {
    const cases: [KeyName, number[]][] = [
      ['B', [59, 63, 66, 70]], ['F#', [53, 65, 77, 89]], ['Gb', [59, 71, 83]],
      ['Db', [61, 63, 65, 66]], ['Ab', [56, 60, 63, 68]], ['Eb', [51, 55, 58, 63]],
      ['A', [57, 61, 64, 69]], ['E', [52, 56, 59, 64]],
    ];
    for (const [key, pitches] of cases) {
      const source = {options:{...DEFAULT_OPTIONS,key},bars:[pitches.map(midi=>note(midi,1))]};
      const audio = parsed(source).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note');
      expect(audio.map(event=>event.pitch)).toEqual(pitches);
    }
  });
  it('resets chromatic accidentals within and between measures', () => {
    const source = {options:DEFAULT_OPTIONS,bars:[[note(66,1),note(65,1),note(66,1),note(65,1)],[note(65,4)]]};
    expect(parsed(source).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note').map(event=>event.pitch)).toEqual([66,65,66,65,65]);
  });
  it('keeps dotted values exact down to dotted sixteenths and separates metric beams', () => {
    const source = { options:DEFAULT_OPTIONS, bars:[[note(60,.375),note(62,.125),note(64,.5),note(65,.75),note(67,.25),note(69,1.5),note(71,.5)]] };
    const audio = parsed(source).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note');
    expect(audio.map(event=>event.duration*4)).toEqual(source.bars[0].map(event=>event.beats));
    expect(passageToAbc(source)).toContain('C3/4D1/4E1 F6/4G2/4 A3 B1');
  });
  it('writes whole-measure rests in either meter with correct following onset', () => {
    for(const meter of [3,4] as const) {
      const source = {options:{...DEFAULT_OPTIONS,meter},bars:[[note(-1,meter,{kind:'rest'})],[note(72,meter)]]};
      expect(passageToAbc(source)).toContain('Z |');
      const audio = parsed(source).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note');
      expect(audio[0].start*4).toBe(meter);
      expect(audio[0].duration*4).toBe(meter);
    }
  });
  it('distinguishes a tie across a barline from a slur between separate notes', () => {
    const tied = {options:DEFAULT_OPTIONS,bars:[[note(72,4,{tieToNext:true})],[note(72,4)]]};
    const slurred = {options:DEFAULT_OPTIONS,bars:[[note(72,2,{slurStart:true}),note(74,2,{slurEnd:true})]]};
    const tieAudio=parsed(tied).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note');
    expect(tieAudio).toHaveLength(1);
    expect(tieAudio[0].duration*4).toBe(8);
    expect(parsed(slurred).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note')).toHaveLength(2);
    expect(JSON.stringify(parsed(slurred).lines)).toContain('startSlur');
    expect(JSON.stringify(parsed(slurred).lines)).toContain('endSlur');
  });
  it('retains articulation and all dynamic/hairpin decorations in the real parser', () => {
    const source: Passage = {options:DEFAULT_OPTIONS,bars:[
      [note(60,1,{articulation:'staccato',dynamic:'pp',hairpinStart:'crescendo'}),note(62,1,{articulation:'tenuto',dynamic:'p'}),note(64,1,{articulation:'accent',dynamic:'mp'}),note(65,1,{articulation:'marcato',dynamic:'mf',hairpinEnd:true})],
      [note(67,2,{dynamic:'ff',hairpinStart:'diminuendo'}),note(60,2,{dynamic:'f',hairpinEnd:true})],
    ]};
    const model = JSON.stringify(parsed(source).lines);
    for (const symbol of ['staccato','tenuto','accent','marcato','pp','p','mp','mf','f','ff','crescendo(','crescendo)','diminuendo(','diminuendo)']) expect(model).toContain('"' + symbol + '"');
  });
  it('parses 128 measures with complete note data and responsive line breaks', () => {
    const source: Passage = {options:{...DEFAULT_OPTIONS,measures:128},bars:Array.from({length:128},()=>Array.from({length:16},(_,i)=>note(60+(i%7),.25)))};
    expect(parsed(source).setUpAudio({}).tracks[0].filter(event=>event.cmd==='note')).toHaveLength(2048);
    const narrow = abcjs.parseOnly(passageToAbc(source,2))[0];
    expect(narrow.warnings ?? []).toEqual([]);
    expect(narrow.lines).toHaveLength(64);
  });
});

