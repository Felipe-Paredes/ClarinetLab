import { barMeter } from './meter';
import { NATURAL_PITCH } from './theory';
import { eventTicks, isRest, type Passage } from './types';
/** Final invariant gate shared by generation and regression tests. */
export function validatePassage(passage:Passage):void {
 if(passage.bars.length!==passage.options.measures)throw new Error('Measure count does not match exercise definition.');
 let slur=false, hairpin=false,total=0;
 const flat=passage.bars.flat(); let index=0;
 for(let b=0;b<passage.bars.length;b++){
  const bar=passage.bars[b];const meter=barMeter(passage,b);
  if(bar.reduce((sum,n)=>sum+eventTicks(n),0)!==meter.barTicks)throw new Error('Measure duration does not match meter.');
  let tupletGroup:string|undefined;let tupletRemaining=0;
  for(const n of bar){
   const ticks=eventTicks(n); total+=ticks;
   if(isRest(n)){if(n.midi!==-1)throw new Error('Rest must have no pitch.');if(n.slurStart||n.slurEnd||n.tieToNext||n.ornament)throw new Error('Rest cannot carry note connections or ornament.');}
   else{
    if(!Number.isInteger(n.midi)||n.midi<52||n.midi>91)throw new Error('Pitch outside supported clarinet range.');
    if(n.spelling&&(n.spelling.octave+1)*12+NATURAL_PITCH[n.spelling.letter]+n.spelling.accidental!==n.midi)throw new Error('Pitch spelling and MIDI disagree.');
   }
   if(n.tieToNext){const next=flat[index+1];if(!next||isRest(next)||next.midi!==n.midi||n.breath)throw new Error('Invalid tie connection.');}
   if(n.slurStart){if(slur)throw new Error('Nested slur.');slur=true;}
   if(isRest(n)&&slur)throw new Error('Slur crosses a rest.');
   if(n.slurEnd){if(!slur)throw new Error('Unopened slur.');slur=false;}
   if(n.hairpinEnd){if(!hairpin)throw new Error('Unopened hairpin.');hairpin=false;}
   if(n.hairpinStart){if(hairpin)throw new Error('Overlapping hairpins.');hairpin=true;}
   if(n.tuplet){
    const t=n.tuplet;if(t.writtenTicks*t.normal!==ticks*t.actual)throw new Error('Incorrect tuplet ratio.');
    if(t.start){if(tupletRemaining)throw new Error('Overlapping tuplets.');tupletGroup=t.group;tupletRemaining=t.actual;}
    if(!tupletRemaining||tupletGroup!==t.group)throw new Error('Discontinuous tuplet.');
    tupletRemaining--;
   }else if(tupletRemaining)throw new Error('Incomplete tuplet.');
   if(n.fermata!==undefined&&(!Number.isFinite(n.fermata)||n.fermata<1||n.fermata>4))throw new Error('Invalid fermata multiplier.');
   index++;
  }
  if(tupletRemaining)throw new Error('Tuplet crosses measure boundary.');
 }
 if(slur||hairpin)throw new Error('Unclosed expression span.');
 let previous=-1;
 for(const event of passage.tempoEvents??[]){
  if(!Number.isInteger(event.tick)||event.tick<previous||event.tick<0||event.tick>=total||!Number.isFinite(event.bpm)||event.bpm<20||event.bpm>300)throw new Error('Invalid tempo event.');
  if(event.endTick!==undefined&&(!Number.isInteger(event.endTick)||event.endTick<=event.tick||event.endTick>total||!event.targetBpm||event.targetBpm<20||event.targetBpm>300))throw new Error('Invalid tempo ramp.');previous=event.tick;
 }
}
