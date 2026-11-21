import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { passageToAbc } from './notationAbc';
import { DEFAULT_OPTIONS, TICKS_PER_BEAT, type KeyName, type NoteEvent, type Passage, type Tonality } from './types';
import { METER_NAMES, resolveMeter } from './meter';
import { KEY_NAMES, scalePitches } from './theory';
const note = (midi: number, beats: number, extra: Partial<NoteEvent> = {}): NoteEvent => ({ midi, beats, ticks: beats * TICKS_PER_BEAT, ...extra });
function parsed(source: Passage) {
  const tune = abcjs.parseOnly(passageToAbc(source))[0];
  expect(tune.warnings ?? []).toEqual([]);
  return tune;
}

describe('expressive notation serialization', () => {
  it('preserves contextual pitches across all 15 tonics and 10 tonalities', () => {
    const modes: Tonality[] = ['major','natural-minor','harmonic-minor','melodic-minor','chromatic','dorian','phrygian','lydian','mixolydian','locrian'];
    for (const key of KEY_NAMES) for (const tonality of modes) {
      const pitches=scalePitches(key,tonality,52,91);
      const source:Passage={options:{...DEFAULT_OPTIONS,key,tonality},bars:pitches.map(p=>[note(p.midi,4,{spelling:p.spelling})])};
      expect(parsed(source).setUpAudio({}).tracks[0].filter(e=>e.cmd==='note').map(e=>e.pitch),`${key} ${tonality}`).toEqual(pitches.map(p=>p.midi));
    }
  });
  it('encodes all meters and their tempo units with exact full-bar rests', () => {
    for (const timeSignature of METER_NAMES) {
      const meter=resolveMeter(timeSignature);
      const source:Passage={options:{...DEFAULT_OPTIONS,timeSignature},bars:[[note(-1,meter.barTicks/96,{kind:'rest'})],[note(72,meter.barTicks/96)]]};
      expect(parsed(source).setUpAudio({}).tracks[0].filter(e=>e.cmd==='note')[0].start*384).toBe(meter.barTicks);
      expect(parsed(source).metaText.tempo?.duration?.[0]).toBe(meter.beatTicks/384);
    }
  });
  it('beams compound and asymmetric groups without crossing their boundaries', () => {
    const source:Passage={options:{...DEFAULT_OPTIONS,timeSignature:'6/8'},bars:[Array.from({length:6},()=>note(60,.5))]};
    expect(passageToAbc(source)).toContain('C1C1C1 C1C1C1');
    source.options.timeSignature='7/8';source.options.grouping=[3,2,2];source.bars[0].push(note(60,.5));
    expect(passageToAbc(source)).toContain('C1C1C1 C1C1 C1C1');
  });
  it('keeps performed triplet and sextuplet durations exact in the parser', () => {
    for(const actual of [3,6] as const){
      const normal=actual===3?2:4;
      const source:Passage={options:DEFAULT_OPTIONS,bars:[Array.from({length:actual},(_,i)=>note(60+i,1/3,{tuplet:{actual,normal,writtenTicks:48,group:'a',start:i===0}}))]};
      const audio=parsed(source).setUpAudio({}).tracks[0].filter(e=>e.cmd==='note');
      expect(audio).toHaveLength(actual);
      for (const event of audio) expect(Math.abs(event.duration*384-32)).toBeLessThan(0.001);
    }
  });
  it('renders expanded performance directions and meter/key/tempo changes', () => {
    const source:Passage={options:DEFAULT_OPTIONS,keys:['C','D'],meters:[resolveMeter('4/4'),resolveMeter('6/8')],tempoEvents:[{tick:384,bpm:72,label:'rit.',endTick:672,targetBpm:60}],bars:[
      [note(60,1,{dynamic:'ppp',articulation:'staccatissimo',emphasis:'sfz'}),note(62,1,{dynamic:'fff',articulation:'portato',emphasis:'fp'}),note(64,1,{fermata:1.5,breath:true,emphasis:'subito p'}),note(65,1,{ornament:'trill'})],
      [note(66,1,{ornament:'acciaccatura',ornamentMidi:64}),note(67,1,{ornament:'mordent'}),note(69,1,{ornament:'turn',emphasis:'sf'})],
    ]};
    const model=JSON.stringify(parsed(source).lines);
    for(const text of ['ppp','fff','wedge','tenuto','fermata','breath','trill','mordent','turn','fp','subito p'])expect(model).toContain(text);
    expect(passageToAbc(source)).toContain('[M:6/8][K:D][Q:"rit."3/8=72]');
  });
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
    expect(passageToAbc(source)).toContain('C3/4D1/4E1 F3/2G1/2 A3 B1');
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
