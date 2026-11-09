"use strict";
/* ---------- início ---------- */
S.dpWeek=weekStart(todayISO());
const startHash=(location.hash||'').slice(1);
go(NAV.some(n=>n.id===startHash)?startHash:S.view);
boot();
setInterval(()=>{if(S.view==='capa')renderCapa();},60000);
document.addEventListener('click',e=>{document.querySelectorAll('details.newmenu[open]').forEach(d=>{if(!(e.target.closest&&e.target.closest('summary')&&d.contains(e.target)))d.removeAttribute('open');});},true);
