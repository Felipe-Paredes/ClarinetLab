import { describe, expect, it } from 'vitest';
import { generatePassage, seededRandom, ACCEPTANCE_OPTIONS } from './music';
import { DEFAULT_OPTIONS, eventTicks, type ExerciseOptions } from './types';
const make=(extra:Partial<ExerciseOptions>={},seed=42)=>generatePassage({...DEFAULT_OPTIONS,...extra},seededRandom(seed));
describe('Version 3 generation features',()=>{
 it('reproduces complete definitions and varies seeds',()=>{expect(make()).toEqual(make());expect(make({},1)).not.toEqual(make({},2));});
 it('rejects invalid settings and random sources',()=>{for(const extra of [{measures:0},{measures:129},{tempo:NaN},{key:'constructor'},{difficulty:'constructor'},{rhythm:'invalid'},{articulationProbability:2}])expect(()=>make(extra as Partial<ExerciseOptions>)).toThrow();for(const n of [NaN,Infinity,-.1,1])expect(()=>generatePassage(DEFAULT_OPTIONS,()=>n)).toThrow('Random');});
 it('emits triplets, sextuplets, double dots and thirty-seconds',()=>{
  const ticks=new Set<number>(),tuplets=new Set<number>();for(let seed=0;seed<50;seed++)for(const timeSignature of ['4/4','6/8','2/2'] as const){const p=make({difficulty:'expert',timeSignature,measures:16},seed);p.bars.flat().forEach(n=>{ticks.add(eventTicks(n));if(n.tuplet)tuplets.add(n.tuplet.actual);});}
  for(const n of [12,24,48,72,84,96,144,168,192])expect(ticks.has(n)).toBe(true);expect(tuplets).toEqual(new Set([3,6]));
 });
 it('procedure produces multiple complete acceptance études',()=>{
  for(const seed of [1,23,1729,1730]){const p=generatePassage(ACCEPTANCE_OPTIONS,seededRandom(seed)),notes=p.bars.flat();expect(p.bars).toHaveLength(32);expect(notes.some(n=>n.tuplet)).toBe(true);expect(notes.some(n=>n.kind==='rest')).toBe(true);expect(notes.some(n=>n.breath)).toBe(true);expect(notes.some(n=>n.ticks===24)).toBe(true);expect(notes.some(n=>n.ticks===48)).toBe(true);expect(notes.some(n=>n.ticks===72)).toBe(true);for(const a of ['legato','staccato','tenuto','accent','marcato'])expect(notes.some(n=>n.articulation===a)).toBe(true);expect(notes.some(n=>n.dynamic==='p')).toBe(true);expect(notes.some(n=>n.dynamic==='ff')).toBe(true);expect(new Set(p.bars.map(b=>b.map(n=>n.ticks).join(','))).size).toBeGreaterThan(1);}
 });
 it('rests respond to category and frequency',()=>{
  const count=(extra:Partial<ExerciseOptions>)=>Array.from({length:20},(_,seed)=>make({difficulty:'expert',measures:8,...extra},seed).bars.flat().filter(n=>n.kind==='rest').length).reduce((a,b)=>a+b,0);
  expect(count({restFrequency:'none'})).toBe(0);expect(count({restFrequency:'high'})).toBeGreaterThan(count({restFrequency:'low'}));expect(count({exerciseType:'rhythm',restFrequency:'medium'})).toBeGreaterThan(count({exerciseType:'scales',restFrequency:'medium'}));
 });
 it('all standard dynamics, emphasis and ornament types can appear',()=>{
  const dynamics=new Set(),emphasis=new Set(),ornaments=new Set();for(let seed=0;seed<25;seed++)make({difficulty:'expert',measures:64,dynamics:'expressive',ornamentFrequency:'medium'},seed).bars.flat().forEach(n=>{if(n.dynamic)dynamics.add(n.dynamic);if(n.emphasis)emphasis.add(n.emphasis);if(n.ornament)ornaments.add(n.ornament);});expect(dynamics.size).toBe(8);expect(emphasis.size).toBe(5);expect(ornaments.size).toBe(6);
 });
 it('emits meaningful tempo events, fermatas, key and meter changes',()=>{const p=make({difficulty:'expert',measures:32,tempoExpression:'musical',tempoWord:'Andante',changingMeters:true,keyChanges:true});expect(p.tempoEvents!.some(e=>e.label==='rit.')).toBe(true);expect(p.tempoEvents!.some(e=>e.label==='a tempo')).toBe(true);expect(p.bars.flat().some(n=>n.fermata)).toBe(true);expect(new Set(p.keys).size).toBeGreaterThan(1);expect(new Set(p.meters!.map(m=>m.name)).size).toBeGreaterThan(1);});
 it('technique and range controls influence generated pitches',()=>{const options={difficulty:'expert' as const,measures:16,pitchLow:67,pitchHigh:82};for(const exerciseType of ['crossing-break','repeated-notes','intervals','arpeggios','chromatic'] as const){const p=make({...options,exerciseType});expect(p.bars.flat().filter(n=>n.kind==='note').every(n=>n.midi>=67&&n.midi<=82)).toBe(true);}expect(make({...options,exerciseType:'intervals',intervalSize:3}).bars).not.toEqual(make({...options,exerciseType:'intervals',intervalSize:7}).bars);});
});
