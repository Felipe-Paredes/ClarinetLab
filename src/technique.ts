import type { Difficulty, ExerciseOptions, RegisterFocus } from './types';
export const DIFFICULTY_RULES:Record<Difficulty,{low:number;high:number;step:number;rhythm:number}>={beginner:{low:55,high:74,step:1,rhythm:0},intermediate:{low:52,high:79,step:2,rhythm:1},advanced:{low:52,high:84,step:4,rhythm:2},expert:{low:52,high:91,step:7,rhythm:3}};
export const REGISTER_RANGES:Record<RegisterFocus,[number,number]>={all:[52,91],chalumeau:[52,65],throat:[67,70],clarion:[71,83],altissimo:[85,91],transitions:[65,76]};
export const TECHNIQUE_METADATA={ 'crossing-break':{description:'Throat A/Bb to clarion B/C crosses the register break, even at small intervals.',pairs:[[69,71],[70,72]]},'finger-coordination':{description:'Alternating neighboring and chromatic finger changes; interval size alone does not represent fingering demand.'}};
export function pitchRange(options:ExerciseOptions):[number,number]{
 const rules=DIFFICULTY_RULES[options.difficulty];const focus=REGISTER_RANGES[options.registerFocus??'all'];
 if(!focus)throw new Error('Invalid register focus.');
 // Explicit register focus is an intentional technique override, still within clarinet range.
 const low=options.pitchLow??(options.registerFocus&&options.registerFocus!=='all'?focus[0]:rules.low);
 const high=options.pitchHigh??(options.registerFocus&&options.registerFocus!=='all'?focus[1]:rules.high);
 if(!Number.isInteger(low)||!Number.isInteger(high)||low<52||high>91||low>=high)throw new Error('Written pitch range must be E3–G6 with low below high.');
 return [Math.max(low,focus[0]),Math.min(high,focus[1])];
}
export function melodicStep(options:ExerciseOptions,index:number,motif:number[]):number{
 const category=options.exerciseType;
 if(category==='rhythm'||category==='repeated-notes')return 0;
 if(category==='scales'||category==='chromatic')return Math.floor(index/7)%2===0?1:-1;
 if(category==='arpeggios')return [2,2,3,-3,-2,-2][index%6];
 if(category==='intervals')return (index%2===0?1:-1)*((options.intervalSize??3)-1);
 if(category==='register-leaps')return index%2===0?7:-6;
 if(category==='finger-coordination')return [1,-1,2,-1][index%4];
 const base=motif[index%motif.length];
 return options.intervalComplexity==='stepwise'?Math.sign(base):options.intervalComplexity==='wide'?base*2:base;
}
