import { describe,expect,it } from 'vitest';
import { generatePassage,seededRandom } from './music';
import { METER_NAMES } from './meter';
import { KEY_NAMES } from './theory';
import { eventTicks, type Difficulty, type Tonality } from './types';
const levels:Difficulty[]=['beginner','intermediate','advanced','expert'];
const tonalities:Tonality[]=['major','natural-minor','harmonic-minor','melodic-minor','chromatic','dorian','phrygian','lydian','mixolydian','locrian'];
// 13 meters × 4 difficulty levels × 24 seeds = 1,248 independent deterministic studies.
describe('Version3: 1,248 generated-exercise audit',()=>{
 for(const timeSignature of METER_NAMES)for(const difficulty of levels)it(`${timeSignature} ${difficulty}`,()=>{
  for(let seed=0;seed<24;seed++){
   const options={key:KEY_NAMES[seed%KEY_NAMES.length],meter:4 as const,timeSignature,difficulty,measures:[2,4,8,16,32,64][seed%6],tempo:[40,72,120,180][seed%4],tonality:tonalities[seed%tonalities.length],restFrequency:'medium' as const,ornamentFrequency:'low' as const,tempoExpression:'musical' as const};
   const p=generatePassage(options,seededRandom(seed));expect(p).toEqual(generatePassage(options,seededRandom(seed)));expect(p.bars).toHaveLength(options.measures);
   p.bars.forEach((bar,b)=>{expect(bar.reduce((s,n)=>s+eventTicks(n),0)).toBe(p.meters![b].barTicks);for(const n of bar){if(n.kind==='rest')expect(n.midi).toBe(-1);else{expect(n.midi).toBeGreaterThanOrEqual(52);expect(n.midi).toBeLessThanOrEqual(91);}if(n.tuplet)expect(n.tuplet.writtenTicks*n.tuplet.normal).toBe(n.ticks!*n.tuplet.actual);}});
  }
 },30000);
});
