"use strict";
/* =================== Boards (conselhos) =================== */
Object.assign(REC,{
  'brd':{one:'conselho ou programa',col:'brd-boards',fem:false,fields:[
    {k:'nome',l:'Organização ou conselho',req:true,ph:'Ex.: Conselho da Fundação X'},
    {k:'tipo',l:'Tipo',opts:['','Conselho de administração','Conselho diretivo','Conselho deliberativo ou curador','Conselho consultivo','Conselho fiscal','Comitê','Diretoria','Programa ou fellowship','Comunidade ou rede','Outro']},
    {k:'executivo',l:'Quem participa',opts:['fernando','leticia','ambos'],lab:v=>EXEC[v]},
    {k:'papel',l:'Papel',opts:['','Presidente do conselho','Vice-presidente do conselho','Conselheiro(a)','Diretor(a) presidente','Diretor(a) vice-presidente','Diretor(a)','Coordenador(a) de comitê','Membro de comitê','Membro','Observador(a)','Outro']},
    {k:'comites',l:'Comitês',ph:'Ex.: Auditoria, Pessoas'},
    {k:'situacao',l:'Situação',opts:['Ativo','Encerrado']},
    {k:'inicio',l:'Início do mandato',t:'date'},
    {k:'fim',l:'Fim do mandato',t:'date'},
    {k:'periodicidade',l:'Reuniões',opts:['Semanal','Quinzenal','Mensal','Bimestral','Trimestral','Semestral','Anual','Sob demanda']},
    {k:'honorarios',l:'Honorários por mês',t:'money'},
    {k:'contato',l:'Contato da secretaria',ph:'Nome, e-mail ou telefone'},
    {k:'portal',l:'Portal ou pasta de materiais',ph:'Endereço do portal ou da pasta'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Documentos (termo de posse, regimento)',t:'files'}]},
  'brd-reun':{one:'reunião',col:'brd-reun',fem:true,fields:[
    {k:'board',l:'Conselho ou programa',ref:'boards',req:true},
    {k:'titulo',l:'Reunião',req:true,def:()=>'Reunião ordinária',ph:'Ex.: Reunião ordinária, Comitê de auditoria'},
    {k:'data',l:'Data',t:'date',req:true},
    {k:'hora',l:'Horário',t:'time'},
    {k:'local',l:'Local ou link'},
    {k:'status',l:'Status',opts:['Agendada','Realizada','Cancelada']},
    {k:'pauta',l:'Pauta',long:true},
    {k:'ata',l:'Anotações',long:true},
    {k:'anexos',l:'Materiais',t:'files'}]}
});
S.rec['brd']=S.rec['brd']||[];S.rec['brd-reun']=S.rec['brd-reun']||[];
Object.assign(S,{brdTab:'boards',brdB:'',brdExec:''});
try{const u=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(u.brdTab)S.brdTab=u.brdTab;}catch(e){}
const boardById=id=>recs('brd').find(b=>b.id===id);
const boardsAll=()=>recs('brd').slice().sort((a,b)=>((a.situacao==='Encerrado')-(b.situacao==='Encerrado'))||String(a.nome||'').localeCompare(String(b.nome||''),'pt'));
const brdOwnerOk=id=>{const b=boardById(id);return !b||ownerOk(b.executivo);};
function brdExecOk(b){const x=S.brdExec;return !x||!!(b&&(b.executivo===x||b.executivo==='ambos'));}
const brdScope=id=>S.brdB?id===S.brdB:(brdOwnerOk(id)&&brdExecOk(boardById(id)));
function brdTasks(){const set=descendants('p-brd');return [...S.tasks.values()].filter(t=>set.has(t.categoryId)||(t.fields&&t.fields.board));}
const taskBoard=t=>(t.fields&&t.fields.board)||'';
const reunUp=r=>r.status!=='Cancelada'&&r.status!=='Realizada'&&r.data&&r.data>=todayISO();
const brdEvs=()=>recs('age-ev').filter(e=>e.board&&boardById(e.board)&&brdOwnerOk(e.board)&&!evOff(e));
const evUpTo=(e,lim)=>!!e.data&&evEnd(e)>=todayISO()&&e.data<=lim;
const reunPastOpen=r=>(r.status||'Agendada')==='Agendada'&&r.data&&r.data<todayISO();

const BRD_G=[['leticia','Conselhos e programas da Leticia'],['fernando','Conselhos e programas do Fernando'],['ambos','Conselhos e programas de ambos']];
function brdOpenTasks(b){const aset=catById('c-'+b.id)?descendants('c-'+b.id):new Set();return [...S.tasks.values()].filter(t=>isOpen(t)&&(aset.has(t.categoryId)||taskBoard(t)===b.id));}
function renderBrd(){
  const el=$('#v-brd');const t0=todayISO();const all=boardsAll().filter(b=>ownerOk(b.executivo)&&brdExecOk(b));
  if(S.brdB&&!all.some(b=>b.id===S.brdB))S.brdB='';
  const B=S.brdB?boardById(S.brdB):null;
  if(B){if(catById('c-'+B.id))S.demSub['p-brd']='c-'+B.id;else delete S.demSub['p-brd'];}
  let h='';
  if(B){
    const reun=recs('brd-reun').filter(r=>r.board===B.id);
    const open=brdOpenTasks(B);const nx=reun.filter(reunUp).sort((x,y)=>(x.data+(x.hora||'')).localeCompare(y.data+(y.hora||'')))[0];
    h+='<div class="toolbar"><button class="btn sm ghost" data-brd-open="">← Conselhos e Programas</button></div>';
    h+='<div class="plan-hero"><div><h2>'+esc(B.nome)+'</h2><p>'+esc([EXEC[B.executivo]||'',B.tipo,B.papel,B.comites,B.situacao==='Encerrado'?'Encerrado':''].filter(Boolean).join(' · '))+'</p></div><div class="acts">'+subDrive(B,'brd')+'<button class="btn" data-rec="brd:'+esc(B.id)+'">Editar cadastro</button><button class="btn" data-new-rec="age-ev">Evento</button><button class="btn primary" data-new-rec="brd-reun">Reunião</button></div></div>';
    h+='<div class="kpis">'+kpi('Próxima reunião',nx?esc(fmtDate(nx.data)+(nx.hora?' · '+nx.hora:'')):'—')+kpi('To-dos abertos',String(open.length),open.some(t=>t.due&&t.due<t0)?'neg':'')+(B.fim?kpi('Mandato até',esc(fmtDateFull(B.fim)),B.fim<t0?'neg':B.fim<=addDays(t0,90)?'warn':''):'')+'</div>';
    const portal=String(B.portal||'').trim();
    const det=[['Reuniões',B.periodicidade],['Contato da secretaria',B.contato],['Portal ou materiais',/^https:\/\//.test(portal)?'<a href="'+esc(portal)+'" target="_blank" rel="noopener">Abrir</a>':esc(portal),true],['Observações',B.obs]].filter(x=>x[1]);
    if(det.length)h+='<div class="panel"><div class="kv">'+det.map(([l,v,raw])=>'<div><span>'+esc(l)+'</span><b class="small">'+(raw?v:esc(v))+'</b></div>').join('')+'</div></div>';
    h+='<div class="brd-top">'+demBlock('p-brd',null,{title:'Demandas'})+brdProx(reun,brdEvs().filter(e=>e.board===B.id))+'</div>';
    h+=brdHist(reun);
  }else{
    const reun=recs('brd-reun').filter(r=>brdOwnerOk(r.board));
    h+='<div class="plan-hero"><div><h2>Conselhos e Programas</h2><p>Conselhos, comitês, programas e comunidades de que os executivos participam: demandas, mandatos e reuniões.</p></div><div class="acts"><button class="btn" data-new-rec="brd">Conselho ou programa</button><button class="btn" data-new-rec="age-ev">Evento</button><button class="btn primary" data-new-rec="brd-reun">Reunião</button></div></div>';
    h+='<div class="brd-top">'+demBlock('p-brd',null,{title:'Demandas'})+brdProx(reun,brdEvs())+'</div>';
    if(!all.length)h+='<ul class="list"><li><div class="empty">'+(S.brdExec&&recs('brd').length?'<b>Nada cadastrado para '+esc(EXEC[S.brdExec].split(' ')[0])+'</b>':'<b>Nada cadastrado ainda</b>')+'Cadastre cada conselho ou programa, com quem participa, o papel e o mandato.<br><button class="btn sm" data-new-rec="brd" style="margin-top:8px">Cadastrar agora</button></div></li></ul>';
    if(all.length)h+='<div><div class="sec-h"><h3>Conselhos e Programas</h3><span class="cnt">'+all.length+'</span></div>'+brdCards(all.slice().sort((x,y)=>String(x.nome).localeCompare(String(y.nome),'pt')))+'</div>';
    h+=brdHist(reun);
  }
  el.innerHTML='<div class="wrap">'+h+'</div>';
}
function brdCards(list){
  const t0=todayISO();
  return '<div class="pulse">'+list.map(b=>{
    const nx=recs('brd-reun').filter(r=>r.board===b.id&&reunUp(r)).sort((x,y)=>(x.data+(x.hora||'')).localeCompare(y.data+(y.hora||'')))[0];
    const td=brdOpenTasks(b);const fimSoon=b.fim&&b.fim<=addDays(t0,90);
    return '<div role="button" tabindex="0" class="card" data-brd-open="'+esc(b.id)+'"><div class="card-h"><span class="chip">'+IC.brd+'</span><div style="flex:1;min-width:0"><h4>'+esc(b.nome)+'</h4><small class="sub">'+esc([EXEC[b.executivo]||EXEC.ambos,b.tipo,b.papel,b.comites].filter(Boolean).join(' · '))+'</small></div>'+(b.situacao==='Encerrado'?'<span class="tag">Encerrado</span>':'')+'</div>'+
      '<div class="kv"><div><span>Próxima reunião</span><b class="small">'+(nx?esc(fmtDate(nx.data)+(nx.hora?' · '+nx.hora:'')):'—')+'</b></div><div><span>To-dos abertos</span><b>'+td.length+'</b></div></div>'+
      '<div class="foot">'+(b.fim?'<span class="tag '+(b.fim<t0?'bad':fimSoon?'warn':'')+'">Mandato até '+esc(fmtDateFull(b.fim))+'</span>':'')+(b.periodicidade?'<span class="tag">'+esc(b.periodicidade)+'</span>':'')+filesHtml(b.anexos)+subDrive(b,'brd')+'</div></div>';}).join('')+'</div>';
}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-brd-open]');if(!c||e.target.closest('a'))return;
  S.brdB=c.dataset.brdOpen||'';S.demAll['p-brd']=false;if(!S.brdB)delete S.demSub['p-brd'];
  renderBrd();const v=$('#v-brd');if(v)v.scrollTop=0;
});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const c=e.target.closest&&e.target.closest('[data-brd-open]');if(c&&c.getAttribute('role')==='button')c.click();});
function evLine(e){
  const b=boardById(e.board);
  return rowBtn('age-ev',e,'<span style="min-width:0"><span class="tt">'+esc(e.titulo||'Evento')+(S.brdB?'':' · '+esc(b?b.nome:'—'))+'</span><span class="mm"><span class="tag info">Evento</span><span class="tag">'+esc(fmtDateFull(e.data))+(e.fim&&e.fim!==e.data?' a '+esc(fmtDateFull(e.fim)):'')+(e.horario?' · '+esc(e.horario):'')+'</span>'+(e.formato&&e.formato!=='Presencial'?'<span class="tag">'+esc(e.formato)+'</span>':'')+(e.palestrante==='Sim'?'<span class="tag warn">Palestrante</span>':'')+(e.local?'<span class="tag">'+esc(e.local)+'</span>':'')+filesHtml(e.anexos)+'</span></span><span class="rr"><small>'+esc(fmtDate(e.data<todayISO()?todayISO():e.data))+'</small></span>','info');
}
function reunLine(r){
  const b=boardById(r.board);const up=reunUp(r);
  return rowBtn('brd-reun',r,'<span style="min-width:0"><span class="tt">'+esc(r.titulo||'Reunião')+(S.brdB?'':' · '+esc(b?b.nome:'—'))+'</span><span class="mm"><span class="tag">Reunião</span><span class="tag '+(r.status==='Realizada'?'ok':'')+'">'+esc(r.status||'Agendada')+'</span>'+(r.data?'<span class="tag">'+esc(fmtDateFull(r.data))+(r.hora?' · '+esc(r.hora):'')+'</span>':'')+(b&&b.executivo&&!S.brdB?'<span class="tag">'+esc(EXEC[b.executivo])+'</span>':'')+(r.local?'<span class="tag">'+esc(r.local)+'</span>':'')+filesHtml(r.anexos)+'</span></span><span class="rr">'+(up?'<small>'+esc(fmtDate(r.data))+'</small>':'')+'</span>',up?'info':r.status==='Realizada'?'ok':'');
}
function brdProx(reun,evs){
  const t0=todayISO();const lim=addDays(t0,7);
  const it=reun.filter(r=>reunUp(r)&&r.data<=lim).map(r=>({d:r.data+(r.hora||''),h:reunLine(r)})).concat((evs||[]).filter(e=>evUpTo(e,lim)).map(e=>({d:(e.data<t0?t0:e.data)+'00',h:evLine(e)}))).sort((a,b)=>a.d.localeCompare(b.d));
  return '<div class="brd-prox"><div class="sec-h"><h3>Próximos compromissos</h3><span class="cnt">'+it.length+'</span><span class="hint">próximos 7 dias</span></div>'+(it.length?'<ul class="list">'+it.map(x=>x.h).join('')+'</ul>':'<ul class="list"><li><div class="empty"><b>Nenhum compromisso nos próximos 7 dias</b>O que estiver agendado para essa semana aparece aqui.</div></li></ul>')+'</div>';
}
function brdHist(reun){
  const done=reun.filter(r=>!reunUp(r)).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  return done.length?'<div><div class="sec-h"><h3>Histórico</h3><span class="cnt">'+done.length+'</span></div><ul class="list">'+done.map(reunLine).join('')+'</ul></div>':'';
}
function brdTodo(tasks){
  if(!tasks.length)return '<ul class="list"><li><div class="empty"><b>Nenhum to-do aberto</b>Os to-dos criados aqui vão para a Operação em Conselhos e Programas, com o item marcado.</div></li></ul>';
  const t0=todayISO();const g={};tasks.forEach(t=>{const k=taskBoard(t);(g[k]=g[k]||[]).push(t);});
  return Object.keys(g).sort((a,b)=>(a?0:1)-(b?0:1)||String((boardById(a)||{}).nome).localeCompare(String((boardById(b)||{}).nome),'pt')).map(k=>'<div><div class="sec-h"><h3>'+esc(k?((boardById(k)||{}).nome||'(removido)'):'Sem item marcado')+'</h3><span class="cnt">'+g[k].length+'</span></div><ul class="list">'+
    g[k].sort((a,b)=>String(a.due||'9').localeCompare(String(b.due||'9'))).map(t=>{const late=t.due&&t.due<t0;return '<li><button class="item '+(late?'bad':t.status==='aguardando'?'warn':'info')+'" data-task="'+esc(t.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(t.title||'(sem título)')+'</span><span class="mm"><span class="tag">'+esc(ST[t.status]||'')+'</span>'+(t.due?'<span class="tag '+(late?'bad':'')+'">Prazo '+esc(fmtDate(t.due))+'</span>':'')+(t.executive?'<span class="tag">'+esc(EXEC[t.executive])+'</span>':'')+'</span></span><span class="rr"><small>#'+esc(t.num||'')+'</small></span></button></li>';}).join('')+'</ul></div>').join('');
}
function phase4Capa(attention,upcoming,t0,horizon){
  recs('brd-reun').forEach(r=>{if(!brdOwnerOk(r.board))return;const b=boardById(r.board);const nm=(r.titulo||'Reunião')+(b?' · '+b.nome:'');
    if(reunUp(r)&&r.data<=horizon){upcoming.push({date:r.data,kind:'Reunião',title:nm,meta:[r.hora?['',r.hora]:null,b&&b.executivo?['',EXEC[b.executivo]]:null],right:'',go:'brd',sev:'info'});}
  });
  recs('brd').forEach(b=>{if(b.situacao==='Encerrado'||!b.fim||!ownerOk(b.executivo))return;
    if(b.fim>=t0&&b.fim<=horizon)upcoming.push({date:b.fim,kind:'Conselho/Programa',title:'Fim do mandato · '+b.nome,meta:[b.executivo?['',EXEC[b.executivo]]:null],right:'',go:'brd',sev:'warn'});});
}
function phase4Pulse(){
  const t0=todayISO();
  const reun=recs('brd-reun').filter(r=>brdOwnerOk(r.board));const upAll=reun.filter(reunUp).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')));
  const r7=upAll.filter(r=>r.data<=addDays(t0,7)).length;
  const ev=brdEvs().filter(e=>evUpTo(e,addDays(t0,30)));
  const nx=upAll.filter(r=>r.data<=addDays(t0,7)).map(r=>({d:r.data,t:((boardById(r.board)||{}).nome||'')})).concat(ev.map(e=>({d:e.data<t0?t0:e.data,t:(e.titulo||'Evento')+' (evento)'}))).sort((a,b)=>a.d.localeCompare(b.d)).slice(0,2);
  return '<button class="card" data-go="brd"><div class="card-h"><span class="chip">'+IC.brd+'</span><h4>Conselhos e Programas</h4></div>'+
    '<div class="kv"><div><span>Reuniões em 7 dias</span><b>'+r7+'</b></div><div><span>Eventos em 30 dias</span><b>'+ev.length+'</b></div></div>'+
    '<div class="foot">'+(nx.length?nx.map(x=>'<span class="tag">'+esc(fmtDate(x.d)+' · '+x.t)+'</span>').join(''):'<span>Nada agendado no período</span>')+'</div></button>';
}
