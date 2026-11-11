import { eventTicks, isRest, type NoteEvent, type Passage, type PitchSpelling, type KeyName, type Tonality } from './types';
import { barMeter, groupStarts } from './meter';
import { abcKey, keySignature, spellPitch, NATURAL_PITCH } from './theory';
function fraction(ticks:number,unit=48):string { let a=ticks,b=unit;while(b){const r=a%b;a=b;b=r;}return unit/a===1?String(ticks/a):`${ticks/a}/${unit/a}`; }
function signature(key:KeyName,mode:Tonality){const accidentals=keySignature(key,mode);const theoretical=Object.values(accidentals).some(n=>Math.abs(n)>1);return {abc:theoretical?'none':abcKey(key,mode),accidentals:theoretical?{}:accidentals};}
function pitch(note:Pick<NoteEvent,'midi'|'spelling'|'courtesy'>,key:KeyName,mode:Tonality,state:Map<string,number>,sig:Record<string,number>):string {
 if(!Number.isInteger(note.midi)||note.midi<0||note.midi>127)throw new Error('Invalid written MIDI pitch.');
 const p:PitchSpelling=note.spelling??spellPitch(note.midi,key,mode);
 if((p.octave+1)*12+NATURAL_PITCH[p.letter]+p.accidental!==note.midi)throw new Error('Pitch spelling disagrees with MIDI.');
 const id=p.letter+p.octave;const previous=state.get(id)??sig[p.letter]??0;
 const mark=p.accidental===0?'=':p.accidental>0?'^'.repeat(p.accidental):'_'.repeat(-p.accidental);
 const accidental=previous===p.accidental&&!note.courtesy?'':(note.courtesy?'!courtesy!':'')+mark;
 state.set(id,p.accidental);
 return accidental+(p.octave>=5?p.letter.toLowerCase()+"'".repeat(p.octave-5):p.letter+','.repeat(4-p.octave));
}
const decorations:Partial<Record<NonNullable<NoteEvent['articulation']>,string>>={staccato:'.',staccatissimo:'!wedge!',tenuto:'!tenuto!',accent:'!accent!',marcato:'!marcato!',portato:'.!tenuto!'};
export function passageToAbc(passage:Passage,barsPerLine=4):string {
 const {options,bars}=passage;const mode=options.tonality??'major';let globalTick=0;let hairpin:string|undefined;
 const initialMeter=barMeter(passage,0);const firstKey=passage.keys?.[0]??options.key;
 const encoded=bars.map((bar,barIndex)=>{
  const meter=barMeter(passage,barIndex);const starts=groupStarts(meter);const group=(tick:number)=>starts.filter(n=>n<=tick).length-1;
  const key=passage.keys?.[barIndex]??options.key;const sig=signature(key,mode);const state=new Map<string,number>();let elapsed=0;
  let header='';if(barIndex&&meter.name!==barMeter(passage,barIndex-1).name)header+=`[M:${meter.name}]`;
  if(barIndex&&key!==(passage.keys?.[barIndex-1]??options.key))header+=`[K:${sig.abc}]`;
    // Split durations that have no single conventional note glyph (for example 5/8).
  const values=[672,576,384,336,288,192,168,144,96,84,72,48,42,36,24,21,18,12,6];
  const displayBar=bar.flatMap(note=>{
   if(note.tuplet||values.includes(eventTicks(note)))return [note];
   let remaining=eventTicks(note);const parts:NoteEvent[]=[];
   while(remaining){const ticks=values.find(n=>n<=remaining);if(!ticks)throw new Error('Unrepresentable notation duration.');remaining-=ticks;
    parts.push({...note,ticks,beats:ticks/96,tieToNext:!isRest(note)&&(remaining>0||note.tieToNext),
     dynamic:parts.length?undefined:note.dynamic,slurStart:parts.length?undefined:note.slurStart,
     slurEnd:remaining?undefined:note.slurEnd,breath:remaining?undefined:note.breath});}
   return parts;
  });
  const content=displayBar.map((note,index)=>{
   const ticks=eventTicks(note);const written=note.tuplet?.writtenTicks??ticks;const previous=displayBar[index-1];
   const previousTicks=previous?eventTicks(previous):0;
   const beam=previous&&!isRest(previous)&&!isRest(note)&&written<96&&(previous.tuplet?.writtenTicks??previousTicks)<96&&group(elapsed)===group(elapsed-previousTicks);
   let marks='';
   for(const event of passage.tempoEvents??[])if(event.tick===globalTick&&globalTick!==0){marks+=`[Q:"${event.label}"${fraction(meter.beatTicks,384)}=${Math.round(event.bpm)}]`;}
   if(note.hairpinEnd&&hairpin){marks+=`!${hairpin})!`;hairpin=undefined;}
   if(note.dynamic)marks+=`!${note.dynamic}!`;
   if(note.emphasis)marks+=note.emphasis==='sfz'?'!sfz!':`"_${note.emphasis}"`;
   if(note.expressionText)marks+=`"_${note.expressionText}"`;
   if(note.hairpinStart){hairpin=note.hairpinStart;marks+=`!${hairpin}(!`;}
   if(note.tuplet?.start)marks+=`(${note.tuplet.actual}:${note.tuplet.normal}:${note.tuplet.actual}`;
   if(note.slurStart)marks+='(';
   if(!isRest(note))marks+=decorations[note.articulation??'unmarked']??'';
   if(note.fermata)marks+='!fermata!';
   if(note.ornament&&!isRest(note)){
    if(['trill','mordent','turn'].includes(note.ornament))marks+=`!${note.ornament}!`;
    else {const graceMidi=note.ornamentMidi??note.midi;marks+='{'+(note.ornament==='acciaccatura'?'/':'')+pitch({midi:graceMidi,spelling:note.ornamentSpelling},key,mode,new Map(state),sig.accidentals)+'}';}
   }
   const fullRest=isRest(note)&&displayBar.length===1&&ticks===meter.barTicks;
   const body=fullRest?'Z':(isRest(note)?'z':pitch(note,key,mode,state,sig.accidentals))+fraction(written);
   elapsed+=ticks;globalTick+=ticks;
   return(index===0||beam?'':' ')+marks+body+(note.tieToNext?'-':'')+(note.slurEnd?')':'')+(note.breath?'!breath!':'');
  }).join('');return header+content;
 });
 const count=Math.max(1,Math.floor(barsPerLine));const lines:string[]=[];
 for(let i=0;i<encoded.length;i+=count)lines.push(encoded.slice(i,i+count).join(' | ')+(i+count>=encoded.length?' |]':' |'));
 const tempoWord=options.tempoWord??passage.tempoEvents?.find(e=>e.tick===0)?.label;
 return ['X:1','T:Clarinet étude',`M:${initialMeter.name}`,'L:1/8',`Q:${tempoWord?'"'+tempoWord+'"':''}${fraction(initialMeter.beatTicks,384)}=${options.tempo}`,'%%stretchlast 1',`K:${signature(firstKey,mode).abc} clef=treble`,...lines].join('\n');
}

