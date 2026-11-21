import { describe,it,expect } from 'vitest';
import { METER_NAMES,resolveMeter,beatLabel } from './meter';
import { KEY_NAMES,TONICS,scalePitches,keySignature,NATURAL_PITCH,spellPitch } from './theory';
import type { Tonality } from './types';
describe('V3 shared meter contracts',()=>{
 it.each(METER_NAMES)('%s defines exact groups and beat unit',name=>{
  const m=resolveMeter(name);expect(m.groupTicks.reduce((a,b)=>a+b,0)).toBe(m.barTicks);expect(m.barTicks).toBe(m.numerator*384/m.denominator);
 });
 it('distinguishes simple eighth compound dotted-quarter and cut-time beats',()=>{
  expect(resolveMeter('3/8').beatTicks).toBe(48);expect(resolveMeter('6/8').groupTicks).toEqual([144,144]);expect(resolveMeter('9/8').groupTicks).toEqual([144,144,144]);expect(resolveMeter('12/8').groupTicks).toEqual([144,144,144,144]);expect(resolveMeter('2/2').beatTicks).toBe(192);expect(beatLabel(resolveMeter('6/8'))).toBe('dotted quarter');
 });
 it('validates asymmetric groupings',()=>{
  expect(resolveMeter('7/8',[2,3,2]).groupTicks).toEqual([96,144,96]);expect(resolveMeter('5/8',[3,2]).groupTicks).toEqual([144,96]);expect(()=>resolveMeter('7/8',[2,2])).toThrow();expect(()=>resolveMeter('6/8',[2,2,2])).toThrow();
 });
});
describe('V3 contextual pitch spelling',()=>{
 it.each(KEY_NAMES)('%s spells every degree with correct sounding MIDI in all modes',key=>{
  for(const mode of ['major','natural-minor','harmonic-minor','melodic-minor','chromatic','dorian','phrygian','lydian','mixolydian','locrian'] as Tonality[]) {
   const pitches=scalePitches(key,mode,52,91);expect(pitches.length).toBeGreaterThan(0);
   for(const {midi,spelling:p} of pitches){expect(Number.isInteger(p.octave)).toBe(true);expect((p.octave+1)*12+NATURAL_PITCH[p.letter]+p.accidental).toBe(midi);expect(Math.abs(p.accidental)).toBeLessThanOrEqual(2);}
  }
 });
 it('keeps correct B-sharp/C-flat octaves and harmonic leading tones',()=>{
  expect(spellPitch(60,'C#','major')).toEqual({letter:'B',accidental:1,octave:3});expect(spellPitch(59,'Cb','major')).toEqual({letter:'C',accidental:-1,octave:4});expect(spellPitch(68,'A','harmonic-minor').accidental).toBe(1);expect(keySignature('A','harmonic-minor').G).toBe(0);
 });
 it('uses natural minor descending melodic minor',()=>{
  expect(scalePitches('A','melodic-minor',60,72,true).map(n=>n.midi)).toContain(67);expect(scalePitches('A','melodic-minor',60,72,false).map(n=>n.midi)).toContain(68);
  expect(TONICS.Cb).toBe(11);
 });
});
