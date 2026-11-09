"use strict";
/* =================== Viagens =================== */
const VIA_CARTOES=['C6','Itaú The One','Itaú LATAM','Itaú Personnalité','Santander Black','Pix','Outro'];
const VIA_CAT=['Aéreo','Hotel','Aluguel de veículos','Alimentação','Táxi','Rodoviário','Estacionamento','Pedágio','Material de trabalho','Outros'];
const VIA_ST_OPEN=['Planejando','Reservada','Em andamento'];
const VIA_CHECK_INT=['Passaporte válido (6 meses após a volta)','Visto','Seguro viagem','Câmbio e cartão internacional','Chip ou roaming','Check-in dos voos','Hotel confirmado','Transfer do aeroporto','Agenda local enviada ao executivo','Documentos impressos'];
const VIA_CHECK_NAC=['Documento de identidade','Check-in dos voos','Hotel confirmado','Transfer do aeroporto','Agenda local enviada ao executivo'];
Object.assign(REC,{
  'via':{one:'viagem',col:'via-viagens',fem:true,fields:[
    {k:'titulo',l:'Destino ou nome da viagem',req:true,ph:'Ex.: Nova York · Conferência ASU+GSV'},
    {k:'executivo',l:'Executivo',opts:['leticia','fernando','ambos'],lab:v=>EXEC[v]},
    {k:'viajantes',l:'Quem viaja',t:'people'},
    {k:'outros',l:'Outros viajantes',ph:'Ex.: Ana Souza (coordenadora), Pedro Lima',hint:'Funcionários ou convidados que viajam por conta do Fernando ou da Leticia. Separe os nomes por vírgula.'},
    {k:'tipo',l:'Tipo',opts:['Corporativa','Pessoal']},
    {k:'ambito',l:'Âmbito',opts:['Internacional','Nacional']},
    {k:'paisNome',l:'País de destino',ph:'Ex.: Estados Unidos'},
    {k:'requisitos',l:'Requisitos de entrada',long:true,ph:'Passaporte, visto, vacinas, seguro…'},
    {k:'motivo',l:'Motivo',ph:'Ex.: Conferência, reunião de board, férias'},
    {k:'inicio',l:'Ida',t:'date',req:true},
    {k:'fim',l:'Volta',t:'date'},
    {k:'status',l:'Status',opts:['Planejando','Reservada','Em andamento','Concluída','Cancelada']},
    {k:'agencia',l:'Agência ou quem reservou'},
    {k:'cartao',l:'Cartão da viagem',opts:VIA_CARTOES,hint:'Centralizar os gastos num cartão facilita separar o que é reembolsável.'},
    {k:'orcamento',l:'Orçamento',t:'money'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Documentos da viagem',t:'files'}]},
  'via-item':{one:'reserva',col:'via-itens',fem:true,fields:[
    {k:'viagem',l:'Viagem',ref:'viagens',req:true},
    {k:'tipo',l:'Tipo',opts:['Voo','Hotel','Carro','Transfer','Trem ou ônibus','Evento','Seguro','Outro']},
    {k:'descricao',l:'Descrição',req:true,ph:'Ex.: GRU → JFK · LATAM 8180 · assento 3A'},
    {k:'inicio',l:'Data',t:'date',req:true},
    {k:'hora',l:'Horário',t:'time'},
    {k:'fim',l:'Até (hotel, carro)',t:'date'},
    {k:'localizador',l:'Localizador ou reserva'},
    {k:'fornecedor',l:'Companhia, hotel ou locadora'},
    {k:'status',l:'Status',opts:['Cotando','Reservado','Pago','Cancelado']},
    {k:'valor',l:'Valor (R$)',t:'money'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Bilhete, voucher ou confirmação',t:'files'}]},
  'via-gasto':{one:'gasto',col:'via-gastos',fem:false,fields:[
    {k:'viagem',l:'Viagem',ref:'viagens',req:true},
    {k:'data',l:'Data',t:'date',req:true,def:()=>todayISO()},
    {k:'descricao',l:'Descrição',req:true,ph:'Ex.: Jantar com parceiros'},
    {k:'categoria',l:'Categoria',opts:VIA_CAT},
    {k:'moeda',l:'Moeda',opts:['BRL','USD','EUR','GBP']},
    {k:'valorMoeda',l:'Valor na moeda',t:'money',hint:'Preencha quando a moeda não for real.'},
    {k:'valor',l:'Valor em R$',t:'money',req:true},
    {k:'cartao',l:'Cartão',opts:VIA_CARTOES},
    {k:'reembolsavel',l:'Reembolsável',opts:['Sim','Não','Talvez']},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Comprovante',t:'files'}]},
  'via-vis':{one:'visitante',col:'via-visitantes',fem:false,fields:[
    {k:'nome',l:'Visitante',req:true,ph:'Nome ou grupo'},
    {k:'origem',l:'Vem de',ph:'Cidade e país'},
    {k:'paisNome',l:'País',ph:'Ex.: Estados Unidos'},
    {k:'requisitos',l:'Requisitos de entrada',long:true,ph:'Passaporte, visto, vacinas, seguro…'},
    {k:'organizacao',l:'Organização'},
    {k:'anfitriao',l:'Quem recebe',opts:['leticia','fernando','ambos'],lab:v=>EXEC[v]},
    {k:'motivo',l:'Motivo da visita'},
    {k:'chegada',l:'Chegada',t:'date',req:true},
    {k:'partida',l:'Partida',t:'date'},
    {k:'status',l:'Status',opts:['Planejando','Confirmada','Em andamento','Concluída','Cancelada']},
    {k:'hospedagem',l:'Hospedagem'},
    {k:'transfers',l:'Transfers',long:true},
    {k:'agenda',l:'Agenda na Camino',long:true},
    {k:'orcamento',l:'Orçamento',t:'money'},
    {k:'gasto',l:'Gasto realizado',t:'money'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Arquivos',t:'files'}]},
  'via-pais':{one:'requisitos de país',col:'via-paises',fem:false,fields:[
    {k:'nome',l:'País',req:true,ph:'Ex.: Estados Unidos'},
    {k:'passaporte',l:'Para passaporte',opts:['Brasileiro','Português','Italiano','Espanhol','Americano','Outro']},
    {k:'visto',l:'Visto',opts:['Não exige visto','Exige visto','Autorização eletrônica','Visto na chegada']},
    {k:'autorizacao',l:'Visto ou autorização: detalhes',ph:'Ex.: ESTA, pedir com 72 h de antecedência, vale 2 anos'},
    {k:'validadePassaporte',l:'Validade mínima do passaporte',ph:'Ex.: válido durante toda a estada'},
    {k:'vacinas',l:'Vacinas exigidas',ph:'Ex.: febre amarela (Certificado Internacional)'},
    {k:'seguro',l:'Seguro viagem',opts:['Não exigido','Obrigatório','Recomendado']},
    {k:'outros',l:'Outras exigências',long:true,ph:'Ex.: passagem de volta, comprovante de hospedagem, formulário de chegada'},
    {k:'itens',l:'Itens para o checklist',long:true,ph:'Um por linha. Ex.:\nESTA aprovado\nCertificado de febre amarela',hint:'Entram sozinhos no checklist das viagens para este país.'},
    {k:'fonte',l:'Fonte oficial (link)',ph:'https://...'},
    {k:'fonte2',l:'Outra fonte (link)',ph:'https://...'},
    {k:'verificadoEm',l:'Verificado em',t:'date',req:true,def:()=>todayISO()}]},
  'via-cred':{one:'crédito ou estorno de viagem',col:'via-creditos',fem:false,fields:[
    {k:'tipo',l:'Tipo',opts:['Crédito','Estorno']},
    {k:'emissor',l:'Companhia ou hotel',req:true,ph:'Ex.: LATAM, Booking, Marriott'},
    {k:'pessoa',l:'Em nome de',ref:'familia'},
    {k:'valor',l:'Valor',t:'money'},
    {k:'moeda',l:'Moeda',opts:['BRL','USD','EUR','GBP']},
    {k:'validade',l:'Válido até (crédito) ou previsão (estorno)',t:'date'},
    {k:'codigo',l:'Código ou localizador'},
    {k:'origem',l:'De onde veio',ph:'Ex.: voo cancelado para Lisboa em março, estorno de hotel'},
    {k:'situacao',l:'Situação',opts:['Disponível','Usado parcialmente','Usado','Expirado','Em andamento','Recebido'],hint:'Crédito: Disponível, Usado parcialmente, Usado ou Expirado. Estorno: Em andamento ou Recebido.'},
    {k:'obs',l:'Observações',long:true}]},
  'via-pts':{one:'programa de pontos',col:'abas/pontos/linhas',fem:false,fields:[
    {k:'prog',l:'Programa',req:true,ph:'Ex.: Programa de milhas A'},
    {k:'titular',l:'Titular',opts:['Leticia','Fernando']},
    {k:'codigo',l:'Código ou número do programa'},
    {k:'login',l:'Login (e-mail ou app)'},
    {k:'cofre',l:'Onde está a senha',hint:'Não escreva a senha aqui. Diga só onde encontrá-la.'},
    {k:'pts',l:'Pontuação atual',t:'num'},
    {k:'venc',l:'Próximo vencimento',t:'date'},
    {k:'atual',l:'Última atualização',t:'date',hint:'Preenchida sozinha quando você muda a pontuação ou o vencimento.'},
    {k:'parc',l:'Parcerias',ph:'Ex.: Hotéis, cartões'},
    {k:'obs',l:'Observações',long:true}]},
  'via-hotel':{one:'preferência de hotel',col:'via-hoteis',fem:false,fields:[
    {k:'nome',l:'Hotel',req:true,ph:'Ex.: Hotel Fasano'},
    {k:'cidade',l:'Cidade',req:true,ph:'Ex.: Nova York'},
    {k:'paisNome',l:'País',ph:'Ex.: Estados Unidos'},
    {k:'ambito',l:'Nacional ou internacional',opts:['Nacional','Internacional']},
    {k:'hospedes',l:'Quem se hospedou',ph:'Ex.: Leticia e Fernando'},
    {k:'situacao',l:'Situação',opts:['Já se hospedou','Favorito','Quer conhecer','Evitar']},
    {k:'executivo',l:'Executivo',opts:['ambos','leticia','fernando'],lab:v=>EXEC[v]},
    {k:'quarto',l:'Quarto ou categoria preferida',ph:'Ex.: Suíte, andar alto, cama king'},
    {k:'diaria',l:'Diária média (R$)',t:'money'},
    {k:'fidelidade',l:'Programa de fidelidade',ph:'Ex.: Marriott Bonvoy',hint:'Não escreva senhas aqui.'},
    {k:'contato',l:'Contato de reservas',ph:'Telefone, e-mail ou nome do contato'},
    {k:'ultima',l:'Última estadia',t:'date'},
    {k:'link',l:'Site',ph:'https://...'},
    {k:'obs',l:'Observações',long:true,ph:'Pedidos de sempre, travesseiros, transfer, café da manhã'}]}
});
['via','via-item','via-gasto','via-vis','via-cred','via-pais','via-pts','via-hotel'].forEach(k=>{S.rec[k]=S.rec[k]||[];});
Object.assign(S,{viaTab:'ger',viaSel:null,viaExec:'',viaTipo:'',viaPar:'',viaHot:'Nacional',viaCid:''});
try{const u=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(u.viaTab)S.viaTab=u.viaTab;}catch(e){}
const viaById=id=>recs('via').find(v=>v.id===id);
const viaAll=()=>recs('via').slice().sort((a,b)=>String(a.inicio||'9').localeCompare(String(b.inicio||'9')));
function viaExecOk(v){const x=S.viaExec;if(x&&!(v.executivo===x||v.executivo==='ambos'))return false;return ownerOk(v.executivo);}
const viaOpen=v=>VIA_ST_OPEN.includes(v.status||'Planejando');
function viaLabelDates(v){if(!v.inicio)return 'Sem data';const a=fmtDateFull(v.inicio);return v.fim&&v.fim!==v.inicio?a+' a '+fmtDateFull(v.fim):a;}
function viaDias(v){if(!v.inicio)return null;return daysBetween(todayISO()+'T12:00:00',v.inicio+'T12:00:00');}
function viaGastos(id){return recs('via-gasto').filter(g=>g.viagem===id);}
function viaItens(id){return recs('via-item').filter(i=>i.viagem===id);}
const paisById=id=>recs('via-pais').find(x=>x.id===id);
const paisItens=pa=>pa?String(pa.itens||'').split('\n').map(x=>x.trim()).filter(Boolean):[];
const paisStale=pa=>!pa||!pa.verificadoEm||pa.verificadoEm<addDays(todayISO(),-180);
function viaCheck(v){if(Array.isArray(v.checklist))return v.checklist;const base=(v.ambito||'Internacional')==='Nacional'?VIA_CHECK_NAC:VIA_CHECK_INT;return base.concat(paisItens(paisById(v.pais)).filter(t=>!base.includes(t))).map(t=>({t,done:false}));}
const safeUrl=u=>/^https?:\/\/\S+$/i.test(String(u||'').trim())?String(u).trim():'';
function paisPanel(v){
  if(v.paisNome||v.requisitos)return '<div class="panel"><div class="sec-h"><h3>Requisitos de entrada'+(v.paisNome?' · '+esc(v.paisNome):'')+'</h3><span class="act"><button class="btn sm ghost" data-rec="via:'+esc(v.id)+'">Editar</button></span></div>'+(v.requisitos?'<p style="white-space:pre-wrap;margin:0">'+esc(v.requisitos)+'</p>':'<p class="hint">Ainda sem requisitos. Clique em Editar para escrever.</p>')+'</div>';
  const pa=paisById(v.pais);
  if(!v.pais)return (v.ambito||'Internacional')==='Internacional'?'<div class="panel"><h3>Requisitos de entrada</h3><p class="hint">Escreva o país de destino e os requisitos de entrada em "Editar viagem".</p></div>':'';
  if(!pa)return '';
  const stale=paisStale(pa);const ck=viaCheck(v);const falta=paisItens(pa).filter(t=>!ck.some(c=>c.t===t));
  const row=(l,x)=>x?'<div><span>'+esc(l)+'</span><b class="small">'+esc(x)+'</b></div>':'';
  const links=[pa.fonte,pa.fonte2].map(safeUrl).filter(Boolean).map((u,i)=>'<a class="sub-drive" href="'+esc(u)+'" target="_blank" rel="noopener">Fonte oficial'+(i?' 2':'')+'</a>').join(' ');
  return '<div class="panel"><div class="sec-h"><h3>Requisitos de entrada · '+esc(pa.nome)+'</h3><span class="act"><button class="btn sm ghost" data-rec="via-pais:'+esc(pa.id)+'">Editar</button></span></div>'+
    (stale?'<div class="banner" style="margin-bottom:10px">Verificado em '+esc(pa.verificadoEm?fmtDateFull(pa.verificadoEm):'data não informada')+'. As regras podem ter mudado: peça ao Claude para verificar de novo antes da viagem.</div>':'')+
    '<div class="kv">'+row('Para passaporte',pa.passaporte)+row('Visto',pa.visto)+row('Detalhes do visto',pa.autorizacao)+row('Validade do passaporte',pa.validadePassaporte)+row('Vacinas',pa.vacinas)+row('Seguro viagem',pa.seguro)+'</div>'+
    (pa.outros?'<p class="hint" style="margin-top:10px;white-space:pre-wrap">'+esc(pa.outros)+'</p>':'')+
    '<p class="hint" style="margin-top:10px">'+(stale?'':'Verificado em '+esc(fmtDateFull(pa.verificadoEm))+'. ')+'Confirme sempre no consulado antes de emitir as passagens.</p>'+
    '<div class="acts" style="margin-top:8px">'+links+(falta.length?'<button class="btn sm" data-via-pais-ck="'+esc(v.id)+'">Incluir '+falta.length+' '+(falta.length>1?'itens':'item')+' no checklist</button>':'')+'</div></div>';
}
function viajantesNomes(v){return (Array.isArray(v.viajantes)?v.viajantes:[]).map(id=>{const p=personById(id);return p?p.nome.split(' ')[0]:'';}).filter(Boolean).concat(String(v.outros||'').split(',').map(x=>x.trim()).filter(Boolean));}
/* passaportes que vencem antes de 6 meses após a volta */
function viaPassAlerts(v){
  if((v.ambito||'Internacional')!=='Internacional')return [];
  const lim=addMonthsISO(v.fim||v.inicio||todayISO(),6);const out=[];
  (Array.isArray(v.viajantes)?v.viajantes:[]).forEach(pid=>{const p=personById(pid);if(!p)return;
    const docs=recs('fam-doc').filter(d=>d.pessoa===pid&&d.tipo==='Passaporte');
    if(!docs.length)out.push({p,msg:'sem passaporte cadastrado'});
    else{const best=docs.map(d=>d.validade||'').sort().pop();if(best&&best<lim)out.push({p,msg:'passaporte vence em '+fmtDateFull(best)});}});
  return out;
}
const credExecOk=c=>{const p=personById(c.pessoa);return ownerOk(p&&p.executivo||'');};
const ptsExec=r=>{const t=String(r.titular||'').toLowerCase();return t==='fernando'?'fernando':t==='leticia'?'leticia':'';};
const ptsExecOk=r=>ownerOk(ptsExec(r));
const ptsCiente=r=>!!r.venc&&r.cienteVenc===r.venc;
const visExecOk=x=>ownerOk(x.anfitriao||'');
const ptsParcs=r=>String(r.parc||'').split(/\s*[,;\n]\s*|\s+e\s+/i).map(x=>x.trim()).filter(Boolean);
const CRED_FECH=['Usado','Expirado','Recebido'];
const credEst=c=>c.tipo==='Estorno';
const credLate=c=>!credEst(c)&&c.validade&&c.validade<todayISO()&&!CRED_FECH.includes(c.situacao);
const credSoon=c=>!credEst(c)&&c.validade&&c.validade>=todayISO()&&c.validade<=addDays(todayISO(),60)&&!CRED_FECH.includes(c.situacao);

function viaMenu(){
  const t0=todayISO();
  const n1=viaAll().filter(v=>viaExecOk(v)&&(!S.viaTipo||v.tipo===S.viaTipo)&&viaOpen(v)).length;
  const n2=recs('via-cred').filter(c=>credExecOk(c)&&!CRED_FECH.includes(c.situacao)).length;
  const n3=recs('via-vis').filter(x=>visExecOk(x)&&!['Concluída','Cancelada'].includes(x.status)&&(x.partida||x.chegada||'')>=t0).length;
  const nd=[...S.tasks.values()].filter(t=>isOpen(t)&&descendants('k-via').has(t.categoryId)&&taskExec(t)).length;
  const CHK='<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="m8.5 10 1.5 1.5 3-3M9 15.5h6"/></svg>';
  const cnt=n=>n?'<span class="cnt">'+n+'</span>':'';
  const on=k=>(S.viaSel?k==='viagens':S.viaTab===k)?' on':'';
  const TICKET='<svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>';
  const STAR='<svg viewBox="0 0 24 24"><path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/></svg>';
  const BED='<svg viewBox="0 0 24 24"><path d="M4 18V7M4 14h16v4M20 14v-2a3 3 0 0 0-3-3h-6v5"/><circle cx="7.5" cy="11" r="1.5"/></svg>';
  const PERS='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>';
  return '<nav class="neg-menu" aria-label="Viagens"><div class="nm-head"><div class="nm-mark">VI</div><div><b>Viagens</b><small>Deles e de quem visita</small></div></div><div class="nm-list">'+
    '<button class="nm-item nm-g'+on('ger')+'" data-via-tab="ger"><span class="nm-chip">'+CHK+'</span><b class="lbl">Visão geral</b>'+cnt(nd)+'</button>'+
    '<div class="nm-grp"><button class="nm-item nm-g'+on('viagens')+'" data-via-tab="viagens"><span class="nm-chip">'+IC.via+'</span><b class="lbl">Executivos e família</b>'+cnt(n1)+'</button></div>'+
    '<div class="nm-grp"><button class="nm-item nm-g'+on('vis')+'" data-via-tab="vis"><span class="nm-chip">'+PERS+'</span><b class="lbl">Visitantes</b>'+cnt(n3)+'</button></div>'+
    '<div class="nm-grp"><button class="nm-item nm-g'+on('pts')+'" data-via-tab="pts"><span class="nm-chip">'+STAR+'</span><b class="lbl">Programas de pontos</b>'+cnt(recs('via-pts').filter(r=>ptsExecOk(r)&&r.venc&&r.venc<=addDays(t0,30)&&!ptsCiente(r)).length)+'</button></div>'+
    '<div class="nm-grp"><button class="nm-item nm-g'+on('hot')+'" data-via-tab="hot"><span class="nm-chip">'+BED+'</span><b class="lbl">Preferência de hotéis</b></button></div>'+
    '<div class="nm-grp"><button class="nm-item nm-g'+on('cred')+'" data-via-tab="cred"><span class="nm-chip">'+TICKET+'</span><b class="lbl">Créditos e estornos</b>'+cnt(n2)+'</button></div></div></nav>';
}
function renderVia(){
  const el=$('#v-via');
  if(S.viaSel&&viaById(S.viaSel)){el.innerHTML='<div class="wrap"><div class="side-layout">'+viaMenu()+'<div class="side-main">'+viaFicha(viaById(S.viaSel)).replace(/^<div class="wrap">/,'').replace(/<\/div>$/,'')+'</div></div></div>';return;}
  S.viaSel=null;const t0=todayISO();
  const vs=viaAll().filter(v=>viaExecOk(v)&&(!S.viaTipo||v.tipo===S.viaTipo));
  const prox=vs.filter(v=>viaOpen(v)&&v.inicio&&v.inicio>=t0&&v.inicio<=addDays(t0,30)).length;
  const andamento=vs.filter(v=>v.inicio&&v.inicio<=t0&&(v.fim||v.inicio)>=t0&&v.status!=='Cancelada').length;
  const reembPend=recs('via-gasto').filter(g=>{const v=viaById(g.viagem);return v&&vs.includes(v)&&g.reembolsavel==='Sim'&&!g.reembLancado;});
  const creds=recs('via-cred').filter(credExecOk);const vis=recs('via-vis').filter(visExecOk);
  if(!['ger','viagens','vis','cred','pts','hot'].includes(S.viaTab))S.viaTab='ger';
  const HERO={ger:['Viagens','Viagens, visitantes, pontos e créditos, e as demandas de viagem.'],viagens:['Executivos e família','Viagens dos executivos e da família.'],cred:['Créditos e estornos de viagem','Créditos de companhias aéreas e hotéis e estornos a receber, com validade.'],paises:['Requisitos por país','Requisitos de entrada, com fonte e data da verificação.'],pts:['Programas de pontos','Saldos, vencimentos e parcerias. As senhas ficam no gerenciador de senhas; aqui fica só onde encontrá-las.'],hot:['Preferência de hotéis','Hotéis em que já se hospedaram, para consultar quando houver uma nova viagem.'],vis:['Visitantes','Quem vem de fora: hospedagem, transfers, agenda e orçamento. Tudo vai para o reembolso.']}[S.viaTab];
  const ACT={ger:'',viagens:'<button class="btn primary" data-new-rec="via">Nova viagem</button>',cred:'<button class="btn primary" data-new-rec="via-cred">Crédito ou estorno</button>',pts:'<button class="btn primary" data-new-rec="via-pts">Programa</button>',hot:'<button class="btn primary" data-new-rec="via-hotel">Hotel</button>',paises:'',vis:'<button class="btn primary" data-new-rec="via-vis">Visitante</button>'}[S.viaTab];
  const K4='<div class="kpis" style="grid-template-columns:repeat(4,minmax(0,1fr))">';
  let h='<div class="wrap"><div class="side-layout">'+viaMenu()+'<div class="side-main"><div class="plan-hero"><div><h2>'+HERO[0]+'</h2><p>'+HERO[1]+'</p></div><div class="acts">'+ACT+'</div></div>';
  if(S.viaTab==='ger'){
    const lim30=addDays(t0,30);
    const vAb=vis.filter(x=>!['Concluída','Cancelada'].includes(x.status));
    const vProx=vAb.filter(x=>x.chegada&&x.chegada>=t0&&x.chegada<=lim30).length;
    const pp=recs('via-pts').filter(ptsExecOk);
    const pVen=pp.filter(r=>r.venc&&r.venc>=t0&&r.venc<=lim30).length,pVenc=pp.filter(r=>r.venc&&r.venc<t0&&!ptsCiente(r)).length;
    const cOk=creds.filter(c=>!credEst(c)&&!CRED_FECH.includes(c.situacao)),cEs=creds.filter(c=>credEst(c)&&!CRED_FECH.includes(c.situacao));
    h+='<div class="kpis" style="grid-template-columns:repeat(5,minmax(0,1fr))">'+kpi('Viagens em 30 dias',String(prox),prox?'warn':'','executivos e família')+kpi('Visitantes em 30 dias',String(vProx),vProx?'warn':'')+
      kpi('Pontos vencendo',String(pVen+pVenc),pVenc?'neg':pVen?'warn':'',pVenc?pVenc+' já vencido'+(pVenc>1?'s':''):'em 30 dias')+kpi('Créditos disponíveis',String(cOk.length))+kpi('Estornos em andamento',String(cEs.length),cEs.length?'warn':'')+'</div>';
    h+=demBlock('k-via');
  }
  else if(S.viaTab==='hot'){
    const todos=recs('via-hotel').filter(x=>ownerOk(x.executivo));
    if(!['Nacional','Internacional'].includes(S.viaHot))S.viaHot='Nacional';
    const nN=todos.filter(x=>hotAmbito(x)==='Nacional').length,nI=todos.length-nN;
    const daAba=todos.filter(x=>hotAmbito(x)===S.viaHot);
    const cids=[...new Set(daAba.map(x=>String(x.cidade||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
    if(S.viaCid&&!cids.includes(S.viaCid))S.viaCid='';
    h+='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div class="seg tabs" role="tablist"><button role="tab" data-via-hsub="Nacional" class="'+(S.viaHot==='Nacional'?'on':'')+'">Nacionais <span class="num" style="opacity:.6">'+nN+'</span></button><button role="tab" data-via-hsub="Internacional" class="'+(S.viaHot==='Internacional'?'on':'')+'">Internacionais <span class="num" style="opacity:.6">'+nI+'</span></button></div>'+selHtml('via-cid',S.viaCid,[['','Todas as cidades']].concat(cids.map(c=>[c,c])),'Filtrar por cidade')+(S.viaCid?'<button class="btn sm ghost" data-via-cid-clear="1">Limpar filtro</button>':'')+'</div>';
    h+=viaHoteis(S.viaCid?daAba.filter(x=>String(x.cidade||'').trim()===S.viaCid):daAba);
  }
  else if(S.viaTab==='pts'){
    const base=recs('via-pts').filter(ptsExecOk);
    const uni={};base.forEach(r=>ptsParcs(r).forEach(x=>{const k=x.toLowerCase();if(!uni[k])uni[k]=x;}));
    const opts=Object.keys(uni).sort((a,b)=>uni[a].localeCompare(uni[b],'pt')).map(k=>[k,uni[k]]);
    if(S.viaPar&&!uni[S.viaPar])S.viaPar='';
    const rs=S.viaPar?base.filter(r=>ptsParcs(r).some(x=>x.toLowerCase()===S.viaPar)):base;
    const lim=addDays(t0,30);
    h+=K4+kpi('Programas',String(rs.length))+kpi('Com saldo',String(rs.filter(r=>+r.pts>0).length))+kpi('Vencem em 30 dias',String(rs.filter(r=>r.venc&&r.venc>=t0&&r.venc<=lim).length),rs.some(r=>r.venc&&r.venc>=t0&&r.venc<=lim)?'warn':'')+kpi('Vencidos',String(rs.filter(r=>r.venc&&r.venc<t0&&!ptsCiente(r)).length),rs.some(r=>r.venc&&r.venc<t0&&!ptsCiente(r))?'neg':'')+'</div>';
h+=demBlock('c-via-pontos',null,{title:'Demandas de programas de pontos',newLbl:'+ Nova demanda'});
    h+='<div class="filters">'+selHtml('via-par',S.viaPar,[['','Todas as parcerias']].concat(opts),'Filtrar por parceria')+(S.viaPar?'<button class="btn sm ghost" data-via-par-clear="1">Limpar filtro</button>':'')+'</div>';
    h+=viaPontos(rs);
  }else if(S.viaTab==='cred'){
    const money=l=>{const b=l.filter(c=>!c.moeda||c.moeda==='BRL').reduce((a,c)=>a+(+c.valor||0),0);const ext={};l.filter(c=>c.moeda&&c.moeda!=='BRL').forEach(c=>{ext[c.moeda]=(ext[c.moeda]||0)+(+c.valor||0);});return [fmtMoney(b)].concat(Object.entries(ext).map(([m,v])=>m+' '+fmtMoney(v).replace('R$','').trim())).join(' + ');};
    const cr=creds.filter(c=>!credEst(c)&&!CRED_FECH.includes(c.situacao));
    const es=creds.filter(c=>credEst(c)&&!CRED_FECH.includes(c.situacao));
    const prox=cr.filter(c=>c.validade&&c.validade>=t0).sort((a,b)=>a.validade.localeCompare(b.validade))[0];
    const atr=cr.filter(credLate);
    h+=K4+kpi('Créditos disponíveis',String(cr.length),'',cr.length?money(cr):'nenhum')+kpi('Estornos em andamento',String(es.length),es.length?'warn':'',es.length?money(es):'nenhum')+
      kpi('Próximo vencimento',prox?fmtDateFull(prox.validade):'—',prox&&credSoon(prox)?'warn':'',prox?prox.emissor:'sem prazo')+kpi('Vencidos sem uso',String(atr.length),atr.length?'neg':'')+'</div>';
h+=demBlock('c-via-creditos',null,{title:'Demandas de créditos e estornos',newLbl:'+ Nova demanda'});
    h+=viaCreditos(creds);
  }else if(S.viaTab==='vis'){
    const vAb=vis.filter(x=>!['Concluída','Cancelada'].includes(x.status));
    const agora=vAb.filter(x=>x.chegada&&x.chegada<=t0&&(x.partida||x.chegada)>=t0).length;
    const prox30=vAb.filter(x=>x.chegada&&x.chegada>t0&&x.chegada<=addDays(t0,30)).length;
    const pend=vis.filter(x=>!x.reembLancado&&+x.orcamento&&x.status!=='Cancelada');
    h+=K4+kpi('Recebendo agora',String(agora),agora?'warn':'')+kpi('Próximos 30 dias',String(prox30))+kpi('A lançar no reembolso',fmtMoney(pend.reduce((a,x)=>a+(+x.orcamento||0),0)),pend.length?'warn':'',pend.length+' sem lançar')+kpi('Já no reembolso',String(vis.filter(x=>x.reembLancado).length))+'</div>';
h+=demBlock('c-via-visitantes',null,{title:'Demandas de visitantes',newLbl:'+ Nova demanda'});
    h+=viaVisitantes(vis);
  }else{
    h+=K4+kpi('Viajando agora',String(andamento),andamento?'warn':'')+kpi('Próximos 30 dias',String(prox))+kpi('Gastos a reembolsar',fmtMoney(reembPend.reduce((a,g)=>a+(+g.valor||0),0)),reembPend.length?'warn':'',reembPend.length+' sem lançar')+
      kpi('Créditos vencendo',String(creds.filter(c=>credSoon(c)||credLate(c)).length),creds.some(credLate)?'neg':creds.some(credSoon)?'warn':'','em 60 dias')+'</div>';
if(S.viaTab==='viagens')h+=demBlock('c-via-viagens',null,{title:'Demandas de viagens',newLbl:'+ Nova demanda'});
    if(S.viaTab==='viagens'){
      h+='<div class="filters">'+selHtml('via-tipo',S.viaTipo,[['','Corporativas e pessoais'],['Corporativa','Só corporativas'],['Pessoal','Só pessoais']],'Tipo de viagem')+'</div>'+viaLista(vs);}
    else if(S.viaTab==='paises')h+=viaPaises();
  }
  h+='</div></div></div>';el.innerHTML=h;
}
function hotAmbito(x){return x.ambito||((x.paisNome&&!/^brasil$/i.test(String(x.paisNome).trim()))?'Internacional':'Nacional');}
function viaHoteis(hs){
  if(!hs.length)return '<ul class="list"><li><div class="empty"><b>Nenhum hotel cadastrado</b>Registre os hotéis em que já se hospedaram, para consultar quando houver nova viagem.<br><button class="btn sm" data-new-rec="via-hotel" style="margin-top:8px">Cadastrar hotel</button></div></li></ul>';
  const intl=S.viaHot==='Internacional';
  const o=hs.slice().sort((a,b)=>String(a.cidade||'').localeCompare(String(b.cidade||''),'pt')||String(a.nome||'').localeCompare(String(b.nome||''),'pt'));
  return '<div class="tbl-wrap pts-w"><table class="num-t"><thead><tr><th>Hotel</th><th>Cidade</th>'+(intl?'<th>País</th>':'')+'<th>Quem se hospedou</th></tr></thead><tbody>'+
    o.map(x=>{const fav=x.situacao==='Favorito';return '<tr data-rec="via-hotel:'+esc(x.id)+'" tabindex="0"><td><button type="button" data-via-fav="'+esc(x.id)+'" aria-pressed="'+fav+'" aria-label="'+(fav?'Tirar dos favoritos':'Marcar como favorito')+'" title="'+(fav?'Favorito. Clique para desmarcar':'Marcar como favorito')+'" style="background:none;border:0;padding:0 8px 0 0;cursor:pointer;vertical-align:middle;line-height:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="'+(fav?'#DB4479':'none')+'" stroke="'+(fav?'#DB4479':'#7E8C84')+'" stroke-width="2" stroke-linejoin="round"><path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"/></svg></button>'+esc(x.nome||'Sem nome')+(x.situacao==='Evitar'?' <span class="tag bad" style="font-size:9px;padding:1px 6px;margin-left:6px;line-height:1.3">Evitar</span>':'')+(x.obs?'<small class="dim" style="display:block;margin-top:2px">'+esc(x.obs)+'</small>':'')+'</td><td>'+esc(x.cidade||'')+'</td>'+(intl?'<td>'+esc(x.paisNome||'')+'</td>':'')+'<td>'+esc(x.hospedes||'')+'</td></tr>';}).join('')+'</tbody></table></div>';
}
function viaCard(v){
  const t0=todayISO();const d=viaDias(v);const vj=viajantesNomes(v);const its=viaItens(v.id).filter(i=>i.status!=='Cancelado');
  const ck=viaCheck(v);const done=ck.filter(c=>c.done).length;const pass=viaPassAlerts(v);
  const now=v.inicio&&v.inicio<=t0&&(v.fim||v.inicio)>=t0&&v.status!=='Cancelada';
  const when=now?'Em viagem':d==null?'Sem data':d>0?'Em '+d+' dia'+(d>1?'s':''):d===0?'Hoje':'';
  return '<div role="button" tabindex="0" class="card" data-via-sel="'+esc(v.id)+'"><div class="card-h"><span class="chip">'+IC.via+'</span><div style="flex:1;min-width:0"><h4>'+esc(v.titulo)+'</h4><small class="sub">'+esc(viaLabelDates(v)+(v.executivo?' · '+EXEC[v.executivo]:''))+'</small></div>'+(when?'<span class="tag '+(now?'warn':d!=null&&d<=7?'info':'')+'">'+esc(when)+'</span>':'')+'</div>'+
    '<div class="kv"><div><span>Reservas</span><b>'+its.length+'</b></div><div><span>Checklist</span><b class="'+(viaOpen(v)&&done<ck.length?'warn':'')+'">'+done+' de '+ck.length+'</b></div></div>'+
    '<div class="foot"><span class="tag">'+esc(v.status||'Planejando')+'</span><span class="tag '+(v.tipo==='Pessoal'?'pess':'corp')+'">'+esc(v.tipo||'Corporativa')+'</span>'+(vj.length?'<span class="tag">'+esc(vj.join(', '))+'</span>':'')+(pass.length&&viaOpen(v)?'<span class="tag bad">Passaporte</span>':'')+subDrive(v,'via')+'</div></div>';
}
function viaLista(vs){
  const t0=todayISO();
  const atuais=vs.filter(v=>v.status!=='Cancelada'&&(viaOpen(v)||(v.fim||v.inicio||'')>=t0));
  const passadas=vs.filter(v=>!atuais.includes(v)).sort((a,b)=>String(b.inicio).localeCompare(String(a.inicio)));
  const dem=[...S.tasks.values()].filter(t=>isOpen(t)&&descendants('k-via').has(t.categoryId)&&taskExec(t));
  let h='';
  h+='<div><div class="sec-h"><h3>Próximas e em andamento</h3><span class="cnt">'+atuais.length+'</span></div>'+(atuais.length?'<div class="pulse">'+atuais.map(viaCard).join('')+'</div>':'<ul class="list"><li><div class="empty"><b>Nenhuma viagem à frente</b>Cadastre a viagem com datas e quem viaja. Depois acrescente voos, hotel e o resto do itinerário.</div></li></ul>')+'</div>';
  if(passadas.length)h+='<div><div class="sec-h"><h3>Concluídas e canceladas</h3><span class="cnt">'+passadas.length+'</span></div><div class="pulse">'+passadas.map(viaCard).join('')+'</div></div>';
  return h;
}
function viaFicha(v){
  const t0=todayISO();const its=viaItens(v.id).slice().sort((a,b)=>(String(a.inicio)+(a.hora||'')).localeCompare(String(b.inicio)+(b.hora||'')));
  const gs=viaGastos(v.id).slice().sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  const ck=viaCheck(v);const pass=viaPassAlerts(v);const d=viaDias(v);
  const totRes=its.filter(i=>i.status!=='Cancelado').reduce((a,i)=>a+(+i.valor||0),0);const totG=gs.reduce((a,g)=>a+(+g.valor||0),0);
  const aReemb=gs.filter(g=>g.reembolsavel==='Sim'&&!g.reembLancado);
  let h='<div class="wrap"><div class="back-row"><button class="back-home" data-via-sel="">‹ Voltar para as viagens</button></div>';
  h+='<div class="plan-hero"><div><h2>'+esc(v.titulo)+'</h2><p>'+esc([viaLabelDates(v),v.executivo?EXEC[v.executivo]:'',v.tipo,(v.paisNome||(v.pais?refName('paises',v.pais):v.ambito)),v.motivo].filter(Boolean).join(' · '))+(viajantesNomes(v).length?' · Viajam: '+esc(viajantesNomes(v).join(', ')):'')+'</p></div>'+
    '<div class="acts">'+subDrive(v,'via')+'<button class="btn" data-rec="via:'+esc(v.id)+'">Editar viagem</button><button class="btn" data-new-rec="via-gasto" data-pre-viagem="'+esc(v.id)+'">Lançar gasto</button><button class="btn primary" data-new-rec="via-item" data-pre-viagem="'+esc(v.id)+'">Nova reserva</button></div></div>';
  if(pass.length&&viaOpen(v))h+='<div class="banner">'+pass.map(x=>esc(x.p.nome.split(' ')[0]+': '+x.msg)).join(' · ')+'. Para viagens internacionais, o passaporte deve valer pelo menos 6 meses após a volta.</div>';
  h+='<div class="kpis">'+kpi('Status',esc(v.status||'Planejando'))+kpi(d!=null&&d>0?'Faltam':'Ida',d!=null&&d>0?d+' dia'+(d>1?'s':''):esc(v.inicio?fmtDateFull(v.inicio):'—'))+kpi('Reservas',fmtMoney(totRes),'',its.length+' itens')+kpi('Gastos',fmtMoney(totG),'',v.orcamento?'orçamento '+fmtMoney(v.orcamento):'')+kpi('A reembolsar',fmtMoney(aReemb.reduce((a,g)=>a+(+g.valor||0),0)),aReemb.length?'warn':'',aReemb.length?aReemb.length+' sem lançar':'')+'</div>';
  h+='<div class="grid2"><div style="display:flex;flex-direction:column;gap:22px">';
  h+='<div><div class="sec-h"><h3>Itinerário</h3><span class="cnt">'+its.length+'</span></div>'+(its.length?'<ul class="list">'+its.map(i=>{const soon=i.tipo==='Voo'&&i.status!=='Cancelado'&&i.inicio&&i.inicio>=t0&&i.inicio<=addDays(t0,2);
    return rowBtn('via-item',i,'<span style="min-width:0"><span class="tt">'+esc(i.tipo+' · '+i.descricao)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(i.inicio)+(i.hora?' · '+i.hora:'')+(i.fim&&i.fim!==i.inicio?' a '+fmtDateFull(i.fim):''))+'</span>'+(i.localizador?'<span class="tag info">'+esc(i.localizador)+'</span>':'')+(i.fornecedor?'<span class="tag">'+esc(i.fornecedor)+'</span>':'')+'<span class="tag '+(i.status==='Cancelado'?'':i.status==='Cotando'?'warn':'ok')+'">'+esc(i.status||'Cotando')+'</span>'+(soon?'<span class="tag warn">Fazer check-in</span>':'')+filesHtml(i.anexos)+'</span></span><span class="rr">'+(+i.valor?'<b>'+fmtMoney(i.valor)+'</b>':'')+'</span>',i.status==='Cancelado'?'':soon?'warn':i.status==='Cotando'?'warn':'info');}).join('')+'</ul>':'<ul class="list"><li><div class="empty">Acrescente voos, hotel, carro, transfers e eventos da viagem.</div></li></ul>')+'</div>';
  h+='<div><div class="sec-h"><h3>Gastos</h3><span class="cnt">'+gs.length+'</span>'+(aReemb.length?'<span class="act"><button class="btn sm" data-via-reemb-all="'+esc(v.id)+'">Lançar '+aReemb.length+' no reembolso</button></span>':'')+'</div>'+(gs.length?'<ul class="list">'+gs.map(g=>'<li><div class="item '+(g.reembolsavel==='Sim'&&!g.reembLancado?'warn':g.reembLancado?'ok':'')+'"><span class="sev"></span><button class="item-main" data-rec="via-gasto:'+esc(g.id)+'"><span class="tt">'+esc(g.descricao)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(g.data))+'</span><span class="tag">'+esc(g.categoria||'Outros')+'</span>'+(g.moeda&&g.moeda!=='BRL'&&+g.valorMoeda?'<span class="tag">'+esc(g.moeda+' '+fmtMoney(g.valorMoeda).replace('R$','').trim())+'</span>':'')+(g.cartao?'<span class="tag">'+esc(g.cartao)+'</span>':'')+(g.reembLancado?'<span class="tag ok">No reembolso</span>':g.reembolsavel==='Sim'?'<span class="tag warn">Reembolsável</span>':g.reembolsavel==='Talvez'?'<span class="tag">Talvez reembolso</span>':'')+filesHtml(g.anexos)+'</span></button><span class="rr"><b>'+fmtMoney(g.valor)+'</b>'+(g.reembolsavel==='Sim'&&!g.reembLancado?'<button class="btn sm" data-via-reemb="'+esc(g.id)+'">Lançar no reembolso</button>':'')+'</span></div></li>').join('')+'</ul>':'<ul class="list"><li><div class="empty">Lance os gastos da viagem. Os reembolsáveis vão para o Reembolso corporativo do Financeiro com um clique.</div></li></ul>')+'</div>';
  h+='</div><div style="display:flex;flex-direction:column;gap:22px">';
  h+=paisPanel(v);
  h+='<div class="panel"><div class="sec-h"><h3>Checklist</h3><span class="cnt">'+ck.filter(c=>c.done).length+' de '+ck.length+'</span></div><ul class="checklist">'+ck.map((c,i)=>'<li><label><input type="checkbox" data-via-ck="'+esc(v.id)+':'+i+'"'+(c.done?' checked':'')+'><span>'+esc(c.t)+'</span></label><button class="x" data-via-ckdel="'+esc(v.id)+':'+i+'" aria-label="Remover '+esc(c.t)+'">×</button></li>').join('')+'</ul>'+
    '<div class="ck-add"><input id="via-ck-new" class="sel" placeholder="Novo item" autocomplete="off" aria-label="Novo item do checklist"><button class="btn sm" data-via-ckadd="'+esc(v.id)+'">Adicionar</button></div></div>';
  h+='<div class="panel"><h3>Detalhes</h3><div class="kv">'+[['Agência',v.agencia],['Cartão',v.cartao],['Orçamento',+v.orcamento?fmtMoney(v.orcamento):''],['Motivo',v.motivo]].filter(x=>x[1]).map(([l,x])=>'<div><span>'+esc(l)+'</span><b class="small">'+esc(x)+'</b></div>').join('')+'</div>'+(v.obs?'<p class="hint" style="margin-top:10px;white-space:pre-wrap">'+esc(v.obs)+'</p>':'')+(filesHtml(v.anexos)?'<p style="margin-top:8px">'+filesHtml(v.anexos)+'</p>':'')+'</div>';
  h+='</div></div></div>';return h;
}
function viaPontos(rs){
  if(!rs.length)return '<ul class="list"><li><div class="empty"><b>Nenhum programa cadastrado</b>Cadastre os programas de pontos e milhas com saldo, vencimento e parcerias, ou limpe o filtro de parceria.</div></li></ul>';
  const t0=todayISO(),lim=addDays(t0,30);const nf=n=>Number(n).toLocaleString('pt-BR');
  const o=rs.slice().sort((a,b)=>String(a.prog||'').localeCompare(String(b.prog||''),'pt'));
  return '<div class="tbl-wrap pts-w"><table class="num-t"><thead><tr><th>Programa</th><th>Titular</th><th>Login</th><th class="r">Pontuação</th><th>Vencimento</th><th>Atualizado</th><th>Parcerias</th><th></th></tr></thead><tbody>'+
    o.map(r=>'<tr data-rec="via-pts:'+esc(r.id)+'" tabindex="0"><td><span style="display:block">'+esc(r.prog||'Sem nome')+'</span>'+(r.codigo?'<small class="dim">'+esc(r.codigo)+'</small>':'')+'</td><td>'+esc(r.titular||'')+'</td><td>'+esc(r.login||'')+'</td><td class="r">'+(+r.pts?nf(r.pts):'')+'</td><td>'+(r.venc?'<span class="tag '+(ptsCiente(r)?'':r.venc<t0?'bad':r.venc<=lim?'warn':'')+'">'+esc(fmtDateFull(r.venc))+'</span>'+(ptsCiente(r)?' <small class="dim">vencido, ciente</small>':''):'')+'</td><td class="dim">'+(r.atual?'<span class="tag '+(r.atual<t0.slice(0,7)+'-01'?'warn':'')+'">'+esc(fmtDateFull(r.atual))+'</span>':'<span class="tag warn">Sem data</span>')+'</td><td>'+esc(r.parc||'')+'</td><td class="r">'+((r.venc&&r.venc<t0&&!ptsCiente(r))?'<button class="btn sm" data-via-pts-ciente="'+esc(r.id)+'" data-venc="'+esc(r.venc)+'" title="Marca que você viu que venceu e está ciente">Ciente</button> ':'')+(r.atual===t0?'':'<button class="btn sm" data-via-pts-ok="'+esc(r.id)+'" title="Marca como conferido hoje, sem mudar a pontuação">Conferido</button>')+'</td></tr>').join('')+'</tbody></table></div>';
}
function viaVisitantes(vis){
  const t0=todayISO();const rows=vis.slice().sort((a,b)=>String(a.chegada||'9').localeCompare(String(b.chegada||'9')));
  const prox=rows.filter(x=>!['Concluída','Cancelada'].includes(x.status)&&(x.partida||x.chegada||'')>=t0);const outras=rows.filter(x=>!prox.includes(x)).reverse();
  if(!rows.length)return '<ul class="list"><li><div class="empty"><b>Nenhum visitante cadastrado</b>Registre visitantes de outros estados e de fora do país: hospedagem, transfers, agenda na Camino e orçamento.</div></li></ul>';
  const line=x=>{const sev=x.chegada&&x.chegada<=addDays(t0,7)&&x.chegada>=t0?'warn':'info';const val=+x.orcamento||0;return '<li><div class="item '+(x.reembLancado?'ok':sev)+'"><span class="sev"></span><button class="item-main" data-rec="via-vis:'+esc(x.id)+'">'+'<span style="min-width:0"><span class="tt">'+esc(x.nome)+(x.organizacao?' · '+esc(x.organizacao):'')+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(x.chegada)+(x.partida?' a '+fmtDateFull(x.partida):''))+'</span>'+(x.origem?'<span class="tag">'+esc(x.origem)+'</span>':'')+(x.paisNome?'<span class="tag">'+esc(x.paisNome)+'</span>':'')+(x.anfitriao?'<span class="tag">'+esc(EXEC[x.anfitriao])+'</span>':'')+'<span class="tag '+(x.status==='Confirmada'?'ok':x.status==='Planejando'?'warn':'')+'">'+esc(x.status||'Planejando')+'</span>'+(x.hospedagem?'<span class="tag">'+esc(x.hospedagem)+'</span>':'')+(x.reembLancado?'<span class="tag ok">No reembolso</span>':'')+filesHtml(x.anexos)+'</span></span></button><span class="rr">'+(val?'<b>'+fmtMoney(val)+'</b><small>orçamento</small>':'')+(val&&!x.reembLancado?'<button class="btn sm" data-via-reemb-vis="'+esc(x.id)+'">Lançar no reembolso</button>':'')+'</span></div></li>';};
  return '<div><div class="sec-h"><h3>Próximas visitas</h3><span class="cnt">'+prox.length+'</span></div>'+(prox.length?'<ul class="list">'+prox.map(line).join('')+'</ul>':'<ul class="list"><li><div class="empty">Nenhuma visita à frente.</div></li></ul>')+'</div>'+(outras.length?'<div><div class="sec-h"><h3>Histórico</h3><span class="cnt">'+outras.length+'</span></div><ul class="list">'+outras.map(line).join('')+'</ul></div>':'');
}
function viaPaises(){
  const rows=recs('via-pais').slice().sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'pt'));
  let h='<div class="toolbar"><span class="hint">Requisitos de entrada por país, com fonte e data da verificação. Para pesquisar um país novo ou atualizar um antigo, peça ao Claude na conversa.</span><span class="grow"></span><button class="btn sm primary" data-new-rec="via-pais">Adicionar país</button></div>';
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhum país cadastrado</b>Peça ao Claude: "pesquisa os requisitos de entrada dos Estados Unidos para passaporte brasileiro".</div></li></ul>';
  return h+'<ul class="list">'+rows.map(pa=>{const st=paisStale(pa);const n=recs('via').filter(v=>v.pais===pa.id&&viaOpen(v)).length;
    return rowBtn('via-pais',pa,'<span style="min-width:0"><span class="tt">'+esc(pa.nome)+'</span><span class="mm"><span class="tag">Passaporte '+esc((pa.passaporte||'Brasileiro').toLowerCase())+'</span><span class="tag '+(pa.visto==='Não exige visto'?'ok':'warn')+'">'+esc(pa.visto||'—')+'</span>'+(pa.vacinas?'<span class="tag">Vacinas</span>':'')+(pa.seguro==='Obrigatório'?'<span class="tag warn">Seguro obrigatório</span>':'')+'<span class="tag '+(st?'bad':'')+'">'+(st?'Verificar de novo':'Verificado em '+esc(fmtDateFull(pa.verificadoEm)))+'</span>'+(n?'<span class="tag info">'+n+' viage'+(n>1?'ns':'m')+'</span>':'')+'</span></span><span class="rr"></span>',st?'warn':'ok');}).join('')+'</ul>';
}
function viaCreditos(creds){
  if(!creds.length)return '<ul class="list"><li><div class="empty"><b>Nenhum crédito ou estorno</b>Cadastre créditos de companhias aéreas e hotéis com a validade, para usar antes de vencer, e estornos a receber, para acompanhar até o dinheiro chegar.</div></li></ul>';
  const rows=creds.slice().sort((a,b)=>(CRED_FECH.includes(a.situacao)?1:0)-(CRED_FECH.includes(b.situacao)?1:0)||String(a.validade||'9').localeCompare(String(b.validade||'9')));
  return '<ul class="list">'+rows.map(c=>{const late=credLate(c),soon=credSoon(c);const p=personById(c.pessoa);
    return rowBtn('via-cred',c,'<span style="min-width:0"><span class="tt">'+esc(c.emissor)+(p?' · '+esc(p.nome.split(' ')[0]):'')+'</span><span class="mm">'+(c.validade?'<span class="tag '+(late?'bad':soon?'warn':'')+'">'+(credEst(c)?'Previsto para ':late?'Venceu em ':'Válido até ')+esc(fmtDateFull(c.validade))+'</span>':'')+'<span class="tag '+(credEst(c)?'info':'')+'">'+(credEst(c)?'Estorno':'Crédito')+'</span><span class="tag">'+esc(c.situacao||'Disponível')+'</span>'+(c.codigo?'<span class="tag info">'+esc(c.codigo)+'</span>':'')+(c.origem?'<span class="tag">'+esc(c.origem)+'</span>':'')+'</span></span><span class="rr">'+(+c.valor?'<b>'+esc((c.moeda&&c.moeda!=='BRL'?c.moeda+' ':'')+fmtMoney(c.valor).replace(c.moeda&&c.moeda!=='BRL'?'R$':'#','').trim())+'</b>':'')+'</span>',late?'bad':soon?'warn':CRED_FECH.includes(c.situacao)?'':'ok');}).join('')+'</ul>';
}
/* ações */
async function viaCkSave(v,list){try{await S.db.collection('via-viagens').doc(v.id).update({checklist:list,atualizadoEm:new Date().toISOString()});}catch(e){toast('Não foi possível salvar o checklist agora.');}}
const VIA_REEMB_CAT={'Aéreo':'Aéreo','Hotel':'Hotel','Aluguel de veículos':'Aluguel de veículos','Alimentação':'Alimentação','Táxi':'Táxi','Rodoviário':'Rodoviário','Estacionamento':'Estacionamento','Pedágio':'Pedágio','Material de trabalho':'Material de trabalho'};
async function viaLancarReemb(ids){
  if(!S.db)return;let n=0;
  for(const id of ids){const g=recs('via-gasto').find(x=>x.id===id);if(!g||g.reembLancado)continue;const v=viaById(g.viagem)||{};
    const pessoa=v.executivo==='leticia'?'Leticia':v.executivo==='fernando'?'Fernando':'';
    const row={pessoa,ref:(v.titulo||'Viagem')+(g.data?' · '+fmtYm(g.data.slice(0,7)):''),cat:VIA_REEMB_CAT[g.categoria]||'',descr:g.descricao,data:g.data||'',moeda:g.moeda||'BRL',vme:g.moeda&&g.moeda!=='BRL'?(+g.valorMoeda||null):null,brl:+g.valor||0,formapg:VIA_CARTOES.slice(0,5).includes(g.cartao)?g.cartao:'',status:'A solicitar',coment:'Lançado pelo Painel (Viagens)',criado:Date.now()};
    try{const ref=S.db.collection('abas/reemb-corp/linhas').doc();await ref.set(row);await S.db.collection('via-gastos').doc(id).update({reembLancado:true,reembId:ref.id,atualizadoEm:new Date().toISOString()});n++;}
    catch(e){toast('Não foi possível lançar agora. Tente de novo em instantes.');return;}}
  if(n){const v0=viaById((recs('via-gasto').find(x=>x.id===ids[0])||{}).viagem)||{};toast(n+(n>1?' gastos lançados':' gasto lançado')+' no Reembolso corporativo como "A solicitar"'+(v0.executivo==='ambos'?'. Escolha a pessoa lá.':''));}
}
async function viaLancarReembVis(id){
  if(!S.db)return;const x=recs('via-vis').find(r=>r.id===id);if(!x||x.reembLancado||!+x.orcamento)return;
  const pessoa=x.anfitriao==='leticia'?'Leticia':x.anfitriao==='fernando'?'Fernando':'';
  const row={pessoa,ref:'Visitante · '+x.nome+(x.chegada?' · '+fmtYm(x.chegada.slice(0,7)):''),cat:'',descr:'Visitante: '+x.nome+(x.organizacao?' ('+x.organizacao+')':''),data:x.chegada||'',moeda:'BRL',vme:null,brl:+x.orcamento||0,formapg:'',status:'A solicitar',coment:'Lançado pelo Painel (Visitantes)',criado:Date.now()};
  try{const ref=S.db.collection('abas/reemb-corp/linhas').doc();await ref.set(row);await S.db.collection('via-visitantes').doc(id).update({reembLancado:true,reembId:ref.id,atualizadoEm:new Date().toISOString()});toast('Lançado no Reembolso corporativo como "A solicitar"'+(pessoa?'':'. Escolha a pessoa lá.'));}
  catch(e){toast('Não foi possível lançar agora. Tente de novo em instantes.');}
}
/* capa */
function viaCapa(attention,upcoming,t0,horizon){
  recs('via').forEach(v=>{if(!ownerOk(v.executivo)||v.status==='Cancelada'||!v.inicio)return;
    if(viaOpen(v)&&v.inicio>=t0&&v.inicio<=horizon)upcoming.push({date:v.inicio,kind:'Viagem',title:v.titulo,meta:[['',viaLabelDates(v)],v.executivo?['',EXEC[v.executivo]]:null],right:'',go:'via',sev:'info'});
    if(viaOpen(v)&&v.inicio>=t0&&v.inicio<=addDays(t0,30)){const pa=viaPassAlerts(v);if(pa.length)attention.push({sev:'bad',kind:'Viagem',title:v.titulo,meta:[['bad',pa.map(x=>x.p.nome.split(' ')[0]+': '+x.msg).join(' · ')]],right:'',go:'via',sort:v.inicio});
      if(v.pais&&paisStale(paisById(v.pais)))attention.push({sev:'warn',kind:'Viagem',title:v.titulo,meta:[['warn','Requisitos de entrada de '+refName('paises',v.pais)+' precisam ser verificados de novo']],right:'',go:'via',sort:v.inicio});
      const ck=viaCheck(v);const pend=ck.filter(c=>!c.done).length;if(pend&&v.inicio<=addDays(t0,7))attention.push({sev:'warn',kind:'Viagem',title:v.titulo,meta:[['warn',pend+' itens do checklist pendentes'],['','Ida '+fmtDate(v.inicio)]],right:'',go:'via',sort:v.inicio});}});
  recs('via-item').forEach(i=>{const v=viaById(i.viagem);if(!v||!ownerOk(v.executivo)||i.status==='Cancelado'||i.tipo!=='Voo'||!i.inicio)return;
    if(i.inicio>=t0&&i.inicio<=addDays(t0,2))attention.push({sev:'warn',kind:'Viagem',title:'Check-in · '+i.descricao,meta:[['warn',fmtDate(i.inicio)+(i.hora?' às '+i.hora:'')],['',v.titulo]],right:i.localizador||'',go:'via',sort:i.inicio});});
  recs('via-vis').forEach(x=>{if(!x.chegada||['Cancelada','Concluída'].includes(x.status))return;if(x.anfitriao&&!ownerOk(x.anfitriao))return;
    if(x.chegada>=t0&&x.chegada<=horizon)upcoming.push({date:x.chegada,kind:'Visitante',title:x.nome+(x.organizacao?' · '+x.organizacao:''),meta:[x.origem?['',x.origem]:null,x.status?['',x.status]:null],right:'',go:'via',sev:'info'});});
  {const m0=t0.slice(0,7)+'-01';const old=recs('via-pts').filter(r=>ptsExecOk(r)&&(!r.atual||r.atual<m0));
    if(old.length)attention.push({sev:'warn',kind:'Pontos',title:'Atualizar os programas de pontos',meta:[['warn',old.length+(old.length>1?' programas sem atualização':' programa sem atualização')+' em '+MES_N[+t0.slice(5,7)-1]]],right:'',go:'via',sort:m0});}
  recs('via-pts').forEach(r=>{if(!r.venc||!(+r.pts>0)||ptsCiente(r))return;const ow=r.titular&&r.titular.toLowerCase()==='fernando'?'fernando':r.titular&&r.titular.toLowerCase()==='leticia'?'leticia':'';if(ow&&!ownerOk(ow))return;
    if(r.venc<t0||r.venc<=addDays(t0,30))attention.push({sev:r.venc<t0?'bad':'warn',kind:'Pontos',title:r.prog+' · pontos',meta:[[r.venc<t0?'bad':'warn',(r.venc<t0?'Venceu em ':'Vence ')+fmtDateFull(r.venc)]],right:'',go:'via',sort:r.venc});});
  recs('via-cred').forEach(c=>{if(CRED_FECH.includes(c.situacao)||!c.validade||credEst(c)||!credExecOk(c))return;
    if(c.validade>=t0&&c.validade<=addDays(t0,30))attention.push({sev:'warn',kind:'Crédito',title:c.emissor+' · crédito de viagem',meta:[['warn','Vence '+fmtDateFull(c.validade)]],right:+c.valor?fmtMoney(c.valor):'',go:'via',sort:c.validade});});
}
function viaPulse(){
  const t0=todayISO();const lim=addDays(t0,30);const vs=recs('via').filter(v=>ownerOk(v.executivo)&&v.status!=='Cancelada');
  const now=vs.filter(v=>v.inicio&&v.inicio<=t0&&(v.fim||v.inicio)>=t0);
  const v30=vs.filter(v=>viaOpen(v)&&v.inicio&&v.inicio>=t0&&v.inicio<=lim);
  const prox=vs.filter(v=>viaOpen(v)&&v.inicio&&v.inicio>t0).sort((a,b)=>a.inicio.localeCompare(b.inicio));
  const vis=recs('via-vis').filter(visExecOk).filter(x=>!['Concluída','Cancelada'].includes(x.status)&&x.chegada&&x.chegada>=t0&&x.chegada<=lim).length;
  const pp=recs('via-pts').filter(ptsExecOk);const pVen=pp.filter(r=>r.venc&&r.venc>=t0&&r.venc<=lim).length,pLate=pp.filter(r=>r.venc&&r.venc<t0&&!ptsCiente(r)).length;
  const cr=recs('via-cred').filter(credExecOk);const cSoon=cr.filter(c=>credSoon(c)&&c.validade<=lim).length,cLate=cr.filter(credLate).length;
  const venc=pVen+pLate+cSoon+cLate,vencLate=pLate+cLate;
  const reemb=recs('via-gasto').filter(g=>{const v=viaById(g.viagem);return g.reembolsavel==='Sim'&&!g.reembLancado&&(!v||ownerOk(v.executivo));}).length;
  return '<button class="card" data-go="via"><div class="card-h"><span class="chip">'+IC.via+'</span><h4>Viagens</h4></div>'+
    '<div class="kv"><div><span>Viagens em 30 dias</span><b class="'+(now.length?'warn':'')+'">'+(v30.length+now.filter(v=>!v30.includes(v)).length)+'</b>'+(now.length?'<small>'+now.length+' em andamento</small>':'')+'</div><div><span>Visitantes em 30 dias</span><b>'+vis+'</b></div>'+
    '<div><span>Pontos e créditos vencendo</span><b class="'+(vencLate?'neg':venc?'warn':'')+'">'+venc+'</b></div><div><span>Reembolsos a lançar</span><b class="'+(reemb?'warn':'')+'">'+reemb+'</b></div></div>'+
    '<div class="foot">'+(prox.length?prox.slice(0,2).map(v=>'<span class="tag">'+esc(fmtDate(v.inicio)+' · '+v.titulo)+'</span>').join(''):'<span>Nenhuma viagem marcada</span>')+'</div></button>';
}

/* ---------- módulos embutidos ---------- */
/* os módulos rodam num iframe: o que eles gravam é recriado no contexto da página principal antes de ir para o banco,
   porque objetos criados dentro do iframe podem ser recusados pela gravação */
const SHIM='<script>(function(){var P=null;try{P=window.parent;}catch(e){}'+
 'function cl(a){try{var t=Object.prototype.toString.call(a);if(Array.isArray(a)||t==="[object Object]")return P.JSON.parse(JSON.stringify(a));}catch(e){}return a;}'+
 'function wr(o){if(!o||typeof o!=="object"||typeof o.then==="function")return o;var cache={};return new Proxy({},{get:function(_,k){if(k==="then")return undefined;var v;try{v=o[k];}catch(e){return undefined;}if(typeof v!=="function")return v;if(!cache[k])cache[k]=function(){var a=[];for(var i=0;i<arguments.length;i++)a.push(cl(arguments[i]));return wr(P.Reflect.apply(v,o,a));};return cache[k];},has:function(_,k){return k in o;}});}'+
 'window.claude={use:function(n){try{var c=P&&P.claude;if(c&&typeof c.use==="function")return Promise.resolve(c.use(n)).then(function(ns){if(n==="db"&&ns){try{return wr(ns);}catch(e){return ns;}}return ns;});}catch(e){}return Promise.resolve(null);}};'+
 'function th(){try{var t=P.document.documentElement.getAttribute("data-theme");if(t)document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme");}catch(e){}}'+
 'th();try{new P.MutationObserver(th).observe(P.document.documentElement,{attributes:true,attributeFilter:["data-theme"]});}catch(e){}'+
 /* links externos dos módulos abrem pela página principal (dentro da moldura o Google recusa a conexão) */
 'document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented)return;var u=a.href||"";if(!/^https?:/i.test(u)||a.hasAttribute("download"))return;e.preventDefault();try{var x=P.document.createElement("a");x.href=u;x.target="_blank";x.rel="noopener";x.style.display="none";P.document.body.appendChild(x);x.click();x.remove();}catch(err){try{window.open(u,"_blank","noopener");}catch(e2){}}},true);'+
 '})();<\/script>';
const frames={};
async function showModule(id){
  const host=$('#v-mod');const n=NAV.find(x=>x.id===id);
  Object.entries(frames).forEach(([k,f])=>{f.hidden=k!==id;});
  if(frames[id])return;
  const f=document.createElement('iframe');f.title=n.l;frames[id]=f;host.appendChild(f);
  try{
    const r=await fetch(n.mod);if(!r.ok)throw new Error(r.status);
    let html=await r.text();
    html=/<head[^>]*>/i.test(html)?html.replace(/<head[^>]*>/i,m=>m+SHIM):SHIM+html;
    f.addEventListener('load',()=>{try{f.contentWindow.__setExec&&f.contentWindow.__setExec(S.exec||'')}catch(e){}});
    f.srcdoc=html;
  }catch(e){
    f.remove();delete frames[id];
    const m=document.createElement('div');m.className='frame-msg';m.dataset.err=id;m.textContent='Não foi possível abrir o módulo '+n.l+'. Recarregue a página para tentar de novo.';host.appendChild(m);
  }
}

/* ---------- navegação ---------- */
function renderNav(){
  $('#nav').innerHTML=NAV.map(n=>n.sep?'<span class="sep" aria-hidden="true"></span>':'<button data-nav="'+n.id+'" class="'+(S.view===n.id?'on':'')+'">'+esc(n.l)+(n.area?'<span class="soon">F'+AREAS[n.id].fase+'</span>':'')+'</button>').join('');
}
const DRIVE_ROOT='1Vne9tQl8NuetZV7oOHWPQf1YlGx5pEzd';
const DRIVE={age:'1Smgv4DVfD5ggO-oIHX9s3kcRk6sbQJgB',rel:'1YAlbc9fqx4SNpLhqXnBZ10hC6yYf5Qzr',sec:'1AzM9aLVRzTDj3F9VV9c0U8T4r1q-LdXa',fin:'1sVaoiivC9pbwpv1iUewIvTrRna1z38sS',dp:'1oHOA37caEBT_v9KqqIJ8PN5-zw30wtp0',fac:'1HqO514gfBTu23CChYJIm0HSGERrX32-0',sau:'15NWF6phkmEFlkXlopSGjtsOCaHTf1FmY',fam:'1AuOTadw6IAC1X2yObC6xVHuzxRfpNY2r',neg:'1lNtr4p9_5HHZQ4Ntv_EULcL4nkOYD7ze',brd:'1GVfA72arBTG9FlYXMov5iEIcns5m3g0i',via:'1mc3jMdVeO9xFA7X7vVlpYtTrZgVL6bpX',cad:'1j3QyS7T5KxOUQ9ZjgDG-0H1IPR0Xv9ll'};
function driveTarget(){
  const v=S.view;let rec=null,key=v;
  if(v==='dp'&&S.dpPerson)rec=personById(S.dpPerson);
  else if(v==='fac'&&S.facF&&S.facF.ativo)rec=ativoById(S.facF.ativo);
  else if(v==='sau'&&S.sauP)rec=personById(S.sauP);
  else if(v==='fam'&&S.famP)rec=personById(S.famP);
  else if(v==='neg'&&S.negE)rec=empById(S.negE);
  else if(v==='brd'&&S.brdB)rec=boardById(S.brdB);
  else if(v==='via'&&S.viaSel)rec=viaById(S.viaSel);
  const fid=rec&&rec.drive&&rec.drive[key];
  if(fid)return{id:fid,label:'Pasta no Drive',title:'Abrir a pasta de '+(rec.nome||rec.titulo)+' no Google Drive'};
  const nn=NAV.find(x=>x.id===v);
  return{id:DRIVE[v]||DRIVE_ROOT,label:DRIVE[v]?'Pasta '+nn.l+' no Drive':'Pasta do Painel no Drive',title:DRIVE[v]?'Abrir a pasta '+nn.l+' no Google Drive':'Abrir a pasta Central Executiva no Google Drive'};
}
function subDrive(rec,key,label){const id=rec&&rec.drive&&rec.drive[key];if(!id)return '';return '<a class="sub-drive" href="https://drive.google.com/drive/folders/'+esc(id)+'" target="_blank" rel="noopener" title="Abrir a pasta de '+esc(rec.nome||rec.titulo||'')+' no Google Drive"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>'+esc(label||'Pasta no Drive')+'</a>';}
function updateDriveLink(){const a=$('#driveLink');if(!a)return;const t=driveTarget();a.href='https://drive.google.com/drive/folders/'+t.id;a.title=t.title;a.setAttribute('aria-label',t.title);}
/* sempre abrir o módulo pela visão inicial */
const MOD_ROOT={age:'p-age',dp:'p-dp',fac:'p-fac',sau:'p-sau',neg:'p-neg',brd:'p-brd',fam:'p-fam',via:'k-via'};
function resetModule(id){
  const r=MOD_ROOT[id];if(r){delete S.demSub[r];delete S.demAll[r];delete S.demMode[r];Object.keys(S.demMonth).forEach(k=>{if(k.indexOf(r+'|')===0)delete S.demMonth[k];});}
  if(id==='dp')Object.assign(S,{dpTab:'ind',dpPerson:null,dpMonth:ymOf(todayISO()),dpWeek:weekStart(todayISO()),dpOcTipo:'',dpF:{vinculo:'',funcao:'',local:'',exec:'',ativos:'sim',q:''}});
  else if(id==='fac')Object.assign(S,{facTab:'geral',facF:{ativo:'',exec:'',tipo:'',status:'abertos',forn:'',tipoAtivo:'',q:''}});
  else if(id==='sau')Object.assign(S,{sauTab:'agenda',sauP:'',sauTipo:''});
  else if(id==='neg')Object.assign(S,{negTab:'obr',negE:''});
  else if(id==='brd')Object.assign(S,{brdTab:'boards',brdB:'',brdExec:''});
  else if(id==='fam')Object.assign(S,{famTab:'geral',famP:'',famPet:''});
  else if(id==='via')Object.assign(S,{viaTab:'ger',viaSel:null,viaExec:'',viaTipo:'',viaPar:''});
  else if(id==='age')Object.assign(S,{ageTab:'geral',ageMes:'',ageEvAll:false});
  else if(id==='cad')S.cadTab='pessoas';
}
function homeFrame(id){const f=frames[id];if(!f)return;try{const w=f.contentWindow;if(w&&typeof w.__home==='function')w.__home();}catch(e){}}
function scrollHome(id){const v=document.getElementById('v-'+id)||document.getElementById('v-mod');if(!v)return;const z=()=>{v.scrollTop=0;v.querySelectorAll('*').forEach(x=>{if(x.scrollTop)x.scrollTop=0;});};z();requestAnimationFrame(z);}
function go(id){
  if(!NAV.some(n=>n.id===id))id='capa';
  S.view=id;saveUi();renderNav();
  const n=NAV.find(x=>x.id===id);
  $('#v-capa').hidden=id!=='capa';$('#v-cad').hidden=id!=='cad';$('#v-dp').hidden=id!=='dp';$('#v-fac').hidden=id!=='fac';$('#v-sau').hidden=id!=='sau';$('#v-neg').hidden=id!=='neg';$('#v-age').hidden=id!=='age';$('#v-brd').hidden=id!=='brd';$('#v-via').hidden=id!=='via';$('#v-fam').hidden=id!=='fam';$('#v-rel').hidden=id!=='rel';$('#v-area').hidden=!n.area;$('#v-mod').hidden=!n.mod;
  if(n.mod){document.querySelectorAll('#v-mod .frame-msg').forEach(m=>m.hidden=m.dataset.err!==id);showModule(id);}
  renderCurrent();
  const b=document.querySelector('#nav button.on');if(b&&b.scrollIntoView)b.scrollIntoView({block:'nearest',inline:'nearest'});
}
function renderGexec(){const el=$('#gexec');if(!el)return;el.innerHTML=[['','Todos'],['fernando','Fernando'],['leticia','Leticia']].map(([k,l])=>'<button data-exec="'+k+'" class="'+((S.exec||'')===k?'on':'')+'" aria-pressed="'+((S.exec||'')===k)+'">'+l+'</button>').join('');el.classList.toggle('active',!!S.exec);}
function syncExecFrames(){Object.values(frames).forEach(f=>{try{const w=f.contentWindow;if(w&&w.__setExec)w.__setExec(S.exec||'');}catch(e){}});}
function renderCurrent(){renderGexec();syncExecFrames();
  const ae=document.activeElement;const keep=ae&&ae.id&&!ae.closest('#drawer')&&ae.closest('#views')?{id:ae.id,s:ae.selectionStart,e:ae.selectionEnd}:null;
  if(S.view==='capa')renderCapa();
  else if(S.view==='cad')renderCad();
  else if(S.view==='dp')renderDP();
  else if(S.view==='fac')renderFac();
  else if(S.view==='sau')renderSau();
  else if(S.view==='neg')renderNeg();
  else if(S.view==='age')renderAge();
  else if(S.view==='brd')renderBrd();
  else if(S.view==='via')renderVia();
  else if(S.view==='fam')renderFam();
  else if(S.view==='rel')renderRel();
  else if(AREAS[S.view]&&NAV.find(n=>n.id===S.view).area)renderArea(S.view);
  updateDriveLink();
  if(keep){const el=document.getElementById(keep.id);if(el&&el!==document.activeElement){el.focus();try{if(keep.s!=null)el.setSelectionRange(keep.s,keep.e);}catch(e){}}}
}

/* ---------- busca ---------- */
let hits=[],hi=0;
function search(q){
  q=q.trim().toLowerCase();const out=[];if(!q)return out;
  const m=s=>String(s||'').toLowerCase().includes(q);
  S.tasks.forEach(t=>{if(m(t.title)||m(t.notes))out.push({k:'Demanda',t:(t.num?'#'+t.num+' ':'')+(t.title||''),go:'sec'});});
  S.fin.cronograma.forEach(r=>{if(m(r.despesa)||m(r.obs))out.push({k:'Pagamento',t:r.despesa,go:'fin'});});
  S.fin.solicitacoes.forEach(r=>{if(m(r.descr)||m(r.solic))out.push({k:'Solicitação',t:r.descr||r.solic,go:'fin'});});
  recs('fac-ch').forEach(r=>{if(m(r.titulo)||m(r.descricao))out.push({k:'Chamado',t:r.titulo,rec:'fac-ch:'+r.id});});
  recs('fac-rec').forEach(r=>{if(m(r.titulo)||m(r.obs))out.push({k:'Vencimento',t:r.titulo,rec:'fac-rec:'+r.id});});
  recs('sau-ev').forEach(r=>{if(m(r.titulo)||m(profOf(r))||m(r.obs))out.push({k:'Saúde',t:r.titulo+' · '+refName('familia',r.pessoa),rec:'sau-ev:'+r.id});});
  recs('sau-med').forEach(r=>{if(m(r.nome)||m(r.obs))out.push({k:'Remédio',t:r.nome+' · '+refName('familia',r.pessoa),rec:'sau-med:'+r.id});});
  obrList().forEach(r=>{if(m(r.titulo)||m(r.obs))out.push({k:'Obrigação',t:r.titulo,rec:'neg-obr:'+r.id});});
  recs('fam-doc').forEach(r=>{if(m(r.tipo)||m(r.titulo)||m(r.guardado))out.push({k:'Documento',t:(r.tipo||'')+' · '+refName('familia',r.pessoa),rec:'fam-doc:'+r.id});});
  recs('fam-ev').forEach(r=>{if(m(r.titulo)||m(r.local))out.push({k:'Evento',t:r.titulo,rec:'fam-ev:'+r.id});});
  recs('via').forEach(r=>{if(m(r.titulo)||m(r.motivo)||m(r.obs)||m(r.outros))out.push({k:'Viagem',t:r.titulo,via:r.id});});
  recs('via-item').forEach(r=>{if(m(r.descricao)||m(r.localizador)||m(r.fornecedor))out.push({k:'Reserva',t:r.descricao,rec:'via-item:'+r.id});});
  recs('via-pts').forEach(r=>{if(m(r.prog)||m(r.codigo))out.push({k:'Pontos',t:r.prog,rec:'via-pts:'+r.id});});
  recs('via-vis').forEach(r=>{if(m(r.nome)||m(r.organizacao))out.push({k:'Visitante',t:r.nome,rec:'via-vis:'+r.id});});
  recs('via-pais').forEach(r=>{if(m(r.nome))out.push({k:'País',t:r.nome,rec:'via-pais:'+r.id});});
  recs('via-cred').forEach(r=>{if(m(r.emissor)||m(r.codigo))out.push({k:'Crédito',t:r.emissor,rec:'via-cred:'+r.id});});
  recs('brd').forEach(r=>{if(m(r.nome)||m(r.comites)||m(r.obs))out.push({k:'Conselho/Programa',t:r.nome,rec:'brd:'+r.id});});
  recs('brd-reun').forEach(r=>{if(m(r.titulo)||m(r.pauta)||m(r.ata))out.push({k:'Reunião',t:(r.titulo||'Reunião')+' · '+refName('boards',r.board),rec:'brd-reun:'+r.id});});
  recs('neg-doc').forEach(r=>{if(m(r.titulo)||m(r.parte)||m(r.obs))out.push({k:'Contrato',t:r.titulo,rec:'neg-doc:'+r.id});});
  Object.keys(CAD).forEach(c=>S.cad[c].forEach(r=>{if(Object.values(r).some(v=>typeof v==='string'&&m(v))){const dp=c==='pessoas'&&(r.grupo==='Funcionário(a)'||r.grupo==='Prestador(a)');out.push({k:dp?'Equipe':CAD[c].one.replace(/^./,x=>x.toUpperCase()),t:r.nome,edit:dp?null:c+':'+r.id,person:dp?r.id:null});}}));
  return out.slice(0,20);
}
function renderResults(){
  const box=$('#results');const q=$('#q').value;
  if(!q.trim()){box.hidden=true;return;}
  hits=search(q);hi=Math.min(hi,Math.max(0,hits.length-1));
  box.innerHTML=hits.length?hits.map((x,i)=>'<button data-hit="'+i+'" class="'+(i===hi?'hi':'')+'"><span class="k">'+esc(x.k)+'</span><span class="t">'+esc(x.t)+'</span></button>').join(''):'<div class="none">Nada encontrado para “'+esc(q)+'”.</div>';
  box.hidden=false;
}
function openHit(i){const x=hits[i];if(!x)return;$('#q').value='';$('#results').hidden=true;if(x.via){S.viaSel=x.via;go('via');}else if(x.person){S.dpPerson=x.person;go('dp');}else if(x.rec){const[t,id]=x.rec.split(':');go(t.split('-')[0]);openRec(t,id);}else if(x.edit){openCad(...x.edit.split(':'));}else go(x.go);}

/* ---------- gaveta: nova demanda ---------- */
let dr=null;
function closeDrawer(){dr=null;$('#drawer').innerHTML='';}
function drawerShell(title,body,foot,ro){
  $('#drawer').innerHTML='<div class="scrim" data-close></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="dr-head"><h3>'+esc(title)+'</h3><button class="icon-btn" data-close aria-label="Fechar">'+IC.x+'</button></div><div class="dr-body">'+body+'</div><div class="dr-foot">'+foot+'</div></aside>';
  if(ro){applyRO($('#drawer .drawer'),{close:'.dr-foot [data-close]',keep:'a'});return;}
  const f=$('#drawer input,#drawer select');if(f)f.focus();
}
function roLock(dw,on,keep){dw.querySelectorAll('.dr-body input,.dr-body select,.dr-body textarea,.dr-body button').forEach(e=>{if(keep&&e.matches(keep))return;if(on){if(!e.disabled){e.disabled=true;e.dataset.roLocked='1';}}else if(e.dataset.roLocked){e.disabled=false;delete e.dataset.roLocked;}});}
function applyRO(dw,o){o=o||{};if(!dw)return;dw.classList.add('ro');
  const cl=dw.querySelector(o.close||'.dr-foot [data-close]');if(cl){cl.classList.add('ro-keep');cl.dataset.roLabel=cl.textContent;cl.textContent='Fechar';}
  const head=dw.querySelector('.dr-head');const x=head&&head.querySelector('.icon-btn');
  const eb=document.createElement('button');eb.type='button';eb.className='btn sm edit-btn';eb.textContent='✎ Editar';eb.setAttribute('aria-label','Editar');
  if(head){if(x)head.insertBefore(eb,x);else head.appendChild(eb);}
  roLock(dw,true,o.keep);
  eb.addEventListener('click',ev=>{ev.stopPropagation();dw.classList.remove('ro');roLock(dw,false,o.keep);eb.remove();if(cl){cl.textContent=cl.dataset.roLabel||'Cancelar';cl.classList.remove('ro-keep');}if(o.onEdit)o.onEdit();const f=dw.querySelector('.fields input,.fields select,.fields textarea,.dr-body input,.dr-body textarea');if(f&&f.focus)f.focus();});}

function catOptions(sphere,sel){
  const roots=S.cats.filter(c=>!c.parentId&&(!sphere||c.sphere===sphere)).sort((a,b)=>((a.sphere==='corporativo')-(b.sphere==='corporativo'))||(a.order??0)-(b.order??0));
  const out=sel?[]:['<option value="" disabled selected>Escolha a categoria…</option>'];
  const walk=(c,depth)=>{out.push('<option value="'+esc(c.id)+'"'+(c.id===sel?' selected':'')+'>'+'— '.repeat(depth)+esc(c.name)+'</option>');S.cats.filter(x=>x.parentId===c.id).sort((a,b)=>(a.order??0)-(b.order??0)).forEach(x=>walk(x,depth+1));};
  roots.forEach(c=>walk(c,0));return out.join('');
}
function rootOf(id){const p=catPath(id);return p[0]?p[0].id:null;}
const catSort=(a,b)=>(a.order??0)-(b.order??0);
function rootOptions(sel){return (sel?'':'<option value="" disabled selected>Escolha a categoria…</option>')+S.cats.filter(c=>!c.parentId).sort(catSort).map(c=>'<option value="'+esc(c.id)+'"'+(c.id===sel?' selected':'')+'>'+esc(c.name)+'</option>').join('');}
function subOptions(root,sel){if(!root||!catById(root))return '<option value="" disabled selected>Escolha a categoria primeiro</option>';
  const out=['<option value="" disabled'+(sel?'':' selected')+'>Escolha a subcategoria…</option>'];
  const walk=(pid,d)=>S.cats.filter(x=>x.parentId===pid).sort(catSort).forEach(c=>{out.push('<option value="'+esc(c.id)+'"'+(c.id===sel?' selected':'')+'>'+'\u2003'.repeat(d)+esc(c.name)+'</option>');walk(c.id,d+1);});
  walk(root,0);out.push('<option value="__new">+ Nova subcategoria…</option>');return out.join('');}
function subFields(sub){const f={};const path=catPath(sub);
  for(let i=path.length-1;i>=0;i--){const id=path[i].id;if(id.indexOf('c-')===0&&typeof empById==='function'&&empById(id.slice(2))){f.empresa=id.slice(2);break;}}
  const tipoRev={'c-fam-compras':'Compras','c-fam-docs':'Documentos','c-fam-escola':'Escola e atividades','c-fam-eventos':'Eventos','c-fam-pets':'Pets','c-fam-outros':'Outros'};
  path.forEach(c=>{if(tipoRev[c.id])f.tipo=tipoRev[c.id];});return f;}
async function createSub(){
  const inp=$('#nt-newsub-in');const name=(inp&&inp.value||'').trim();const root=$('#nt-cat').value;
  if(!root||!catById(root)){toast('Escolha a categoria primeiro.');return;}if(!name){toast('Escreva o nome da subcategoria.');inp.focus();return;}
  let n=S.cats.find(c=>c.parentId===root&&c.name.trim().toLowerCase()===name.toLowerCase());
  if(!n){n={id:'c-u'+Date.now().toString(36)+Math.random().toString(36).slice(2,4),name,order:S.cats.filter(c=>c.parentId===root).length,parentId:root,sphere:catById(root).sphere||'pessoal'};
    S.cats=S.cats.concat([n]);try{await S.db.doc('meta/categories').set({nodes:S.cats});toast('Subcategoria “'+name+'” criada');}catch(e){toast('Não foi possível criar agora. Tente de novo.');S.cats=S.cats.filter(c=>c!==n);return;}}
  $('#nt-sub').innerHTML=subOptions(root,n.id);$('#nt-newsub').hidden=true;inp.value='';}
const KIND_LBL={email:'Follow-up de e-mail',impressao:'Impressão',assinatura:'Solicitação de assinatura',certificado:'Certificado digital',familia:'Atendimento a família'};
function kindNewFields(){
  const emps=[['todas','Todas as empresas']].concat(empresasPessoais().map(e=>[e.id,(e.pai&&empById(e.pai)?'    ':'')+e.nome]));
  const all='email impressao assinatura certificado';
  const L=(k,id,txt,ctl)=>'<label class="nt-k" data-k="'+k+'" for="'+id+'" hidden>'+esc(txt)+'</label>'+ctl;
  const I=(k,nk,txt,o)=>{o=o||{};const id='nt-k-'+nk;return L(k,id,txt,'<input class="nt-k" hidden data-k="'+k+'" data-nk="'+nk+'" id="'+id+'" type="'+(o.type||'text')+'"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+' autocomplete="off">');};
  const Sl=(k,nk,txt,opts)=>{const id='nt-k-'+nk;return L(k,id,txt,'<select class="nt-k" hidden data-k="'+k+'" data-nk="'+nk+'" id="'+id+'"><option value="">—</option>'+opts.map(o=>Array.isArray(o)?'<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>':'<option>'+esc(o)+'</option>').join('')+'</select>');};
  const EX=[['leticia','Leticia Lyle'],['fernando','Fernando Shayer']];
  return Sl(all,'empresa','Empresa',emps)+
    I('email','de','De quem')+I('email','link','Link do e-mail',{ph:'Cole o link da conversa'})+
    I('impressao','qtd','Quantidade',{type:'number'})+I('impressao','solic','Solicitante')+
    Sl('assinatura','modo','Tipo de assinatura',['Digital','Física'])+Sl('assinatura','quem','Em nome de',EX.concat([['ambos','Fernando Shayer e Leticia Lyle']]))+
    I('assinatura','pedidoPor','Quem pediu',{ph:'Qualquer pessoa: o executivo, um parceiro, uma família…'})+Sl('assinatura','pedidoVia','Pedido feito por',['WhatsApp','E-mail','Presencial','Telefone','Outro'])+
    I('assinatura','pedidoLink','Prova do pedido',{ph:'Link ou nome do print'})+
    I('familia','familia','Família ou aluno')+Sl('familia','canal','Canal',['ClassApp','WhatsApp','Telefone','E-mail','Lanttern','Presencial'])+Sl('familia','recebeu','Contato com',EX)+Sl('familia','pedeAg','Pediu agendamento?',[['sim','Sim'],['nao','Não']])+I('familia','dataAg','Data da reunião',{type:'date'})+I('familia','horaAg','Horário da reunião',{type:'time'})+
    I('certificado','titular','Titular')+Sl('certificado','representante','Representante legal',EX)+Sl('certificado','tipoCert','Tipo de certificado',['e-CNPJ A1','e-CNPJ A3','e-CPF A1','e-CPF A3','Outro']);
}
function openNewTask(preCat,o){o=o||{};
  if(!S.db){toast('Os dados não estão disponíveis nesta visualização.');return;}
  const pc=preCat?catById(preCat):null;const root=pc?rootOf(pc.id):null;
  let sub=pc&&pc.id!==root?pc.id:null;if(!sub&&root==='p-neg'&&S.negE&&catById('c-'+S.negE))sub='c-'+S.negE;
  dr={type:'task',status:ST[o.status]?o.status:'nova'};
  const lock=!!root;const ppl=S.people||[];
  const showFam=(root==='p-fam')||S.view==='fam',showBrd=(root==='p-brd')||S.view==='brd',showAge=(root==='p-age')||S.view==='age';
  const preBoard=S.brdB||(sub&&sub.indexOf('c-')===0&&boardById(sub.slice(2))?sub.slice(2):'');
  drawerShell('Nova demanda',
    '<textarea class="dr-title" id="nt-title" rows="1" maxlength="300" placeholder="O que precisa ser feito" aria-label="Título"></textarea>'+
    '<div class="fields">'+
    '<label for="nt-status">Status</label><select id="nt-status">'+Object.entries(ST).map(([k,v])=>'<option value="'+k+'"'+(dr.status===k?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select>'+
    '<label for="nt-kind" id="nt-kind-l">Tipo</label><select id="nt-kind"><option value="">Demanda comum</option>'+Object.keys(KIND_LBL).filter(k=>k!=='certificado').map(k=>'<option value="'+k+'">'+esc(KIND_LBL[k])+'</option>').join('')+'</select>'+
    '<label for="nt-cat">Categoria</label><select id="nt-cat"'+(lock?' disabled':'')+'>'+rootOptions(root)+'</select>'+
    '<label for="nt-sub">Subcategoria</label><select id="nt-sub">'+subOptions(root,sub)+'</select>'+
    '<div class="full" id="nt-newsub" hidden><div style="display:flex;gap:8px"><input id="nt-newsub-in" placeholder="Nome da nova subcategoria" autocomplete="off" style="flex:1"><button class="btn primary" type="button" id="nt-newsub-ok">Criar</button></div></div>'+
    (ppl.length?'<span class="lbl-like" id="lbl-nresp">Responsáveis</span><div class="people-pick" id="nt-resp" role="group" aria-labelledby="lbl-nresp">'+ppl.map(p=>'<button type="button" data-nt-resp="'+esc(p.id)+'" aria-pressed="false">'+esc(p.name)+'</button>').join('')+'</div>':'')+
    '<label for="nt-exec">Executivo</label><select id="nt-exec"><option value="">Sem executivo</option>'+Object.entries(EXEC).map(([k,v])=>'<option value="'+k+'"'+(S.exec===k?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select>'+
    '<label for="nt-pri">Prioridade</label><select id="nt-pri"><option value="">Sem prioridade</option><option value="critica">Crítica</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select>'+
    '<label for="nt-due">Prazo</label><input id="nt-due" type="date">'+
    '<label for="nt-wait">Aguardando</label><input id="nt-wait" placeholder="Pessoa, resposta ou condição" autocomplete="off">'+
    (showFam?'<label for="nt-pessoa">Pessoa</label><select id="nt-pessoa"><option value="">—</option>'+familia().map(p=>'<option value="'+esc(p.id)+'"'+(S.famP===p.id?' selected':'')+'>'+esc(p.nome)+'</option>').join('')+'</select>':'')+
    (showBrd?'<label for="nt-board">Conselho/programa</label><select id="nt-board"><option value="">—</option>'+boardsAll().filter(b=>b.situacao!=='Encerrado').map(b=>'<option value="'+esc(b.id)+'"'+(preBoard===b.id?' selected':'')+'>'+esc(b.nome)+'</option>').join('')+'</select>':'')+
    (showAge?'<label for="nt-canal">Canal do pedido</label><select id="nt-canal"><option value="">—</option>'+AGE_CANAIS.map(x=>'<option>'+x+'</option>').join('')+'</select><label for="nt-tema">Tema</label><input id="nt-tema" autocomplete="off"><label for="nt-part">Participantes</label><input id="nt-part" autocomplete="off" placeholder="Ex.: Leticia, Maria Olívia e a família">':'')+
    kindNewFields()+
    (S.dfields||[]).map(fd=>'<label for="nt-df-'+esc(fd.id)+'">'+esc(fd.name)+'</label><input id="nt-df-'+esc(fd.id)+'" data-nt-df="'+esc(fd.id)+'" type="'+(fd.type==='number'?'number':fd.type==='date'?'date':'text')+'">').join('')+
    '<label for="nt-notes" class="full">Observações</label><textarea id="nt-notes" class="full" placeholder="Contexto, contatos, números de pedido…"></textarea>'+
    '<div class="full rep-flags"><span class="rf-h">No report do executivo</span><label class="rf"><input type="checkbox" id="nt-rel"><span><b>Relevante para o executivo</b></span></label><label class="rf"><input type="checkbox" id="nt-needs"><span><b>Precisa do executivo</b></span></label></div>'+
    '</div>'+
    '<div class="hint">Entrada em '+new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'. Depois de registrada, a demanda abre na Operação com checklist, anexos e histórico.</div>',
    '<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn primary" id="nt-save">Registrar demanda</button>');
  if(o.kind&&$('#nt-kind')){$('#nt-kind').value=o.kind;$('#nt-kind').dispatchEvent(new Event('change',{bubbles:true}));const es=$('#nt-k-empresa');if(es&&S.negE&&[...es.options].some(x=>x.value===S.negE))es.value=S.negE;}
  ntKindVis();
  const ta=$('#nt-title');if(ta){const fit=()=>{ta.style.height='auto';ta.style.height=Math.max(30,ta.scrollHeight)+'px';};ta.addEventListener('input',fit);fit();ta.focus();}
}
/* Board e subcategoria andam juntos: escolher um preenche o outro */
document.addEventListener('change',e=>{
  const t=e.target;if(!t||!t.id)return;
  if(t.id==='nt-board'){const sub=$('#nt-sub');if(t.value&&sub&&catById('c-'+t.value)){if(!sub.querySelector('option[value="c-'+t.value+'"]'))sub.innerHTML=subOptions($('#nt-cat').value,'c-'+t.value);sub.value='c-'+t.value;}
    else if(!t.value&&sub&&/^c-brd-/.test(sub.value)&&boardById(sub.value.slice(2)))sub.value='';}
  else if(t.id==='nt-sub'){const bd=$('#nt-board');if(bd&&t.value&&t.value.indexOf('c-')===0&&boardById(t.value.slice(2)))bd.value=t.value.slice(2);}
});
document.addEventListener('click',e=>{const rb=e.target.closest&&e.target.closest('[data-nt-resp]');if(rb){rb.classList.toggle('on');rb.setAttribute('aria-pressed',rb.classList.contains('on'));}});
async function saveNewTask(){
  const title=$('#nt-title').value.trim();if(!title){toast('Escreva o que precisa ser feito.');$('#nt-title').focus();return;}
  const now=new Date().toISOString();const root=$('#nt-cat').value||null;if(!root||!catById(root)){toast('Escolha a categoria da demanda.');$('#nt-cat').focus();return;}
  let cat=$('#nt-sub').value||null;
  const bsel=$('#nt-board')&&$('#nt-board').value;
  if((!cat||cat==='__new'||cat===root)&&bsel&&catById('c-'+bsel))cat='c-'+bsel;
  if(!cat||cat==='__new'||!catById(cat)||rootOf(cat)!==root||cat===root){toast('Escolha a subcategoria da demanda.');$('#nt-sub').focus();return;}
  const boardFromCat=(!bsel&&cat.indexOf('c-')===0&&boardById(cat.slice(2)))?cat.slice(2):'';
  const sf=subFields(cat);const sph=catById(cat).sphere||'pessoal';
  let num=0;S.tasks.forEach(t=>{if((t.num||0)>num)num=t.num;});num++;
  const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const hist=[{at:now,text:'Demanda registrada pelo Painel'}];
  let exec=$('#nt-exec').value||null;if(!exec&&(bsel||boardFromCat)){const b=boardById(bsel||boardFromCat);if(b)exec=b.executivo||null;}
  if(!exec&&$('#nt-pessoa')&&$('#nt-pessoa').value){const pp=personById($('#nt-pessoa').value);if(pp)exec=pp.executivo||null;}
  const st0=($('#nt-status')&&$('#nt-status').value)||(dr&&dr.status)||'nova';
  const asg=[...document.querySelectorAll('#nt-resp [data-nt-resp].on')].map(b=>b.dataset.ntResp);
  const dfx={};document.querySelectorAll('[data-nt-df]').forEach(i=>{if(i.value)dfx[i.dataset.ntDf]=i.value;});
  const t={id,num,title,status:st0,sphere:sph,categoryId:cat,executive:exec,priority:$('#nt-pri').value||null,due:$('#nt-due').value||null,
    assignees:asg,delegatedAt:asg.length?now:null,attachments:[],checklist:[],fields:Object.assign({},sf,dfx,$('#nt-canal')?{canal:$('#nt-canal').value||'',tema:$('#nt-tema').value.trim(),participantes:$('#nt-part').value.trim()}:{},(bsel||boardFromCat)?{board:bsel||boardFromCat}:{},($('#nt-pessoa')&&$('#nt-pessoa').value)?{pessoa:$('#nt-pessoa').value}:{}),notes:$('#nt-notes').value.trim(),reportRel:!!($('#nt-rel')&&$('#nt-rel').checked),needsExec:!!($('#nt-needs')&&$('#nt-needs').checked),sessions:[],timerStart:null,waitingFor:($('#nt-wait').value||'').trim(),waitingSince:st0==='aguardando'?now:null,
    history:hist,statusLog:[{s:st0,at:now}],createdAt:now,updatedAt:now,completedAt:st0==='concluido'?now:null};
  const kind=($('#nt-kind')&&$('#nt-kind').value)||'';
  if(kind){const kf={};document.querySelectorAll('[data-nk]').forEach(i=>{if((' '+i.dataset.k+' ').includes(' '+kind+' ')&&i.value.trim())kf[i.dataset.nk]=i.value.trim();});
    if(kind==='certificado'&&!t.due){toast('Informe o vencimento do certificado em Prazo.');$('#nt-due').focus();return;}
    t.kind=kind;t.fields=Object.assign({},t.fields,kf,kind==='assinatura'?{etapa:'Recebida'}:{},kind==='familia'?{contatoEm:now.slice(0,10)}:{});t.history=[{at:now,text:'Demanda registrada pelo Painel · tipo: '+(KIND_LBL[kind]||kind)}];}
  const b=$('#nt-save');b.disabled=true;b.textContent='Salvando…';
  try{await S.db.doc('tasks/'+id).set(t);closeDrawer();toast('Demanda #'+num+' registrada');}
  catch(e){b.disabled=false;b.textContent='Registrar demanda';toast(e&&e.code==='quota_exceeded'?'Limite de armazenamento atingido.':'Não foi possível salvar agora. Tente de novo em instantes.');}
}

/* ---------- gaveta: cadastros ---------- */
function openCad(c,id,pre){
  const C=CAD[c];const r=id?S.cad[c].find(x=>x.id===id):null;
  if(id&&!r)return;
  if(!S.db){toast('Os dados não estão disponíveis nesta visualização.');return;}
  dr={type:'cad',c,id:id||null,arm:false};
  const body=C.fields.map(f=>{const v=r?r[f.k]:(pre&&pre[f.k]!=null)?pre[f.k]:(f.opts?(c==='pessoas'&&f.k==='grupo'&&AREAS[S.view]?{dp:'Funcionário(a)',sau:'Família'}[S.view]||f.opts[0]:f.opts[0]):'');
    const fid='cf-'+f.k;
    if(f.t==='people'){const cur=Array.isArray(v)?v:(!r&&S.view==='sau'&&S.sauP?[S.sauP]:[]);return '<div class="fld"><label>'+esc(f.l)+'</label><div class="days-pick" id="'+fid+'">'+(S.view==='sau'?sauPessoas():familia()).map(p=>'<label><input type="checkbox" value="'+esc(p.id)+'"'+(cur.includes(p.id)?' checked':'')+'><span>'+esc(p.nome.split(' ')[0])+'</span></label>').join('')+'</div></div>';}
    if(f.ref){const rows=refRows(f.ref);return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><select id="'+fid+'"><option value="">—</option>'+rows.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===v?' selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</select></div>';}
    if(f.opts)return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><select id="'+fid+'">'+f.opts.map(o=>'<option value="'+esc(o)+'"'+((v||'')===o?' selected':'')+'>'+esc(f.lab?(o?f.lab(o):'—'):(o||'—'))+'</option>').join('')+'</select></div>';
    if(f.long)return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><textarea id="'+fid+'">'+esc(v||'')+'</textarea></div>';
    if(f.t==='money')return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><input id="'+fid+'" inputmode="decimal" data-money value="'+esc(moneyFmtInput(v))+'" placeholder="0,00" autocomplete="off"></div>';
    return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><input id="'+fid+'" value="'+esc(v||'')+'" placeholder="'+esc(f.ph||'')+'" autocomplete="off"></div>';}).join('');
  drawerShell(r?r.nome:'Adicionar '+C.one,body,
    (r?'<button class="btn danger" id="cf-del">Excluir</button>':'')+'<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn primary" id="cf-save">'+(r?'Salvar':'Adicionar')+'</button>',!!r);
}
async function saveCad(){
  const {c,id}=dr;const C=CAD[c];const obj={};
  for(const f of C.fields){if(f.t==='people'){obj[f.k]=[...document.querySelectorAll('#cf-'+f.k+' input:checked')].map(x=>x.value);continue;}if(f.t==='money'){const mv=moneyParse(($('#cf-'+f.k).value||'').trim());obj[f.k]=isNaN(mv)||!mv?'':mv;continue;}obj[f.k]=($('#cf-'+f.k).value||'').trim();}
  if(!obj.nome){toast('Informe o nome.');$('#cf-nome').focus();return;}
  const now=new Date().toISOString();const old=id?S.cad[c].find(x=>x.id===id):null;
  obj.criadoEm=old&&old.criadoEm?old.criadoEm:now;obj.atualizadoEm=now;
  if(old){for(const k in old){if(k!=='id'&&!(k in obj))obj[k]=old[k];}}
  const docId=id||uid(c.slice(0,3));
  try{await S.db.collection(C.col).doc(docId).set(obj);closeDrawer();toast(id?'Alterações salvas':C.one.replace(/^./,x=>x.toUpperCase())+' adicionad'+(c==='pessoas'||c==='empresas'?'a':'o'));driveAfterSave(c,docId,obj,old);}
  catch(e){toast('Não foi possível salvar agora. Tente de novo em instantes.');}
}
async function delCad(){
  const b=$('#cf-del');
  if(!dr.arm){dr.arm=true;b.classList.add('armed');b.textContent='Confirmar exclusão';return;}
  const kind=dr.c,old=S.cad[kind].find(x=>x.id===dr.id);
  try{await S.db.collection(CAD[kind].col).doc(dr.id).delete();closeDrawer();toast('Registro excluído');driveAfterDelete(kind,old);}catch(e){toast('Não foi possível excluir agora.');}
}

/* ---------- eventos ---------- */
document.addEventListener('click',e=>{
  if(e.target.closest('a[href]'))return;
  const t=e.target.closest('[data-ov-tick],[data-neg-new],[data-via-pais-ck],[data-via-sel],[data-via-exec],[data-via-tab],[data-via-hsub],[data-via-cid-clear],[data-via-fav],[data-via-pts-ok],[data-via-pts-ciente],[data-via-par-clear],[data-via-reemb],[data-via-reemb-vis],[data-via-reemb-all],[data-via-ckdel],[data-via-ckadd],[data-fam-p],[data-fam-tab],[data-brd-exec],[data-brd-b],[data-brd-tab],[data-sau-p],[data-sau-tab],[data-neg-e],[data-neg-tab],[data-retorno],[data-comprou],[data-lancar-reemb],[data-obr-done],[data-fin-reemb],[data-task],[data-unfile],#syncDrive,[data-done],[data-rec],[data-new-rec],[data-person],[data-dp-tab],[data-dp-month],[data-dp-pagview],[data-dp-week],[data-fac-tab],[data-fac-ativo],#dp-gerar,#rf-save,#rf-del,[data-nav],[data-go],[data-exec],[data-cad-tab],[data-edit],[data-add],[data-new-cat],[data-close],[data-hit],#newTask,#nt-save,#nt-newsub-ok,#cf-save,#cf-del');
  if(!t){if(!e.target.closest('.search'))$('#results').hidden=true;return;}
  if(t.dataset.viaPaisCk!=null){const v=viaById(t.dataset.viaPaisCk);if(!v)return;const ck=viaCheck(v);const add=paisItens(paisById(v.pais)).filter(x=>!ck.some(c=>c.t===x)).map(x=>({t:x,done:false}));return viaCkSave(v,ck.concat(add));}
  if(t.dataset.viaSel!=null){S.viaSel=t.dataset.viaSel||null;if(S.view!=='via')return go('via');renderVia();$('#v-via').scrollTop=0;return;}
  if(t.dataset.viaExec!=null){S.viaExec=t.dataset.viaExec;return renderVia();}
  if(t.dataset.viaFav!=null){const h=recs('via-hotel').find(x=>x.id===t.dataset.viaFav);if(!h||!S.db)return;const ns=h.situacao==='Favorito'?'Já se hospedou':'Favorito';
    S.db.collection('via-hoteis').doc(h.id).update({situacao:ns,atualizadoEm:new Date().toISOString()}).catch(()=>toast('Não foi possível salvar agora. Tente de novo.'));return;}
  if(t.dataset.viaCidClear!=null){S.viaCid='';return renderVia();}
  if(t.dataset.viaHsub!=null){S.viaHot=t.dataset.viaHsub;return renderVia();}
  if(t.dataset.viaTab!=null){S.viaTab=t.dataset.viaTab;saveUi();return renderVia();}
  if(t.dataset.viaPtsCiente!=null){const id=t.dataset.viaPtsCiente;if(!S.db)return;S.db.collection('abas/pontos/linhas').doc(id).update({cienteVenc:t.dataset.venc,cienteEm:todayISO(),atualizadoEm:new Date().toISOString()}).then(()=>toast('Marcado como ciente')).catch(()=>toast('Não foi possível salvar agora.'));return;}
  if(t.dataset.viaPtsOk!=null){const id=t.dataset.viaPtsOk;if(!S.db)return;S.db.collection('abas/pontos/linhas').doc(id).update({atual:todayISO(),atualizadoEm:new Date().toISOString()}).then(()=>toast('Marcado como conferido hoje')).catch(()=>toast('Não foi possível salvar agora.'));return;}
  if(t.dataset.viaParClear!=null){S.viaPar='';return renderVia();}
  if(t.dataset.viaReembVis!=null)return viaLancarReembVis(t.dataset.viaReembVis);
  if(t.dataset.viaReemb!=null)return viaLancarReemb([t.dataset.viaReemb]);
  if(t.dataset.viaReembAll!=null)return viaLancarReemb(recs('via-gasto').filter(g=>g.viagem===t.dataset.viaReembAll&&g.reembolsavel==='Sim'&&!g.reembLancado).map(g=>g.id));
  if(t.dataset.viaCkdel!=null){const[vid,i]=t.dataset.viaCkdel.split(':');const v=viaById(vid);if(!v)return;const l=viaCheck(v).slice();l.splice(+i,1);return viaCkSave(v,l);}
  if(t.dataset.viaCkadd!=null){const v=viaById(t.dataset.viaCkadd);const inp=$('#via-ck-new');const tx=(inp&&inp.value||'').trim();if(!v||!tx){if(inp)inp.focus();return;}return viaCkSave(v,viaCheck(v).concat([{t:tx,done:false}]));}
  if(t.dataset.famP!=null){S.famP=t.dataset.famP;return renderFam();}
  if(t.dataset.famTab!=null){S.famTab=t.dataset.famTab;saveUi();return renderFam();}
  if(t.dataset.brdExec!=null){S.brdExec=t.dataset.brdExec;if(S.brdB&&!brdExecOk(boardById(S.brdB)))S.brdB='';return renderBrd();}
  if(t.dataset.brdB!=null){S.brdB=t.dataset.brdB;return renderBrd();}
  if(t.dataset.brdTab!=null){S.brdTab=t.dataset.brdTab;saveUi();return renderBrd();}
  if(t.dataset.sauP!=null){S.sauP=t.dataset.sauP;return renderSau();}
  if(t.dataset.sauTab!=null){S.sauTab=t.dataset.sauTab;saveUi();return renderSau();}
  if(t.dataset.ovTick){const x=S.tasks.get(t.dataset.ovTick);if(x)setTaskStatus(x.id,x.status==='concluido'?'nova':'concluido');return;}
  if(t.dataset.negNew){openNewTask('p-neg',{kind:t.dataset.negNew});return;}
  if(t.dataset.negE!=null){S.negE=t.dataset.negE;if(t.dataset.negTabGo){S.negTab=t.dataset.negTabGo;saveUi();}return renderNeg();}
  if(t.dataset.retorno!=null){const id=t.dataset.retorno;if(dr)closeDrawer();return agendarRetorno(id);}
  if(t.dataset.comprou!=null){const id=t.dataset.comprou;if(dr)closeDrawer();return comprou(id);}
  if(t.dataset.lancarReemb!=null){const id=t.dataset.lancarReemb;if(dr)closeDrawer();return lancarReemb(id);}
  if(t.dataset.obrDone!=null){const id=t.dataset.obrDone;if(dr)closeDrawer();return obrFeita(id);}
  if(t.dataset.finReemb!=null)return window.CE.openFin({tid:'reemb-med',tab:'reemb-med',id:t.dataset.finReemb});
  if(t.dataset.task!=null)return window.CE.openTask(t.dataset.task);
  if(t.dataset.unfile!=null){e.preventDefault();dr.files.splice(+t.dataset.unfile,1);$('#rf-files-list').innerHTML=filesEdit();return;}
  if(t.dataset.done!=null){const id=t.dataset.done;if(dr)closeDrawer();return registrarFeito(id);}
  if(t.dataset.rec!=null){const[ty,id]=t.dataset.rec.split(':');return openRec(ty,id);}
  if(t.dataset.newRec!=null){const pre={};if(t.dataset.newRec==='via-hotel')pre.ambito=S.viaHot==='Internacional'?'Internacional':'Nacional';if(t.dataset.prePessoa)pre.pessoa=t.dataset.prePessoa;else if(S.view==='dp'&&S.dpPerson)pre.pessoa=S.dpPerson;if(t.dataset.newRec.startsWith('fac')&&S.facF.ativo)pre.ativo=S.facF.ativo;if(t.dataset.newRec==='dp-pag')pre.competencia=S.dpMonth;if(t.dataset.preTipo)pre.tipo=t.dataset.preTipo;if(t.dataset.newRec.startsWith('sau')&&S.sauP)pre.pessoa=S.sauP;if(t.dataset.newRec.startsWith('neg')&&S.negE)pre.empresa=S.negE;if(t.dataset.newRec==='brd-reun'&&S.brdB)pre.board=S.brdB;if(t.dataset.newRec==='age-ev'&&S.view==='brd'&&S.brdB){pre.board=S.brdB;const bb=boardById(S.brdB);if(bb&&bb.executivo)pre.executivo=bb.executivo;}if(t.dataset.newRec.startsWith('fam')&&S.famP)pre.pessoa=S.famP;if(t.dataset.preViagem)pre.viagem=t.dataset.preViagem;else if(t.dataset.newRec.startsWith('via-')&&S.viaSel)pre.viagem=S.viaSel;return openRec(t.dataset.newRec,null,pre);}
  if(t.dataset.person!=null){S.dpPerson=t.dataset.person||null;if(S.view!=='dp')return go('dp');renderDP();{const sm=document.querySelector('#v-dp .side-main');if(sm)sm.scrollTop=0;}return;}
  if(t.dataset.dpTab!=null){S.dpTab=t.dataset.dpTab;S.dpPerson=null;saveUi();renderDP();{const sm=document.querySelector('#v-dp .side-main');if(sm)sm.scrollTop=0;}if(t.dataset.dpGo){const g=document.getElementById('dp-'+t.dataset.dpGo);if(g)g.scrollIntoView({block:'start'});}return;}
  if(t.dataset.dpMonth!=null){S.dpMonth=+t.dataset.dpMonth>0?nextYm(S.dpMonth):prevYm(S.dpMonth);return renderDP();}
  if(t.dataset.dpPagview!=null){S.dpPagView=t.dataset.dpPagview;saveUi();return renderDP();}
  if(t.dataset.dpWeek!=null){const n=+t.dataset.dpWeek;S.dpWeek=n?addDays(S.dpWeek,n):weekStart(todayISO());return renderDP();}
  if(t.dataset.facTab!=null){S.facTab=t.dataset.facTab;saveUi();return renderFac();}
  if(t.dataset.facAtivo!=null){S.facF.ativo=t.dataset.facAtivo;S.facF.status=t.dataset.facAtivo?'':'abertos';S.facTab=t.dataset.facAtivo?'venc':'ativos';if(!t.dataset.facAtivo)delete S.demSub['p-fac'];renderFac();$('#v-fac').scrollTop=0;return;}
  if(t.id==='dp-gerar')return gerarFolha();
  if(t.id==='syncDrive')return syncAllDrive(t);
  if(t.id==='rf-save')return saveRec();
  if(t.id==='rf-del')return delRec();
  if(t.dataset.nav!=null){const nid=t.dataset.nav;resetModule(nid);go(nid);homeFrame(nid);scrollHome(nid);return;}
  if(t.dataset.go!=null)return go(t.dataset.go);
  if(t.dataset.exec!=null){S.exec=t.dataset.exec;saveUi();return renderCurrent();}
  if(t.dataset.cadTab!=null){S.cadTab=t.dataset.cadTab;saveUi();if(S.view!=='cad')return go('cad');return renderCad();}
  if(t.dataset.edit!=null){const[c,id]=t.dataset.edit.split(':');return openCad(c,id);}
  if(t.dataset.add!=null){const T=CAD_TABS.find(x=>x.k===t.dataset.add);return openCad(T?T.c:t.dataset.add,null,T&&T.pre);}
  if(t.dataset.newCat!=null)return openNewTask(t.dataset.newCat);
  if(t.dataset.close!=null)return closeDrawer();
  if(t.dataset.hit!=null)return openHit(+t.dataset.hit);
  if(t.id==='newTask')return openNewTask(S.view==='via'?'k-via':AREAS[S.view]?AREAS[S.view].cat:null);
  if(t.id==='nt-save')return saveNewTask();
  if(t.id==='nt-newsub-ok')return createSub();
  if(t.id==='cf-save')return saveCad();
  if(t.id==='cf-del')return delCad();
});
document.addEventListener('keydown',e=>{if(e.target&&e.target.id==='nt-newsub-in'&&e.key==='Enter'){e.preventDefault();createSub();}});
document.addEventListener('change',e=>{
  const id=e.target.id||'';
  if(id==='nt-cat'){$('#nt-sub').innerHTML=subOptions(e.target.value,null);$('#nt-newsub').hidden=true;ntKindVis();}
  if(id==='nt-sub'){const nw=e.target.value==='__new';$('#nt-newsub').hidden=!nw;if(nw){e.target.value='';$('#nt-newsub-in').focus();}}
  if(id==='rf-anexos')uploadFiles(e.target);
  if(id.startsWith('dpf-')&&id!=='dpf-q'){S.dpF[id.slice(4)]=e.target.value;renderDP();}
  if(id.startsWith('facf-')&&id!=='facf-q'){S.facF[id.slice(5)]=e.target.value;if(id==='facf-tipoAtivo'||id==='facf-exec')S.facF.ativo='';renderFac();}
  if(id==='dp-oc-tipo'){S.dpOcTipo=e.target.value;renderDP();}
  if(id==='dp-oc-mes'){S.dpOcMes=e.target.value;renderDP();}
  if(id==='dp-f-pessoa'){S.dpFp=e.target.value;renderDP();}
  if(id==='dp-mov-mes'){S.dpMovMes=e.target.value;renderDP();}
  if(id==='sau-tipo'){S.sauTipo=e.target.value;renderSau();}
  if(id==='via-tipo'){S.viaTipo=e.target.value;renderVia();}
  if(id==='via-par'){S.viaPar=e.target.value;renderVia();}
  if(id==='via-cid'){S.viaCid=e.target.value;renderVia();}
  if(e.target.dataset&&e.target.dataset.viaCk){const[vid,i]=e.target.dataset.viaCk.split(':');const v=viaById(vid);if(v){const l=viaCheck(v).map(x=>Object.assign({},x));if(l[+i])l[+i].done=e.target.checked;viaCkSave(v,l);}}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(dr)closeDrawer();$('#results').hidden=true;}
  if(e.key==='Enter'&&e.target.closest&&e.target.closest('tr[data-edit]')){const[c,id]=e.target.closest('tr').dataset.edit.split(':');openCad(c,id);}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('div.card[role=button]')){e.preventDefault();e.target.click();}
  if(e.key==='Enter'&&e.target.id==='via-ck-new'){e.preventDefault();const b=document.querySelector('[data-via-ckadd]');if(b)b.click();}
  if(e.key==='Enter'&&e.target.id==='nt-title'){e.preventDefault();saveNewTask();}
});
$('#q').addEventListener('input',()=>{hi=0;renderResults();});
document.addEventListener('input',e=>{
  if(e.target.id==='dpf-q'){S.dpF.q=e.target.value;renderCurrent();}
  if(e.target.id==='facf-q'){S.facF.q=e.target.value;renderCurrent();}
});
$('#q').addEventListener('focus',renderResults);
$('#q').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(hits.length-1,hi+1);renderResults();}
  else if(e.key==='ArrowUp'){e.preventDefault();hi=Math.max(0,hi-1);renderResults();}
  else if(e.key==='Enter'){e.preventDefault();openHit(hi);}
});

/* ---------- ponte entre módulos ---------- */
function whenFrame(id,ready,fn){go(id);let n=0;const tick=()=>{const f=frames[id];let w=null;try{w=f&&f.contentWindow;}catch(e){}let ok=false;try{ok=!!(w&&ready(w));}catch(e){}if(ok){try{fn(w);}catch(e){}return;}if(++n<150)setTimeout(tick,100);};tick();}

/* Tipo da demanda: mostra só os campos do tipo escolhido */
/* Tipo só existe em Negócios: nas outras categorias o campo some e a demanda é comum */
function ntKindVis(){const k=$('#nt-kind'),l=$('#nt-kind-l'),c=$('#nt-cat');if(!k||!c)return;const on=c.value==='p-neg';k.hidden=!on;if(l)l.hidden=!on;
  if(!on&&k.value){k.value='';k.dispatchEvent(new Event('change',{bubbles:true}));}}
document.addEventListener('change',e=>{if(!e.target||e.target.id!=='nt-kind')return;const k=e.target.value;
  document.querySelectorAll('.nt-k').forEach(el=>{el.hidden=!(k&&(' '+el.dataset.k+' ').includes(' '+k+' '));});});
