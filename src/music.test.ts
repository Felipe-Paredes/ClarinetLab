import { describe, expect, it } from 'vitest';
import { generatePassage, seededRandom } from './music';
import { DEFAULT_OPTIONS, type ExerciseOptions } from './types';
const make=(extra:Partial<ExerciseOptions>={},seed=42)=>generatePassage({...DEFAULT_OPTIONS,...extra},seededRandom(seed));
describe('generation feature regressions',()=>{
 it('reproduces definitions and varies seeds',()=>{expect(make()).toEqual(make());expect(make({},1)).not.toEqual(make({},2));});
 it('validates options and RNG before producing invalid music',()=>{
  for(const extra of [{measures:0},{measures:129},{tempo:NaN},{key:'constructor'},{difficulty:'constructor'},{rhythm:'invalid'}]) expect(()=>make(extra as Partial<ExerciseOptions>)).toThrow();
  for(const n of [NaN,Infinity,-0.1,1]) expect(()=>generatePassage(DEFAULT_OPTIONS,()=>n)).toThrow('Random');
 });
 it('contains every supported exact duration over a deterministic batch',()=>{
  const ticks=new Set<number>();
  for(const difficulty of ['beginner','intermediate','advanced','expert'] as const) for(let seed=0;seed<50;seed++) make({difficulty,measures:16},seed).bars.flat().forEach(n=>ticks.add(n.ticks!));
  for(const duration of [12,24,36,48,72,96,144,192,288,384]) expect(ticks.has(duration)).toBe(true);
 });
 it('expert has higher technical density and larger leaps than advanced',()=>{
  const stats=(difficulty:'advanced'|'expert')=>{let notes=0,wide=0;for(let seed=0;seed<30;seed++){const ns=make({difficulty,measures:16,restFrequency:'none'},seed).bars.flat();notes+=ns.length;ns.forEach((n,i)=>{if(i&&Math.abs(n.midi-ns[i-1].midi)>=9)wide++;});}return {notes,wide};};
  const advanced=stats('advanced'),expert=stats('expert');expect(expert.notes).toBeGreaterThan(advanced.notes);expect(expert.wide).toBeGreaterThan(advanced.wide);
 });
 it('rest frequency and exercise type affect first-class silence',()=>{
  const rests=(extra:Partial<ExerciseOptions>)=>Array.from({length:25},(_,seed)=>make({difficulty:'expert',measures:8,...extra},seed).bars.flat().filter(n=>n.kind==='rest').length).reduce((a,b)=>a+b,0);
  expect(rests({restFrequency:'none'})).toBe(0); expect(rests({restFrequency:'high'})).toBeGreaterThan(rests({restFrequency:'low'}));
  expect(rests({exerciseType:'rhythm',restFrequency:'medium'})).toBeGreaterThan(rests({exerciseType:'scales',restFrequency:'medium'}));
 });
 it('all customization controls affect music',()=>{
  const base:Partial<ExerciseOptions>={difficulty:'expert',measures:16};
  for(const [a,b] of [[{rhythm:'simple'},{rhythm:'complex'}],[{articulationComplexity:'none'},{articulationComplexity:'patterned'}],[{dynamics:'none'},{dynamics:'expressive'}],[{articulation:'staccato'},{articulation:'tenuto'}],[{exerciseType:'scales'},{exerciseType:'rhythm'}]] as [Partial<ExerciseOptions>,Partial<ExerciseOptions>][]) expect(make({...base,...a}).bars).not.toEqual(make({...base,...b}).bars);
 });
 it('includes closed slurs, dynamic contours and cross-bar ties',()=>{
  const p=make({difficulty:'expert',measures:16,restFrequency:'none',articulation:'legato',dynamics:'expressive'});
  expect(p.bars.some((bar,i)=>i<p.bars.length-1&&bar.at(-1)!.tieToNext)).toBe(true);
  expect(p.bars.flat().some(n=>n.slurStart)).toBe(true);expect(p.bars.flat().some(n=>n.hairpinStart==='crescendo')).toBe(true);expect(p.bars.flat().some(n=>n.hairpinStart==='diminuendo')).toBe(true);
 });
});
