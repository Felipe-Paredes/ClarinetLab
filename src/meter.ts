import { type MeterDefinition, type MeterName, type ExerciseOptions, type Passage } from './types';
export const METER_NAMES: MeterName[] = ['2/4','3/4','4/4','2/2','3/2','3/8','6/8','9/8','12/8','5/8','7/8','5/4','7/4'];
export function resolveMeter(name: MeterName, grouping?: number[]): MeterDefinition {
  if (!METER_NAMES.includes(name)) throw new Error('Unsupported time signature.');
  const [numerator,denominator]=name.split('/').map(Number);
  const compound=denominator===8 && numerator>=6 && numerator%3===0;
  const asymmetric=numerator===5||numerator===7;
  const defaults=compound?Array(numerator/3).fill(3):asymmetric?(numerator===5?[2,3]:[2,2,3]):Array(numerator).fill(1);
  const groups=grouping??defaults;
  if (!groups.length||groups.some(n=>!Number.isInteger(n)||n<1)||groups.reduce((a,b)=>a+b,0)!==numerator) throw new Error('Beat groups must add up to the meter numerator.');
  if (grouping&&!asymmetric&&groups.join()!==defaults.join()) throw new Error('Custom grouping is supported for asymmetric meters.');
  const unit=384/denominator;
  return {name,numerator,denominator,groups:[...groups],barTicks:numerator*unit,beatTicks:compound?144:unit,groupTicks:groups.map(n=>n*unit)};
}
export function optionMeter(options:ExerciseOptions):MeterDefinition { return resolveMeter(options.timeSignature??`${options.meter}/4`,options.grouping); }
export function barMeter(passage:Passage,index:number):MeterDefinition { return passage.meters?.[index]??optionMeter(passage.options); }
export function groupStarts(meter:MeterDefinition):number[] { let t=0; return meter.groupTicks.map(n=>{const start=t;t+=n;return start;}); }
export function beatLabel(meter:MeterDefinition):string { return meter.beatTicks===144?'dotted quarter':meter.beatTicks===192?'half':meter.beatTicks===48?'eighth':'quarter'; }
