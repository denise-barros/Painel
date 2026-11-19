"use strict";
/* ---------- início ---------- */
S.dpWeek=weekStart(todayISO());
const startHash=(location.hash||'').slice(1);
/* Atualizar a página (F5, puxar para baixo no tablet) mantém a tela onde estava: módulo, aba, empresa, pessoa, viagem, mês…
   Abrir o Painel de novo (aba nova) começa pela aba inicial do módulo. A foto fica no sessionStorage, que só dura enquanto a aba do navegador existir. */
const SNAP_KEYS=['view','dpTab','dpPerson','dpMonth','dpWeek','dpPagView','dpOcTipo','dpEmpSt','dpF','facTab','facF','sauTab','sauP','sauTipo','negTab','negE','brdTab','brdB','brdExec','famTab','famP','famPet','viaTab','viaSel','viaExec','viaTipo','viaPar','viaHot','ageTab','ageMes','ageEvAll','cadTab'];
function snapSave(){try{const o={};SNAP_KEYS.forEach(k=>{if(S[k]!==undefined)o[k]=S[k];});sessionStorage.setItem('ce-snap',JSON.stringify(o));}catch(e){}}
window.addEventListener('pagehide',snapSave);document.addEventListener('visibilitychange',()=>{if(document.hidden)snapSave();});
{let snap=null;try{snap=JSON.parse(sessionStorage.getItem('ce-snap')||'null');}catch(e){}
  const fromHash=NAV.some(n=>n.id===startHash)?startHash:'';
  if(snap){Object.keys(snap).forEach(k=>{if(SNAP_KEYS.includes(k))S[k]=snap[k];});go(NAV.some(n=>n.id===S.view)?S.view:'capa');}
  else{const v0=fromHash||S.view;resetModule(v0);go(v0);}}
boot();
setInterval(()=>{if(S.view==='capa')renderCapa();},60000);
document.addEventListener('click',e=>{document.querySelectorAll('details.newmenu[open]').forEach(d=>{if(!(e.target.closest&&e.target.closest('summary')&&d.contains(e.target)))d.removeAttribute('open');});},true);
