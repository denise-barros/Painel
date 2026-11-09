"use strict";
/* =================== Demandas no topo de cada módulo =================== */
S.demAll=S.demAll||{};S.demSub=S.demSub||{};S.demMode=S.demMode||{};S.demMonth=S.demMonth||{};
function subList(root){const out=[];const walk=(pid,d)=>S.cats.filter(x=>x.parentId===pid).sort(catSort).forEach(c=>{out.push({id:c.id,name:c.name,depth:d});walk(c.id,d+1);});walk(root,0);return out;}
const EXEC_SHORT={fernando:'FS',leticia:'LL',ambos:'FS + LL'};
const MES_N=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function modTasks(root){const set=descendants(root);return [...S.tasks.values()].filter(t=>set.has(t.categoryId)&&taskExec(t));}
const doneAt=t=>String(t.completedAt||t.updatedAt||t.createdAt||'').slice(0,10);
const DEM_HOOKS=window.DEM_HOOKS=window.DEM_HOOKS||{};
const DEM_ST=[['nova','A fazer'],['andamento','Em andamento'],['aguardando','Aguardando'],['concluido','Concluído']];
function demStSel(t){return '<select class="dem-st st-'+esc(t.status||'nova')+'" data-dem-st="'+esc(t.id)+'" aria-label="Etapa da demanda">'+DEM_ST.map(([k,l])=>'<option value="'+k+'"'+((t.status||'nova')===k?' selected':'')+'>'+l+'</option>').join('')+'</select>';}
async function setTaskStatus(id,st){const old=S.tasks.get(id);if(!old||old.status===st)return;
  try{const f=frames.sec;const w=f&&f.contentWindow;if(w&&typeof w.__setStatus==='function'&&w.__setStatus(id,st)){toast('Movida para '+ST[st]);return;}}catch(e){}
  const now=new Date().toISOString();const t=JSON.parse(JSON.stringify(old));const notes=['Status: '+(ST[old.status]||old.status)+' → '+ST[st]+' (pelo módulo)'];
  t.status=st;t.completedAt=st==='concluido'?now:null;t.waitingSince=st==='aguardando'?now:null;
  t.statusLog=(old.statusLog||[]).concat([{s:st,at:now}]).slice(-200);
  if(t.timerStart&&(st==='concluido'||old.status==='andamento')){t.sessions=(t.sessions||[]).concat([{start:t.timerStart,end:now}]);t.timerStart=null;notes.push('Cronômetro pausado');}
  t.updatedAt=now;t.history=(t.history||[]).concat(notes.map(text=>({at:now,text}))).slice(-150);
  try{await S.db.doc('tasks/'+id).set(t);toast('Movida para '+ST[st]);}catch(e){toast('Não foi possível mover agora. Tente de novo.');renderCurrent();}}
function demRow(t,t0,o){const done=!isOpen(t);const late=!done&&t.due&&t.due<t0;const today=!done&&t.due===t0;const p=t.categoryId?catPath(t.categoryId):[];let area=p.length>1?p[p.length-1].name:(p[0]?p[0].name:'');if(o&&o.area){const v=o.area(t);if(v!==undefined)area=v||'';}const hk=DEM_HOOKS[(o&&o.hook&&o.hook(t))||(p[0]&&p[0].id)];
  const right=done?'<span class="tag ok">Concluída '+esc(fmtDate(doneAt(t)))+'</span>':(t.due?'<span class="tag '+(late||today?'bad':'')+'">'+(late?'Venceu ':'')+esc(fmtDate(t.due))+'</span>':'<small>sem prazo</small>');
  return '<li><div class="item dem-row '+(done?'done':late?'bad':t.status==='aguardando'?'warn':'info')+'"><span class="sev"></span><button class="item-main" data-task="'+esc(t.id)+'"><span class="tt">'+esc(t.title||'(sem título)')+'</span><span class="mm">'+
    (t.executive&&EXEC_SHORT[t.executive]?'<span class="tag exec">'+EXEC_SHORT[t.executive]+'</span>':'')+(area?'<span class="tag area">'+esc(area)+'</span>':'')+(t.kind&&KIND_LBL[t.kind]?'<span class="tag">'+esc(KIND_LBL[t.kind])+'</span>':'')+(hk?hk.tags(t):'')+'</span></button>'+
    '<span class="rr">'+(hk?hk.act(t):'')+right+demStSel(t)+'</span></div></li>';}
function demDone(root,done,o){if(!done.length)return '';const t0=todayISO();const cur=t0.slice(0,7);const groups=new Map();
  done.slice().sort((a,b)=>doneAt(b).localeCompare(doneAt(a))).forEach(t=>{const k=doneAt(t).slice(0,7)||'—';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t);});
  let h='';for(const [ym,list] of groups){const key=root+'|'+ym;const open=key in S.demMonth?S.demMonth[key]:ym===cur;
    const lbl=ym==='—'?'Sem data':MES_N[+ym.slice(5,7)-1].replace(/^./,c=>c.toUpperCase())+' de '+ym.slice(0,4)+(ym===cur?' · mês atual':'');
    h+='<div class="dem-mon"><button class="dem-mon-h" data-dem-mon="'+esc(key)+'" aria-expanded="'+open+'"><span class="car">'+(open?'▾':'▸')+'</span>'+esc(lbl)+'<span class="cnt">'+list.length+'</span></button>'+(open?'<ul class="list">'+list.map(t=>demRow(t,t0,o)).join('')+'</ul>':'')+'</div>';}
  return h;}
