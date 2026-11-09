// Receita: vale a partir da data da receita pelo intervalo de compra (Comprar a cada, padrão 30 dias)
function medRecAte(m){if(m.receitaData)return addDays(m.receitaData,(+m.intervaloDias>0?+m.intervaloDias:30));return m.receitaValidade||'';}
"use strict";
/* =================== FASE 3: Saúde e Negócios pessoais =================== */
Object.assign(REC,{
  'sau-ev':{one:'registro de saúde',col:'sau-ev',fem:false,fields:[
    {k:'pessoa',l:'Pessoa',ref:'saude',req:true},
    {k:'tipo',l:'Tipo',opts:['Consulta','Exame','Retorno','Procedimento','Terapia','Vacina','Outro']},
    {k:'titulo',l:'Especialidade ou descrição',req:true,ph:'Ex.: Dermatologista, Hemograma, Vacina da gripe'},
    {k:'status',l:'Status',opts:['Agendado','A agendar','Realizado','Cancelado']},
    {k:'data',l:'Data',t:'date'},
    {k:'hora',l:'Horário',t:'time'},
    {k:'medico',l:'Médico',ref:'medicos',hint:'Cadastre os profissionais de saúde da família em Saúde › Profissionais de Saúde.'},
    {k:'profissional',l:'Outro profissional ou laboratório',ph:'Use quando não for um médico cadastrado'},
    {k:'local',l:'Local ou contato',hint:'Se ficar em branco, usa o endereço do médico.'},
    {k:'retornoEm',l:'Próximo retorno ou próxima dose',t:'date',hint:'O Painel avisa quando chegar a hora de agendar.'},
    {k:'valor',l:'Valor pago',t:'money'},
    {k:'reembolso',l:'Reembolso do plano',opts:['','Com reembolso','Lançado no Financeiro','Não se aplica']},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Pedidos, resultados e receitas',t:'files'}]},
  'sau-med':{one:'medicamento',col:'sau-med',fem:false,fields:[
    {k:'pessoa',l:'Pessoa',ref:'saude',req:true},
    {k:'nome',l:'Medicamento',req:true},
    {k:'posologia',l:'Como tomar',ph:'Ex.: 1 comprimido pela manhã'},
    {k:'situacao',l:'Situação',opts:['Em uso','Suspenso']},
    {k:'proximaCompra',l:'Próxima compra',t:'date',req:true,def:()=>todayISO()},
    {k:'intervaloDias',l:'Comprar a cada (dias)',t:'num',def:()=>30},
    {k:'receitaData',l:'Data da receita',t:'date'},
    {k:'farmacia',l:'Onde comprar'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Receitas',t:'files'}]},
  'neg-obr':{one:'obrigação',col:'neg-obr',fem:true,fields:[
    {k:'empresa',l:'Empresa',ref:'empresasPessoais',req:true},
    {k:'titulo',l:'Obrigação',req:true,ph:'Ex.: DAS, Fechamento contábil, Certidão negativa'},
    {k:'categoria',l:'Categoria',opts:['Imposto','Contabilidade','Folha / eSocial','Certidão','Taxa ou alvará','Outro']},
    {k:'frequencia',l:'Repete',opts:['Mensal','Trimestral','Semestral','Anual','Única']},
    {k:'proxima',l:'Próximo vencimento',t:'date',req:true},
    {k:'antecedencia',l:'Avisar com quantos dias',t:'num',def:()=>7},
    {k:'valor',l:'Valor estimado',t:'money'},
    {k:'fornecedor',l:'Quem cuida',ref:'fornecedores'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Guias e comprovantes',t:'files'}]},
  'neg-doc':{one:'contrato ou documento',col:'neg-doc',fem:false,fields:[
    {k:'empresa',l:'Empresa',ref:'empresasPessoais',req:true},
    {k:'titulo',l:'Nome',req:true,ph:'Ex.: Contrato de consultoria com a Escola X'},
    {k:'tipo',l:'Tipo',opts:['Contrato','Contrato social ou alteração','Procuração','Certidão','Alvará','Outro']},
    {k:'parte',l:'Outra parte'},
    {k:'inicio',l:'Início',t:'date'},
    {k:'vencimento',l:'Vencimento',t:'date'},
    {k:'valor',l:'Valor',t:'money'},
    {k:'status',l:'Status',opts:['Vigente','Em negociação','Encerrado']},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Arquivos',t:'files'}]}
});
['sau-ev','sau-med','neg-obr','neg-doc'].forEach(k=>{if(!S.rec[k])S.rec[k]=[];});
Object.assign(S,{sauTab:'agenda',sauP:'',sauTipo:'',negTab:'obr',negE:''});
try{const u=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(u.sauTab)S.sauTab=u.sauTab;if(u.negTab)S.negTab=u.negTab;}catch(e){}
REF_CAD.familia='pessoas';REF_CAD.medicos='medicos';REF_CAD.empresasPessoais='empresas';REF_CAD.empresas='empresas';REF_CAD.empresasRaiz='empresas';
const familia=()=>S.cad.pessoas.filter(p=>p.grupo==='Executivo'||p.grupo==='Família');
/* grupo "Saúde": pessoas acompanhadas só no módulo Saúde (ex.: parentes fora do núcleo da família) */
const sauPessoas=()=>S.cad.pessoas.filter(p=>p.grupo==='Executivo'||p.grupo==='Família'||p.grupo==='Saúde');
const empOrd=(a,b)=>((a.ordem??99)-(b.ordem??99))||String(a.nome).localeCompare(String(b.nome),'pt');
function empresasPessoais(){const all=S.cad.empresas.filter(e=>e.menu!=='nao');const roots=all.filter(e=>!e.pai||!all.some(x=>x.id===e.pai)).sort(empOrd);const out=[];roots.forEach(r=>{out.push(r);all.filter(e=>e.pai===r.id).sort(empOrd).forEach(c=>out.push(c));});return out;}
const empChildren=id=>S.cad.empresas.filter(e=>e.pai===id);
function negSet(){if(!S.negE)return null;return new Set([S.negE].concat(empChildren(S.negE).map(e=>e.id)));}
const empById=id=>S.cad.empresas.find(e=>e.id===id);
const profOf=e=>e.medico?refName('medicos',e.medico):(e.profissional||'');
const SAU_FIN_CAT={Consulta:'Consultas',Retorno:'Consultas',Exame:'Exames',Procedimento:'Procedimentos médicos',Terapia:'Terapias'};
const OBR_M={'Mensal':1,'Trimestral':3,'Semestral':6,'Anual':12};

/* ---------- Saúde: regras ---------- */
function sauScope(pid){if(S.sauP)return pid===S.sauP;const p=personById(pid);return !p||ownerOk(p.executivo)||!S.exec;}
const evUpcoming=e=>e.status==='Agendado'&&e.data&&e.data>=todayISO();
const evPastPending=e=>e.status==='Agendado'&&e.data&&e.data<todayISO();
const retornoDue=e=>e.status==='Realizado'&&e.retornoEm&&!e.retornoAgendado;
const medActive=m=>(m.situacao||'Em uso')==='Em uso';
const medRepor=m=>medActive(m)&&m.proximaCompra&&m.proximaCompra<=addDays(todayISO(),5);
function finReembFor(p){const n=String(p.nome||'').toLowerCase();if(!n)return [];return S.fin['reemb-med'].filter(r=>String(r.paciente||'').toLowerCase().includes(n.split(' ')[0])||(p.grupo==='Executivo'&&String(r.titular||'').toLowerCase()===n.split(' ')[0]&&!r.paciente));}

function renderSau(){
  const el=$('#v-sau');const t0=todayISO();const fam=sauPessoas();
  if(S.sauTab==='medicos')S.sauTab='med';
  if(S.sauTab==='pessoa'&&!personById(S.sauP))S.sauTab='agenda';
  if(S.sauTab!=='pessoa')S.sauP='';
  const ev=recs('sau-ev').filter(e=>sauScope(e.pessoa));const meds=recs('sau-med').filter(m=>sauScope(m.pessoa));
  const prox=ev.filter(e=>evUpcoming(e)&&e.data<=addDays(t0,30)).length;
  const agendar=ev.filter(e=>e.status==='A agendar').length+ev.filter(retornoDue).filter(e=>e.retornoEm<=addDays(t0,30)).length;
  const repor=meds.filter(medRepor).length;
  const reemb=S.fin['reemb-med'].filter(r=>r.status==='Pendente'||r.status==='Em análise');
  const P=S.sauP&&personById(S.sauP);
  if(S.sauTab==='medicos')S.sauTab='med';
  const TL={agenda:'Visão geral',hist:'Histórico',med:'Profissionais de Saúde',reemb:'Reembolsos'};
  let h='<div class="plan-hero"><div><h2>'+(P?esc(P.nome):S.sauTab==='agenda'?'Saúde':esc(TL[S.sauTab]||'Saúde'))+'</h2><p>'+(P?'Saúde de '+esc(P.nome.split(' ')[0])+': medicamentos, próximos compromissos, histórico e profissionais.':({agenda:'Consultas, exames, retornos, vacinas e medicamentos de toda a família.',hist:'Consultas e exames já realizados, com os resultados anexados.',med:'Médicos, terapeutas e laboratórios de preferência da família, com contato e convênio.',reemb:'Reembolsos do plano de saúde: o que falta lançar e o que está no Financeiro.'}[S.sauTab]||''))+'</p></div>'+
    '<div class="acts">'+(P?subDrive(P,'sau','Pasta de '+P.nome.split(' ')[0]+' no Drive'):'')+'<button class="btn" data-new-rec="sau-med"'+(P?' data-pre-pessoa="'+esc(P.id)+'"':'')+'>Medicamento</button><button class="btn primary" data-new-rec="sau-ev"'+(P?' data-pre-pessoa="'+esc(P.id)+'"':'')+'>Novo registro</button></div></div>';
  if(S.sauTab==='agenda'){
    h+='<div class="kpis">'+kpi('Próximos 30 dias',String(prox),'','consultas e exames agendados')+kpi('Para agendar',String(agendar),agendar?'warn':'','inclui retornos')+kpi('Remédios para repor',String(repor),repor?'warn':'','nos próximos 5 dias')+kpi('Em uso contínuo',String(meds.filter(medActive).length))+kpi('Reembolsos em aberto',fmtMoney(reemb.reduce((a,r)=>a+(+r.valor||0),0)),'',reemb.length+' no Financeiro')+'</div>';
    h+=demBlock('p-sau');
  }
  if(!fam.length)h+='<ul class="list"><li><div class="empty"><b>Ninguém da família cadastrado</b>Cadastre pessoas com o grupo Executivo ou Família.</div></li></ul>';
  else if(S.sauTab==='agenda')h+=sauAgenda(ev);
  else if(S.sauTab==='hist')h+=sauHist(ev);
  else if(S.sauTab==='pessoa')h+='<div><div class="sec-h"><h3>Medicamentos</h3><span class="cnt">'+meds.length+'</span></div>'+sauMed(meds)+'</div>'+sauAgenda(ev)+sauHist(ev)+'<div><div class="sec-h"><h3>Profissionais de Saúde</h3></div>'+sauMedicos()+'</div>';
  else if(S.sauTab==='med')h+=sauMedicos();
  else h+=sauReemb();
  const t1=todayISO();
  const items=[['agenda','Visão geral',MIC.geral],['hist','Histórico',MIC.hist],['med','Profissionais de Saúde',MIC.steth],['reemb','Reembolsos',MIC.money]].map(([k,l,ic])=>({l,nav:'sau|'+k+'|',on:S.sauTab===k,ic}));
  const famV=fam.filter(p=>!S.exec||ownerOk(p.executivo)||p.id===S.sauP);
  if(famV.length){items.push({l:'Pessoas',nav:'sau|pessoa|'+(S.sauP||famV[0].id),on:S.sauTab==='pessoa',ic:MIC.reun});
    famV.forEach(p=>{const rep=recs('sau-med').filter(m=>m.pessoa===p.id&&medRepor(m)).length;const n=recs('sau-ev').filter(e=>e.pessoa===p.id&&evUpcoming(e)&&e.data<=addDays(t1,30)).length;items.push({l:p.nome.split(' ')[0]+(p.nome.split(' ').length>1?' '+p.nome.split(' ').slice(-1)[0]:''),nav:'sau|pessoa|'+p.id,on:S.sauTab==='pessoa'&&S.sauP===p.id,child:true,cnt:rep||n||'',alert:!!rep});});}
  el.innerHTML=sideWrap(sideNav({mark:'SA',title:'Saúde',sub:'Saúde da família',items}),h);
}
function evLine(e,opts){
  const p=personById(e.pessoa);const late=evPastPending(e);
  const when=e.data?(fmtDate(e.data)+(e.data.slice(0,4)!==todayISO().slice(0,4)?' de '+e.data.slice(0,4):'')+(e.hora?' às '+e.hora:'')):'Sem data';
  return rowBtn('sau-ev',e,'<span style="min-width:0"><span class="tt">'+esc(e.titulo)+(S.sauP?'':' · '+esc(p?p.nome.split(' ')[0]:'—'))+'</span><span class="mm"><span class="tag">'+esc(e.tipo||'Consulta')+'</span><span class="tag '+(late?'bad':e.status==='Realizado'?'ok':e.status==='A agendar'?'warn':'')+'">'+esc(e.status==='Agendado'?when:e.status)+'</span>'+(e.status!=='Agendado'&&e.data?'<span class="tag">'+esc(fmtDateFull(e.data))+'</span>':'')+(profOf(e)?'<span class="tag">'+esc(profOf(e))+'</span>':'')+(late?'<span class="tag bad">Confirmar se aconteceu</span>':'')+(e.reembolso==='Com reembolso'?'<span class="tag warn">Com reembolso</span>':'')+filesHtml(e.anexos)+'</span></span><span class="rr">'+(+e.valor?'<b>'+fmtMoney(e.valor)+'</b>':'')+(opts&&opts.retorno?'<small>retorno '+esc(fmtDate(e.retornoEm))+'</small>':'')+'</span>',late?'bad':e.status==='A agendar'?'warn':e.status==='Realizado'?'ok':'info');
}
function sauAgenda(ev){
  const t0=todayISO();
  const up=ev.filter(evUpcoming).sort((a,b)=>(a.data+(a.hora||'')).localeCompare(b.data+(b.hora||'')));
  const pend=ev.filter(evPastPending);
  const toSch=ev.filter(e=>e.status==='A agendar');
  const ret=ev.filter(retornoDue).sort((a,b)=>a.retornoEm.localeCompare(b.retornoEm));
  let h='<div class="grid2"><div style="display:flex;flex-direction:column;gap:22px">';
  if(pend.length)h+='<div><div class="sec-h"><h3>Confirmar se aconteceu</h3><span class="cnt">'+pend.length+'</span></div><ul class="list">'+pend.map(e=>evLine(e)).join('')+'</ul></div>';
  h+='<div><div class="sec-h"><h3>Agendados</h3><span class="cnt">'+up.length+'</span></div>'+(up.length?'<ul class="list">'+up.map(e=>evLine(e)).join('')+'</ul>':'<ul class="list"><li><div class="empty"><b>Nada agendado</b>Registre consultas, exames e vacinas com data para vê-los aqui.</div></li></ul>')+'</div>';
  h+='</div><div style="display:flex;flex-direction:column;gap:22px">';
  h+='<div><div class="sec-h"><h3>Para agendar</h3><span class="cnt">'+toSch.length+'</span></div>'+(toSch.length?'<ul class="list">'+toSch.map(e=>evLine(e)).join('')+'</ul>':'<ul class="list"><li><div class="empty">Nada pendente de agendamento.</div></li></ul>')+'</div>';
  h+='<div><div class="sec-h"><h3>Retornos e próximas doses</h3><span class="cnt">'+ret.length+'</span></div>'+(ret.length?'<ul class="list">'+ret.map(e=>{const p=personById(e.pessoa);const late=e.retornoEm<t0;return '<li><div class="item '+(late?'bad':e.retornoEm<=addDays(t0,30)?'warn':'info')+'"><span class="sev"></span><button class="item-main" data-rec="sau-ev:'+esc(e.id)+'"><span class="tt">'+esc(e.titulo)+(S.sauP?'':' · '+esc(p?p.nome.split(' ')[0]:'—'))+'</span><span class="mm"><span class="tag '+(late?'bad':'')+'">'+(late?'Era para ':'Previsto para ')+esc(fmtDate(e.retornoEm))+'</span>'+(profOf(e)?'<span class="tag">'+esc(profOf(e))+'</span>':'')+'</span></button><span class="rr"><button class="btn sm" data-retorno="'+esc(e.id)+'">Agendar</button></span></div></li>';}).join('')+'</ul>':'<ul class="list"><li><div class="empty">Quando um registro tiver data de retorno, ele aparece aqui.</div></li></ul>')+'</div>';
  h+='</div></div>';return h;
}
function sauHist(ev){
  const f=S.sauTipo;const rows=ev.filter(e=>(e.status==='Realizado'||e.status==='Cancelado')&&(!f||e.tipo===f)).sort((a,b)=>String(b.data||'').localeCompare(String(a.data||'')));
  let h='<div class="toolbar">'+selHtml('sau-tipo',f,[['','Todos os tipos']].concat(REC['sau-ev'].fields[1].opts.map(o=>[o,o])),'Tipo')+'</div>';
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Sem histórico</b>Consultas e exames marcados como realizados ficam guardados aqui, com os resultados anexados.</div></li></ul>';
  const g={};rows.forEach(e=>{const y=(e.data||'Sem data').slice(0,4);(g[y]=g[y]||[]).push(e);});
  return h+Object.keys(g).sort().reverse().map(y=>'<div><div class="sec-h"><h3>'+esc(y)+'</h3><span class="cnt">'+g[y].length+'</span></div><ul class="list">'+g[y].map(e=>evLine(e)).join('')+'</ul></div>').join('');
}
function sauMed(meds){
  const t0=todayISO();const rows=meds.slice().sort((a,b)=>(medActive(a)?0:1)-(medActive(b)?0:1)||String(a.proximaCompra||'9').localeCompare(String(b.proximaCompra||'9')));
  if(!rows.length)return '<ul class="list"><li><div class="empty"><b>Nenhum medicamento de uso contínuo</b>Cadastre para receber o aviso de reposição na Capa.</div></li></ul>';
  return '<ul class="list">'+rows.map(m=>{const p=personById(m.pessoa);const act=medActive(m);const late=act&&m.proximaCompra&&m.proximaCompra<t0;const soon=medRepor(m);const recAte=medRecAte(m);const recV=recAte&&recAte<=addDays(t0,15);
    return '<li><div class="item '+(!act?'':late?'bad':soon?'warn':'ok')+'"><span class="sev"></span><button class="item-main" data-rec="sau-med:'+esc(m.id)+'"><span class="tt">'+esc(m.nome)+(S.sauP?'':' · '+esc(p?p.nome.split(' ')[0]:'—'))+'</span><span class="mm">'+(m.posologia?'<span class="tag">'+esc(m.posologia)+'</span>':'')+(act?'<span class="tag '+(late?'bad':soon?'warn':'')+'">Comprar '+esc(fmtDate(m.proximaCompra))+'</span>':'<span class="tag">Suspenso</span>')+(recAte?'<span class="tag '+(recV?'warn':'')+'">'+(m.receitaData?'Receita de '+esc(fmtDateFull(m.receitaData))+' · ':'')+(recAte<t0?'venceu ':'vale até ')+esc(fmtDateFull(recAte))+'</span>':'')+(m.farmacia?'<span class="tag">'+esc(m.farmacia)+'</span>':'')+filesHtml(m.anexos)+'</span></button><span class="rr">'+(act?'<button class="btn sm" data-comprou="'+esc(m.id)+'">Comprei</button>':'')+'</span></div></li>';}).join('')+'</ul>';
}
function sauMedicos(){
  const t0=todayISO();const list=S.cad.medicos.filter(m=>!S.sauP||(Array.isArray(m.pacientes)&&m.pacientes.includes(S.sauP)));
  let h='<div class="toolbar"><span class="hint">'+(S.sauP?'Profissionais que atendem '+esc((personById(S.sauP)||{}).nome||''):'Profissionais de saúde de preferência da família')+'</span><span class="grow"></span><button class="btn sm primary" data-add="medicos">Adicionar profissional</button></div>';
  if(!list.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhum profissional cadastrado'+(S.sauP?' para esta pessoa':'')+'</b>Cadastre os profissionais de preferência com especialidade, contato, endereço e convênio.</div></li></ul>';
  const g={};list.forEach(m=>{const k=m.especialidade||'Sem especialidade';(g[k]=g[k]||[]).push(m);});
  return h+Object.keys(g).sort((a,b)=>a.localeCompare(b,'pt')).map(k=>'<div><div class="sec-h"><h3>'+esc(k)+'</h3><span class="cnt">'+g[k].length+'</span></div><ul class="list">'+g[k].map(m=>{
    const evs=recs('sau-ev').filter(e=>e.medico===m.id);const last=evs.filter(e=>e.status==='Realizado'&&e.data).sort((a,b)=>b.data.localeCompare(a.data))[0];const nx=evs.filter(evUpcoming).sort((a,b)=>a.data.localeCompare(b.data))[0];
    return '<li><button class="item info" data-edit="medicos:'+esc(m.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(m.nome)+'</span><span class="mm">'+
      (Array.isArray(m.pacientes)&&m.pacientes.length?'<span class="tag pess">'+esc(showVal('medicos','pacientes',m.pacientes))+'</span>':'')+
      (m.secretaria?'<span class="tag">'+esc(m.secretaria)+'</span>':'')+(m.endereco?'<span class="tag">'+esc(m.endereco)+'</span>':'')+
      (m.convenio?'<span class="tag '+(m.convenio==='Atende SulAmérica'?'ok':m.convenio.startsWith('Particular')?'warn':'')+'">'+esc(m.convenio)+'</span>':'')+
      (nx?'<span class="tag info">Próxima: '+esc(fmtDate(nx.data))+'</span>':'')+'</span></span><span class="rr">'+(m.valor?'<b>'+esc(m.valor)+'</b>':'')+(last?'<small>última '+esc(fmtDateFull(last.data))+'</small>':'')+'</span></button></li>';}).join('')+'</ul></div>').join('');
}
function sauReemb(){
  const fp=S.sauReembP||'';const p=fp?personById(fp):null;const rows=(p?finReembFor(p):S.fin['reemb-med'].slice()).sort((a,b)=>String(b.data||'').localeCompare(String(a.data||'')));
  const pendEv=recs('sau-ev').filter(e=>e.reembolso==='Com reembolso'&&(fp?e.pessoa===fp:sauScope(e.pessoa)));
  const opts=sauPessoas().filter(x=>!S.exec||ownerOk(x.executivo)||x.id===fp);
  let h='<div class="toolbar"><select class="sel" data-sau-reemb-p aria-label="Filtrar por pessoa"><option value="">Todas as pessoas</option>'+opts.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===fp?' selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</select><span class="grow"></span></div>';
  if(pendEv.length)h+='<div><div class="sec-h"><h3>Para lançar no Financeiro</h3><span class="cnt">'+pendEv.length+'</span></div><ul class="list">'+pendEv.map(e=>{const pp=personById(e.pessoa);return '<li><div class="item warn"><span class="sev"></span><button class="item-main" data-rec="sau-ev:'+esc(e.id)+'"><span class="tt">'+esc(e.titulo)+' · '+esc(pp?pp.nome.split(' ')[0]:'—')+'</span><span class="mm"><span class="tag">'+esc(e.tipo)+'</span>'+(e.data?'<span class="tag">'+esc(fmtDateFull(e.data))+'</span>':'')+filesHtml(e.anexos)+'</span></button><span class="rr">'+(+e.valor?'<b>'+fmtMoney(e.valor)+'</b>':'')+'<button class="btn sm" data-lancar-reemb="'+esc(e.id)+'">Lançar no Financeiro</button></span></div></li>';}).join('')+'</ul></div>';
  h+='<div><div class="sec-h"><h3>Reembolsos no Financeiro</h3><span class="cnt">'+rows.length+'</span><span class="act"><button class="btn sm ghost" data-go="fin">Abrir Financeiro</button></span></div>';
  if(!rows.length)return h+'<ul class="list"><li><div class="empty">Nenhuma solicitação de reembolso'+(p?' para '+esc(p.nome.split(' ')[0]):'')+' no Financeiro.</div></li></ul></div>';
  return h+'<ul class="list">'+rows.map(r=>{const tone=r.status==='Pago'?'ok':r.status==='Negado'?'bad':'warn';return '<li><button class="item '+tone+'" data-fin-reemb="'+esc(r.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(r.descr||r.cat||'Reembolso')+(r.paciente?' · '+esc(r.paciente):'')+'</span><span class="mm"><span class="tag '+tone+'">'+esc(r.status||'Pendente')+'</span>'+(r.titular?'<span class="tag">Titular: '+esc(r.titular)+'</span>':'')+(r.data?'<span class="tag">'+esc(fmtDateFull(r.data))+'</span>':'')+'</span></span><span class="rr"><b>'+fmtMoney(r.valor)+'</b>'+(+r.vreemb?'<small>reembolsado '+fmtMoney(r.vreemb)+'</small>':'')+'</span></button></li>';}).join('')+'</ul></div>';
}
async function lancarReemb(id){
  const e=recs('sau-ev').find(x=>x.id===id);if(!e||!S.db)return;const p=personById(e.pessoa)||{};
  const tit=p.executivo==='leticia'?'Leticia':p.executivo==='fernando'?'Fernando':'';
  const row={titular:tit,paciente:p.nome||'',cat:SAU_FIN_CAT[e.tipo]||'Consultas',descr:e.titulo+(profOf(e)?' · '+profOf(e):''),data:e.data||'',valor:+e.valor||0,status:'Pendente',coment:'Lançado pelo Painel (Saúde)',criado:Date.now()};
  try{const ref=S.db.collection('abas/reemb-med/linhas').doc();await ref.set(row);await S.db.collection('sau-ev').doc(id).update({reembolso:'Lançado no Financeiro',finReembId:ref.id,atualizadoEm:new Date().toISOString()});toast('Reembolso lançado no Financeiro como Pendente'+(tit?'':'. Escolha o titular lá.'));}
  catch(err){toast('Não foi possível lançar agora. Tente de novo em instantes.');}
}
async function comprou(id){
  const m=recs('sau-med').find(x=>x.id===id);if(!m||!S.db)return;const n=Math.max(1,+m.intervaloDias||30);const t0=todayISO();
  const prox=addDays(t0,n);const hist=(Array.isArray(m.compras)?m.compras:[]).concat([t0]).slice(-24);
  try{await S.db.collection('sau-med').doc(id).update({proximaCompra:prox,compras:hist,atualizadoEm:new Date().toISOString()});toast('Compra registrada. Próxima: '+fmtDateFull(prox));}catch(e){toast('Não foi possível registrar agora.');}
}
function agendarRetorno(id){
  const e=recs('sau-ev').find(x=>x.id===id);if(!e)return;
  openRec('sau-ev',null,{pessoa:e.pessoa,tipo:e.tipo==='Vacina'?'Vacina':'Retorno',titulo:e.titulo,medico:e.medico||'',profissional:e.profissional||'',local:e.local||'',data:e.retornoEm||'',status:'Agendado'});
  dr.extra={origem:id};
}

/* ---------- Negócios: regras ---------- */
const negScope=empId=>{const ns=negSet();if(ns)return ns.has(empId);const e=empById(empId);return !S.exec||!e||ownerOk(e.executivo);};
const obrLate=o=>!o.encerrada&&o.proxima&&o.proxima<todayISO();
const obrSoon=o=>!o.encerrada&&o.proxima&&o.proxima>=todayISO()&&o.proxima<=addDays(todayISO(),+o.antecedencia||7);
const docVencido=d=>d.status!=='Encerrado'&&d.vencimento&&d.vencimento<todayISO();
const docVencendo=d=>d.status!=='Encerrado'&&d.vencimento&&d.vencimento>=todayISO()&&d.vencimento<=addDays(todayISO(),60);
function negTasks(){const set=descendants('p-neg');return [...S.tasks.values()].filter(t=>set.has(t.categoryId)||(t.fields&&t.fields.empresa));}
const normN=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const NO_OBR=['chase','cloe','savia','apiario','associacao cs','instituto cs','seeds','kind','camino school'];
function empObr(e){if(!e)return true;if(e.obrigacoes==='sim')return true;if(e.obrigacoes==='nao')return false;const n=normN(e.nome);return !NO_OBR.some(x=>n===x||n.indexOf(x+' ')===0);}
const empFam=e=>!!e&&normN(e.nome).indexOf('camino school')===0;
const obrList=()=>recs('neg-obr').filter(o=>empObr(empById(o.empresa)));
function taskEmp(t){const v=(t.fields&&t.fields.empresa)||'';if(!v||v==='todas')return v;if(empById(v))return v;const n=normN(v);const m=(S.cad.empresas||[]).find(e=>normN(e.nome)===n);return m?m.id:v;}
const dayBetween=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
const localDayOf=iso=>{const d=new Date(iso);return isNaN(d)?'':d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};

function negMenu(emps){
  const sub=id=>new Set([id].concat(empChildren(id).map(e=>e.id)));
  const GRID='<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>';
  const info=e=>{const set=sub(e.id);const n=negTasks().filter(t=>isOpen(t)&&set.has(taskEmp(t))).length+obrList().filter(o=>set.has(o.empresa)&&!o.encerrada).length;const late=obrList().some(o=>set.has(o.empresa)&&obrLate(o));
    return (e.situacao&&e.situacao!=='Ativa'?'<span class="soon">'+esc(e.situacao==='Em encerramento'?'encerrando':e.situacao)+'</span>':'')+(n?'<span class="cnt'+(late?' alert':'')+'">'+n+'</span>':'');};
  const root=e=>'<button class="nm-item nm-g'+(S.negE===e.id?' on':'')+'" data-neg-e="'+esc(e.id)+'"><span class="nm-chip">'+IC.neg+'</span><b class="lbl">'+esc(e.nome)+'</b>'+info(e)+'</button>';
  const child=e=>'<button class="nm-item nm-c'+(S.negE===e.id?' on':'')+'" data-neg-e="'+esc(e.id)+'"><span class="lbl">'+esc(e.nome)+'</span>'+info(e)+'</button>';
  return '<nav class="neg-menu" aria-label="Empresas"><div class="nm-head"><div class="nm-mark">NE</div><div><b>Negócios</b><small>Empresas e unidades</small></div></div><div class="nm-list">'+
    '<button class="nm-item nm-g'+(!S.negE?' on':'')+'" data-neg-e=""><span class="nm-chip">'+GRID+'</span><b class="lbl">Todas as empresas</b></button>'+
    emps.filter(e=>!e.pai||!emps.some(x=>x.id===e.pai)).map(r=>'<div class="nm-grp">'+root(r)+emps.filter(c=>c.pai===r.id).map(child).join('')+'</div>').join('')+
    '<button class="nm-item nm-c add" data-add="empresas"><span class="lbl">+ Adicionar empresa</span></button></div></nav>';
}
function renderNeg(){
  const el=$('#v-neg');const emps=empresasPessoais().filter(e=>!S.exec||ownerOk(e.executivo));
  if(S.negE&&!empById(S.negE))S.negE='';
  const ns=negSet();const sel=S.negE?empById(S.negE):null;
  const showObr=!sel||empObr(sel),showFam=!sel||empFam(sel);
  const tasksAll=negTasks().filter(t=>(ns?ns.has(taskEmp(t)):(!S.exec||taskExec(t))));const tasks=tasksAll.filter(isOpen);
  const obr=obrList().filter(o=>negScope(o.empresa));const docs=recs('neg-doc').filter(d=>negScope(d.empresa));
  let h='<div class="wrap"><div class="side-layout">'+negMenu(emps)+'<div class="side-main">'+(sel?'<div class="back-row"><button class="back-home" data-neg-e="">‹ Voltar para todas as empresas</button></div>':'');
  h+='<div class="plan-hero"><div><h2>'+esc(sel?sel.nome:'Negócios')+'</h2><p>'+(sel?esc([sel.pai?'Unidade de negócio da '+((empById(sel.pai)||{}).nome||''):'',empChildren(sel.id).length?'Unidades: '+empChildren(sel.id).sort(empOrd).map(e=>e.nome).join(', '):'',sel.situacao,sel.executivo?EXEC[sel.executivo]:''].filter(Boolean).join(' · ')):'Demandas e o que precisa de atenção hoje, em todas as empresas.')+'</p></div>'+
    '<div class="acts">'+(sel?subDrive(sel,'neg'):'')+'</div></div>';
  const late=obr.filter(obrLate).length,soon=obr.filter(o=>!o.encerrada&&o.proxima&&o.proxima>=todayISO()&&o.proxima<=addDays(todayISO(),30)).length;
  const asPend=negKind('assinatura').filter(isOpen).length,faPend=negKind('familia').filter(isOpen).length;
  const ceSoon=certEmps().filter(e=>e.certVenc&&e.certVenc<=addDays(todayISO(),30)),ceLate=ceSoon.filter(e=>e.certVenc<todayISO()).length;
  if(!sel)h+='<div class="kpis">'+kpi('Demandas abertas',String(tasks.length))+kpi('Assinaturas pendentes',String(asPend),asPend?'warn':'')+kpi('Famílias aguardando',String(faPend),faPend?'warn':'')+kpi('Certificados vencendo em 30 dias',String(ceSoon.length),ceLate?'neg':ceSoon.length?'warn':'',ceLate?ceLate+' já vencido'+(ceLate>1?'s':''):'')+'</div>';
  h+=demBlock('p-neg',tasksAll,{hook:t=>famAg(t)?'p-age':undefined,area:t=>{if(sel)return '';const v=taskEmp(t);return v==='todas'?'Todas as empresas':((empById(v)||{}).nome||'');}});
  if(!sel)h+=negHome(emps);
  if(!sel){if(!emps.length)h+='<ul class="list"><li><div class="empty"><b>Nenhuma empresa cadastrada</b>Cadastre em Cadastros › Empresas.<br><button class="btn sm" data-add="empresas" style="margin-top:8px">Adicionar empresa</button></div></li></ul>';}
  else if(!emps.length)h+='<ul class="list"><li><div class="empty"><b>Nenhuma empresa cadastrada</b>Cadastre em Cadastros › Empresas.<br><button class="btn sm" data-add="empresas" style="margin-top:8px">Adicionar empresa</button></div></li></ul>';
  else{
    const card=(title,count,btn,body)=>'<section class="ov-b wide"><div class="sec-h"><h3>'+title+'</h3><span class="cnt">'+count+'</span>'+(btn?'<span class="act">'+btn+'</span>':'')+'</div><div class="ov-box">'+body+'</div></section>';
    const nOpen=n=>n+' aberta'+(n===1?'':'s');
    let c='';
    if(showObr)c+=card('Obrigações',obr.length+' cadastrada'+(obr.length===1?'':'s'),'<button class="btn sm primary" data-new-rec="neg-obr">Obrigação</button>',negObr(obr));
    if(showFam)c+=card('Atendimento a famílias',faPend+' aguardando','',negFam());
    c+=card('Assinaturas',asPend+' pendente'+(asPend===1?'':'s'),'',negAss());
    c+=card('Contratos e documentos',docs.length+' registrado'+(docs.length===1?'':'s'),'<button class="btn sm primary" data-new-rec="neg-doc">Adicionar</button>',negDoc(docs));
    h+='<div class="ov-grid">'+c+'</div>';
  }
  h+='</div></div></div>';el.innerHTML=h;
}


const certRepOf=e=>e.certRep||(normN(e.nome||'').indexOf('mindset')===0?'leticia':'fernando');
function certEmps(){const ns=negSet();return empresasPessoais().filter(e=>(!ns||ns.has(e.id))&&(!S.exec||ownerOk(e.executivo)));}
function negHome(empsIn){
  const t0=todayISO();const ex=t=>!S.exec||taskExec(t);
  const L=k=>[...S.tasks.values()].filter(t=>t.kind===k&&ex(t));
  const due=t=>{if(!t.due)return null;const late=t.due<t0;return [late?'Venceu '+fmtDate(t.due).toLowerCase():'Prazo '+fmtDate(t.due),late?'bad':''];};
  const en=t=>{const v=taskEmp(t);return v==='todas'?'Todas as empresas':((empById(v)||{}).nome||'');};
  const tags=a=>a.filter(Boolean).map(x=>'<span class="tag '+(x[1]||'')+'">'+esc(x[0])+'</span>').join('');
  const ck=(t,lab,on)=>'<button class="ov-ck'+(on?' on':'')+'" data-ov-tick="'+esc(t.id)+'" aria-pressed="'+(!!on)+'" aria-label="'+lab+'" title="'+lab+'">'+(on?'✓':'')+'</button>';
  const row=(t,tg,tone,c)=>'<li><div class="item '+tone+'"><span class="sev"></span><button class="item-main" data-task="'+esc(t.id)+'"><span class="tt">'+esc(t.title||'(sem título)')+'</span><span class="mm">'+tags(tg)+'</span></button><span class="rr">'+(c||'')+'</span></div></li>';
  const blk=(title,count,body,wide,extra)=>'<section class="ov-b'+(wide?' wide':'')+'"><div class="sec-h"><h3>'+title+'</h3><span class="cnt">'+count+'</span>'+(extra?'<span class="act">'+extra+'</span>':'')+'</div><div class="ov-box">'+body+'</div></section>';
  const none=x=>'<ul class="list"><li><div class="empty">'+x+'</div></li></ul>';
  const origem=t=>rootOf(t.categoryId)==='p-brd'?'Conselhos e Programas':sphereOf(t)==='pessoal'?'Pessoal':'Corporativo';
  const em=L('email').filter(t=>isOpen(t)&&origem(t)==='Corporativo').sort((a,b)=>String(a.due||'9999').localeCompare(String(b.due||'9999')));
  const emH=em.length?'<ul class="list">'+em.map(t=>{const f=t.fields||{};const d=due(t);return row(t,[en(t)?[en(t)]:null,f.de?['De '+f.de]:null,d],d&&d[1]==='bad'?'bad':'',ck(t,'Marcar como respondido',false));}).join('')+'</ul>':none('Nenhum follow-up pendente.');
  const im=L('impressao').filter(t=>(isOpen(t)&&(!t.due||t.due<=t0))||(!isOpen(t)&&localDayOf(t.completedAt)===t0)).sort((a,b)=>(isOpen(b)-isOpen(a))||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
  const imDone=im.filter(t=>!isOpen(t)).length;
  const imH=im.length?'<ul class="list">'+im.map(t=>{const f=t.fields||{};const d=due(t);const done=!isOpen(t);return row(t,[en(t)?[en(t)]:null,f.qtd?[f.qtd+' cópias']:null,f.solic?[f.solic]:null,d],done?'ok':d&&d[1]==='bad'?'bad':'',ck(t,done?'Desfazer':'Marcar como impressa',done));}).join('')+'</ul>':none('Nenhuma impressão para hoje.');
  const as=L('assinatura').filter(isOpen).sort((a,b)=>String(a.due||'9999').localeCompare(String(b.due||'9999')));
  const asH=as.length?'<ul class="list">'+as.map(t=>{const f=t.fields||{};const d=due(t);return row(t,[[f.etapa||'Recebida','warn'],en(t)?[en(t)]:null,f.modo?[f.modo]:null,f.quem?['Em nome de '+(EXEC[f.quem]||f.quem)]:null,d],d&&d[1]==='bad'?'bad':'warn');}).join('')+'</ul>':none('Nenhuma assinatura pendente.');
  const fa=L('familia').filter(isOpen);const base=t=>(t.fields||{}).contatoEm||localDayOf(t.createdAt)||t0;fa.sort((a,b)=>base(a).localeCompare(base(b)));
  const faH=fa.length?'<ul class="list">'+fa.map(t=>{const f=t.fields||{};const w=dayBetween(base(t),t0);return row(t,[[w<=0?'Contato hoje':'Há '+w+' dia'+(w>1?'s':''),w>=3?'bad':'warn'],f.familia?[f.familia]:null,f.canal?[f.canal]:null,f.recebeu?['Contato com '+(EXEC[f.recebeu]||f.recebeu)]:null,famAgTag(t)],w>=3?'bad':'warn',ck(t,'Marcar retorno feito',false));}).join('')+'</ul>':none('Nenhuma família aguardando retorno.');
  const rows=[];
  certEmps().forEach(e=>{const v=e.certVenc||'';const n=v?dayBetween(t0,v):null;const cl=n==null?'':n<0?'bad':n<=30?'warn':'';
    const dm=[...S.tasks.values()].find(t=>t.kind==='certificado'&&t.id==='cert-'+e.id+'-'+v);
    rows.push('<tr><td class="emp'+(dm?' clk':'')+'"'+(dm?' data-task="'+esc(dm.id)+'" title="Abrir a demanda de renovação"':'')+'>'+esc(e.nome)+'</td><td><select class="cert-in" data-cert-rep="'+esc(e.id)+'" aria-label="Representante legal">'+['fernando','leticia'].concat(e.certRep==='outro'?['outro']:[]).map(k=>'<option value="'+k+'"'+(certRepOf(e)===k?' selected':'')+'>'+esc(k==='outro'?(e.certRepNome||'Outra pessoa'):EXEC[k])+'</option>').join('')+'</select></td><td><input class="cert-in" type="date" data-cert-due="'+esc(e.id)+'" value="'+esc(v)+'" aria-label="Vencimento"></td><td>'+(n==null?'<span class="none">Sem data</span>':'<span class="tag '+cl+'">'+(n<0?'Vencido há '+(-n)+' dias':n===0?'Vence hoje':n+' dias')+'</span>')+'</td></tr>');});
  const ceH='<table class="cert-t"><thead><tr><th>Empresa</th><th>Representante legal</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  return '<div class="ov-grid">'
    +blk('Follow-ups de e-mail',em.length+' pendente'+(em.length===1?'':'s'),emH)
    +blk('Impressões do dia',im.length?imDone+' de '+im.length+' feitas':'0',imH)
    +blk('Assinaturas pendentes',as.length+' pendente'+(as.length===1?'':'s'),asH)
    +blk('Famílias aguardando retorno',fa.length+' aguardando',faH)
    +blk('Certificados digitais','todas as empresas',ceH,true)+'</div>';
}
function negKind(k){const ns=negSet();return [...S.tasks.values()].filter(t=>t.kind===k&&(k==='familia'||!ns||ns.has(taskEmp(t)))&&(!S.exec||taskExec(t)));}
function negItem(t,tags,tone){return '<li><button class="item '+tone+'" data-task="'+esc(t.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(t.title||'(sem título)')+'</span><span class="mm">'+tags.filter(Boolean).map(x=>'<span class="tag '+(x[1]||'')+'">'+esc(x[0])+'</span>').join('')+'</span></span><span class="rr"><small>#'+esc(t.num||'')+'</small></span></button></li>';}
function negAss(){
  const l=negKind('assinatura');const t0=todayISO();
  if(!l.length)return '<ul class="list"><li><div class="empty"><b>Nenhuma solicitação de assinatura</b></div></li></ul>';
  const nome=t=>{const v=taskEmp(t);return v==='todas'?'Todas as empresas':((empById(v)||{}).nome||'');};
  const tg=t=>{const f=t.fields||{};return [!S.negE&&nome(t)?[nome(t)]:null,f.modo?[f.modo]:null,f.quem?['Em nome de '+(EXEC[f.quem]||f.quem)]:null,f.pedidoPor?['Pedido de '+(EXEC[f.pedidoPor]||f.pedidoPor)+(f.pedidoVia?' por '+f.pedidoVia:'')]:null];};
  const open=l.filter(isOpen).sort((a,b)=>String(a.due||'9999').localeCompare(String(b.due||'9999')));
  const done=l.filter(t=>!isOpen(t)).sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
  const sec=(tt,arr,fn)=>arr.map(fn).join('');
  return '<ul class="list">'+sec('Pendentes',open,t=>{const late=t.due&&t.due<t0;return negItem(t,[[(t.fields||{}).etapa||'Recebida','warn']].concat(tg(t)).concat([t.due?['Prazo '+fmtDate(t.due),late?'bad':'']:null]),late?'bad':'warn');})
    +sec('Histórico',done,t=>negItem(t,[[(t.fields||{}).etapa==='Assinada'||(t.fields||{}).assinadoEm?'Assinada'+((t.fields||{}).assinadoEm?' em '+fmtDateFull(t.fields.assinadoEm):''):'Concluída','ok']].concat(tg(t)),'ok'))+'</ul>';
}
function famAgTag(t){const f=t.fields||{};if(!famAg(t))return null;return f.dataAg?['Reunião '+fmtDate(f.dataAg)+(f.horaAg?' · '+f.horaAg:''),'ok']:['Pediu agendamento','warn'];}
function negFam(){
  const l=negKind('familia');const t0=todayISO();
  if(!l.length)return '<ul class="list"><li><div class="empty"><b>Nenhum atendimento registrado</b>Registre as famílias que procuram a Leticia. Cada uma fica aguardando retorno até ser marcada como concluída, e o histórico mostra quanto tempo levou.</div></li></ul>';
  const base=t=>(t.fields||{}).contatoEm||localDayOf(t.createdAt)||t0;
  const tg=t=>{const f=t.fields||{};return [f.familia?[f.familia]:null,f.canal?[f.canal]:null,f.recebeu?['Contato com '+(EXEC[f.recebeu]||f.recebeu)]:null,famAgTag(t)];};
  const open=l.filter(isOpen).sort((a,b)=>base(a).localeCompare(base(b)));
  const done=l.filter(t=>!isOpen(t)).sort((a,b)=>String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
  const sec=(tt,arr,fn)=>arr.map(fn).join('');
  return '<ul class="list">'+sec('Aguardando retorno',open,t=>{const w=dayBetween(base(t),t0);return negItem(t,[[w<=0?'Contato hoje':'Há '+w+' dia'+(w>1?'s':''),w>=3?'bad':'warn']].concat(tg(t)),w>=3?'bad':'warn');})
    +sec('Histórico',done,t=>{const d=t.completedAt?dayBetween(base(t),localDayOf(t.completedAt)):null;return negItem(t,[['Retorno feito'+(t.completedAt?' em '+fmtDateFull(localDayOf(t.completedAt)):'')+(d!=null?' · '+(d<=0?'no mesmo dia':'em '+d+' dia'+(d>1?'s':'')):''),'ok']].concat(tg(t)),'ok');})+'</ul>';
}
function negObr(obr){
  const rows=obr.slice().sort((a,b)=>(a.encerrada?1:0)-(b.encerrada?1:0)||String(a.proxima||'9').localeCompare(String(b.proxima||'9')));
  if(!rows.length)return '<ul class="list"><li><div class="empty"><b>Nenhuma obrigação cadastrada</b>Cadastre impostos, fechamentos contábeis, certidões e taxas que se repetem.</div></li></ul>';
  return '<ul class="list">'+rows.map(o=>{const e=empById(o.empresa);const late=obrLate(o),soon=obrSoon(o);
    const when=o.encerrada?'Concluída':o.proxima?(late?'Venceu '+fmtDate(o.proxima):'Vence '+fmtDate(o.proxima)):'Sem data';
    const last=Array.isArray(o.historico)&&o.historico.length?o.historico[o.historico.length-1]:null;
    return '<li><div class="item '+(late?'bad':soon?'warn':o.encerrada?'ok':'')+'"><span class="sev"></span><button class="item-main" data-rec="neg-obr:'+esc(o.id)+'"><span class="tt">'+esc(o.titulo)+(S.negE?'':' · '+esc(e?e.nome:'—'))+'</span><span class="mm"><span class="tag '+(late?'bad':soon?'warn':'')+'">'+esc(when)+'</span>'+(o.categoria?'<span class="tag">'+esc(o.categoria)+'</span>':'')+'<span class="tag">'+esc(o.frequencia||'Mensal')+'</span>'+(o.fornecedor?'<span class="tag">'+esc(refName('fornecedores',o.fornecedor))+'</span>':'')+(last?'<span class="tag ok">Última: '+esc(fmtDateFull(last.feitoEm))+'</span>':'')+filesHtml(o.anexos)+'</span></button><span class="rr">'+(+o.valor?'<b>'+fmtMoney(o.valor)+'</b>':'')+(!o.encerrada?'<button class="btn sm" data-obr-done="'+esc(o.id)+'">Registrar como feita</button>':'')+'</span></div></li>';}).join('')+'</ul>';
}
function negDoc(docs){
  const rows=docs.slice().sort((a,b)=>(a.status==='Encerrado'?1:0)-(b.status==='Encerrado'?1:0)||String(a.vencimento||'9').localeCompare(String(b.vencimento||'9')));
  if(!rows.length)return '<ul class="list"><li><div class="empty"><b>Nenhum contrato ou documento</b>Guarde contratos, alterações do contrato social, procurações, certidões e alvarás, com os arquivos anexados.</div></li></ul>';
  return '<ul class="list">'+rows.map(d=>{const e=empById(d.empresa);const venc=docVencido(d),vind=docVencendo(d);
    return rowBtn('neg-doc',d,'<span style="min-width:0"><span class="tt">'+esc(d.titulo)+(S.negE?'':' · '+esc(e?e.nome:'—'))+'</span><span class="mm"><span class="tag '+(d.status==='Vigente'&&!venc?'ok':'')+'">'+esc(venc?'Vencido':d.status||'Vigente')+'</span><span class="tag">'+esc(d.tipo||'Contrato')+'</span>'+(d.parte?'<span class="tag">'+esc(d.parte)+'</span>':'')+(d.vencimento?'<span class="tag '+(venc?'bad':vind?'warn':'')+'">Vence '+esc(fmtDateFull(d.vencimento))+'</span>':'')+filesHtml(d.anexos)+'</span></span><span class="rr">'+(+d.valor?'<b>'+fmtMoney(d.valor)+'</b>':'')+'</span>',venc?'bad':vind?'warn':d.status==='Encerrado'?'':'ok');}).join('')+'</ul>';
}
async function obrFeita(id){
  const o=recs('neg-obr').find(x=>x.id===id);if(!o||!S.db)return;const t0=todayISO();const now=new Date().toISOString();
  const hist=(Array.isArray(o.historico)?o.historico:[]).concat([{venc:o.proxima||'',feitoEm:t0,valor:+o.valor||0}]).slice(-36);
  const m=OBR_M[o.frequencia||'Mensal'];const patch=m?{proxima:addMonthsISO(o.proxima||t0,m),historico:hist,atualizadoEm:now}:{encerrada:true,historico:hist,atualizadoEm:now};
  try{await S.db.collection('neg-obr').doc(id).update(patch);toast(m?'Feita. Próximo vencimento: '+fmtDateFull(patch.proxima):'Feita. Obrigação encerrada.');}catch(e){toast('Não foi possível registrar agora.');}
}

/* ---------- integração com a capa ---------- */
function phase3Capa(attention,upcoming,t0,horizon){
  const famOk=pid=>{const p=personById(pid);return !p||ownerOk(p.executivo);};
  recs('sau-ev').forEach(e=>{if(!famOk(e.pessoa))return;const p=personById(e.pessoa);const nm=e.titulo+(p?' · '+p.nome.split(' ')[0]:'');
    if(evUpcoming(e)&&e.data<=horizon)upcoming.push({date:e.data,kind:'Saúde',title:nm,meta:[['',e.tipo||'Consulta'],e.hora?['',e.hora]:null,profOf(e)?['',profOf(e)]:null],right:'',go:'sau',sev:'info'});
    if(evPastPending(e))attention.push({sev:'warn',kind:'Saúde',title:nm,meta:[['warn','Confirmar se aconteceu ('+fmtDate(e.data)+')']],right:'',go:'sau',sort:e.data});
    if(retornoDue(e)){if(e.retornoEm<t0)attention.push({sev:'warn',kind:'Saúde',title:nm,meta:[['warn','Agendar retorno (previsto '+fmtDate(e.retornoEm)+')']],right:'',go:'sau',sort:e.retornoEm});
      else if(e.retornoEm<=horizon)upcoming.push({date:e.retornoEm,kind:'Saúde',title:'Agendar retorno · '+nm,meta:[profOf(e)?['',profOf(e)]:null],right:'',go:'sau',sev:'warn'});}});
  recs('sau-med').forEach(m=>{if(!famOk(m.pessoa)||!medActive(m))return;const p=personById(m.pessoa);const nm=m.nome+(p?' · '+p.nome.split(' ')[0]:'');
    if(m.proximaCompra&&m.proximaCompra<=addDays(t0,3))attention.push({sev:m.proximaCompra<t0?'bad':'warn',kind:'Remédio',title:nm,meta:[[m.proximaCompra<t0?'bad':'warn','Repor '+(m.proximaCompra<t0?'desde ':'')+fmtDate(m.proximaCompra)]],right:'',go:'sau',sort:m.proximaCompra});
    else if(m.proximaCompra&&m.proximaCompra<=horizon)upcoming.push({date:m.proximaCompra,kind:'Remédio',title:'Repor '+nm,meta:[],right:'',go:'sau',sev:'info'});
    const recAte=medRecAte(m);if(recAte&&recAte<t0)attention.push({sev:'warn',kind:'Remédio',title:nm,meta:[['warn','Receita venceu '+fmtDate(recAte)]],right:'',go:'sau',sort:recAte});else if(recAte&&recAte<=horizon)upcoming.push({date:recAte,kind:'Remédio',title:'Receita vence · '+nm,meta:[],right:'',go:'sau',sev:'warn'});});
  const empOk=id=>{const e=empById(id);return !e||ownerOk(e.executivo);};
  obrList().forEach(o=>{if(o.encerrada||!o.proxima||!empOk(o.empresa))return;const e=empById(o.empresa);const nm=o.titulo+(e?' · '+e.nome:'');
    if(o.proxima<t0)attention.push({sev:'bad',kind:'Negócios',title:nm,meta:[['bad','Venceu '+fmtDate(o.proxima)],o.categoria?['',o.categoria]:null],right:+o.valor?fmtMoney(o.valor):'',go:'neg',sort:o.proxima});
    else if(o.proxima<=horizon)upcoming.push({date:o.proxima,kind:'Negócios',title:nm,meta:[o.categoria?['',o.categoria]:null],right:+o.valor?fmtMoney(o.valor):'',go:'neg',sev:'warn'});});
  recs('neg-doc').forEach(d=>{if(d.status==='Encerrado'||!d.vencimento||!empOk(d.empresa))return;const e=empById(d.empresa);const nm=d.titulo+(e?' · '+e.nome:'');
    if(d.vencimento<t0)attention.push({sev:'warn',kind:'Contrato',title:nm,meta:[['warn','Vencido desde '+fmtDate(d.vencimento)]],right:'',go:'neg',sort:d.vencimento});
    else if(d.vencimento<=horizon)upcoming.push({date:d.vencimento,kind:'Contrato',title:'Vence · '+nm,meta:[],right:'',go:'neg',sev:'warn'});});
}
function phase3Pulse(){
  const t0=todayISO();const famOk=pid=>{const p=personById(pid);return !p||ownerOk(p.executivo);};
  const ev=recs('sau-ev').filter(e=>famOk(e.pessoa));const meds=recs('sau-med').filter(m=>famOk(m.pessoa));
  const up=ev.filter(e=>evUpcoming(e)&&e.data<=addDays(t0,30)).sort((a,b)=>a.data.localeCompare(b.data));
  const agendar=ev.filter(e=>e.status==='A agendar').length+ev.filter(e=>retornoDue(e)&&e.retornoEm<=addDays(t0,30)).length;
  let h='<button class="card" data-go="sau"><div class="card-h"><span class="chip">'+IC.sau+'</span><h4>Saúde da família</h4></div>'+
    '<div class="kv"><div><span>Próximos 30 dias</span><b>'+up.length+'</b></div><div><span>Para agendar</span><b class="'+(agendar?'warn':'')+'">'+agendar+'</b></div><div><span>Remédios para repor</span><b class="'+(meds.filter(medRepor).length?'warn':'')+'">'+meds.filter(medRepor).length+'</b></div><div><span>Reembolsos em aberto</span><b>'+S.fin['reemb-med'].filter(r=>r.status==='Pendente'||r.status==='Em análise').length+'</b></div></div>'+
    '<div class="foot">'+(up.length?up.slice(0,2).map(e=>{const p=personById(e.pessoa);return '<span class="tag">'+esc(fmtDate(e.data)+' · '+e.titulo+(p?' · '+p.nome.split(' ')[0]:''))+'</span>';}).join(''):'<span>Nenhuma consulta ou exame agendado</span>')+'</div></button>';
  const hSau=h;h='';
  const empOk=id=>{const e=empById(id);return !e||ownerOk(e.executivo);};
  const obr=obrList().filter(o=>empOk(o.empresa));const docs=recs('neg-doc').filter(d=>empOk(d.empresa));
  const dem=negTasks().filter(t=>isOpen(t)&&taskExec(t)).length;const late=obr.filter(obrLate).length;
  const K=k=>[...S.tasks.values()].filter(t=>t.kind===k&&isOpen(t)&&taskExec(t));
  const ass=K('assinatura');
  const fbase=t=>(t.fields||{}).contatoEm||localDayOf(t.createdAt)||t0;
  const fam=K('familia');const famLate=fam.filter(t=>dayBetween(fbase(t),t0)>=3).length;
  const lim=addDays(t0,30);const ce=empresasPessoais().filter(e=>ownerOk(e.executivo)&&e.certVenc&&e.certVenc<=lim);const ceLate=ce.filter(e=>e.certVenc<t0).length;
  h+='<button class="card" data-go="neg"><div class="card-h"><span class="chip">'+IC.neg+'</span><h4>Negócios</h4></div>'+
    '<div class="kv" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><span>Assinaturas pendentes</span><b class="'+(ass.length?'warn':'')+'">'+ass.length+'</b></div><div><span>Famílias aguardando</span><b class="'+(famLate?'neg':fam.length?'warn':'')+'">'+fam.length+'</b></div><div><span>Certificados em 30 dias</span><b class="'+(ceLate?'neg':ce.length?'warn':'')+'">'+ce.length+'</b></div></div></button>';
  return {sau:hSau,neg:h};
}


/* certificados digitais: cadastro (representante e vencimento) editável no card; a demanda nasce 30 dias antes */
document.addEventListener('change',async e=>{
  const el=e.target;if(!el||!el.dataset||(el.dataset.certRep==null&&el.dataset.certDue==null))return;
  const id=el.dataset.certRep||el.dataset.certDue;const emp=empById(id);if(!emp||!S.db)return;
  const isRep=el.dataset.certRep!=null;const v=el.value;
  if(isRep?v===certRepOf(emp):v===(emp.certVenc||''))return;
  if(!isRep&&!v){toast('O vencimento não pode ficar vazio.');renderNeg();return;}
  try{await S.db.collection('cad-empresas').doc(id).update(isRep?{certRep:v}:{certVenc:v});toast('Certificado atualizado');}catch(err){toast('Não foi possível salvar agora.');renderNeg();}
});
const certMade=new Set();
function certAuto(){
  if(!S.db||!S.loaded||!(S.cad.empresas||[]).length)return;
  const lim=addDays(todayISO(),30);const now=new Date().toISOString();
  S.cad.empresas.forEach(e=>{
    if(!e.certVenc||e.certVenc>lim)return;const id='cert-'+e.id+'-'+e.certVenc;
    if(S.tasks.has(id)||certMade.has(id))return;certMade.add(id);
    const num=Math.max(0,...[...S.tasks.values()].map(t=>+t.num||0))+1;const rep=certRepOf(e);const ex=rep==='outro'?(e.executivo||'ambos'):rep;
    S.db.collection('tasks').doc(id).set({num,title:'Renovar certificado digital · '+e.nome,kind:'certificado',status:'nova',sphere:'corporativo',categoryId:'c-'+e.id,executive:ex,priority:null,due:e.certVenc,assignees:[],attachments:[],checklist:[],
      fields:{empresa:e.id,titular:e.nome,representante:rep==='outro'?(e.certRepNome||'Outra pessoa'):rep},notes:'Criada automaticamente: o certificado vence em '+e.certVenc.split('-').reverse().join('/')+'.',
      history:[{at:now,text:'Demanda criada automaticamente · certificado a 30 dias do vencimento'}],statusLog:[{s:'nova',at:now}],createdAt:now,updatedAt:now,delegatedAt:null,completedAt:null,needsExec:false,reportRel:false,sessions:[],timerStart:null,waitingFor:'',waitingSince:null}).catch(()=>{certMade.delete(id);});
  });
}
setInterval(certAuto,5000);

document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-sau-reemb-p]');if(!t)return;S.sauReembP=t.value;renderSau();});
