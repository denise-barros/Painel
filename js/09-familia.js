"use strict";
/* =================== Rotina e Família =================== */
const FAM_TIPOS=['Compras','Documentos','Escola e atividades','Eventos','Pets','Outros'];
const DRIVE_PETS='1bPYA-LKNbp3mKPQtdRrVk9mQA46IWn6P';
const EXO=['','fernando','leticia','ambos'];
Object.assign(REC,{
  'fam-doc':{one:'documento',col:'fam-doc',fem:false,fields:[
    {k:'pessoa',l:'Pessoa',ref:'familia',req:true},
    {k:'tipo',l:'Documento',opts:['RG','CPF','Passaporte','CNH','Visto','Carteirinha do plano','Certidão','e-CPF (certificado digital)','Título de eleitor','Carteira de vacinação','Outro']},
    {k:'titulo',l:'Descrição',ph:'Ex.: Passaporte brasileiro, Visto americano'},
    {k:'emissao',l:'Emissão',t:'date'},
    {k:'validade',l:'Validade',t:'date'},
    {k:'antecedencia',l:'Avisar com quantos dias',t:'num',def:()=>90},
    {k:'guardado',l:'Onde está guardado',ph:'Ex.: Cofre da Morás 558, pasta azul'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Cópia digitalizada',t:'files'}]},
  'fam-ev':{one:'evento',col:'fam-ev',fem:false,fields:[
    {k:'titulo',l:'Evento',req:true,ph:'Ex.: Aniversário do Spike, Reunião de pais'},
    {k:'pessoa',l:'Pessoa',ref:'familia'},
    {k:'tipo',l:'Tipo',opts:['Aniversário','Festa','Escola','Viagem','Celebração','Outro']},
    {k:'data',l:'Data',t:'date',req:true},
    {k:'hora',l:'Horário',t:'time'},
    {k:'local',l:'Local'},
    {k:'anual',l:'Repete todo ano',t:'check',def:()=>false},
    {k:'obs',l:'O que precisa ser providenciado',long:true},
    {k:'anexos',l:'Convites e arquivos',t:'files'}]},
  'fam-pet':{one:'pet',col:'fam-pet',fem:false,fields:[
    {k:'nome',l:'Nome',req:true,ph:'Ex.: Panqueca'},
    {k:'especie',l:'Espécie',opts:['Gato','Cachorro','Outro']},
    {k:'executivo',l:'De quem',opts:EXO,lab:v=>EXEC[v]||'—'},
    {k:'sexo',l:'Sexo',opts:['','Fêmea','Macho']},
    {k:'raca',l:'Raça',ph:'Ex.: SRD, Shih-tzu'},
    {k:'nascimento',l:'Nascimento (aproximado serve)',t:'date'},
    {k:'castrado',l:'Castrado(a)',opts:['','Sim','Não']},
    {k:'microchip',l:'Microchip'},
    {k:'veterinario',l:'Veterinário',ph:'Ex.: Special Dog'},
    {k:'hotel',l:'Hotelzinho / creche',ph:'Ex.: Special Dog'},
    {k:'passeador',l:'Passeador(a)',ref:'equipe'},
    {k:'alimentacao',l:'Alimentação',ph:'Ração, quantidade, horários'},
    {k:'proxVacina',l:'Próxima vacina',t:'date'},
    {k:'proxVermifugo',l:'Próximo vermífugo',t:'date'},
    {k:'proxAntipulgas',l:'Próximo antipulgas',t:'date'},
    {k:'antecedencia',l:'Avisar com quantos dias',t:'num',def:()=>15},
    {k:'obs',l:'Observações',long:true,ph:'Remédios, alergias, cuidados, temperamento'},
    {k:'anexos',l:'Carteira de vacinação, exames e documentos',t:'files'}]}
});
S.rec['fam-doc']=S.rec['fam-doc']||[];S.rec['fam-ev']=S.rec['fam-ev']||[];S.rec['fam-pet']=S.rec['fam-pet']||[];
const PET_CUID=[['proxVacina','Vacina'],['proxVermifugo','Vermífugo'],['proxAntipulgas','Antipulgas']];
const petOk=p=>ownerOk(p.executivo);
function petIdade(d){if(!d)return '';const a=new Date(d+'T12:00:00'),b=new Date(todayISO()+'T12:00:00');let m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth();if(b.getDate()<a.getDate())m--;if(m<0)return '';return m<12?m+(m===1?' mês':' meses'):Math.floor(m/12)+(Math.floor(m/12)===1?' ano':' anos');}
function petCuidados(p){const t0=todayISO();return PET_CUID.filter(([k])=>p[k]).map(([k,l])=>({k,l,d:p[k],late:p[k]<t0,soon:p[k]>=t0&&p[k]<=addDays(t0,+p.antecedencia||15)}));}
Object.assign(S,{famTab:'geral',famP:'',famPet:'',famEvAll:false});
try{const u=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(u.famTab)S.famTab=u.famTab;}catch(e){}
function famTasks(){const set=descendants('p-fam');return [...S.tasks.values()].filter(t=>set.has(t.categoryId));}
const taskPessoa=t=>(t.fields&&t.fields.pessoa)||'';
const taskTipo=t=>(t.fields&&t.fields.tipo)||'Outros';
const famPersonOk=pid=>{if(S.famP)return pid===S.famP;const p=personById(pid);return !p||ownerOk(p.executivo);};
function nextOcc(e){if(!e.data)return '';if(!e.anual)return e.data;const t0=todayISO();const md=e.data.slice(5);let y=+t0.slice(0,4);let d=y+'-'+md;if(md==='02-29'&&!(y%4===0&&(y%100!==0||y%400===0)))d=y+'-02-28';if(d<t0){y++;d=y+'-'+(md==='02-29'&&!(y%4===0&&(y%100!==0||y%400===0))?'02-28':md);}return d;}
const docLate=d=>d.validade&&d.validade<todayISO();
const docSoon=d=>d.validade&&d.validade>=todayISO()&&d.validade<=addDays(todayISO(),+d.antecedencia||90);

function famProx(evs){
  const t0=todayISO();
  const a=evs.map(e=>({k:'fam-ev',e,n:nextOcc(e)})).filter(x=>x.n&&x.n>=t0);
  const b=recs('age-ev').filter(e=>e.pessoa&&ownerOk(e.executivo)&&!evOff(e)&&famPersonOk(e.pessoa)&&e.data&&evEnd(e)>=t0).map(e=>({k:'age-ev',e,n:e.data<t0?t0:e.data}));
  return a.concat(b).sort((x,y)=>(x.n+(x.e.hora||'')).localeCompare(y.n+(y.e.hora||'')));
}
function renderFam(){
  const el=$('#v-fam');const t0=todayISO();const fam=familia();
  if(!['geral','doc','pet','pessoa'].includes(S.famTab))S.famTab='geral';
  if(S.famTab==='pessoa'&&!personById(S.famP))S.famTab='geral';
  if(S.famTab!=='pessoa')S.famP='';
  const tasksAll=famTasks().filter(t=>(S.famP?taskPessoa(t)===S.famP:(taskExec(t)||famPersonOk(taskPessoa(t))&&!!taskPessoa(t))));const tasks=tasksAll.filter(isOpen);
  const docs=recs('fam-doc').filter(d=>famPersonOk(d.pessoa));
  const evs=recs('fam-ev').filter(e=>!e.pessoa?!S.famP:famPersonOk(e.pessoa));
  const prox=famProx(evs);const ev30=prox.filter(x=>x.n<=addDays(t0,30)).length;
  const pets=recs('fam-pet').filter(petOk);const pet=S.famTab==='pet'&&S.famPet&&pets.find(x=>x.id===S.famPet);
  const P=S.famTab==='pessoa'&&S.famP&&personById(S.famP);const nmP=P?P.nome.split(' ')[0]:'';
  const petOpen=cid=>{if(!catById(cid))return {n:0,late:false};const set=descendants(cid);const l=[...S.tasks.values()].filter(t=>isOpen(t)&&set.has(t.categoryId)&&taskExec(t));return {n:l.length,late:l.some(t=>t.due&&t.due<t0)};};
  const TL={geral:'Rotina e Família',doc:'Documentos',pet:'Pets',pessoa:'Pessoa'};
  const DSC={pessoa:P?'Eventos, documentos e demandas de '+esc(nmP)+'.':'',geral:'Demandas, próximos eventos e datas e documentos a vencer da família. Consultas e remédios das pessoas ficam em Saúde.',
    doc:'Passaportes, RGs, vistos e carteirinhas, com a validade e o aviso antes de vencer.',pet:'Os bichos da família: veterinário, hotelzinho, passeador, vacinas e documentos.'};
  let h='';
  if(pet){
    h+='<div class="plan-hero"><div><h2>'+esc(pet.nome)+'</h2><p>'+esc([pet.especie,pet.sexo,pet.raca,pet.executivo?(pet.especie==='Gato'?(pet.sexo==='Macho'?'gato':'gata'):'pet')+' de '+(EXEC[pet.executivo]||''):''].filter(Boolean).join(' · '))+'</p></div><div class="acts">'+subDrive(pet,'fam','Pasta de '+pet.nome+' no Drive')+'<button class="btn primary" data-rec="fam-pet:'+esc(pet.id)+'">Editar ficha</button></div></div>';
    h+=demBlock('p-fam',null,{title:'Demandas'});
    h+=famPet([pet])+petFicha(pet);
  }else{
    const pre=P?' data-pre-pessoa="'+esc(P.id)+'"':'';
    const acts=S.famTab==='pet'?'<button class="btn primary" data-new-rec="fam-pet">Pet</button>':
      S.famTab==='doc'?'<button class="btn primary" data-new-rec="fam-doc"'+pre+'>Documento</button>':
      '<button class="btn" data-new-rec="fam-ev"'+pre+'>Evento ou data</button><button class="btn primary" data-new-rec="fam-doc"'+pre+'>Documento</button>';
    h+='<div class="plan-hero"><div><h2>'+(P?esc(P.nome):esc(TL[S.famTab]))+'</h2><p>'+DSC[S.famTab]+'</p></div><div class="acts">'+(P?subDrive(P,'fam','Pasta de '+nmP+' no Drive'):'')+acts+'</div></div>';
    if(S.famTab==='pessoa'){
      h+='<div class="kpis">'+kpi('Demandas abertas',String(tasks.length),tasks.some(t=>t.due&&t.due<t0)?'neg':'')+kpi('Documentos vencidos',String(docs.filter(docLate).length),docs.filter(docLate).length?'neg':'')+kpi('Documentos a vencer',String(docs.filter(docSoon).length),docs.filter(docSoon).length?'warn':'','dentro do prazo de aviso')+kpi('Eventos em 30 dias',String(ev30))+'</div>';
      h+=demBlock('p-fam',tasksAll);
      h+=famEventos(prox,evs);
      h+='<div><div class="sec-h"><h3>Documentos</h3><span class="cnt">'+docs.length+'</span></div>'+famDoc(docs)+'</div>';
    }else if(S.famTab==='geral'){
      const dv=docs.filter(d=>docLate(d)||docSoon(d));
      h+='<div class="kpis">'+kpi('Demandas abertas',String(tasks.length),tasks.some(t=>t.due&&t.due<t0)?'neg':'')+kpi('Compras pendentes',String(tasks.filter(t=>taskTipo(t)==='Compras').length))+
        kpi('Documentos vencidos',String(docs.filter(docLate).length),docs.filter(docLate).length?'neg':'')+kpi('Documentos a vencer',String(docs.filter(docSoon).length),docs.filter(docSoon).length?'warn':'','dentro do prazo de aviso')+kpi('Eventos em 30 dias',String(ev30))+'</div>';
      h+=demBlock('p-fam',tasksAll);
      h+=famEventos(prox,evs);
      h+='<div><div class="sec-h"><h3>Documentos a vencer</h3><span class="cnt">'+dv.length+'</span></div>'+(dv.length?famDocRows(dv):'<ul class="list"><li><div class="empty"><b>Nenhum documento vencendo</b>Os vencidos e os que entram no prazo de aviso aparecem aqui.</div></li></ul>')+'</div>';
    }else if(S.famTab==='doc')h+=famDoc(docs);
    else h+=demBlock('p-fam',null,{title:'Demandas'})+famPet(pets);
  }
  const items=[{l:'Visão geral',nav:'fam|geral|',on:S.famTab==='geral',ic:MIC.geral,cnt:tasks.length||''},
    {l:'Documentos',nav:'fam|doc|',on:S.famTab==='doc',ic:MIC.doc,cnt:docs.filter(d=>docLate(d)||docSoon(d)).length||'',alert:docs.some(docLate)},
    {l:'Pets',nav:'fam|pet|',on:S.famTab==='pet'&&!S.famPet,ic:MIC.paw,cnt:petOpen('c-fam-pets').n||'',alert:petOpen('c-fam-pets').late}];
  pets.slice().sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt')).forEach(x=>items.push({l:x.nome,nav:'fam|pet|'+x.id,on:S.famTab==='pet'&&S.famPet===x.id,child:true,soon:x.executivo?(EXEC_SHORT&&EXEC_SHORT[x.executivo])||'':'',cnt:petOpen('c-'+x.id).n||'',alert:petOpen('c-'+x.id).late}));
  const famV=fam.filter(p=>!S.exec||ownerOk(p.executivo)||p.id===S.famP);
  if(famV.length){items.push({l:'Pessoas',nav:'fam|pessoa|'+(S.famP||famV[0].id),on:S.famTab==='pessoa',ic:MIC.reun});
    famV.forEach(p=>items.push({l:p.nome.split(' ')[0]+(p.nome.split(' ').length>1?' '+p.nome.split(' ').slice(-1)[0]:''),nav:'fam|pessoa|'+p.id,on:S.famTab==='pessoa'&&S.famP===p.id,child:true}));}
  el.innerHTML=sideWrap(sideNav({mark:'RF',title:'Rotina e Família',sub:'Eventos, documentos e pets',items}),h);
}
function cadPets(rows){
  const th=['Nome','Espécie','De quem','Raça','Veterinário','Hotelzinho','Passeador(a)','Próxima vacina','Observações'];
  return '<div class="tbl-wrap"><table><thead><tr>'+th.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.slice().sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt')).map(p=>{const pas=p.passeador&&personById(p.passeador);
    return '<tr data-rec="fam-pet:'+esc(p.id)+'" tabindex="0"><td class="nm">'+esc(p.nome||'')+'</td><td>'+esc(p.especie||'')+'</td><td>'+esc(p.executivo?EXEC[p.executivo]:'')+'</td><td>'+esc(p.raca||'')+'</td><td>'+esc(p.veterinario||'')+'</td><td>'+esc(p.hotel||'')+'</td><td>'+esc(pas?pas.nome:'')+'</td><td>'+esc(p.proxVacina?fmtDateFull(p.proxVacina):'')+'</td><td class="ob">'+esc(p.obs||'')+'</td></tr>';}).join('')+'</tbody></table></div>';
}
function petFicha(p){
  const pas=p.passeador&&personById(p.passeador);
  const F=[['Espécie',p.especie],['Sexo',p.sexo],['Raça',p.raca],['Nascimento',p.nascimento?fmtDateFull(p.nascimento)+(petIdade(p.nascimento)?' ('+petIdade(p.nascimento)+')':''):''],['Castrado(a)',p.castrado],['Microchip',p.microchip],
    ['Veterinário',p.veterinario],['Hotelzinho / creche',p.hotel],['Passeador(a)',pas?pas.nome:''],['Alimentação',p.alimentacao],
    ['Próxima vacina',p.proxVacina?fmtDateFull(p.proxVacina):''],['Próximo vermífugo',p.proxVermifugo?fmtDateFull(p.proxVermifugo):''],['Próximo antipulgas',p.proxAntipulgas?fmtDateFull(p.proxAntipulgas):''],['Observações',p.obs]];
  return '<div><div class="sec-h"><h3>Ficha</h3></div><div class="pet-ficha">'+F.map(([l,v])=>'<div><span>'+esc(l)+'</span><b>'+(v?esc(v):'<span style="color:var(--faint);text-transform:none;letter-spacing:0;font-size:12px">A preencher</span>')+'</b></div>').join('')+'</div></div>';
}
function famDem(tasks){
  if(!tasks.length)return '<ul class="list"><li><div class="empty"><b>Nenhuma demanda aberta</b>As demandas criadas aqui vão para a Operação em Rotina e Família, com a pessoa e o tipo marcados.</div></li></ul>';
  const t0=todayISO();const g={};tasks.forEach(t=>{(g[taskTipo(t)]=g[taskTipo(t)]||[]).push(t);});
  return FAM_TIPOS.filter(k=>g[k]).map(k=>'<div><div class="sec-h"><h3>'+esc(k)+'</h3><span class="cnt">'+g[k].length+'</span></div><ul class="list">'+
    g[k].sort((a,b)=>String(a.due||'9').localeCompare(String(b.due||'9'))).map(t=>{const late=t.due&&t.due<t0;const p=personById(taskPessoa(t));return '<li><button class="item '+(late?'bad':t.status==='aguardando'?'warn':'info')+'" data-task="'+esc(t.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(t.title||'(sem título)')+'</span><span class="mm"><span class="tag">'+esc(ST[t.status]||'')+'</span>'+(p&&!S.famP?'<span class="tag pess">'+esc(p.nome.split(' ')[0])+'</span>':'')+(t.due?'<span class="tag '+(late?'bad':'')+'">Prazo '+esc(fmtDate(t.due))+'</span>':'')+'</span></span><span class="rr"><small>#'+esc(t.num||'')+'</small></span></button></li>';}).join('')+'</ul></div>').join('');
}
function famDocRows(docs){
  const rows=docs.slice().sort((a,b)=>String(a.validade||'9').localeCompare(String(b.validade||'9')));
  return '<ul class="list">'+rows.map(d=>{const p=personById(d.pessoa);const late=docLate(d),soon=docSoon(d);
    return rowBtn('fam-doc',d,'<span style="min-width:0"><span class="tt">'+esc(d.tipo||'Documento')+(d.titulo?' · '+esc(d.titulo):'')+(S.famP?'':' · '+esc(p?p.nome.split(' ')[0]:'—'))+'</span><span class="mm">'+(d.validade?'<span class="tag '+(late?'bad':soon?'warn':'ok')+'">'+(late?'Venceu em ':'Válido até ')+esc(fmtDateFull(d.validade))+'</span>':'<span class="tag">Sem validade</span>')+(d.guardado?'<span class="tag">'+esc(d.guardado)+'</span>':'')+filesHtml(d.anexos)+'</span></span><span class="rr"></span>',late?'bad':soon?'warn':'ok');}).join('')+'</ul>';
}
function famDoc(docs){
  if(!docs.length)return '<ul class="list"><li><div class="empty"><b>Nenhum documento cadastrado</b>Cadastre passaportes, RGs, vistos e carteirinhas com a validade para receber o aviso antes de vencer.</div></li></ul>';
  return famDocRows(docs);
}
function famEventos(prox,evs){
  const t0=todayISO(),lim=addDays(t0,90);
  const near=prox.filter(x=>x.n<=lim),rest=prox.filter(x=>x.n>lim);
  const past=evs.filter(e=>!e.anual&&e.data&&e.data<t0).sort((x,y)=>y.data.localeCompare(x.data)).map(e=>({k:'fam-ev',e,n:e.data}));
  const line=x=>{const e=x.e,n=x.n,p=personById(e.pessoa);const hot=n<=addDays(t0,7)&&n>=t0?'warn':'info';
    const pt=p&&!S.famP?'<span class="tag pess">'+esc(p.nome.split(' ')[0])+'</span>':'';
    if(x.k==='age-ev')return rowBtn('age-ev',e,'<span style="min-width:0"><span class="tt">'+esc(e.titulo)+'</span><span class="mm"><span class="tag">Agenda</span><span class="tag">'+esc(fmtDateFull(n))+(e.horario?' · '+esc(e.horario):'')+'</span>'+pt+(e.local?'<span class="tag">'+esc(e.local)+'</span>':'')+filesHtml(e.anexos)+'</span></span><span class="rr"><small>'+esc(fmtDate(n))+'</small></span>',hot);
    return rowBtn('fam-ev',e,'<span style="min-width:0"><span class="tt">'+esc(e.titulo)+'</span><span class="mm"><span class="tag">'+esc(e.tipo||'Evento')+'</span><span class="tag">'+esc(fmtDateFull(n))+(e.hora?' · '+esc(e.hora):'')+'</span>'+pt+(e.anual?'<span class="tag">Todo ano</span>':'')+(e.local?'<span class="tag">'+esc(e.local)+'</span>':'')+filesHtml(e.anexos)+'</span></span><span class="rr"><small>'+esc(fmtDate(n))+'</small></span>',hot);};
  const blk=(t,l)=>'<div><div class="sec-h"><h3>'+t+'</h3><span class="cnt">'+l.length+'</span></div><ul class="list">'+l.map(line).join('')+'</ul></div>';
  let h='<div><div class="sec-h"><h3>Próximos eventos e datas</h3><span class="cnt">'+near.length+'</span></div>'+(near.length?'<ul class="list">'+near.map(line).join('')+'</ul>':'<ul class="list"><li><div class="empty"><b>Nenhum evento nos próximos 90 dias</b>Cadastre aniversários, festas e datas da família. Compromissos criados na Agenda com a pessoa marcada também aparecem aqui.</div></li></ul>')+'</div>';
  if(rest.length||past.length){h+='<div><button class="btn sm ghost" data-fam-evall>'+(S.famEvAll?'Mostrar só os próximos 90 dias':'Ver os mais distantes e os anteriores ('+(rest.length+past.length)+')')+'</button></div>';
    if(S.famEvAll){if(rest.length)h+=blk('Mais adiante',rest);if(past.length)h+=blk('Já passaram',past);}}
  return h;
}
document.addEventListener('click',e=>{if(e.target.closest('[data-fam-evall]')){S.famEvAll=!S.famEvAll;renderFam();}});
function famPet(pets){
  const add='<div class="acts" style="margin:4px 0 10px"><a class="sub-drive" href="https://drive.google.com/drive/folders/'+DRIVE_PETS+'" target="_blank" rel="noopener">Pasta Pets no Drive</a></div>';
  if(!pets.length)return add+'<ul class="list"><li><div class="empty"><b>Nenhum pet cadastrado</b>Cadastre os bichos da família com veterinário, hotelzinho, passeador e as datas de vacina, vermífugo e antipulgas para receber o aviso.</div></li></ul>';
  return add+'<ul class="list">'+pets.slice().sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt')).map(p=>{const c=petCuidados(p);const late=c.some(x=>x.late),soon=c.some(x=>x.soon);
    const pas=p.passeador&&personById(p.passeador);
    const meta=[esc(p.especie||'Pet')+(p.sexo?' · '+esc(p.sexo):'')+(p.raca?' · '+esc(p.raca):''),p.executivo?esc(EXEC[p.executivo]||''):'',petIdade(p.nascimento)?esc(petIdade(p.nascimento)):''].filter(Boolean).map(x=>'<span class="tag">'+x+'</span>').join('')+
      (p.veterinario?'<span class="tag">Vet: '+esc(p.veterinario)+'</span>':'')+(p.hotel?'<span class="tag">Hotel: '+esc(p.hotel)+'</span>':'')+(pas?'<span class="tag pess">Passeio: '+esc(pas.nome.split(' ')[0])+'</span>':'')+
      c.map(x=>'<span class="tag '+(x.late?'bad':x.soon?'warn':'ok')+'">'+esc(x.l)+' '+(x.late?'atrasado desde ':'')+esc(fmtDate(x.d))+'</span>').join('')+filesHtml(p.anexos);
    return rowBtn('fam-pet',p,'<span style="min-width:0"><span class="tt">'+esc(p.nome)+'</span><span class="mm">'+meta+'</span></span><span class="rr">'+(p.drive&&p.drive.fam?'<small>Pasta no Drive</small>':'')+'</span>',late?'bad':soon?'warn':'ok');}).join('')+'</ul>';
}
function phase5Capa(attention,upcoming,t0,horizon){
  recs('fam-pet').filter(petOk).forEach(p=>petCuidados(p).forEach(x=>{
    if(x.late)attention.push({sev:'bad',kind:'Pets',title:x.l+' · '+p.nome,meta:[['bad','Atrasado desde '+fmtDate(x.d)]],right:'',go:'fam',sort:x.d});
    else if(x.d<=horizon)upcoming.push({date:x.d,kind:'Pets',title:x.l+' · '+p.nome,meta:[],right:'',go:'fam',sev:x.soon?'warn':'info'});}));
  const ok=pid=>{const p=personById(pid);return !p||ownerOk(p.executivo);};
  recs('fam-doc').forEach(d=>{if(!d.validade||!ok(d.pessoa))return;const p=personById(d.pessoa);const nm=(d.tipo||'Documento')+(p?' · '+p.nome.split(' ')[0]:'');
    if(docLate(d))attention.push({sev:'bad',kind:'Família',title:nm,meta:[['bad','Venceu '+fmtDate(d.validade)]],right:'',go:'fam',sort:d.validade});
    else if(d.validade<=horizon)upcoming.push({date:d.validade,kind:'Família',title:'Vence · '+nm,meta:[],right:'',go:'fam',sev:'warn'});
    else if(docSoon(d)&&d.validade<=addDays(t0,60))attention.push({sev:'warn',kind:'Família',title:nm,meta:[['warn','Vence '+fmtDateFull(d.validade)+', providenciar renovação']],right:'',go:'fam',sort:d.validade});});
  recs('fam-ev').forEach(e=>{if(e.pessoa&&!ok(e.pessoa))return;const n=nextOcc(e);if(!n||n<t0||n>horizon)return;const p=personById(e.pessoa);
    upcoming.push({date:n,kind:'Família',title:e.titulo,meta:[['',e.tipo||'Evento'],e.hora?['',e.hora]:null,p?['pess',p.nome.split(' ')[0]]:null],right:'',go:'fam',sev:'info'});});
}
function phase5Pulse(){
  const t0=todayISO();const ok=pid=>{const p=personById(pid);return !p||ownerOk(p.executivo);};
  const tasks=famTasks().filter(t=>isOpen(t)&&taskExec(t));const docs=recs('fam-doc').filter(d=>ok(d.pessoa));
  const up=recs('fam-ev').filter(e=>!e.pessoa||ok(e.pessoa)).map(e=>({e,n:nextOcc(e)})).filter(x=>x.n&&x.n>=t0&&x.n<=addDays(t0,30)).sort((a,b)=>a.n.localeCompare(b.n));
  return '<button class="card" data-go="fam"><div class="card-h"><span class="chip">'+IC.fam+'</span><h4>Rotina e Família</h4></div>'+
    '<div class="kv"><div><span>Demandas abertas</span><b>'+tasks.length+'</b></div><div><span>Compras pendentes</span><b>'+tasks.filter(t=>taskTipo(t)==='Compras').length+'</b></div><div><span>Documentos a vencer</span><b class="'+(docs.filter(d=>docLate(d)||docSoon(d)).length?'warn':'')+'">'+docs.filter(d=>docLate(d)||docSoon(d)).length+'</b></div><div><span>Eventos em 30 dias</span><b>'+up.length+'</b></div></div>'+
    '<div class="foot">'+(up.length?up.slice(0,2).map(x=>'<span class="tag">'+esc(fmtDate(x.n)+' · '+x.e.titulo)+'</span>').join(''):'<span>Nenhum evento nos próximos 30 dias</span>')+'</div></button>';
}


