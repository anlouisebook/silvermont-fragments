"use strict";
(function(){
const V="0.13.0",D={exact:100,major:90,birthday:85,chain:70,relationship:40,flavor:20};
const A=()=>({...STORY.events.major,...STORY.events.minor}),E=id=>STORY.events.major[id]||STORY.events.minor[id],T=id=>STORY.events.major[id]?"major":"minor";
const O=d=>{const m=[31,29,31,30,31,30,31,31,30,31,30,31];let n=Number(d?.day||0);for(let i=1;i<Number(d?.month||1);i++)n+=m[i-1];return n};
const C=s=>Array.isArray(s)?s.some(id=>state.eventHistory?.includes(id)):state.eventHistory?.includes(s);
function R(e){if(!e?.chainId)return true;const c=window.SilvermontEventChains?.definitions?.[e.chainId],i=Number(e.chainStep||0);return !c||i<=0||C(c[i-1])}
function act(day){return day?.clubId&&window.SilvermontClubs?.definitions?.[day.clubId]?window.SilvermontClubs.definitions[day.clubId].activityId:day?.activityId}
function ok(e,day){
 if(!e||state.eventHistory?.includes(e.id)||state.missedEvents?.includes(e.id))return false;
 if(!e.triggerDate&&Number(day.absoluteDayIndex)<Number(e.minDay??0))return false;
 if(!e.triggerDate&&Number(day.absoluteDayIndex)>Number(e.maxDay??1e9))return false;
 if(e.triggerDate&&O(day.date)<O(e.triggerDate))return false;
 if(!window.GameCore.eventDayTypeEligible(e,day.dayName))return false;
 const at=e.activityTags?.length?e.activityTags:["any"];if(!at.includes("any")&&!at.includes(act(day)))return false;
 if(e.clubTags?.length&&(!day.clubAttending||!day.clubId||!e.clubTags.includes(day.clubId)))return false;
 if(!(e.prerequisiteEvents||[]).every(id=>state.eventHistory?.includes(id))||!R(e)||!window.GameCore.eventRequirementMet(e,state))return false;
 return e.special==="birthday"?!state.birthdayCelebrated&&window.GameCore.sameDate(state.birthday,day.date):true;
}
function p(e){if(Number.isFinite(Number(e?.priority)))return Number(e.priority);if(e?.triggerDate)return D.exact;if(e?.special==="birthday")return D.birthday;if(T(e?.id)==="major")return D.major;if(e?.chainId)return D.chain;if(e?.requirements?.relationshipMin||e?.requirements?.relationshipMax)return D.relationship;return D.flavor}
function cap(e){const t=T(e.id),c=state.resolution?.eventCounts||{major:0,minor:0};return Number(c[t]||0)<Number(WEEKLY_EVENT_LIMITS[t]??1e9)}
function pick(day){let x=Object.values(A()).filter(e=>ok(e,day)&&cap(e));if(Number(state.week)===1)x=x.filter(e=>e.triggerDate);x=x.filter(e=>e.triggerDate||e.special==="birthday"||Math.random()<Number(e.chance??0));x.sort((a,b)=>p(b)-p(a)||(O(a.triggerDate)-O(b.triggerDate))||Number(a.chainStep||0)-Number(b.chainStep||0)||String(a.id).localeCompare(String(b.id)));return x[0]||null}
const P={mystery_necklace_echo:100,mystery_broken_glass_flash:100,mystery_hospital_record_gap:100,ethan_playground_intro:95,fern_school_intro:95,birthday:90,club_fair:75,ethan_second_meeting:70,ethan_playground_friendship:70,fern_shared_notes:70,fern_library_promise:70,scholars_first_meeting:65,creatives_first_meeting:65,athletics_first_meeting:65,home_family_breakfast:40,dorian_desk_light:40,agnes_evening_tea:40};
Object.entries(P).forEach(([id,n])=>{const e=E(id);if(e)e.priority=n});
const old=chooseEventForDay;chooseEventForDay=function(day){const e=pick(day);if(e)return{type:T(e.id),id:e.id};if(Number(state.week)===1)return null;const q=old(day),z=q?E(q.id):null;return z&&ok(z,day)?q:null};
window.SilvermontEventPriority={defaults:D,valueFor:id=>p(E(id)),preview:day=>Object.values(A()).filter(e=>ok(e,day)).map(e=>({id:e.id,priority:p(e)})).sort((a,b)=>b.priority-a.priority)};
const us=updateStatus;updateStatus=function(){us();document.getElementById("versionLabel").textContent=`v${V}`;document.getElementById("menuVersionLabel").textContent=`v${V}`};
["menuBtn","newGameMenuBtn","continueMenuBtn"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>setTimeout(updateStatus,0)));updateStatus();
})();