function demBlock(root,tasks,o){o=o||{};
  const t0=todayISO();let base=(tasks||modTasks(root));
  const subs=subList(root);let fs=S.demSub[root]||'';if(fs&&!catById(fs))fs=S.demSub[root]='';
  if(fs){const set=descendants(fs);base=base.filter(t=>set.has(t.categoryId)||(o.virt&&set.has(o.virt(t))));}
  const open=base.filter(isOpen),done=base.filter(t=>!isOpen(t));
  const mode=['abertas','concluidas','todas'].includes(S.demMode[root])?S.demMode[root]:'abertas';
  const subSel=subs.length?'<select class="sel dem-sub" data-dem-sub="'+esc(root)+'" aria-label="Filtrar por subcategoria"><option value="">Todas as subcategorias</option>'+subs.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===fs?' selected':'')+'>'+' '.repeat(c.depth)+esc(c.name)+'</option>').join('')+'</select>':'';
  const seg='<div class="seg dem-mode" role="group" aria-label="Situação">'+[['abertas',o.masc?'Abertos':'Abertas',open.length],['concluidas',o.masc?'Concluídos':'Concluídas',done.length],['todas',o.masc?'Todos':'Todas',base.length]].map(([k,l,n])=>'<button data-dem-mode="'+esc(root)+'|'+k+'" class="'+(mode===k?'on':'')+'" aria-pressed="'+(mode===k)+'">'+l+' <span class="n">'+n+'</span></button>').join('')+'</div>';
  const sorted=open.slice().sort((a,b)=>{const la=a.due&&a.due<t0,lb=b.due&&b.due<t0;if(la!==lb)return la?-1:1;return String(a.due||'9999').localeCompare(String(b.due||'9999'))||(a.num||0)-(b.num||0);});
  const all=!!S.demAll[root];const shown=(all||mode==='todas')?sorted:sorted.slice(0,5);
  let h='<div class="dem-blk"><div class="sec-h"><h3>'+esc(o.title||'Demandas')+'</h3>'+seg+subSel+'<span class="act">'+(mode==='abertas'&&open.length>5?'<button class="btn sm ghost" data-dem-all="'+esc(root)+'">'+(all?'Mostrar menos':'Ver todas ('+open.length+')')+'</button> ':'')+'<button class="btn sm primary" data-new-dem="'+esc(root)+'"'+(o.defSub?' data-def-sub="'+esc(o.defSub)+'"':'')+'>'+esc(o.newLbl||'+ Nova demanda')+'</button></span></div>';
  const empty=(b,txt)=>'<ul class="list"><li><div class="empty"><b>'+b+(fs?' nesta subcategoria':'')+'</b>'+txt+'</div></li></ul>';
  if(mode==='abertas')h+=open.length?'<ul class="list">'+shown.map(t=>demRow(t,t0,o)).join('')+'</ul>':empty((o.none||'Nenhuma demanda')+(o.masc?' aberto':' aberta'),'As demandas deste módulo aparecem aqui e no kanban da Operação.');
  else if(mode==='concluidas')h+=done.length?demDone(root,done,o):empty((o.none||'Nenhuma demanda')+(o.masc?' concluído':' concluída'),'Quando uma demanda for concluída na Operação, ela fica registrada aqui, agrupada por mês.');
  else h+=base.length?(open.length?'<div class="dem-sub-h">'+(o.masc?'Abertos':'Abertas')+'</div><ul class="list">'+shown.map(t=>demRow(t,t0,o)).join('')+'</ul>':'')+(done.length?'<div class="dem-sub-h">'+(o.masc?'Concluídos':'Concluídas')+'</div>'+demDone(root,done,o):''):empty(o.none||'Nenhuma demanda','As demandas deste módulo aparecem aqui e no kanban da Operação.');
  return h+'</div>';}
document.addEventListener('click',e=>{const a=e.target.closest('[data-dem-all]');if(a){S.demAll[a.dataset.demAll]=!S.demAll[a.dataset.demAll];renderCurrent();return;}
  const m=e.target.closest('[data-dem-mode]');if(m){const [r,k]=m.dataset.demMode.split('|');S.demMode[r]=k;renderCurrent();return;}
  const g=e.target.closest('[data-dem-mon]');if(g){const k=g.dataset.demMon;const cur=todayISO().slice(0,7);const was=k in S.demMonth?S.demMonth[k]:k.split('|')[1]===cur;S.demMonth[k]=!was;renderCurrent();return;}
  const n=e.target.closest('[data-new-dem]');if(n){const r=n.dataset.newDem;openNewTask(S.demSub[r]&&catById(S.demSub[r])?S.demSub[r]:(n.dataset.defSub&&catById(n.dataset.defSub)?n.dataset.defSub:r));}});
document.addEventListener('click',e=>{if(e.target.closest('[data-op-rep]')){whenFrame('sec',w=>typeof w.__openReports==='function',w=>{w.__fromRel=true;w.__openReports();});}});
document.addEventListener('change',e=>{const ds=e.target.closest&&e.target.closest('[data-dem-st]');if(ds){setTaskStatus(ds.dataset.demSt,ds.value);return;}const s=e.target.closest&&e.target.closest('[data-dem-sub]');if(s){S.demSub[s.dataset.demSub]=s.value;S.demAll[s.dataset.demSub]=false;renderCurrent();}});

