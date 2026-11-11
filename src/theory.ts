import type { KeyName, Tonality, PitchSpelling } from './types';
export const KEY_NAMES: KeyName[]=['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb'];
export const TONICS:Record<KeyName,number>={C:0,G:7,D:2,A:9,E:4,B:11,'F#':6,'C#':1,F:5,Bb:10,Eb:3,Ab:8,Db:1,Gb:6,Cb:11};
const LETTERS:PitchSpelling['letter'][]=['C','D','E','F','G','A','B'];
export const NATURAL_PITCH:Record<PitchSpelling['letter'],number>={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const MODES:Record<Tonality,number[]>={major:[0,2,4,5,7,9,11],'natural-minor':[0,2,3,5,7,8,10],'harmonic-minor':[0,2,3,5,7,8,11],'melodic-minor':[0,2,3,5,7,9,11],chromatic:[0,1,2,3,4,5,6,7,8,9,10,11],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],locrian:[0,1,3,5,6,8,10]};
export function scaleIntervals(tonality:Tonality='major',descending=false):number[]{if(!Object.hasOwn(MODES,tonality))throw new Error('Unknown tonality.');return tonality==='melodic-minor'&&descending?MODES['natural-minor']:MODES[tonality];}
function degrees(key:KeyName,tonality:Tonality,descending=false){
 if(!Object.hasOwn(TONICS,key))throw new Error('Unknown tonic.');
 const start=LETTERS.indexOf(key[0] as PitchSpelling['letter']);
 return scaleIntervals(tonality==='chromatic'?'major':tonality,descending).map((interval,index)=>{
  const letter=LETTERS[(start+index)%7]; const pitchClass=(TONICS[key]+interval)%12;
  let accidental=(pitchClass-NATURAL_PITCH[letter]+18)%12-6;
  return {letter,accidental,pitchClass};
 });
}
export function keySignature(key:KeyName,tonality:Tonality='major'):Record<string,number>{
 const signatureMode=tonality==='harmonic-minor'||tonality==='melodic-minor'?'natural-minor':tonality==='chromatic'?'major':tonality;
 return Object.fromEntries(degrees(key,signatureMode).map(d=>[d.letter,d.accidental]));
}
export function spellPitch(midi:number,key:KeyName,tonality:Tonality='major',descending=false):PitchSpelling{
 const choices=degrees(key,tonality,descending); const pc=((midi%12)+12)%12;
 let d=choices.find(d=>d.pitchClass===pc);
 if(!d){
  const candidates=LETTERS.map(letter=>({letter,accidental:(pc-NATURAL_PITCH[letter]+18)%12-6,pitchClass:pc})).filter(d=>Math.abs(d.accidental)<=1);
  d=candidates.find(d=>descending?d.accidental<=0:d.accidental>=0)??candidates[0];
 }
 return {letter:d.letter,accidental:d.accidental,octave:(midi-NATURAL_PITCH[d.letter]-d.accidental)/12-1};
}
export function scalePitches(key:KeyName,tonality:Tonality,low:number,high:number,descending=false):{midi:number;spelling:PitchSpelling}[]{
 const intervals=scaleIntervals(tonality,descending);
 return Array.from({length:Math.max(0,high-low+1)},(_,i)=>low+i).filter(midi=>intervals.includes((midi-TONICS[key]+12)%12)).map(midi=>({midi,spelling:spellPitch(midi,key,tonality,descending)}));
}
export function abcKey(key:KeyName,tonality:Tonality='major'):string{
 const suffix:Record<Tonality,string>={major:'',chromatic:'','natural-minor':'min','harmonic-minor':'min','melodic-minor':'min',dorian:'dor',phrygian:'phr',lydian:'lyd',mixolydian:'mix',locrian:'loc'};
 return key+suffix[tonality];
}
