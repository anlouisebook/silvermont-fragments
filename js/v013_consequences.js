"use strict";
(function(){
const cp=v=>JSON.parse(JSON.stringify(v));
const ord=d=>{const m=[31,29,31,30,31,30,31,31,30,31,30,31];let n=Number(d?.day||0);for(let i=1;i<Number(d?.month||1);i++)n+=m[i-1];return n};
function ensure(){state.pendingConsequences=Array.isArray(state.pendingConsequences)?state.pendingConsequences:[];state.consequenceHistory=Array.isArray(state.consequenceHistory)?state.consequenceHistory:[]}
function toast(msg){if(!msg)return;let n=document.getElementById("v013Toast");if(!n){n=document.createElement("div");n.id="v013Toast";Object.assign(n.style,{position:"fixed",left:"50%",bottom:"24px",transform:"translateX(-50%)",zIndex:"22000",maxWidth:"min(620px,90vw)",padding:"10px 14px",borderRadius:"10px",border:"1px solid rgba(45,38,51,.18)",background:"rgba(255,250,247,.97)",color:"#2d2633",boxShadow:"0 8px 28px rgba(45,38,51,.2)"});document.body.appendChild(n)}n.textContent=msg;n.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>n.hidden=true,2800)}
function exists(id){return state.pendingConsequences.some(x=>x.id===id)||state.consequenceHistory.includes(id)}
function queue(def,src){ensure();const days=Math.max(0,Number(def?.delayDays||0)),base=cp(state.currentDate||{month:9,day:1}),due=def?.dueDate?cp(def.dueDate):addDays(base,days),id=String(def?.id||`${src||"consequence"}:${ord(due)}:${state.pendingConsequences.length}`);if(exists(id))return;state.pendingConsequences.push({id,sourceId:src||"unknown",dueDate:due,effects:cp(def?.effects||{}),message:String(def?.message||""),queuedAt:base})}
function queueAll(effect,src){(effect?.delayedConsequences||[]).forEach(d=>queue(d,src))}
const ac=applyChoiceEffect;applyChoiceEffect=function(effect={}){ac(effect);queueAll(effect,state.activeEvent?.id||"choice")};
const ae=applyEventEffects;applyEventEffects=function(event){ae(event);queueAll(event?.effects||{},event?.id||state.activeEvent?.id||"event")};
function run(){ensure();const today=ord(state.currentDate),due=state.pendingConsequences.filter(x=>ord(x.dueDate)<=today).sort((a,b)=>ord(a.dueDate)-ord(b.dueDate));if(!due.length)return;due.forEach(x=>{applyEventEffects({id:`consequence:${x.id}`,effects:cp(x.effects||{})});if(!state.consequenceHistory.includes(x.id))state.consequenceHistory.push(x.id);toast(x.message)});const done=new Set(due.map(x=>x.id));state.pendingConsequences=state.pendingConsequences.filter(x=>!done.has(x.id))}
const pd=processCurrentResolutionDay;processCurrentResolutionDay=function(){const d=state.resolution?.days?.[state.resolution.index];if(d){state.currentDate={...d.date};state.day=d.dayName;state.dayIndex=d.absoluteDayIndex;run()}pd()};
function choice(scenes,text){for(const s of scenes||[]){for(const c of s.choices||[]){if(c.text===text)return c;const n=choice(c.scenes||[],text);if(n)return n}}return null}
function attach(eventId,text,def){const e=STORY.events.major[eventId]||STORY.events.minor[eventId],c=choice(e?.scenes||[],text);if(!c)return;c.effect=c.effect||{};c.effect.delayedConsequences=[...(c.effect.delayedConsequences||[]),cp(def)]}
attach("ethan_second_meeting","Ask if you can sit with him.",{id:"ethan_remembers_shared_silence",delayDays:7,effects:{relationships:{ethan:1},flags:{ethan_remembers_shared_silence:true}},message:"Ethan remembers that you chose to sit beside him without pushing for more."});
attach("fern_shared_notes","Offer to study together.",{id:"fern_remembers_study_offer",delayDays:7,effects:{relationships:{fern:1},flags:{fern_study_offer_remembered:true}},message:"Fern remembers your offer to study together."});
ensure();window.SilvermontConsequences={pending:()=>cp(state.pendingConsequences||[]),history:()=>cp(state.consequenceHistory||[]),queue:(d,s="debug")=>queue(d,s),runDue:run};
if(window.SilvermontDebug?.registerTool)window.SilvermontDebug.registerTool("Show Pending Consequences",()=>toast(JSON.stringify(state.pendingConsequences||[])));
})();
