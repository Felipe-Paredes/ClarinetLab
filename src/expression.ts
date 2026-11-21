import type { Articulation, Dynamic, Emphasis, Passage, TempoEvent } from './types';
import { groupStarts } from './meter';
const DYNAMICS:Dynamic[]=['ppp','pp','p','mp','mf','f','ff','fff'];
export function applyExpression(passage:Passage,random:()=>number):void{
 const o=passage.options;const probability=o.articulationProbability??1;const complexity=o.articulationComplexity??'simple';
 const highLevel=o.difficulty==='advanced'||o.difficulty==='expert';
 const mixed:Articulation[]=['legato','legato','staccato','tenuto','accent','marcato','portato','staccatissimo'];
 passage.bars.forEach((bar,b)=>{
  let elapsed=0;const starts=groupStarts(passage.meters![b]);
  bar.forEach((note,i)=>{
   if(note.kind==='note'&&complexity!=='none'&&random()<probability){
    let articulation:Articulation=o.articulation==='mixed'||!o.articulation?mixed[(i+b*2)%(highLevel?8:4)]:o.articulation;
    if(highLevel&&o.articulation==='mixed'&&starts.includes(elapsed)&&i===0)articulation=b%2===0?'accent':'marcato';
    if(highLevel&&complexity==='patterned'&&(o.articulation==='mixed'||!o.articulation)&&b%4===0&&i<4)articulation='legato';
    if(o.exerciseType==='fast-articulation'||o.exerciseType==='repeated-notes')articulation=i%4===0?'accent':'staccato';
    if((articulation==='accent'||articulation==='marcato')&&!starts.includes(elapsed))articulation='unmarked';
    note.articulation=articulation;
   }
   elapsed+=note.ticks!;
  });
  for(let i=0;i<bar.length;i++)if(bar[i].articulation==='legato'&&bar[i].kind==='note'){
   let end=i;const max=complexity==='patterned'?4:2;
   while(end+1<bar.length&&bar[end+1].kind==='note'&&bar[end+1].articulation==='legato'&&end-i+1<max&&!bar[end].breath)end++;
   if(end>i){bar[i].slurStart=true;bar[end].slurEnd=true;}i=end;
  }
 });
 for(const [phraseIndex,phrase] of passage.phrases!.entries()){
  const notes=passage.bars.slice(phrase.startBar,phrase.endBar+1).flat().filter(n=>n.kind==='note');
  if(!notes.length)continue;
  if(o.dynamics!=='none'){
   const min=DYNAMICS.indexOf(o.dynamicMin??(o.dynamics==='expressive'?'ppp':'mp'));
   const max=DYNAMICS.indexOf(o.dynamicMax??(o.dynamics==='expressive'?'fff':'mf'));
   const range=DYNAMICS.slice(min,max+1);const soft=range[phraseIndex%Math.max(1,Math.ceil(range.length/2))];const loud=range[range.length-1-(phraseIndex%Math.max(1,Math.floor(range.length/2)))];
   notes[0].dynamic=soft;
   if(notes.length>=5){
    // Peak follows the highest melodic event in the inner 60% of the phrase.
    const from=Math.max(1,Math.floor(notes.length*.2)),to=Math.min(notes.length-3,Math.ceil(notes.length*.8));
    let peak=from;for(let i=from;i<=to;i++)if(notes[i].midi>notes[peak].midi)peak=i;
    notes[0].hairpinStart='crescendo';notes[peak].hairpinEnd=true;notes[peak].dynamic=loud;
    notes[peak+1].hairpinStart='diminuendo';notes.at(-1)!.hairpinEnd=true;notes.at(-1)!.dynamic=soft;
    if(highLevel&&phraseIndex%2===1){notes[0].expressionText='cresc.';notes[peak+1].expressionText='dim.';}
   }
   if(highLevel&&o.dynamics==='expressive'&&phraseIndex%2===1){const emphasis:Emphasis[]=['sfz','sf','fp','subito p','subito f'];notes[0].emphasis=emphasis[Math.floor(phraseIndex/2)%emphasis.length];}
  }
 }
 const flat=passage.bars.flat();for(let i=1;i<flat.length;i++)if(flat[i-1].tieToNext)flat[i].articulation='unmarked';
 if(o.tempoExpression==='musical'){
  const starts:number[]=[];let total=0;for(const meter of passage.meters!){starts.push(total);total+=meter.barTicks;}
  const events:TempoEvent[]=[];
  if(o.tempoWord)events.push({tick:0,bpm:o.tempo,label:o.tempoWord});
  passage.phrases!.forEach((phrase,index)=>{
   if(phrase.endBar>phrase.startBar){const begin=starts[phrase.endBar];const end=begin+passage.meters![phrase.endBar].barTicks;const slow=index%3!==1;
    events.push({tick:begin,bpm:o.tempo,label:slow?(index%2===0?'rit.':'rall.'):'accel.',endTick:end,targetBpm:o.tempo*(slow?.8:1.12)});
    if(phrase.endBar+1<passage.bars.length)events.push({tick:end,bpm:o.tempo,label:'a tempo'});
   }
  });
  passage.tempoEvents=events;
  if(highLevel){const last=flat.at(-1)!;if(last.kind==='note')last.fermata=1.5;}
 }else if(o.tempoWord)passage.tempoEvents=[{tick:0,bpm:o.tempo,label:o.tempoWord}];
}
