import { type Difficulty, type ExerciseOptions, type KeyName, type NoteEvent, type Passage, type Phrase, type Tonality } from './types';
import { optionMeter, resolveMeter } from './meter';
import { TONICS, scalePitches, spellPitch } from './theory';
import { DIFFICULTY_RULES, melodicStep, pitchRange } from './technique';
import { rhythmBar } from './rhythm';
import { applyExpression } from './expression';
import { validatePassage } from './validation';
export { DIFFICULTY_RULES } from './technique';
export { passageToAbc } from './notationAbc';
export function seededRandom(seed:number):()=>number{let state=seed>>>0;return()=>{state=(state+0x6D2B79F5)|0;let n=Math.imul(state^(state>>>15),1|state);n^=n+Math.imul(n^(n>>>7),61|n);return((n^(n>>>14))>>>0)/4294967296;};}
export { ACCEPTANCE_OPTIONS } from './acceptance';
export function generatePassage(options:ExerciseOptions,random=Math.random):Passage{
 if(!Object.hasOwn(TONICS,options.key)||!Object.hasOwn(DIFFICULTY_RULES,options.difficulty)||!Number.isInteger(options.measures)||options.measures<1||options.measures>128||!Number.isFinite(options.tempo)||options.tempo<30||options.tempo>300)throw new Error('Invalid exercise settings.');
 const allowed={rhythm:['auto','simple','mixed','complex'],articulation:['unmarked','staccato','staccatissimo','tenuto','accent','marcato','portato','legato','mixed'],articulationComplexity:['none','simple','patterned'],dynamics:['none','gentle','expressive'],restFrequency:['none','low','medium','high'],exerciseType:['sight-reading','scales','rhythm','arpeggios','crossing-break','finger-coordination','chromatic','intervals','repeated-notes','register-leaps','endurance','breath-control','fast-articulation'],phrasing:['simple','developed','long'],ornamentFrequency:['none','low','medium'],intervalComplexity:['stepwise','balanced','wide'],tempoExpression:['none','musical']};
 for(const field of Object.keys(allowed) as (keyof typeof allowed)[])if(options[field]!==undefined&&!allowed[field].includes(options[field]!))throw new Error(`Invalid ${field}.`);
 if(options.articulationProbability!==undefined&&(!Number.isFinite(options.articulationProbability)||options.articulationProbability<0||options.articulationProbability>1))throw new Error('Invalid articulation probability.');
 if(options.intervalSize!==undefined&&(!Number.isInteger(options.intervalSize)||options.intervalSize<2||options.intervalSize>8))throw new Error('Invalid interval.');
 const dynamicOrder=['ppp','pp','p','mp','mf','f','ff','fff'];const lo=dynamicOrder.indexOf(options.dynamicMin??'ppp'),hi=dynamicOrder.indexOf(options.dynamicMax??'fff');if(lo<0||hi<lo)throw new Error('Invalid dynamic range.');
 const roll=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw new Error('Random source must return a finite value in [0, 1).');return n;};
 const o:ExerciseOptions={rhythm:'auto',articulation:'mixed',articulationComplexity:'simple',dynamics:'gentle',restFrequency:'low',exerciseType:'sight-reading',tonality:'major',...options};
 const baseMeter=optionMeter(o);const rules=DIFFICULTY_RULES[o.difficulty];const level=o.rhythm==='simple'?0:o.rhythm==='mixed'?Math.min(1,rules.rhythm):rules.rhythm;
 const [low,high]=pitchRange(o);if(low>=high)throw new Error('Pitch range does not overlap register.');
 const tonal:Tonality=o.exerciseType==='chromatic'?'chromatic':o.tonality!;
 const phraseSeconds=baseMeter.barTicks/baseMeter.beatTicks*60/o.tempo;
 const desired=o.phrasing==='long'||o.exerciseType==='breath-control'?8:o.phrasing==='simple'?2:4;
 const phraseBars=Math.max(1,Math.min(desired,Math.max(2,Math.floor((o.exerciseType==='breath-control'?32:20)/phraseSeconds))));
 const phrases:Phrase[]=[];for(let start=0;start<o.measures;start+=phraseBars)phrases.push({startBar:start,endBar:Math.min(o.measures-1,start+phraseBars-1),role:['call','response','contrast','resolution'][phrases.length%4] as Phrase['role']});
 const meters=Array.from({length:o.measures},(_,i)=>o.changingMeters&&rules.rhythm>=2&&Math.floor(i/phraseBars)%2===1?resolveMeter(baseMeter.name==='3/4'?'4/4':'3/4'):baseMeter);
 const dominant:Record<KeyName,KeyName>={C:'G',G:'D',D:'A',A:'E',E:'B',B:'F#','F#':'C#','C#':'Ab',F:'C',Bb:'F',Eb:'Bb',Ab:'Eb',Db:'Ab',Gb:'Db',Cb:'Gb'};
 const keys=Array.from({length:o.measures},(_,i)=>o.keyChanges&&rules.rhythm>=2&&Math.floor(i/phraseBars)%4===2?dominant[o.key]:o.key);
 const offset=Math.floor(roll()*8);const motif=Array.from({length:8},(_,i)=>i%4===3?0:(roll()<.5?-1:1)*(i%3===0?rules.step:1));
 let current=Math.max(low,Math.min(high,60+TONICS[o.key]));let serial=0;
 const bars:NoteEvent[][]=[];
 const rate={none:0,low:.035,medium:.12,high:.3}[o.restFrequency!]*(o.exerciseType==='scales'||o.exerciseType==='arpeggios'?.2:o.exerciseType==='rhythm'?1.5:1);
 for(let b=0;b<o.measures;b++){
  const phrase=phrases.find(p=>b>=p.startBar&&b<=p.endBar)!;const endPhrase=b===phrase.endBar;
  const notes=rhythmBar(meters[b],level,offset+(b%2)+(Math.floor(b/phraseBars)%3)*2,roll);
  for(let i=0;i<notes.length;i++){
   const n=notes[i];if(n.tuplet)n.tuplet.group=`${b}-${n.tuplet.group}`;const step=melodicStep(o,serial,motif)*(phrase.role==='response'?-1:1);const descending=step<0;
   const scale=scalePitches(keys[b],tonal,low,high,descending);if(!scale.length)throw new Error('No scale notes in selected range.');
   let index=scale.reduce((best,p,k)=>Math.abs(p.midi-current)<Math.abs(scale[best].midi-current)?k:best,0);
   const top=scale.length-1;const folded=top?((index+step)%(2*top)+2*top)%(2*top):0;index=folded>top?2*top-folded:folded;
   if(o.exerciseType==='crossing-break'){const target=serial%2===0?69:71;index=scale.reduce((best,p,k)=>Math.abs(p.midi-target)<Math.abs(scale[best].midi-target)?k:best,0);}
   if(endPhrase&&i===notes.length-1){const tonicIndices=scale.map((p,k)=>p.midi%12===TONICS[keys[b]]?k:-1).filter(k=>k>=0);if(tonicIndices.length)index=tonicIndices.reduce((best,k)=>Math.abs(scale[k].midi-current)<Math.abs(scale[best].midi-current)?k:best,tonicIndices[0]);}
   current=scale[index].midi;n.midi=current;n.spelling=scale[index].spelling;
   const rest=!(b===0&&i===0)&&!(endPhrase&&i===notes.length-1)&&roll()<rate*(i===notes.length-1?1.6:1);
   if(rest){n.kind='rest';n.midi=-1;delete n.spelling;}
   if(endPhrase&&i===notes.length-1&&b<o.measures-1)n.breath=true;
   if(n.kind==='note'&&!n.breath&&!n.tuplet&&rules.rhythm>=2&&o.ornamentFrequency&&o.ornamentFrequency!=='none'&&n.ticks!>=48&&roll()<(o.ornamentFrequency==='medium'?.2:.06)){
    const ornaments=['grace','appoggiatura','acciaccatura','trill','mordent','turn'] as const;n.ornament=ornaments[(b+serial)%ornaments.length];
    n.ornamentMidi=scale[Math.min(scale.length-1,index+1)].midi;if(n.ornamentMidi===n.midi)n.ornamentMidi=scale[Math.max(0,index-1)].midi;
    n.ornamentSpelling=spellPitch(n.ornamentMidi,keys[b],tonal,descending);
   }
   serial++;
  }
  bars.push(notes);
 }
 // Syncopated same-pitch ties; never connect through rests, tuplets, breaths or key changes.
 if(level>=2)for(let b=0;b<bars.length-1;b++)if(b%4===1&&keys[b]===keys[b+1]){const a=bars[b].at(-1)!,next=bars[b+1][0];if(a.kind==='note'&&next.kind==='note'&&!a.breath&&!a.tuplet&&!next.tuplet&&!a.ornament&&!next.ornament){a.tieToNext=true;next.midi=a.midi;next.spelling=a.spelling;}}
 const passage:Passage={options:o,bars,meters,keys,phrases,version:3};applyExpression(passage,roll);validatePassage(passage);return passage;
}
