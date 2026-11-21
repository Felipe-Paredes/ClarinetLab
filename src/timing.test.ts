import { describe,it,expect } from 'vitest';
import { createTimeline,createMetronomeSchedule } from './timing';
import { createSchedule,DYNAMIC_GAIN } from './audio';
import { DEFAULT_OPTIONS,type Passage,type NoteEvent } from './types';
import { resolveMeter } from './meter';
const note=(ticks:number,extra:Partial<NoteEvent>={}):NoteEvent=>({kind:'note',midi:72,beats:ticks/96,ticks,...extra});
const score=(bars:NoteEvent[][],extra:Partial<Passage['options']>={}):Passage=>({options:{...DEFAULT_OPTIONS,...extra},bars});
describe('V3 meter and expressive timing',()=>{
 it('interprets 6/8 BPM as dotted quarters and 3/8 as eighths',()=>{
  const compound=score([[note(144),note(144)]],{timeSignature:'6/8',tempo:72});
  expect(createSchedule(compound,72).duration).toBeCloseTo(120/72);
  expect(createMetronomeSchedule(compound,72).map(b=>b.time)).toEqual([0,60/72]);
  const simple=score([[note(48),note(48),note(48)]],{timeSignature:'3/8',tempo:72});
  expect(createSchedule(simple,72).duration).toBeCloseTo(180/72);
 });
 it('accents explicit asymmetric group starts without confusing BPM units',()=>{
  const p=score([Array.from({length:7},()=>note(48))],{timeSignature:'7/8',grouping:[2,3,2],tempo:60});
  expect(createMetronomeSchedule(p,60).map(b=>[b.time,b.accent])).toEqual([[0,'bar'],[1,'beat'],[2,'group'],[3,'beat'],[4,'beat'],[5,'group'],[6,'beat']]);
 });
 it('handles meter changes and half-note beats',()=>{
  const p=score([[note(384)],[note(288)]],{tempo:60});p.meters=[resolveMeter('2/2'),resolveMeter('6/8')];
  expect(createSchedule(p,60).duration).toBe(4);
  expect(createMetronomeSchedule(p,60).map(b=>b.time)).toEqual([0,1,2,3]);
 });
 it('integrates a linear BPM ramp analytically and scales the entire tempo map',()=>{
  const p=score([[note(384)]],{tempo:60});p.tempoEvents=[{tick:0,bpm:60,label:'accel.',endTick:384,targetBpm:120}];
  expect(createTimeline(p,60).duration).toBeCloseTo(4*Math.log(2),8);
  expect(createTimeline(p,120).duration).toBeCloseTo(2*Math.log(2),8);
 });
 it('applies a tempo restoration after ritardando',()=>{
  const p=score([[note(384)],[note(384)]],{tempo:120});p.tempoEvents=[{tick:0,bpm:120,label:'rit.',endTick:384,targetBpm:60},{tick:384,bpm:120,label:'a tempo'}];
  const map=createTimeline(p,120);expect(map.secondsAt(384)).toBeCloseTo(4*Math.log(2),8);expect(map.duration).toBeCloseTo(4*Math.log(2)+2,8);
 });
 it('fermata extends performance and following onsets without changing the written values',()=>{
  const p=score([[note(96,{fermata:2}),note(96)]]);const before=JSON.stringify(p);const scheduled=createSchedule(p,60);
  expect(scheduled.notes.map(n=>[n.time,n.duration])).toEqual([[0,2],[2,1]]);expect(scheduled.duration).toBe(3);expect(JSON.stringify(p)).toBe(before);
 });
 it('triplets and sixteenth triplets occupy exact shared-clock durations',()=>{
  const p=score([[note(32),note(32),note(32),note(16),note(16),note(16)]]);
  expect(createSchedule(p,60).duration).toBe(1.5);
 });
 it('rejects invalid tempo changes and fermatas',()=>{
  const p=score([[note(96)]]);p.tempoEvents=[{tick:0,bpm:0,label:'Largo'}];expect(()=>createSchedule(p,60)).toThrow('tempo');
  expect(()=>createSchedule(score([[note(96,{fermata:0})]]),60)).toThrow('fermata');
 });
});
describe('V3 expression and ornaments',()=>{
 it('supports the full dynamic range and detached articulation ordering',()=>{
  expect(DYNAMIC_GAIN.ppp).toBeLessThan(DYNAMIC_GAIN.pp);expect(DYNAMIC_GAIN.fff).toBeGreaterThan(DYNAMIC_GAIN.ff);
  const p=score([[note(96,{articulation:'staccatissimo'}),note(96,{articulation:'staccato'}),note(96,{articulation:'portato'}),note(96,{articulation:'tenuto'})]]);
  expect(createSchedule(p,60).notes.map(n=>n.soundingDuration)).toEqual([0.28,0.5,0.82,1]);
 });
 it('fortepiano has a loud attack then a piano sustain, while subito persists',()=>{
  const p=score([[note(96,{emphasis:'fp'}),note(96),note(96,{emphasis:'subito f'}),note(96)]]);const n=createSchedule(p,60).notes;
  expect(n[0].gainAutomation![0].gain).toBe(DYNAMIC_GAIN.f);expect(n[0].gainAutomation![1].gain).toBe(DYNAMIC_GAIN.p);expect(n[1].gain).toBe(DYNAMIC_GAIN.p);expect(n[3].gain).toBe(DYNAMIC_GAIN.f);
 });
 for(const ornament of ['grace','appoggiatura','acciaccatura','trill','mordent','turn'] as const)it(ornament+' playback fits inside the written note',()=>{
  const p=score([[note(96,{ornament,ornamentMidi:74}),note(96)]]);const n=createSchedule(p,60);
  expect(n.duration).toBe(2);expect(n.notes.length).toBeGreaterThan(2);expect(n.notes.at(-1)!.time).toBe(1);expect(n.notes[0].time).toBe(0);
  expect(n.notes.slice(0,-1).reduce((sum,n)=>sum+n.duration,0)).toBeCloseTo(1);
  expect(n.notes.slice(0,-1).some(n=>n.midi!==70)).toBe(true);
 });
});

it('ornaments at configured range edges stay within that range',()=>{
 for(const midi of [52,91])for(const ornament of ['mordent','turn','trill'] as const){
  const p=score([[note(96,{midi,ornament})]],{difficulty:'expert',pitchLow:52,pitchHigh:91});
  expect(createSchedule(p,60).notes.every(n=>n.midi>=50&&n.midi<=89)).toBe(true);
 }
});
