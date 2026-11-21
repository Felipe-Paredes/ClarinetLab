import type { MeterDefinition, NoteEvent } from './types';
interface Cell { ticks:number; writtenTicks?:number; actual?:3|6; normal?:2|4; group?:number; }
const plain=(values:number[]):Cell[]=>values.map(ticks=>({ticks}));
const triplet=(writtenTicks:number,actual:3|6=3):Cell[]=>Array.from({length:actual},()=>({ticks:writtenTicks*(actual===3?2:4)/actual,writtenTicks,actual,normal:actual===3?2:4,group:1}));
/** Motifs are selected within metric groups; tuplets never straddle group boundaries. */
export function rhythmBar(meter:MeterDefinition,level:number,variant:number,random:()=>number):NoteEvent[]{
 const output:NoteEvent[]=[];let serial=0;
 if(level===0 && (meter.name==='4/4'||meter.name==='3/4'||meter.name==='2/2') && variant%4===0){const lengths=meter.barTicks===384?[384]:[288];return lengths.map(ticks=>({kind:'note',midi:60,ticks,beats:ticks/96}));}
 for(const [groupIndex,size] of meter.groupTicks.entries()){
  let remaining=size;
  while(remaining>0){
   const span=Math.min(remaining,remaining===144?144:192);
   const choices:Cell[][]=[plain([span])];
   if(span===48){choices.push(plain([24,24]));if(level>=1)choices.push(plain([36,12]),triplet(24));if(level>=3)choices.push(plain([12,12,12,12]),plain([42,6]));}
   if(span===96){choices.push(plain([48,48]));if(level>=1)choices.push(plain([72,24]),plain([24,24,24,24]),triplet(48));if(level>=2)choices.push(plain([24,48,24]),plain([84,12]));if(level>=3)choices.push(plain(Array(8).fill(12)),triplet(24,6));}
   if(span===144){choices.push(plain([48,48,48]));if(level>=1)choices.push(plain([72,24,48]),plain([24,24,48,24,24]),[...triplet(48),...plain([48])]);if(level>=2)choices.push(plain([48,24,48,24]),plain([84,12,48]));if(level>=3)choices.push(plain(Array(12).fill(12)),[...triplet(24,6),...plain([24,24])]);}
   if(span===192){choices.push(plain([96,96]),plain([144,48]));if(level>=1)choices.push(plain([48,48,48,48]),[...triplet(48),...plain([96])]);if(level>=2)choices.push(plain([168,24]),plain([48,96,48]));if(level>=3)choices.push(plain(Array(16).fill(12)),[...triplet(24,6),...triplet(24,6)]);}
   const permitted=level===0?choices.filter(c=>c.every(n=>n.ticks>=Math.min(48,span)&&!n.actual)):choices;
   const selected=permitted[(variant+groupIndex+Math.floor(random()*2))%permitted.length];
   let tupletCount=0,tupletId='';
   for(const cell of selected){
    if(cell.actual){if(tupletCount===0){tupletId=`${variant}-${groupIndex}-${serial++}`;tupletCount=cell.actual;} }
    const note:NoteEvent={kind:'note',midi:60,ticks:cell.ticks,beats:cell.ticks/96};
    if(cell.actual){note.tuplet={actual:cell.actual,normal:cell.normal!,writtenTicks:cell.writtenTicks!,group:tupletId,start:tupletCount===cell.actual};tupletCount--;}
    output.push(note);
   }
   remaining-=span;
  }
 }
 return output;
}
