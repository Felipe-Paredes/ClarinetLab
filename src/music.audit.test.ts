import { describe, expect, it } from 'vitest';
import { generatePassage, seededRandom, DIFFICULTY_RULES } from './music';
import { DEFAULT_OPTIONS, eventTicks, type Difficulty, type KeyName } from './types';
const keys: KeyName[] = ['C','G','D','A','E','B','F#','F','Bb','Eb','Ab','Db','Gb'];
const levels: Difficulty[] = ['beginner','intermediate','advanced','expert'];
// 13 keys × 4 levels × 2 meters × 12 seeds = 1,248 exercises.
describe('1,248 deterministic exercise core audit', () => {
  for (const key of keys) for (const difficulty of levels) it(`${key}: ${difficulty}`, () => {
    const tonic = { C:0,G:7,D:2,A:9,E:4,B:11,'F#':6,F:5,Bb:10,Eb:3,Ab:8,Db:1,Gb:6 }[key];
    for (const meter of [3,4] as const) for (let seed=0;seed<12;seed++) {
      const options = { ...DEFAULT_OPTIONS, key, difficulty, meter, measures:[1,4,8,12,16,24,32,64,128][seed%9], tempo:[30,80,180,240][seed%4] };
      const passage=generatePassage(options,seededRandom(seed));
      expect(passage).toEqual(generatePassage(options,seededRandom(seed)));
      expect(passage.bars).toHaveLength(options.measures);
      for(const bar of passage.bars) {
        expect(bar.reduce((sum,n)=>sum+eventTicks(n),0)).toBe(meter*96);
        for(const n of bar) {
          expect([12,24,36,48,72,96,144,192,288,384]).toContain(n.ticks);
          if(n.kind==='rest') { expect(n.midi).toBe(-1); continue; }
          expect(n.midi).toBeGreaterThanOrEqual(DIFFICULTY_RULES[difficulty].low);
          expect(n.midi).toBeLessThanOrEqual(DIFFICULTY_RULES[difficulty].high);
          expect([0,2,4,5,7,9,11]).toContain((n.midi-tonic+12)%12);
        }
      }
      const flat=passage.bars.flat();
      let slur=false, hairpin=false;
      flat.forEach((n,i)=>{
        if(n.tieToNext) { expect(flat[i+1].midi).toBe(n.midi); expect(n.kind).toBe('note'); expect(flat[i+1].kind).toBe('note'); }
        if(n.slurStart) { expect(slur).toBe(false); slur=true; }
        if(n.slurEnd) { expect(slur).toBe(true); slur=false; }
        if(n.hairpinStart) { expect(hairpin).toBe(false); expect(n.hairpinEnd).not.toBe(true); hairpin=true; }
        if(n.hairpinEnd) { expect(hairpin).toBe(true); hairpin=false; }
      });
      expect(slur).toBe(false); expect(hairpin).toBe(false);
      expect(flat.at(-1)!.midi%12).toBe(tonic);
    }
  },15000);
});
