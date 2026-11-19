"use strict";
/* ---------- início ---------- */
S.dpWeek=weekStart(todayISO());
const startHash=(location.hash||'').slice(1);
{const v0=NAV.some(n=>n.id===startHash)?startHash:S.view;resetModule(v0);go(v0);}
boot();
/* saiu do Painel (outra aba do navegador ou outro app) por alguns minutos e voltou: o módulo aberto volta para a aba inicial */
{let hidAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hidAt=Date.now();return;}
  const long=hidAt&&Date.now()-hidAt>=5*60e3;hidAt=0;if(!long)return;const dw=$('#drawer');if(dw&&dw.innerHTML)return;goHome(S.view);});}
setInterval(()=>{if(S.view==='capa')renderCapa();},60000);
document.addEventListener('click',e=>{document.querySelectorAll('details.newmenu[open]').forEach(d=>{if(!(e.target.closest&&e.target.closest('summary')&&d.contains(e.target)))d.removeAttribute('open');});},true);
