"use strict";
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad2=n=>String(n).padStart(2,'0');
const MESES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MESL=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIASL=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const DIAS=['dom','seg','ter','qua','qui','sex','sáb'];
const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmtMoney=v=>money.format(Math.round((+v||0)*100)/100);
/* campos de valor: máscara brasileira (3.000,00) enquanto digita */
function moneyFmtInput(v){if(v===''||v==null||isNaN(+v))return '';return (+v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function moneyMask(s){const neg=/^\s*-/.test(String(s));s=String(s).replace(/[^\d,]/g,'');const i=s.indexOf(',');let int=i<0?s:s.slice(0,i);const dec=i<0?null:s.slice(i+1).replace(/,/g,'').slice(0,2);int=int.replace(/^0+(?=\d)/,'');if(i>=0&&!int)int='0';int=int.replace(/\B(?=(\d{3})+(?!\d))/g,'.');return (neg?'-':'')+int+(dec!=null?','+dec:'');}
function moneyParse(s){s=String(s).replace(/[^\d,]/g,'').replace(',','.');const v=parseFloat(s);return isNaN(v)?NaN:Math.round(v*100)/100;}
document.addEventListener('input',e=>{const el=e.target;if(!el||!el.matches||!el.matches('input[data-money]'))return;const pos=el.selectionStart==null?el.value.length:el.selectionStart;const before=el.value.slice(0,pos).replace(/[^\d,-]/g,'').length;const nv=moneyMask(el.value);if(nv===el.value)return;el.value=nv;let n=0,p=0;while(p<nv.length&&n<before){if(/[\d,-]/.test(nv[p]))n++;p++;}try{el.setSelectionRange(p,p);}catch(_){}});

const iso=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const todayISO=()=>iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d);};
const ymOf=s=>s.slice(0,7);
const dayIn=(ym,v)=>{const[y,m]=ym.split('-').map(Number);const last=new Date(y,m,0).getDate();return ym+'-'+pad2(Math.min(v,last));};
const nextYm=ym=>{let[y,m]=ym.split('-').map(Number);m++;if(m>12){m=1;y++;}return y+'-'+pad2(m);};
function fmtDate(s){if(!s)return '';const t=todayISO();if(s===t)return 'Hoje';if(s===addDays(t,1))return 'Amanhã';if(s===addDays(t,-1))return 'Ontem';const d=new Date(s+'T12:00:00');return d.getDate()+' '+MESES[d.getMonth()];}
function fmtDay(s){const d=new Date(s+'T12:00:00');return DIAS[d.getDay()]+', '+d.getDate()+' '+MESES[d.getMonth()];}
const daysBetween=(a,b)=>Math.floor((new Date(b)-new Date(a))/86400000);
let toastT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2600);}
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* ---------- ícones ---------- */
const IC={
  sec:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  fin:'<svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M21 19H3"/></svg>',
  dp:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><path d="M16 5.5a3 3 0 0 1 0 5.6M18 14.5c1.3.8 2.2 2.4 2.5 4.5"/></svg>',
  fac:'<svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>',
  sau:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/><path d="M8.5 11.5h2l1-2 1.5 4 1-2h1.5"/></svg>',
  neg:'<svg viewBox="0 0 24 24"><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17"/></svg>',
  fam:'<svg viewBox="0 0 24 24"><circle cx="8" cy="7" r="2.6"/><circle cx="16.5" cy="8.5" r="2"/><path d="M3.5 19c.5-3.3 2.3-5.5 4.5-5.5s4 2.2 4.5 5.5"/><path d="M13.5 19c.3-2.5 1.5-4.2 3-4.2s2.7 1.7 3 4.2"/></svg>',
  brd:'<svg viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="4" rx="1.5"/><path d="M6 13v6M18 13v6"/><circle cx="8" cy="5.5" r="1.6"/><circle cx="12" cy="5.5" r="1.6"/><circle cx="16" cy="5.5" r="1.6"/></svg>',
  via:'<svg viewBox="0 0 24 24"><path d="M2.5 15.5 21 8.8c.9-.3 1.3-1.4.6-2.1-.5-.5-1.2-.6-1.9-.3L14 8.7 7.2 5.4 5.5 6l4.6 4-4.3 1.6-2.4-1.3-1.3.5 1.6 3.2z"/><path d="M3 20h18"/></svg>',
  car:'<svg viewBox="0 0 24 24"><path d="M5 16V12l2-5h10l2 5v4"/><path d="M3.5 16h17v2.5h-17z"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/></svg>',
  x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

/* ---------- estrutura ---------- */
const NAV=[
  {id:'capa',l:'Capa'},
  {sep:true},
  {id:'sec',l:'Operação',mod:'modulos/secretariado.html?v=4'},
  {id:'fin',l:'Financeiro',mod:'modulos/financeiro.html?v=356'},
  {id:'dp',l:'DP',native:true},
  {id:'fac',l:'Facilities',native:true},
  {id:'sau',l:'Saúde',native:true},
  {id:'fam',l:'Rotina e Família',native:true},
  {id:'via',l:'Viagens',native:true},
  {id:'age',l:'Agenda',native:true},
  {id:'neg',l:'Negócios',native:true},
  {id:'brd',l:'Conselhos e Programas',native:true},
  {id:'rel',l:'Relatórios',native:true},
  {sep:true},
  {id:'cad',l:'Cadastros'}
];
const AREAS={
  dp:{l:'DP',full:'Departamento pessoal',cat:'p-dp',fase:2,desc:'Funcionários e prestadores de serviço das casas e dos executivos.',
    itens:['Ficha por pessoa: CLT, doméstica, PJ ou MEI','Movimentações: admissão, reajuste, férias, desligamento','Histórico salarial','Pagamentos mês a mês: salário, extras, 13º, férias, guias','Escalas de trabalho','Atestados e ocorrências, com anexos'],
    cad:'pessoas',cadFilter:r=>r.grupo==='Funcionário(a)'||r.grupo==='Prestador(a)',cadTitle:'Funcionários e prestadores'},
  fac:{l:'Facilities',full:'Facilities',cat:'p-fac',fase:2,desc:'Casas, carros, escritórios, documentos e serviços.',
    itens:['Chamados por casa e por carro, com prestador ou fornecedor e custo','Recorrências: IPVA, licenciamento, seguro, revisão, dedetização, manutenções','Documentos e vencimentos','Filtros por ativo, tipo, status e prestador ou fornecedor'],
    cad:'ativos',cadFilter:()=>true,cadTitle:'Casas, carros, escritórios e serviços'},
  sau:{l:'Saúde',full:'Saúde da família',cat:'p-sau',fase:3,desc:'Acompanhamento de saúde dos executivos e da família.',
    itens:['Consultas, exames e retornos por pessoa','Medicamentos de uso contínuo, com aviso de reposição','Vacinas','Reembolsos do plano, ligados ao Financeiro'],
    cad:'pessoas',cadFilter:r=>r.grupo==='Executivo'||r.grupo==='Família',cadTitle:'Família'},
  neg:{l:'Negócios',full:'Negócios pessoais',cat:'p-neg',fase:3,desc:'Demandas e obrigações das empresas pessoais dos executivos.',
    itens:['Demandas por empresa','Obrigações recorrentes: contabilidade, impostos, certidões','Contratos e documentos'],
    cad:'empresas',cadFilter:r=>r.tipo==='Pessoal',cadTitle:'Empresas pessoais'}
};
const EXEC={fernando:'Fernando Shayer',leticia:'Leticia Lyle',ambos:'Fernando e Leticia'};
const ST={nova:'A fazer',andamento:'Em andamento',aguardando:'Aguardando',concluido:'Concluído'};
const ST_COLOR={nova:'var(--accent)',andamento:'var(--warn)',aguardando:'var(--pess)',concluido:'var(--pos)'};

/* ---------- cadastros (esquema) ---------- */
const CAD={
  pessoas:{l:'Núcleo',one:'pessoa',col:'cad-pessoas',fields:[
    {k:'nome',l:'Nome',req:true},
    {k:'grupo',l:'Grupo',opts:['Executivo','Família','Saúde','Funcionário(a)','Prestador(a)','Equipe do secretariado','Outro']},
    {k:'vinculo',l:'Vínculo',opts:['','CLT','CLT doméstica','PJ','MEI','Autônomo(a)']},
    {k:'remun',l:'Forma de remuneração',opts:['','Salário mensal','Por sessão','Por diária','Pacote mensal']},
    {k:'relacao',l:'Relação / função',ph:'Ex.: filho da Leticia, motorista'},
    {k:'local',l:'Local principal',ref:'casas'},
    {k:'executivo',l:'Ligado a',opts:['','fernando','leticia','ambos'],lab:v=>EXEC[v]||'—'},
    {k:'esocial',l:'Empregador no eSocial',opts:['','fernando','leticia'],lab:v=>EXEC[v]||'—'},
    {k:'vt',l:'Vale-transporte',opts:['','Não','Sim']},
    {k:'vtValor',l:'Valor mensal do VT',t:'money'},
    {k:'recebe13',l:'Recebe 13º',opts:['','Sim','Não'],hint:'CLT recebe por lei. Marque Sim para prestadores que também recebem.'},
    {k:'contato',l:'Contato',ph:'Telefone ou e-mail'},
    {k:'obs',l:'Observações',long:true}],
    cols:['nome','grupo','relacao','vinculo','local','executivo','contato','obs']},
  ativos:{l:'Casas, carros, escritórios e serviços',one:'ativo',col:'cad-ativos',fields:[
    {k:'nome',l:'Nome',req:true,ph:'Ex.: Casa de Camburi, Volvo XC60, Sala do Fernando'},
    {k:'tipo',l:'Tipo',opts:['Casa','Carro','Escritório','Serviço','Outro']},
    {k:'ident',l:'Endereço ou placa'},
    {k:'obrigacoes',l:'Controla obrigações',opts:['','sim','nao'],lab:v=>v==='sim'?'Sim':v==='nao'?'Não':'Padrão',hint:'Padrão: não controla na Chase, Camino School, Associação CS, Seeds, Kind, Cloe, Savia e Apiário. Escolha Sim para mostrar a aba Obrigações.'},
    {k:'executivo',l:'De quem',opts:['','fernando','leticia','ambos'],lab:v=>EXEC[v]||'—'},
    {k:'obs',l:'Observações',long:true}],
    cols:['nome','tipo','ident','executivo','obs']},
  empresas:{l:'Empresas',one:'empresa',col:'cad-empresas',fields:[
    {k:'nome',l:'Nome',req:true},
    {k:'razao',l:'Razão social'},
    {k:'cnpj',l:'CNPJ'},
    {k:'tipo',l:'Tipo',opts:['Corporativa','Pessoal']},
    {k:'pai',l:'Unidade de negócio de',ref:'empresasRaiz',hint:'Deixe em branco se for uma empresa principal.'},
    {k:'situacao',l:'Situação',opts:['Ativa','Encerrada','Em encerramento']},
    {k:'menu',l:'Aparece no menu de Negócios',opts:['sim','nao'],lab:v=>v==='nao'?'Não':'Sim',hint:'"Não" mantém só no cadastro, sem menu nem demandas.'},
    {k:'executivo',l:'De quem',opts:['','fernando','leticia','ambos'],lab:v=>EXEC[v]||'—'},
    {k:'papelF',l:'Papel do Fernando',hint:'Ex.: Administrador, Diretor, Sócio, Procurador.'},
    {k:'papelL',l:'Papel da Leticia',hint:'Ex.: Administrador, Diretor, Sócio, Procurador.'},
    {k:'obs',l:'Observações',long:true}],
    cols:['nome','razao','cnpj','pai','tipo','situacao','executivo','papelF','papelL','obs']},
  fornecedores:{l:'Fornecedores',one:'fornecedor',col:'cad-fornecedores',fields:[
    {k:'nome',l:'Nome',req:true},
    {k:'servico',l:'Serviço'},
    {k:'contato',l:'Contato'},
    {k:'obs',l:'Observações',long:true}],
    cols:['nome','servico','contato','obs']},
  prestadores:{l:'Prestadores sob demanda',one:'prestador',col:'cad-prestadores',fields:[
    {k:'nome',l:'Nome',req:true},
    {k:'tipo',l:'Tipo de serviço',opts:['','Manutenção','Obra','Motorista','Despachante','Cuidados com pets','Elétrica','Hidráulica','Ar-condicionado','Limpeza','Outro']},
    {k:'servico',l:'Serviço em detalhe',ph:'Ex.: pintura, troca de telhado, motorista de fim de semana'},
    {k:'executivo',l:'Atende',opts:['','fernando','leticia','ambos'],lab:v=>EXEC[v]||'—'},
    {k:'contato',l:'Telefone, WhatsApp ou e-mail'},
    {k:'valor',l:'Valor de referência',ph:'Ex.: R$ 250 a diária'},
    {k:'indicado',l:'Indicado por'},
    {k:'cadastro',l:'Pessoa física ou empresa',opts:['','Pessoa física','Empresa']},
    {k:'obs',l:'Observações',long:true}],
    cols:['nome','tipo','servico','executivo','contato','valor','obs']},
  medicos:{l:'Profissionais de Saúde',one:'profissional',col:'cad-medicos',fields:[
    {k:'nome',l:'Nome',req:true,ph:'Ex.: Dra. Ana Souza'},
    {k:'especialidade',l:'Especialidade',ph:'Ex.: Pediatria, Dermatologia'},
    {k:'pacientes',l:'Atende',t:'people'},
    {k:'telefone',l:'Telefone ou WhatsApp'},
    {k:'email',l:'E-mail'},
    {k:'secretaria',l:'Contato da clínica'},
    {k:'endereco',l:'Endereço',ph:'Rua, número, sala, bairro'},
    {k:'convenio',l:'Convênio',opts:['','Atende SulAmérica','Particular (com reembolso)','Particular (sem reembolso)','Outro convênio']},
    {k:'valor',l:'Valor da consulta',ph:'Ex.: R$ 600'},
    {k:'obs',l:'Observações',long:true,ph:'Ex.: chegar 15 min antes, estacionamento no prédio'}],
    cols:['nome','especialidade','pacientes','secretaria','endereco','convenio','obs']}
};
const fieldOf=(c,k)=>CAD[c].fields.find(f=>f.k===k);
const showVal=(c,k,v)=>{const f=fieldOf(c,k);if(f&&f.t==='money')return v===''||v==null?'':fmtMoney(v);if(f&&f.t==='people')return (Array.isArray(v)?v:[]).map(id=>{const p=personById(id);return p?p.nome.split(' ')[0]:'';}).filter(Boolean).join(', ');if(f&&f.ref)return refName(f.ref,v);return f&&f.lab?(v?f.lab(v):''):(v||'');};

/* ---------- estado ---------- */
const S={view:'capa',exec:'',cadTab:'pessoas',tasks:new Map(),cats:[],staleDays:3,
  fin:{cronograma:[],solicitacoes:[],'reemb-corp':[],'reemb-med':[],'reemb-pagar':[],parcelas:[],faturas:[],emprestimos:[],assinaturas:[],'rep-fech':[],'rep-transf':[],'rep-contas':[],'fdc-leticia':[],'fdc-luciano':[],'fdc-fernando':[],'fdc-camburi':[],'fdc-criancas':[]},
  finOk:{},finErr:{},cad:{pessoas:[],ativos:[],empresas:[],fornecedores:[],prestadores:[],medicos:[]},loaded:false,db:null,dbState:'loading',assets:null,
  rec:{'dp-pag':[],'dp-mov':[],'dp-esc':[],'dp-oc':[],'fac-ch':[],'fac-rec':[]},
  dpTab:'ind',dpF:{vinculo:'',funcao:'',local:'',exec:'',ativos:'sim',q:''},dpMonth:ymOf(todayISO()),dpWeek:'',dpPagView:'mes',dpOcTipo:'',dpPerson:null,
  facTab:'venc',facF:{ativo:'',exec:'',tipo:'',status:'abertos',forn:'',tipoAtivo:'',q:''}};
try{const s=JSON.parse(localStorage.getItem('ce-ui')||'{}');if(s.exec)S.exec=s.exec;if(s.cadTab&&(CAD[s.cadTab]||s.cadTab==='funcionarios'||s.cadTab==='pets'))S.cadTab=s.cadTab;if(s.view)S.view=s.view;if(s.dpTab&&s.dpV===2)S.dpTab=s.dpTab;if(s.facTab)S.facTab=s.facTab;if(s.dpPagView)S.dpPagView=s.dpPagView;}catch(e){}
function saveUi(){try{localStorage.setItem('ce-ui',JSON.stringify({exec:S.exec,cadTab:S.cadTab,view:S.view,dpTab:S.dpTab,dpV:2,facTab:S.facTab,dpPagView:S.dpPagView,sauTab:S.sauTab,negTab:S.negTab,brdTab:S.brdTab,famTab:S.famTab,viaTab:S.viaTab,ageTab:S.ageTab}));}catch(e){}}

/* ---------- dados ---------- */
let rT=null;function schedule(){if(rT)return;rT=requestAnimationFrame(()=>{rT=null;renderCurrent();syncCats();});}
/* categorias do Gestão acompanham os cadastros: empresas (Negócios) e casas/carros (Facilities) */
let syncBusy=false;
function syncCats(){
  if(syncBusy||!S.db||!S.cats||!S.cats.length||!S.cad||!S.cad.empresas||!S.cad.ativos)return;
  let nodes=S.cats.map(c=>Object.assign({},c));let changed=false;
  if(nodes.some(c=>c.id==='c-fac-sol')&&![...S.tasks.values()].some(t=>t.categoryId==='c-fac-sol')){nodes=nodes.filter(c=>c.id!=='c-fac-sol');changed=true;}
  const byId=new Map(nodes.map(c=>[c.id,c]));
  const sib=pid=>nodes.filter(c=>(c.parentId||null)===pid).length;
  const want=(id,name,parent)=>{if(!byId.has(parent))return;const cur=byId.get(id);
    if(cur){if(cur.name!==name){cur.name=name;changed=true;}return;}
    const n={id,name,order:sib(parent),parentId:parent,sphere:'pessoal'};nodes.push(n);byId.set(id,n);changed=true;};
  const emps=S.cad.empresas.filter(e=>e.menu!=='nao');
  emps.filter(e=>!e.pai||!emps.some(x=>x.id===e.pai)).concat(emps.filter(e=>e.pai&&emps.some(x=>x.id===e.pai))).forEach(e=>want('c-'+e.id,e.nome,e.pai&&emps.some(x=>x.id===e.pai)?'c-'+e.pai:'p-neg'));
  want('c-via-pontos','Programas de pontos','k-via');want('c-via-creditos','Créditos e estornos','k-via');
  want('c-fac-escritorios','Escritórios','p-fac');want('c-fac-servicos','Serviços','p-fac');
  want('c-fam-pets','Pets','p-fam');(S.rec['fam-pet']||[]).forEach(p=>want('c-'+p.id,p.nome,'c-fam-pets'));
  S.cad.ativos.forEach(a=>want('c-'+a.id,a.nome,a.tipo==='Casa'?'c-fac-casas':a.tipo==='Escritório'?'c-fac-escritorios':a.tipo==='Serviço'?'c-fac-servicos':'c-fac-carros'));
  {const G={leticia:'Leticia',fernando:'Fernando',ambos:'Ambos'},bl=S.rec['brd']||[],gk=b=>G[b.executivo]?b.executivo:'ambos';
   Object.keys(G).forEach(k=>{if(bl.some(b=>gk(b)===k))want('c-brd-'+k,G[k],'p-brd');});
   bl.forEach(b=>{const par='c-brd-'+gk(b);want('c-'+b.id,b.nome,par);const cur=byId.get('c-'+b.id);if(cur&&byId.has(par)&&cur.parentId!==par){cur.parentId=par;changed=true;}});}
  if(!changed)return;syncBusy=true;
  S.db.doc('meta/categories').set({nodes}).catch(()=>{}).finally(()=>{setTimeout(()=>{syncBusy=false;},1500);});
}
function taskCatFor(base,fields){
  const f=fields||{};let id=base;
  if(f.empresa&&catById('c-'+f.empresa))id='c-'+f.empresa;
  const tipoMap={'Compras':'c-fam-compras','Documentos':'c-fam-docs','Escola e atividades':'c-fam-escola','Eventos':'c-fam-eventos','Pets':'c-fam-pets','Outros':'c-fam-outros'};
  if(f.tipo&&base==='p-fam'&&catById(tipoMap[f.tipo]))id=tipoMap[f.tipo];
  return id;}
async function boot(){
  let db=null;
  try{if(window.claude&&typeof window.claude.use==='function')db=await window.claude.use('db');}catch(e){db=null;}
  S.db=db;S.dbState=db?'ok':'off';
  if(!db){S.loaded=true;schedule();return;}
  db.collection('tasks').onSnapshot(s=>{const m=new Map();s.docs.forEach(d=>{const v=d.data();if(v)m.set(d.id,{...v,id:d.id});});S.tasks=m;S.loaded=true;schedule();},()=>toast('A conexão com os dados caiu. Recarregue a página.'));
  db.doc('meta/categories').onSnapshot(s=>{S.cats=s.exists?((s.data()||{}).nodes||[]):[];schedule();},()=>{});
  db.doc('meta/atencao').onSnapshot(s=>{S.attSeen=Object.assign({},s.exists?((s.data()||{}).vistos||{}):{});schedule();},()=>{});
  db.doc('meta/settings').onSnapshot(s=>{if(s.exists){const v=s.data()||{};S.staleDays=+((v.auto||{}).staleDays)||3;S.people=Array.isArray(v.people)?JSON.parse(JSON.stringify(v.people)):[];S.dfields=Array.isArray(v.fields)?JSON.parse(JSON.stringify(v.fields)):[];}schedule();},()=>{});
  Object.keys(S.fin).forEach(t=>db.collection('abas/'+t+'/linhas').onSnapshot(s=>{S.fin[t]=s.docs.map(d=>({id:d.id,...d.data()}));S.finOk[t]=true;schedule();try{finNotify(t);}catch(e){}},()=>{S.finErr[t]=true;try{finNotify(t);}catch(e){}}));
  try{window.claude.use('assets').then(a=>{S.assets=a||null;}).catch(()=>{});}catch(e){}
  getMcp().then(()=>schedule()).catch(()=>{});
  /* textos antigos: "pedir reembolso" passou a ser "com reembolso" */
  const legado=o=>{if(o.reembolso==='Pedir reembolso')o.reembolso='Com reembolso';if(o.convenio==='Particular (pedir reembolso)')o.convenio='Particular (com reembolso)';return o;};
  Object.keys(S.rec).forEach(t=>db.collection(REC[t].col).onSnapshot(s=>{S.rec[t]=s.docs.map(d=>legado({id:d.id,...d.data()}));schedule();},()=>{}));
  Object.keys(CAD).forEach(c=>db.collection(CAD[c].col).onSnapshot(s=>{S.cad[c]=s.docs.map(d=>legado({id:d.id,...d.data()})).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt'));schedule();autoDriveSync();},()=>{}));
}

/* ---------- filtros por executivo ---------- */
const FIN_NAME={fernando:['Fernando','Shayer'],leticia:['Leticia']};
function taskExec(t){if(!S.exec)return true;const e=t.executive||null;return e===S.exec||e==='ambos';}
/* mesmo critério das métricas financeiras (finDono, em 14b-financas.js): Luciano conta como Fernando; Camburi, Mauá e Crianças como Leticia */
function finExec(v){if(!S.exec)return true;return finDono(v)===S.exec;}

/* ---------- categorias ---------- */
const catById=id=>S.cats.find(c=>c.id===id);
function descendants(id){const set=new Set([id]);let added=true;while(added){added=false;for(const c of S.cats){if(c.parentId&&set.has(c.parentId)&&!set.has(c.id)){set.add(c.id);added=true;}}}return set;}
function catPath(id){const out=[];let n=catById(id),g=0;while(n&&g++<20){out.unshift(n);n=catById(n.parentId);}return out;}
function catLabel(t){const c=catById(t.categoryId);if(c){const path=[];let n=c,g=0;while(n&&g++<20){path.unshift(n.name);n=catById(n.parentId);}return path.join(' › ');}return '';}
const sphereOf=t=>{const c=catById(t.categoryId);return c?c.sphere:(t.sphere||null);};
const isOpen=t=>t.status!=='concluido';

/* ---------- cálculos da capa ---------- */
function compute(hz){
  const t0=todayISO(),ym=ymOf(t0),day=+t0.slice(8),horizon=addDays(t0,hz||3);
  const tasks=[...S.tasks.values()].filter(taskExec);
  const open=tasks.filter(isOpen);
  const by={nova:0,andamento:0,aguardando:0,concluido:0};tasks.forEach(t=>{if(by[t.status]!=null)by[t.status]++;});
  const doneMonth=tasks.filter(t=>t.status==='concluido'&&t.completedAt&&String(t.completedAt).slice(0,7)===ym).length;
  const attention=[],upcoming=[];
  open.forEach(t=>{
    if(t.due&&t.due<t0)attention.push({sev:'bad',kind:'Demanda',title:t.title||'(sem título)',meta:[t.executive?['',EXEC[t.executive]]:null,sphereTag(t),['bad','Atrasada desde '+fmtDate(t.due)]],right:'#'+(t.num||''),go:'sec',sort:t.due});
    else if(t.status==='aguardando'&&t.waitingSince&&daysBetween(t.waitingSince,new Date())>=S.staleDays)attention.push({sev:'warn',kind:'Demanda',title:t.title||'(sem título)',meta:[t.executive?['',EXEC[t.executive]]:null,sphereTag(t),['warn','Aguardando há '+daysBetween(t.waitingSince,new Date())+' dias'],t.waitingFor?['', 'De: '+t.waitingFor]:null],right:'#'+(t.num||''),go:'sec',sort:'1'});
    if(t.due&&t.due>=t0&&t.due<=horizon)upcoming.push({date:t.due,kind:'Demanda',title:t.title||'(sem título)',meta:[t.executive?['',EXEC[t.executive]]:null,sphereTag(t)],right:'',go:'sec',sev:(t.priority==='alta'||t.priority==='critica')?'bad':'info'});
  });
  // cronograma de pagamentos
  const crono=S.fin.cronograma.filter(r=>r.despesa&&finExec(r.quem));
  let pago=0,semStatus=0,previsto=0;
  crono.forEach(r=>{
    if(!cronoDue(r,ym)){const v=+r.venc;if(v){const ny=nextYm(ym),dNext=dayIn(ny,v),xn=((r.meses||{})[ny])||{};if(dNext<=horizon&&cronoDue(r,ny)&&!(xn.s==='Pago'||xn.s==='Emitido'||xn.s==='Não se aplica'))upcoming.push({date:dNext,kind:'Pagamento',title:r.despesa,meta:[r.quem?['',r.quem]:null,r.forma?['',r.forma]:null],right:r.medio?fmtMoney(r.medio):'',val:+r.medio||0,go:'fin',sev:'warn'});}return;}
    previsto+=+r.medio||0;
    const x=((r.meses||{})[ym])||{};const settled=x.s==='Pago'||x.s==='Emitido'||x.s==='Não se aplica'||!cronoDue(r,ym);
    if(x.s==='Pago'||x.s==='Emitido')pago+=+x.v||0;else if(x.s!=='Não se aplica')semStatus++;
    const v=+r.venc;if(!v)return;
    const dThis=dayIn(ym,v);
    const vd=+dThis.slice(8);
    if(!settled&&vd<day)attention.push({sev:'bad',kind:'Pagamento',title:r.despesa,meta:[['bad','Venceu dia '+v],r.quem?['',r.quem]:null,r.forma?['',r.forma]:null],right:r.medio?fmtMoney(r.medio):'',val:+r.medio||0,go:'fin',sort:dThis});
    if(!settled&&vd>=day&&dThis<=horizon)upcoming.push({date:dThis,kind:'Pagamento',title:r.despesa,meta:[r.quem?['',r.quem]:null,r.forma?['',r.forma]:null],right:r.medio?fmtMoney(r.medio):'',val:+r.medio||0,go:'fin',sev:'warn'});
    const ny=nextYm(ym),dNext=dayIn(ny,v),xn=((r.meses||{})[ny])||{};
    if(dNext<=horizon&&cronoDue(r,ny)&&!(xn.s==='Pago'||xn.s==='Emitido'||xn.s==='Não se aplica'))upcoming.push({date:dNext,kind:'Pagamento',title:r.despesa,meta:[r.quem?['',r.quem]:null,r.forma?['',r.forma]:null],right:r.medio?fmtMoney(r.medio):'',val:+r.medio||0,go:'fin',sev:'warn'});
  });
  // solicitações de pagamento
  const sol=S.fin.solicitacoes.filter(r=>(r.descr||r.valor)&&finExec(r.pagador)&&(r.status==='Pendente'||r.status==='Aguardando transferência'||!r.status));
  let solV=0;sol.forEach(r=>{solV+=+r.valor||0;
    if(r.venc&&r.venc<t0)attention.push({sev:'bad',kind:'Solicitação',title:r.descr||'Solicitação de pagamento',meta:[['bad','Venceu '+fmtDate(r.venc)],r.pagador?['','Pagador: '+r.pagador]:null],right:r.valor?fmtMoney(r.valor):'',go:'fin',sort:r.venc});
    else if(r.venc&&r.venc<=horizon)upcoming.push({date:r.venc,kind:'Solicitação',title:r.descr||'Solicitação de pagamento',meta:[r.status?['warn',r.status]:null,r.pagador?['','Pagador: '+r.pagador]:null],right:r.valor?fmtMoney(r.valor):'',go:'fin',sev:'warn'});});
  // reembolsos
  let rc=0,rcN=0;S.fin['reemb-corp'].filter(r=>finExec(r.pessoa)).forEach(r=>{if(r.status==='A solicitar'||r.status==='Solicitado'||!r.status){if(+r.brl){rc+=+r.brl;rcN++;}}});
  let rm=0,rmN=0;S.fin['reemb-med'].filter(r=>finExec(r.titular)).forEach(r=>{if(r.status==='Pendente'||r.status==='Em análise'){if(+r.valor){rm+=+r.valor;rmN++;}}});
  // parcelas
  let fatura=0,saldo=0;const parc=S.fin.parcelas.filter(r=>finExec(r.titular));parc.forEach(r=>{const rest=Math.max(0,(+r.total||0)-(+r.atual||0));fatura+=+r.vparc||0;saldo+=(+r.vparc||0)*rest;});
  const fMes=S.fin.faturas.map(f=>f.mes).filter(Boolean).sort().pop();const cards=new Set(parc.map(r=>r.cartao));let fatTot=0,fatN=0;S.fin.faturas.forEach(f=>{if(f.mes===fMes&&cards.has(f.cartao)&&f.total!=null&&f.total!==''){fatTot+=+f.total;fatN++;}});
  // áreas
  const areaOpen={};Object.entries(AREAS).forEach(([k,a])=>{const set=descendants(a.cat);areaOpen[k]=open.filter(t=>set.has(t.categoryId));});
  phase2Capa(attention,upcoming,t0,horizon);
  phase3Capa(attention,upcoming,t0,horizon);
  phase4Capa(attention,upcoming,t0,horizon);
  ageCapa(attention,upcoming,t0,horizon);
  phase5Capa(attention,upcoming,t0,horizon);
  viaCapa(attention,upcoming,t0,horizon);
  attention.sort((a,b)=>(a.sev==='bad'?0:1)-(b.sev==='bad'?0:1)||String(a.sort).localeCompare(String(b.sort)));
  upcoming.sort((a,b)=>a.date.localeCompare(b.date));
  return {t0,ym,by,open,doneMonth,attention,upcoming,pago,semStatus,previsto,cronoN:crono.length,solN:sol.length,solV,rc,rcN,rm,rmN,fatura,saldo,fatTot,fatN,parN:parc.length,areaOpen};
}
function sphereTag(t){const c=catLabel(t);return c?['area',c]:null;}
function tagsHtml(meta){return (meta||[]).filter(Boolean).map(([c,t])=>'<span class="tag '+c+'">'+esc(t)+'</span>').join('');}
/* Capa: pagamentos do Cronograma agrupados numa linha só, que abre na própria Capa */
const CAPA_LIM=6;S.capaAll=S.capaAll||{};S.capaGrp=S.capaGrp||{};
function capaRows(list,adj){const pg=list.filter(i=>i.kind==='Pagamento');if(pg.length<2)return list.slice();
  const tot=pg.reduce((a,i)=>a+(i.val||0),0);const grp={grp:true,items:pg,n:pg.length,tot,adj,sev:pg.some(i=>i.sev==='bad')?'bad':'warn'};
  const out=[];let put=false;list.forEach(i=>{if(i.kind==='Pagamento'){if(!put){out.push(grp);put=true;}}else out.push(i);});return out;}
function grpHtml(r,key){const open=!!S.capaGrp[key];
  return '<li class="grp-li"><button class="item '+r.sev+'" data-capa-grp="'+esc(key)+'" aria-expanded="'+open+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+r.n+' pagamentos'+(r.adj?' '+r.adj+'s':'')+'</span><span class="mm"><span class="tag mod-fin">Pagamento</span><span class="tag">'+(open?'Esconder lista':'Ver a lista')+'</span></span></span><span class="rr"><b>'+esc(fmtMoney(r.tot))+'</b><small class="car">'+(open?'▾':'▸')+'</small></span></button>'+
    (open?'<ul class="list sub">'+r.items.map(it=>key==='att'?attLi(it):itemHtml(it,false)).join('')+'</ul>':'')+'</li>';}
document.addEventListener('click',e=>{const g=e.target.closest('[data-capa-grp]');if(g){e.stopPropagation();const k=g.dataset.capaGrp;S.capaGrp[k]=!S.capaGrp[k];renderCapa();return;}
  const a=e.target.closest('[data-capa-all]');if(a){const k=a.dataset.capaAll;S.capaAll[k]=!S.capaAll[k];renderCapa();}},true);
S.attSeen=S.attSeen||{};
const attKey=it=>[it.kind,it.title,it.sort||'',it.right||''].join('|');
const ATT_OK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
function attLi(it,seen){let h=itemHtml(it,false);const k=esc(attKey(it));
  const b=seen?'<button class="att-ok undo" data-att-undo="'+k+'" title="Voltar para a lista" aria-label="Voltar para a lista">Desfazer</button>':'<button class="att-ok" data-att-ok="'+k+'" title="Marcar como visto" aria-label="Marcar como visto">'+ATT_OK+'</button>';
  return h.replace(/^<li>/,'<li class="att-li'+(seen?' seen':'')+'">').replace(/<\/li>$/,b+'</li>');}
function attSave(){S.attSeen=Object.assign({},S.attSeen);const lim=new Date(Date.now()-120*864e5).toISOString().slice(0,10);Object.keys(S.attSeen).forEach(k=>{if(S.attSeen[k]<lim)delete S.attSeen[k];});
  if(S.db)S.db.doc('meta/atencao').set({vistos:S.attSeen}).catch(()=>toast('Não foi possível salvar agora. Tente de novo.'));renderCapa();}
document.addEventListener('click',e=>{const o=e.target.closest('[data-att-ok]');if(o){e.stopPropagation();S.attSeen=Object.assign({},S.attSeen,{[o.dataset.attOk]:todayISO()});attSave();return;}
  const u=e.target.closest('[data-att-undo]');if(u){e.stopPropagation();S.attSeen=Object.assign({},S.attSeen);delete S.attSeen[u.dataset.attUndo];attSave();return;}},true);
function itemHtml(it,showDate){
  return '<li><button class="item '+(it.sev||'')+'" data-go="'+it.go+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(it.title)+'</span><span class="mm"><span class="tag mod-'+esc(it.go||'')+'">'+esc(it.kind)+'</span>'+tagsHtml(it.meta)+'</span></span><span class="rr">'+(it.right?'<b>'+esc(it.right)+'</b>':'')+(showDate?'<small>'+esc(fmtDate(it.date))+'</small>':'')+'</span></button></li>';
}

/* ---------- render: capa ---------- */
function renderCapa(){
  const el=$('#v-capa');const c=compute();const d=new Date();
  const execName=S.exec?EXEC[S.exec].split(' ')[0]:'';
  const attAll=c.attention,attV=attAll.filter(i=>!S.attSeen[attKey(i)]);
  const att=attV.length;
  const summary=!S.loaded?'Carregando os dados…':
    (att?att+(att===1?' item precisa':' itens precisam')+' de atenção':'Nada atrasado')+' · '+c.open.length+' demanda'+(c.open.length===1?'':'s')+' em aberto · '+c.upcoming.length+' compromisso'+(c.upcoming.length===1?'':'s')+' nos próximos 3 dias';
  let h='<div class="wrap">';
  if(S.dbState==='off')h+='<div class="banner">Os dados não estão disponíveis nesta visualização. Abra o Painel pelo seu acesso ao Claude para ver e salvar as informações.</div>';
  h+='<div class="hello"><div><h2>'+esc(DIASL[d.getDay()].replace(/^./,m=>m.toUpperCase())+', '+d.getDate()+' de '+MESL[d.getMonth()])+(execName?' · visão de '+esc(execName):'')+'</h2><p>'+esc(summary)+'</p></div></div>';

  // Atenção + próximos 15 dias
  h+='<div class="grid2"><div><div class="sec-h"><h3>Precisa de atenção</h3><span class="cnt">'+att+'</span></div>';
  if(!att)h+='<ul class="list"><li><div class="empty"><b>Tudo em dia</b>Nenhuma demanda atrasada, pagamento vencido ou espera longa.</div></li></ul>';
  else{const rows=capaRows(attV,'vencido');
    h+='<div class="att-scroll"><ul class="list">'+rows.map(r=>r.grp?grpHtml(r,'att'):attLi(r)).join('')+'</ul></div>';}
  h+='</div><div><div class="sec-h"><h3>Próximos 3 dias</h3><span class="cnt">'+c.upcoming.length+'</span></div>';
  if(!c.upcoming.length)h+='<ul class="list"><li><div class="empty"><b>Agenda livre</b>Prazos de demandas e vencimentos de pagamentos aparecem aqui.</div></li></ul>';
  else{const g={};c.upcoming.forEach(u=>{(g[u.date]=g[u.date]||[]).push(u);});
    let used=0,total=0,hd='';const lim=1e9;
    for(const dt of Object.keys(g)){const rows=capaRows(g[dt],'');total+=rows.length;if(used>=lim)continue;const take=rows.slice(0,lim-used);used+=take.length;
      hd+='<div class="day"><h5><span class="d">'+esc(fmtDate(dt))+'</span><span>'+esc(fmtDay(dt))+'</span></h5><ul class="list">'+take.map(r=>r.grp?grpHtml(r,'up-'+dt):itemHtml(r,false)).join('')+'</ul></div>';}
    h+='<div class="days att-scroll">'+hd+'</div>';}
  h+='</div></div>';

  // Pulso
  const tot=Object.values(c.by).reduce((a,b)=>a+b,0)||1;
  h+='<div><div class="sec-h"><h3>Pulso das categorias</h3></div><div class="pulse">';
  {const OPC={nova:'#7FB8A5',andamento:'#E58FAE',aguardando:'#C2588A',concluido:'#3F7A5F'};
   const segs=[['nova','A fazer',c.by.nova],['andamento','Em andamento',c.by.andamento],['aguardando','Aguardando',c.by.aguardando],['concluido','Concluídas no mês',c.doneMonth]];
   const stot=segs.reduce((a,x)=>a+x[2],0)||1;
   const late=[...S.tasks.values()].filter(t=>taskExec(t)&&isOpen(t)&&t.due&&t.due<c.t0).length;
   h+='<button class="card" data-go="sec"><div class="card-h"><span class="chip">'+IC.sec+'</span><h4>Operação</h4></div>'+
     '<div class="bar-st op-bar" title="Demandas em aberto por etapa e concluídas no mês">'+segs.map(([k,l,v])=>v?'<i style="width:'+(v/stot*100)+'%;background:'+OPC[k]+'" title="'+l+': '+v+'"></i>':'').join('')+'</div>'+
     '<div class="kv op-kv">'+segs.map(([k,l,v])=>'<div><span><i style="background:'+OPC[k]+'"></i>'+l+'</span><b>'+v+'</b></div>').join('')+'</div>'+
     '<div class="foot"><span>'+(c.by.nova+c.by.andamento+c.by.aguardando)+' em aberto'+(late?' · <b class="neg">'+late+' atrasada'+(late>1?'s':'')+'</b>':' · nenhuma atrasada')+'</span></div></button>';}
  {const fm=finMetrics({ym:c.ym}),mes=MESES[+c.ym.slice(5)-1],cr=fm.crono;
   const fv=(v,cls,tip)=>v==null?'<b class="na" title="'+esc(tip)+'">—</b>':'<b class="'+(cls||'')+'">'+fmtMoney(v)+'</b>';
   h+='<button class="card" data-go="fin"><div class="card-h"><span class="chip">'+IC.fin+'</span><h4>Financeiro</h4></div>'+
     '<div class="kv"><div><span>Gasto em '+mes+'</span>'+fv(fm.desp.total,'','Sem lançamentos de '+mes+' na prestação de contas')+'</div>'+
     '<div><span>Reembolsos a receber</span>'+fv(fm.reemb.aReceber,'','Nenhum reembolso registrado')+'</div>'+
     '<div><span>Empréstimos</span>'+(fm.emp.has?'<b class="small">A receber '+fmtMoney(fm.emp.receber.v)+'</b><b class="small">A pagar '+fmtMoney(fm.emp.pagar.v)+'</b>':fv(null,'','Nenhum empréstimo registrado'))+'</div>'+
     '<div><span>Recorrentes de '+mes+'</span>'+fv(cr.previsto,'','Nenhum pagamento recorrente cadastrado')+'</div></div>'+
     '<div class="foot"><span>Competência '+mes+'/'+c.ym.slice(2,4)+' · saldos de hoje'+(cr.prevSemValor?' · '+cr.prevSemValor+' recorrente'+(cr.prevSemValor>1?'s':'')+' sem valor definido':'')+'</span></div></button>';}
  h+=phase2Pulse();
  {const p3=phase3Pulse();
   h+=p3.sau;       /* Saúde */
   h+=phase5Pulse();/* Rotina e Família */
   h+=viaPulse();   /* Viagens */
   h+=agePulse();   /* Agenda */
   h+=p3.neg;       /* Negócios */
   h+=phase4Pulse();/* Conselhos e Programas */}
  h+='</div></div></div>';
  el.innerHTML=h;
}

/* ---------- render: áreas planejadas ---------- */
function renderArea(k){
  const a=AREAS[k];const el=$('#v-area');const c=compute();const list=c.areaOpen[k];
  const people=S.cad[a.cad].filter(a.cadFilter);const C=CAD[a.cad];
  let h='<div class="wrap"><div class="plan-hero"><div><h2>'+esc(a.full)+'</h2><p>'+esc(a.desc)+' O módulo completo chega na Fase '+a.fase+'. Até lá, as demandas desta categoria ficam na Operação e aparecem aqui.</p></div>'+
    '<button class="btn primary" data-new-cat="'+a.cat+'">Nova demanda de '+esc(a.l)+'</button></div>';
  h+='<div class="grid2"><div><div class="sec-h"><h3>Demandas abertas</h3><span class="cnt">'+list.length+'</span><span class="act"><button class="btn sm ghost" data-go="sec">Abrir na Operação</button></span></div>';
  h+=list.length?'<ul class="list">'+list.map(t=>{const late=t.due&&t.due<c.t0;return itemHtml({sev:late?'bad':(t.status==='aguardando'?'warn':'info'),kind:ST[t.status]||'Demanda',title:t.title||'(sem título)',meta:[t.due?[late?'bad':'','Prazo: '+fmtDate(t.due)]:null,t.executive?['',EXEC[t.executive]]:null],right:'#'+(t.num||''),go:'sec'},false);}).join('')+'</ul>'
    :'<ul class="list"><li><div class="empty"><b>Nenhuma demanda aberta</b>Classifique uma demanda em '+esc(catById(a.cat)?catById(a.cat).name:a.l)+' para ela aparecer aqui.</div></li></ul>';
  h+='</div><div style="display:flex;flex-direction:column;gap:22px"><div><div class="sec-h"><h3>'+esc(a.cadTitle)+'</h3><span class="cnt">'+people.length+'</span><span class="act"><button class="btn sm ghost" data-cad-tab="'+a.cad+'">Cadastros</button></span></div>';
  h+=people.length?'<ul class="list">'+people.map(r=>'<li><button class="item" data-edit="'+a.cad+':'+esc(r.id)+'"><span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(r.nome)+'</span><span class="mm">'+[r.grupo||r.tipo,r.relacao||r.ident||r.situacao,r.vinculo].filter(Boolean).map(x=>'<span class="tag">'+esc(x)+'</span>').join('')+'</span></span><span class="rr"><small>'+esc(showVal(a.cad,'executivo',r.executivo))+'</small></span></button></li>').join('')+'</ul>'
    :'<ul class="list"><li><div class="empty"><b>Nada cadastrado</b><button class="btn sm" data-add="'+a.cad+'" style="margin-top:8px">Adicionar '+esc(C.one)+'</button></div></li></ul>';
  h+='</div><div class="panel"><h3>O que este módulo vai ter</h3><ul class="checks">'+a.itens.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul></div></div></div></div>';
  el.innerHTML=h;
}

/* ---------- render: cadastros ---------- */
const isFunc=r=>r.grupo==='Funcionário(a)'||r.grupo==='Prestador(a)';
const CAD_TABS=[
  {k:'pessoas',l:'Núcleo',c:'pessoas',f:r=>!isFunc(r),one:'pessoa',cols:['nome','grupo','relacao','executivo','contato','obs']},
  {k:'funcionarios',l:'Funcionários',c:'pessoas',f:isFunc,one:'funcionário',pre:{grupo:'Funcionário(a)'},cols:['nome','relacao','vinculo','remun','local','executivo','esocial','contato','obs']},
  {k:'ativos',l:'Casas, carros, escritórios e serviços',c:'ativos'},{k:'pets',l:'Pets',rec:'fam-pet',one:'pet'},{k:'empresas',l:'Empresas',c:'empresas'},{k:'prestadores',l:'Prestadores sob demanda',c:'prestadores'},{k:'fornecedores',l:'Fornecedores',c:'fornecedores'},{k:'medicos',l:'Profissionais de Saúde',c:'medicos'}];
const cadTab=k=>CAD_TABS.find(t=>t.k===k)||CAD_TABS[0];
const cadRows=t=>t.rec?recs(t.rec):S.cad[t.c].filter(t.f||(()=>true));
const CAD_COL_L={relacao:{funcionarios:'Função'},esocial:{funcionarios:'eSocial'}};
function renderCad(){
  const el=$('#v-cad');const T=cadTab(S.cadTab);const C=T.rec?{}:CAD[T.c];const rows=cadRows(T);const cols=T.cols||C.cols;const one=T.one||C.one;
  let h='<div class="wrap"><div class="plan-hero"><div><h2>Cadastros</h2><p>Núcleo (executivos, família e equipe), funcionários, casas, carros, pets, empresas, prestadores sob demanda, fornecedores e profissionais de saúde cadastrados uma vez e usados em todos os módulos. Ao criar, renomear ou excluir, a pasta correspondente no Google Drive acompanha.</p></div><div class="acts"><details class="more"><summary class="btn" aria-label="Mais ações" title="Mais ações">+</summary><div class="more-m"><button class="btn sm" id="syncDrive">Sincronizar pastas com o Drive</button></div></details><button class="btn primary" '+(T.rec?'data-new-rec="'+T.rec+'"':'data-add="'+T.k+'"')+'>Adicionar '+esc(one)+'</button></div></div>';
  h+='<div class="seg tabs" role="tablist">'+CAD_TABS.map(t=>'<button role="tab" data-cad-tab="'+t.k+'" class="'+(t.k===T.k?'on':'')+'">'+esc(t.l)+' <span class="num" style="opacity:.6">'+cadRows(t).length+'</span></button>').join('')+'</div>';
  if(!rows.length)h+='<ul class="list"><li><div class="empty"><b>Nenhum registro em '+esc(T.l.toLowerCase())+'</b>Use “Adicionar '+esc(one)+'” para criar o primeiro.</div></li></ul>';
  else if(T.rec)h+=cadPets(rows);
  else h+='<div class="tbl-wrap"><table><thead><tr>'+cols.map(k=>'<th>'+esc((CAD_COL_L[k]&&CAD_COL_L[k][T.k])||fieldOf(T.c,k).l)+'</th>').join('')+'</tr></thead><tbody>'+
    rows.map(r=>'<tr data-edit="'+T.c+':'+esc(r.id)+'" tabindex="0">'+cols.map(k=>'<td class="'+(k==='nome'?'nm':k==='obs'?'ob':'')+'">'+esc(showVal(T.c,k,r[k]))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  h+='</div>';el.innerHTML=h;
}

