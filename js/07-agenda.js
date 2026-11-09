"use strict";
/* =================== Agenda =================== */
/* Baseado nas planilhas: Pedidos de agendamento, Rotina de Gestão CS e Calendário de Eventos */
const DIAS_SEM=['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'];
Object.assign(REC,{
  'age-rot':{one:'reunião de rotina',col:'age-rotinas',fem:true,fields:[
    {k:'executivo',l:'Agenda de',opts:['leticia','fernando','ambos'],lab:v=>EXEC[v],req:true},
    {k:'grupo',l:'Tipo de reunião',opts:['Gerais','Inter áreas','1:1'],req:true},
    {k:'nome',l:'Reunião ou liderado',req:true,ph:'Ex.: Camino School Leadership Meeting, Sissa Dantas'},
    {k:'participantes',l:'Participantes',ph:'Ex.: Diretos; Camila, Leticia e Shayer'},
    {k:'frequencia',l:'Frequência',opts:['Semanal','Quinzenal','Mensal','Trimestral','Sob demanda']},
    {k:'dia',l:'Dia da semana',opts:DIAS_SEM},
    {k:'horario',l:'Horário',ph:'Ex.: 09:00 às 10:00'},
    {k:'inicio',l:'A partir de',t:'date',hint:'Usado para saber em quais semanas cai uma reunião quinzenal.'},
    {k:'ativa',l:'Situação',opts:['Ativa','Pausada','Encerrada']},
    {k:'obs',l:'Observações',long:true}]},
  'age-ev':{one:'evento',col:'age-eventos',fem:false,fields:[
    {k:'executivo',l:'Agenda de',opts:['leticia','fernando','ambos'],lab:v=>EXEC[v],req:true},
    {k:'pessoa',l:'Pessoa da família (se for dela)',ref:'familia',hint:'Para compromissos de uma pessoa da família, como escola ou atividades. Aparece também em Rotina e Família, na página da pessoa.'},
    {k:'board',l:'Conselho ou programa',ref:'boards',hint:'Se o evento for de um conselho ou programa. Aparece também em Conselhos e Programas.'},
    {k:'titulo',l:'Evento',req:true,ph:'Ex.: Family Meetings, Café com a diretora'},
    {k:'tema',l:'Tema',ph:'Ex.: Early Years, Inteligência artificial'},
    {k:'data',l:'Data',t:'date',req:true},
    {k:'fim',l:'Até (se durar mais de um dia)',t:'date'},
    {k:'horario',l:'Horário',ph:'Ex.: 18:00 às 21:00, Dia inteiro, A definir'},
    {k:'formato',l:'Formato',opts:['Presencial','Online','Híbrido']},
    {k:'ambito',l:'Interno ou externo',opts:['Interno','Externo']},
    {k:'palestrante',l:'Palestrante?',opts:['Não','Sim']},
    {k:'local',l:'Local'},
    {k:'status',l:'Feito?',opts:['Previsto','Sim','Não compareceu','Cancelado']},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Convite e materiais',t:'files'}]}
});
['age-rot','age-ev'].forEach(k=>{S.rec[k]=S.rec[k]||[];});
Object.assign(S,{ageTab:'geral',ageMes:'',ageEvAll:false});
try{const u=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(u.ageTab)S.ageTab=u.ageTab;}catch(e){}
const rotAtiva=r=>(r.ativa||'Ativa')==='Ativa';
const AGE_CANAIS=['WhatsApp','ClassApp','E-mail','Telefone','Lanttern','Pessoalmente','Outro'];
function mondayOf(iso){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function rotCai(r,wk){if(r.frequencia!=='Quinzenal'||!r.inicio)return true;const a=new Date(mondayOf(r.inicio)+'T12:00:00'),b=new Date(wk+'T12:00:00');return Math.round((b-a)/(7*864e5))%2===0;}
const ROT_ST={'':['','Marcar'],ok:['✓','Realizada'],canc:['✕','Cancelada'],rem:['↻','Remarcada']};
const ROT_NEXT={'':'ok',ok:'canc',canc:'rem',rem:''};
async function rotMark(id,wk){const r=recs('age-rot').find(x=>x.id===id);if(!r||!S.db)return;const cur=(r.semanas||{})[wk]||'';const nx=ROT_NEXT[cur];
  const sem=Object.assign({},r.semanas||{});sem[wk]=nx;r.semanas=sem;renderAge();
  try{await S.db.collection('age-rotinas').doc(id).update({semanas:sem,atualizadoEm:new Date().toISOString()});}catch(e){toast('Não foi possível salvar agora. Tente de novo.');}}
/* Rotina de gestão por mês. Uma reunião cai no mês pela data real dela (segunda da semana + dia da semana). rotMesStats serve também aos Relatórios. */
const rotData=(r,wk)=>addDays(wk,Math.max(0,DIAS_SEM.indexOf(r.dia)));
function mesWeeks(ym){const y=+ym.slice(0,4),m=+ym.slice(5,7);const last=ym+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0');const out=[];let w=mondayOf(ym+'-01');while(w<=last){out.push(w);w=addDays(w,7);}return out;}
function rotPrev(r,wk,ym){return rotAtiva(r)&&r.frequencia!=='Sob demanda'&&rotCai(r,wk)&&(!r.inicio||wk>=mondayOf(r.inicio))&&rotData(r,wk).slice(0,7)===ym;}
function rotMesStats(rots,ym,t0){t0=t0||todayISO();const o={previstas:0,ocorridas:0,realizadas:0,canceladas:0,remarcadas:0};
  rots.forEach(r=>mesWeeks(ym).forEach(w=>{if(!rotPrev(r,w,ym))return;o.previstas++;if(rotData(r,w)<=t0)o.ocorridas++;const v=(r.semanas||{})[w]||'';if(v==='ok')o.realizadas++;else if(v==='canc')o.canceladas++;else if(v==='rem')o.remarcadas++;}));
  o.cumprimento=o.ocorridas?Math.round(o.realizadas/o.ocorridas*100):null;return o;}
const evEnd=e=>e.fim||e.data||'';
const evOff=e=>['Cancelado','Não compareceu'].includes(e.status||'');
IC.age='<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
/* atendimentos a famílias (Negócios › Camino School) que pediram agendamento aparecem também aqui, sem duplicar a demanda */
const famAg=t=>t.kind==='familia'&&!!(t.fields&&(t.fields.pedeAg==='sim'||t.fields.dataAg));
function ageSol(){const base=modTasks('p-age');const ids=new Set(base.map(t=>t.id));return base.concat([...S.tasks.values()].filter(t=>famAg(t)&&!ids.has(t.id)&&taskExec(t)));}
function agePulse(){
  const t0=todayISO();const wk=mondayOf(t0);
  const rots=recs('age-rot').filter(r=>ownerOk(r.executivo)&&rotAtiva(r));
  const semana=rots.filter(r=>r.frequencia!=='Sob demanda'&&rotCai(r,wk));const feitas=semana.filter(r=>(r.semanas||{})[wk]==='ok').length;
  const ev30=recs('age-ev').filter(e=>ownerOk(e.executivo)&&!evOff(e)&&evEnd(e)>=t0&&(e.data||'')<=addDays(t0,30)).sort((a,b)=>((a.data||'')+(a.hora||'')).localeCompare((b.data||'')+(b.hora||'')));
  const sol=ageSol().filter(isOpen);const semData=sol.filter(t=>!(t.fields&&t.fields.dataAg)).length;
  return '<button class="card" data-go="age"><div class="card-h"><span class="chip">'+IC.age+'</span><h4>Agenda</h4></div>'+
    '<div class="kv"><div><span>Solicitações abertas</span><b>'+sol.length+'</b></div><div><span>Sem data definida</span><b class="'+(semData?'warn':'')+'">'+semData+'</b></div><div><span>Rotina da semana</span><b>'+(semana.length?feitas+'/'+semana.length:'—')+'</b></div><div><span>Eventos em 30 dias</span><b>'+ev30.length+'</b></div></div>'+
    '<div class="foot">'+(ev30.length?ev30.slice(0,2).map(e=>'<span class="tag">'+esc(fmtDate(e.data<t0?t0:e.data)+' · '+(e.titulo||'Evento'))+'</span>').join(''):'<span>Nenhum evento nos próximos 30 dias</span>')+'</div></button>';
}
function renderAge(){
  const el=$('#v-age');const t0=todayISO();const wk=mondayOf(t0);
  const rots=recs('age-rot').filter(r=>ownerOk(r.executivo));const ativas=rots.filter(rotAtiva);
  const evs=recs('age-ev').filter(e=>ownerOk(e.executivo));
  const semana=ativas.filter(r=>r.frequencia!=='Sob demanda'&&rotCai(r,wk));const feitas=semana.filter(r=>(r.semanas||{})[wk]==='ok').length;
    const ev30=evs.filter(e=>!evOff(e)&&evEnd(e)>=t0&&(e.data||'')<=addDays(t0,30));const pal=ev30.filter(e=>e.palestrante==='Sim').length;
  const sol=ageSol().filter(isOpen);const semData=sol.filter(t=>!(t.fields&&t.fields.dataAg)).length;
  if(!['geral','rot','ev'].includes(S.ageTab))S.ageTab='geral';
  const TL={geral:'Agenda',rot:'Rotina de gestão',ev:'Eventos'};
  const DS={geral:'Solicitações de agendamento, rotina de gestão dos liderados e calendário de eventos.',rot:'Reuniões gerais, inter áreas e 1:1 de cada executivo, com o acompanhamento semanal.',ev:'Calendário de eventos dos executivos e compromissos da família: internos, externos, palestras, escola e atividades.'};
  let h='<div class="plan-hero"><div><h2>'+TL[S.ageTab]+'</h2><p>'+DS[S.ageTab]+'</p></div>'+
    '<div class="acts"><button class="btn'+(S.ageTab==='rot'?' primary':'')+'" data-new-rec="age-rot">Reunião de rotina</button><button class="btn'+(S.ageTab==='rot'?'':' primary')+'" data-new-rec="age-ev">Evento</button></div></div>';
  if(S.ageTab==='geral'){
    h+='<div class="kpis">'+kpi('Solicitações abertas',String(sol.length),'',semData?semData+' ainda sem data':'')+kpi('Solicitações agendadas',String(sol.length-semData),'','com data definida')+
      kpi('Rotina de gestão desta semana',feitas+' de '+semana.length,'','reuniões realizadas')+kpi('Eventos em 30 dias',String(ev30.length),'',pal?pal+' como palestrante':'')+'</div>';
    h+=demBlock('p-age',ageSol(),{title:'Solicitações de agendamento',newLbl:'+ Nova solicitação',none:'Nenhuma solicitação',defSub:'c-age-sol',virt:t=>famAg(t)?'c-age-sol-fam':undefined,hook:t=>famAg(t)?'p-age':undefined,area:t=>famAg(t)?'Famílias':undefined});
  }else h+=S.ageTab==='ev'?ageEv(evs):ageRot(rots);
  const items=[{l:'Visão geral',nav:'age|geral|',on:S.ageTab==='geral',ic:MIC.geral,cnt:sol.length||''},
    {l:'Rotina de gestão',nav:'age|rot|',on:S.ageTab==='rot',ic:MIC.reun,cnt:semana.length?feitas+'/'+semana.length:''},
    {l:'Eventos',nav:'age|ev|',on:S.ageTab==='ev',ic:MIC.ev,cnt:ev30.length||''}];
  el.innerHTML=sideWrap(sideNav({mark:'AG',title:'Agenda',sub:'Solicitações, rotina e eventos',items}),h);
}
function ageRot(rots){
  if(!rots.length)return '<ul class="list"><li><div class="empty"><b>Nenhuma reunião de rotina cadastrada</b>Cadastre as reuniões gerais, inter áreas e os 1:1 de cada executivo, com frequência, dia e horário.<br><button class="btn sm" data-new-rec="age-rot" style="margin-top:8px">Cadastrar reunião</button></div></li></ul>';
  const t0=todayISO(),cur=mondayOf(t0),hoje=t0.slice(0,7);const ym=S.ageMes||hoje;const wks=mesWeeks(ym);
  const mlab=MES_N[+ym.slice(5,7)-1].replace(/^./,c=>c.toUpperCase())+' de '+ym.slice(0,4);
  const st=rotMesStats(rots,ym,t0);
  let h='<div class="filters"><span class="lbl" style="font-size:10.5px;color:var(--muted)">Clique na semana para marcar realizada (✓), cancelada (✕) ou remarcada (↻). Cada reunião conta no mês da sua data.</span><span class="grow"></span>'+
    '<button class="btn sm" data-age-mes="-1" aria-label="Mês anterior">‹</button><b class="mes-l">'+esc(mlab)+'</b><button class="btn sm" data-age-mes="1" aria-label="Próximo mês">›</button><button class="btn sm" data-age-mes="0"'+(ym===hoje?' disabled':'')+'>Mês atual</button></div>'+
    '<div class="kpis">'+kpi('Previstas no mês',String(st.previstas),'',st.ocorridas+' já ocorridas')+kpi('Realizadas',String(st.realizadas))+kpi('Canceladas',String(st.canceladas),st.canceladas?'warn':'')+kpi('Remarcadas',String(st.remarcadas))+kpi('Cumprimento',st.cumprimento==null?'—':st.cumprimento+'%','','realizadas ÷ já ocorridas')+'</div>';
  const byEx={};rots.forEach(r=>{(byEx[r.executivo||'']=byEx[r.executivo||'']||[]).push(r);});
  const ordE=['leticia','fernando','ambos',''],ordG=['Gerais','Inter áreas','1:1'];
  const ncol=4+wks.length+4;
  for(const ex of Object.keys(byEx).sort((a,b)=>ordE.indexOf(a)-ordE.indexOf(b))){
    const ts=rotMesStats(byEx[ex],ym,t0);
    h+='<div><div class="sec-h"><h3>'+esc(ex?EXEC[ex]:'Sem executivo')+'</h3><span class="cnt">'+byEx[ex].filter(rotAtiva).length+'</span></div><div class="rot-wrap"><table class="rot-t"><thead><tr><th class="l">Reunião</th><th class="l">Participantes</th><th class="l">Frequência</th><th class="l">Dia e horário</th>'+
      wks.map(w=>'<th class="wk'+(w===cur?' cur':'')+'">'+w.slice(8,10)+'/'+w.slice(5,7)+'</th>').join('')+'<th class="sum" title="Previstas no mês">Prev.</th><th class="sum" title="Realizadas">Real.</th><th class="sum" title="Canceladas">Canc.</th><th class="sum" title="Remarcadas">Rem.</th></tr></thead><tbody>';
    const g={};byEx[ex].forEach(r=>{(g[r.grupo||'1:1']=g[r.grupo||'1:1']||[]).push(r);});
    for(const gk of Object.keys(g).sort((a,b)=>ordG.indexOf(a)-ordG.indexOf(b))){
      h+='<tr class="grp"><td colspan="'+ncol+'">'+esc(gk)+'</td></tr>';
      g[gk].sort((a,b)=>(rotAtiva(b)-rotAtiva(a))||(DIAS_SEM.indexOf(a.dia)-DIAS_SEM.indexOf(b.dia))||String(a.horario||'').localeCompare(String(b.horario||''))).forEach(r=>{
        const on=rotAtiva(r);const rs=rotMesStats([r],ym,t0);
        h+='<tr class="'+(on?'':'off')+'"><td class="l"><button class="rot-n" data-rec="age-rot:'+esc(r.id)+'">'+esc(r.nome)+'</button>'+(on?'':' <span class="tag">'+esc(r.ativa)+'</span>')+'</td><td class="l mut">'+esc(r.participantes||'')+'</td><td class="l mut">'+esc(r.frequencia||'')+'</td><td class="l mut">'+esc([r.dia?r.dia.replace('-feira',''):'',r.horario].filter(Boolean).join(' · '))+'</td>'+
          wks.map(w=>{const v=(r.semanas||{})[w]||'';const cai=rotPrev(r,w,ym);const fut=w>cur;
            return '<td class="wk'+(w===cur?' cur':'')+'">'+((!cai&&!v)||fut?'<span class="rot-na">·</span>':'<button class="rot-c st-'+(v||'none')+(cai?'':' nc')+'" data-rot-mark="'+esc(r.id)+'|'+w+'" title="'+esc(ROT_ST[v][1]+' · semana de '+w.slice(8,10)+'/'+w.slice(5,7))+'">'+ROT_ST[v][0]+'</button>')+'</td>';}).join('')+
          '<td class="sum">'+(rs.previstas||'·')+'</td><td class="sum">'+(rs.realizadas||'·')+'</td><td class="sum">'+(rs.canceladas||'·')+'</td><td class="sum">'+(rs.remarcadas||'·')+'</td></tr>';});
    }
    h+='<tr class="tot"><td class="l" colspan="'+(4+wks.length)+'">Total do mês · '+esc(ex?EXEC[ex]:'sem executivo')+'</td><td class="sum">'+ts.previstas+'</td><td class="sum">'+ts.realizadas+'</td><td class="sum">'+ts.canceladas+'</td><td class="sum">'+ts.remarcadas+'</td></tr></tbody></table></div></div>';
  }
  return h;
}
function ageEv(evs){
  const t0=todayISO();
  if(!evs.length)return '<ul class="list"><li><div class="empty"><b>Nenhum evento cadastrado</b>Registre os eventos de cada executivo: data, horário, formato, se é interno ou externo e se vai como palestrante.<br><button class="btn sm" data-new-rec="age-ev" style="margin-top:8px">Cadastrar evento</button></div></li></ul>';
  const up=evs.filter(e=>evEnd(e)>=t0).sort((a,b)=>String(a.data).localeCompare(String(b.data)));
  const past=evs.filter(e=>evEnd(e)<t0).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  const wd=iso=>{const d=new Date(iso+'T12:00:00');return DIAS_SEM[(d.getDay()+6)%7].replace('-feira','');};
  const exIc=ex=>ex==='ambos'?'<span class="ex-ics" title="'+esc(EXEC.ambos)+'"><span class="ex-ic ex-f">F</span><span class="ex-ic ex-l">L</span></span>':ex?'<span class="ex-ic ex-'+(ex==='fernando'?'f':'l')+'" title="'+esc(EXEC[ex]||'')+'">'+(ex==='fernando'?'F':'L')+'</span>':'<span class="mut">·</span>';
  const row=e=>{const off=evOff(e);const feito=e.status==='Sim';
    const pe=e.pessoa&&personById(e.pessoa)?'<span class="tag pess">'+esc(personById(e.pessoa).nome.split(' ')[0])+'</span>':'';const bo=e.board&&boardById(e.board)?'<span class="tag">'+esc(boardById(e.board).nome)+'</span>':'';
    const dt=esc(fmtDate(e.data))+(e.fim&&e.fim!==e.data?' a '+esc(fmtDate(e.fim)):'');
    return '<tr class="'+(off?'off':'')+'"><td class="ex">'+exIc(e.executivo)+'</td><td class="l"><button class="rot-n" data-rec="age-ev:'+esc(e.id)+'">'+esc(e.titulo)+'</button>'+(e.tema?' <span class="mut">· '+esc(e.tema)+'</span>':'')+pe+bo+(e.palestrante==='Sim'?'<span class="tag warn">Palestrante</span>':'')+filesHtml(e.anexos)+'</td>'+
      '<td class="l">'+dt+(e.fim&&e.fim!==e.data?'':' <span class="mut">'+esc(wd(e.data))+'</span>')+'</td><td class="l mut">'+esc(e.horario||'')+'</td><td class="l mut">'+esc([e.formato,e.ambito].filter(Boolean).join(' · '))+'</td><td class="l mut">'+esc(e.local||'')+'</td>'+
      '<td class="l">'+(off||feito?'<span class="tag '+(off?'bad':'ok')+'">'+esc(feito?'Feito':e.status)+'</span>':'<span class="mut">'+esc(e.status||'Previsto')+'</span>')+'</td></tr>';};
  const byMonth=list=>{const g=new Map();list.forEach(e=>{const k=String(e.data||'').slice(0,7);if(!g.has(k))g.set(k,[]);g.get(k).push(e);});
    let h='';for(const [k,l] of g)h+='<div><div class="sec-h"><h3>'+esc(k?MES_N[+k.slice(5,7)-1].replace(/^./,c=>c.toUpperCase())+' de '+k.slice(0,4):'Sem data')+'</h3><span class="cnt">'+l.length+'</span></div><div class="rot-wrap"><table class="rot-t ev-t"><thead><tr><th></th><th class="l">Evento</th><th class="l">Data</th><th class="l">Horário</th><th class="l">Formato</th><th class="l">Local</th><th class="l">Situação</th></tr></thead><tbody>'+l.map(row).join('')+'</tbody></table></div></div>';return h;};
  let h=up.length?byMonth(up):'<ul class="list"><li><div class="empty"><b>Nenhum evento à frente</b></div></li></ul>';
  if(past.length)h+='<div><button class="btn sm ghost" data-age-evall>'+(S.ageEvAll?'Esconder eventos anteriores':'Ver eventos anteriores ('+past.length+')')+'</button></div>'+(S.ageEvAll?byMonth(past):'');
  return h;
}
function ageCapa(attention,upcoming,t0,horizon){
  recs('age-ev').forEach(e=>{if(!ownerOk(e.executivo)||evOff(e)||!e.data)return;
    if(e.data<=horizon&&evEnd(e)>=t0)upcoming.push({date:e.data<t0?t0:e.data,kind:'Evento',title:e.titulo+(e.tema?' · '+e.tema:''),meta:[e.horario?['',e.horario]:null,e.executivo?['',EXEC[e.executivo]]:null,e.palestrante==='Sim'?['warn','Palestrante']:null],right:'',go:'age',sev:'info'});});
  ageSol().filter(isOpen).forEach(t=>{const f=t.fields||{};if(f.dataAg&&f.dataAg>=t0&&f.dataAg<=horizon)upcoming.push({date:f.dataAg,kind:'Agendamento',title:t.title,meta:[f.horaAg?['',f.horaAg]:null,t.executive?['',EXEC[t.executive]]:null],right:'',go:'age',sev:'info'});});
}
/* solicitação de agendamento: dados extras guardados na própria demanda */
(window.DEM_HOOKS=window.DEM_HOOKS||{})['p-age']={
  tags:t=>{const f=t.fields||{};return (f.canal?'<span class="tag">'+esc(f.canal)+'</span>':'')+(f.dataAg?'<span class="tag ok">Agendada '+esc(fmtDate(f.dataAg))+(f.horaAg?' · '+esc(f.horaAg):'')+'</span>':'')+((f.reags||[]).length?'<span class="tag warn">'+(f.reags.length)+'º reagendamento</span>':'');},
  act:t=>isOpen(t)?'<button class="btn sm" data-age-ag="'+esc(t.id)+'">'+((t.fields||{}).dataAg?'Reagendar':'Agendar')+'</button>':''
};
function openAgendar(id){const t=S.tasks.get(id);if(!t)return;const f=t.fields||{};dr={type:'agendar',id};
  drawerShell((f.dataAg?'Reagendar · ':'Agendar · ')+(t.title||''),
    '<div class="row2"><div class="fld"><label for="ag-data">Data agendada</label><input id="ag-data" type="date" value="'+esc(f.dataAg||'')+'"></div><div class="fld"><label for="ag-hora">Horário</label><input id="ag-hora" type="time" value="'+esc(f.horaAg||'')+'"></div></div>'+
    '<div class="row2"><div class="fld"><label for="ag-fmt">Presencial ou online</label><select id="ag-fmt"><option value="">—</option>'+['Presencial','Online','Híbrido'].map(x=>'<option'+(f.formato===x?' selected':'')+'>'+x+'</option>').join('')+'</select></div>'+
    '<div class="fld"><label for="ag-canal">Canal</label><select id="ag-canal"><option value="">—</option>'+AGE_CANAIS.map(x=>'<option'+(f.canal===x?' selected':'')+'>'+x+'</option>').join('')+'</select></div></div>'+
    '<div class="fld"><label for="ag-tema">Tema</label><input id="ag-tema" value="'+esc(f.tema||'')+'" autocomplete="off"></div>'+
    '<div class="fld"><label for="ag-part">Participantes</label><input id="ag-part" value="'+esc(f.participantes||'')+'" autocomplete="off"></div>'+
    ((f.reags||[]).length?'<p class="hint">Datas anteriores: '+f.reags.map(r=>esc(fmtDateFull(r.d))+(r.h?' '+esc(r.h):'')).join(' → ')+'</p>':'')+
    (f.dataAg?'<p class="hint">Ao mudar a data, a anterior fica registrada como reagendamento.</p>':''),
    '<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn primary" id="ag-save">Salvar</button>');}
async function saveAgendar(){if(!dr||dr.type!=='agendar')return;const t=S.tasks.get(dr.id);if(!t)return;const old=t.fields||{};const now=new Date().toISOString();
  const nf=Object.assign({},old,{dataAg:$('#ag-data').value||'',horaAg:$('#ag-hora').value||'',formato:$('#ag-fmt').value||'',canal:$('#ag-canal').value||'',tema:$('#ag-tema').value.trim(),participantes:$('#ag-part').value.trim()});
  const notes=[];
  if(old.dataAg&&(nf.dataAg!==old.dataAg||nf.horaAg!==(old.horaAg||''))){nf.reags=(old.reags||[]).concat([{d:old.dataAg,h:old.horaAg||''}]);notes.push('Reagendada: '+fmtDateFull(old.dataAg)+' → '+(nf.dataAg?fmtDateFull(nf.dataAg):'sem data'));}
  else if(!old.dataAg&&nf.dataAg)notes.push('Agendada para '+fmtDateFull(nf.dataAg)+(nf.horaAg?' às '+nf.horaAg:''));
  const nt=JSON.parse(JSON.stringify(t));nt.fields=nf;nt.updatedAt=now;if(notes.length)nt.history=(t.history||[]).concat(notes.map(text=>({at:now,text}))).slice(-150);
  if(!old.dataAg&&nf.dataAg&&nt.status==='nova'){nt.status='aguardando';nt.waitingSince=now;nt.statusLog=(t.statusLog||[]).concat([{s:'aguardando',at:now}]);}
  const b=$('#ag-save');b.disabled=true;
  try{await S.db.doc('tasks/'+t.id).set(nt);closeDrawer();toast(notes[0]||'Salvo');}catch(e){b.disabled=false;toast('Não foi possível salvar agora. Tente de novo.');}}
document.addEventListener('click',e=>{
  const tb=e.target.closest('[data-age-tab]');if(tb){S.ageTab=tb.dataset.ageTab;saveUi();renderAge();return;}
  const w=e.target.closest('[data-age-mes]');if(w){const v=+w.dataset.ageMes;if(v===0)S.ageMes='';else{const b=S.ageMes||todayISO().slice(0,7);const d=new Date(+b.slice(0,4),+b.slice(5,7)-1+v,1);S.ageMes=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}renderAge();return;}
  const m=e.target.closest('[data-rot-mark]');if(m){const [id,wk]=m.dataset.rotMark.split('|');rotMark(id,wk);return;}
  const a=e.target.closest('[data-age-evall]');if(a){S.ageEvAll=!S.ageEvAll;renderAge();return;}
  const ag=e.target.closest('[data-age-ag]');if(ag){e.stopPropagation();openAgendar(ag.dataset.ageAg);return;}
  if(e.target.closest('#ag-save'))saveAgendar();
});

