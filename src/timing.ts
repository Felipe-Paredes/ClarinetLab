import { barMeter, groupStarts } from './meter';
import { eventTicks, type Passage } from './types';
export interface MetronomeBeat { time: number; accent: 'bar' | 'group' | 'beat'; }
/** BPM ramps are linear in score position; integration of 1/BPM is analytic. */
export function createTimeline(passage: Passage, tempo: number) {
 if(!Number.isFinite(tempo)||tempo<20||tempo>300) throw new Error('Tempo must be between 20 and 300 BPM.');
 const scale=tempo/passage.options.tempo;
 const changes=[...(passage.tempoEvents??[])].sort((a,b)=>a.tick-b.tick);
 for(const e of changes) if(!Number.isInteger(e.tick)||e.tick<0||!Number.isFinite(e.bpm)||e.bpm<=0||(e.endTick!==undefined&&(!Number.isInteger(e.endTick)||e.endTick<=e.tick))||(e.targetBpm!==undefined&&(!Number.isFinite(e.targetBpm)||e.targetBpm<=0))) throw new Error('Invalid tempo event.');
 const boundaries=new Set<number>([0]); const bars:{start:number;end:number;beatTicks:number}[]=[]; const holds:{start:number;end:number;factor:number}[]=[];
 let tick=0;
 passage.bars.forEach((bar,index)=>{const start=tick;for(const note of bar){const end=tick+eventTicks(note);if(note.fermata!==undefined){if(!Number.isFinite(note.fermata)||note.fermata<1||note.fermata>8)throw new Error('Invalid fermata multiplier.');holds.push({start:tick,end,factor:note.fermata});boundaries.add(tick);boundaries.add(end);}tick=end;}bars.push({start,end:tick,beatTicks:barMeter(passage,index).beatTicks});boundaries.add(start);boundaries.add(tick);});
 const totalTicks=tick;
 for(const e of changes){if(e.tick>totalTicks)throw new Error('Tempo event is outside passage.');boundaries.add(e.tick);if(e.endTick!==undefined)boundaries.add(Math.min(totalTicks,e.endTick));}
 const bpmAt=(position:number)=>{let bpm=tempo;for(const e of changes){if(e.tick>position)break;const fraction=e.endTick===undefined?0:Math.min(1,(position-e.tick)/(e.endTick-e.tick));bpm=(e.bpm+(e.targetBpm===undefined?0:(e.targetBpm-e.bpm)*fraction))*scale;}return bpm;};
 const points=[...boundaries].sort((a,b)=>a-b);const segments:{start:number;end:number;time:number;unit:number;factor:number;bpm:number;slope:number}[]=[];let seconds=0;
 const integral=(distance:number,bpm:number,slope:number,unit:number,factor:number)=>factor*60/unit*(Math.abs(slope)<1e-12?distance/bpm:Math.log((bpm+slope*distance)/bpm)/slope);
 for(let i=0;i<points.length-1;i++){const start=points[i],end=points[i+1];if(end<=start)continue;const mid=(start+end)/2;const unit=bars.find(b=>mid>=b.start&&mid<b.end)?.beatTicks??96;const factor=holds.find(h=>mid>=h.start&&mid<h.end)?.factor??1;const bpm=bpmAt(start);const endBpm=bpmAt(end-1e-8);const slope=(endBpm-bpm)/(end-start);segments.push({start,end,time:seconds,unit,factor,bpm,slope});seconds+=integral(end-start,bpm,slope,unit,factor);}
 const secondsAt=(position:number)=>{if(position<=0)return 0;if(position>=totalTicks)return seconds;const s=segments.find(s=>position>=s.start&&position<s.end)!;return s.time+integral(position-s.start,s.bpm,s.slope,s.unit,s.factor);};
 return {secondsAt,totalTicks,duration:seconds};
}
export function createMetronomeSchedule(passage:Passage,tempo:number):MetronomeBeat[]{
 const timeline=createTimeline(passage,tempo);const beats:MetronomeBeat[]=[];let base=0;
 passage.bars.forEach((bar,index)=>{const meter=barMeter(passage,index);const groups=groupStarts(meter);const length=bar.reduce((sum,e)=>sum+eventTicks(e),0);for(let tick=0;tick<length;tick+=meter.beatTicks)beats.push({time:timeline.secondsAt(base+tick),accent:tick===0?'bar':groups.includes(tick)?'group':'beat'});base+=length;});
 return beats;
}
