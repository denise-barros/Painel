"use strict";
/* =================== FASE 2: registros genéricos (DP e Facilities) =================== */
const DOW=['dom','seg','ter','qua','qui','sex','sáb'];
const REC={
  'dp-pag':{one:'pagamento',col:'dp-pag',fem:false,fields:[
    {k:'pessoa',l:'Pessoa',ref:'equipe',req:true},
    {k:'competencia',l:'Competência',t:'month',req:true,def:()=>ymOf(todayISO())},
    {k:'tipo',l:'Tipo',opts:['Salário','Extra','Diária','Sessões','Pacote','13º salário','Férias','Vale-transporte','Nota de serviço','Guia DAE / INSS / FGTS','Rescisão','Outro']},
    {k:'valor',l:'Valor',t:'money',req:true},
    {k:'status',l:'Status',opts:['Previsto','Pago']},
    {k:'dataPag',l:'Data do pagamento',t:'date'},
    {k:'forma',l:'Forma de pagamento',opts:['','Pix','Transferência','Boleto','Dinheiro','Débito automático']},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Comprovantes',t:'files'}]},
  'dp-mov':{one:'movimentação',col:'dp-mov',fem:true,fields:[
    {k:'pessoa',l:'Pessoa',ref:'equipe',req:true},
    {k:'tipo',l:'Tipo',opts:['Admissão','Registro inicial','Reajuste salarial','Dissídio','Alteração contratual','Férias','Afastamento','Mudança de função','Desligamento','Outro']},
    {k:'data',l:'Data',t:'date',req:true,def:()=>todayISO(),hint:'No registro inicial (quando não se sabe a data de admissão), use a data a partir da qual o valor vale.'},
    {k:'dataFim',l:'Até (férias ou afastamento)',t:'date'},
    {k:'valor',l:'Valor a partir desta data',t:'money',hint:'Salário, valor da sessão, da diária ou do pacote, conforme a forma de remuneração do cadastro. Preencha na admissão, no registro inicial e nos reajustes.'},
    {k:'descricao',l:'Descrição',long:true},
    {k:'anexos',l:'Documentos',t:'files'}]},
  'dp-esc':{one:'escala',col:'dp-esc',fem:true,fields:[
    {k:'pessoa',l:'Pessoa',ref:'equipe',req:true},
    {k:'padrao',l:'Padrão',opts:['Dias fixos','Semanas alternadas','12x36','Sob demanda']},
    {k:'dias',l:'Dias de trabalho',t:'days'},
    {k:'inicio',l:'Início da escala',t:'date',req:true,def:()=>todayISO().slice(0,8)+'01',hint:'Nas semanas alternadas, use uma data de uma semana em que a pessoa trabalha.'},
    {k:'fim',l:'Fim da escala',t:'date'},
    {k:'horario',l:'Horário',ph:'Ex.: 8h às 17h'},
    {k:'local',l:'Local',ref:'casas'},
    {k:'link',l:'Link do documento da escala',ph:'Cole o link do Drive (PDF, planilha…)'},
    {k:'obs',l:'Observações',long:true}]},
  'dp-oc':{one:'ocorrência',col:'dp-oc',fem:true,fields:[
    {k:'pessoa',l:'Pessoa',ref:'equipe',req:true},
    {k:'tipo',l:'Tipo',opts:['Atestado','Falta','Atraso','Advertência','Ocorrência','Elogio']},
    {k:'data',l:'Data',t:'date',req:true,def:()=>todayISO()},
    {k:'dias',l:'Dias de afastamento',t:'num'},
    {k:'descricao',l:'Descrição',long:true},
    {k:'anexos',l:'Anexos',t:'files'}]},
  'fac-ch':{one:'chamado',col:'fac-ch',fem:false,fields:[
    {k:'titulo',l:'O que precisa ser feito',req:true,ph:'Ex.: Conserto do portão da garagem'},
    {k:'ativo',l:'Casa, carro, escritório ou serviço',ref:'ativos'},
    {k:'tipo',l:'Tipo',opts:['Manutenção','Reparo','Serviço','Documentação','Compra','Limpeza','Outro']},
    {k:'status',l:'Status',opts:['Aberto','Orçamento','Agendado','Em execução','Aguardando','Concluído','Cancelado']},
    {k:'prioridade',l:'Prioridade',opts:['','Crítica','Alta','Média','Baixa']},
    {k:'fornecedor',l:'Prestador ou fornecedor',ref:'fornecedores'},
    {k:'abertura',l:'Aberto em',t:'date',def:()=>todayISO()},
    {k:'prazo',l:'Prazo',t:'date'},
    {k:'concluidoEm',l:'Concluído em',t:'date'},
    {k:'custo',l:'Custo',t:'money'},
    {k:'descricao',l:'Detalhes',long:true},
    {k:'anexos',l:'Orçamentos, notas e fotos',t:'files'},
    ]},
  'fac-rec':{one:'vencimento',col:'fac-rec',fem:false,fields:[
    {k:'titulo',l:'Nome',req:true,ph:'Ex.: IPVA, Seguro, Dedetização'},
    {k:'ativo',l:'Casa, carro, escritório ou serviço',ref:'ativos'},
    {k:'categoria',l:'Categoria',opts:['Imposto ou taxa','Documento','Seguro','Manutenção preventiva','Serviço recorrente','Outro']},
    {k:'frequencia',l:'Repete',opts:['Anual','Semestral','Trimestral','Mensal','A cada 2 anos','Única']},
    {k:'proxima',l:'Próximo vencimento',t:'date',req:true},
    {k:'antecedencia',l:'Avisar com quantos dias',t:'num',def:()=>30},
    {k:'valor',l:'Valor estimado',t:'money'},
    {k:'fornecedor',l:'Prestador ou fornecedor',ref:'fornecedores'},
    {k:'obs',l:'Observações',long:true},
    {k:'anexos',l:'Documentos',t:'files'}]}
};
const FAC_OPEN=['Aberto','Orçamento','Agendado','Em execução','Aguardando'];
const FREQ_M={'Mensal':1,'Trimestral':3,'Semestral':6,'Anual':12,'A cada 2 anos':24};

/* ---------- referências ---------- */
const equipe=()=>S.cad.pessoas.filter(p=>p.grupo==='Funcionário(a)'||p.grupo==='Prestador(a)');
function refRows(ref){
  if(ref==='equipe')return equipe();
  if(ref==='casas')return S.cad.ativos.filter(a=>a.tipo==='Casa'||a.tipo==='Escritório');
  if(ref==='ativos'){const o={Casa:0,Carro:1,'Escritório':2,'Serviço':3};return S.cad.ativos.slice().sort((a,b)=>((o[a.tipo]??4)-(o[b.tipo]??4))||String(a.nome||'').localeCompare(String(b.nome||''),'pt'));}
  if(ref==='fornecedores')return S.cad.prestadores.concat(S.cad.fornecedores);
  if(ref==='familia')return familia();
  if(ref==='saude')return sauPessoas();
  if(ref==='empresasPessoais')return empresasPessoais().map(e=>e.pai?Object.assign({},e,{nome:'— '+e.nome}):e);
  if(ref==='empresasRaiz')return empresasPessoais().filter(e=>!e.pai);
  if(ref==='empresas')return S.cad.empresas;
  if(ref==='boards')return boardsAll();
  if(ref==='medicos')return S.cad.medicos;
  if(ref==='paises')return recs('via-pais').slice().sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'pt')).map(x=>({id:x.id,nome:x.nome+(x.passaporte&&x.passaporte!=='Brasileiro'?' (passaporte '+x.passaporte.toLowerCase()+')':'')}));
  if(ref==='viagens')return viaAll().map(v=>({id:v.id,nome:v.titulo+(v.inicio?' · '+fmtDateFull(v.inicio):'')}));
  return [];
}
function facExecOk(a){const x=S.facF.exec;return !x||!!(a&&(a.executivo===x||a.executivo==='ambos'));}
const FAC_EXEC_SEL=f=>'';
function ativoGroups(cur,only,exec){const rows=refRows('ativos').filter(a=>!exec||a.executivo===exec||a.executivo==='ambos');return [['Casa','Casas'],['Carro','Carros'],['Escritório','Escritórios'],['Serviço','Serviços'],['Outro','Outros']].filter(([t])=>!only||only===t).map(([t,l])=>{const g=rows.filter(a=>(t==='Outro'?(a.tipo!=='Casa'&&a.tipo!=='Carro'&&a.tipo!=='Escritório'&&a.tipo!=='Serviço'):a.tipo===t));return g.length?'<optgroup label="'+l+'">'+g.map(a=>'<option value="'+esc(a.id)+'"'+(a.id===cur?' selected':'')+'>'+esc(a.nome)+'</option>').join('')+'</optgroup>':'';}).join('');}
const REF_CAD={saude:'pessoas',equipe:'pessoas',casas:'ativos',ativos:'ativos',fornecedores:'fornecedores'};
function refName(ref,id){if(!id)return '';if(ref==='paises'){const x=recs('via-pais').find(y=>y.id===id);return x?x.nome:'(removido)';}if(ref==='viagens'){const v=recs('via').find(x=>x.id===id);return v?v.titulo:'(removida)';}if(ref==='boards'){const b=recs('brd').find(x=>x.id===id);return b?b.nome:'(removido)';}const c=REF_CAD[ref];const r=c?(ref==='fornecedores'?S.cad.fornecedores.concat(S.cad.prestadores):S.cad[c]).find(x=>x.id===id):null;return r?r.nome:'(removido)';}
const personById=id=>S.cad.pessoas.find(p=>p.id===id);
const ativoById=id=>S.cad.ativos.find(a=>a.id===id);
function ownerOk(exec){if(!S.exec)return true;return !exec||exec===S.exec||exec==='ambos';}

/* ---------- datas extras ---------- */
function addMonthsISO(s,n){const d=new Date(s+'T12:00:00');const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return iso(d);}
function weekStart(s){const d=new Date(s+'T12:00:00');const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d);}
const fmtYm=ym=>{if(!ym)return '';const[y,m]=ym.split('-');return MESES[+m-1]+'/'+y;};
const fmtDateFull=s=>{if(!s)return '';const[y,m,d]=s.split('-');return d+'/'+m+'/'+y;};
const prevYm=ym=>{let[y,m]=ym.split('-').map(Number);m--;if(m<1){m=12;y--;}return y+'-'+pad2(m);};

/* ---------- DP: regras ---------- */
const recs=t=>S.rec[t]||[];
function movsOf(pid){return recs('dp-mov').filter(m=>m.pessoa===pid).sort((a,b)=>String(a.data).localeCompare(String(b.data)));}
function salaryHist(pid){return movsOf(pid).filter(m=>(m.tipo==='Admissão'||m.tipo==='Registro inicial'||m.tipo==='Reajuste salarial'||m.tipo==='Dissídio')&&+m.valor);}
const FOLHA_T={'Salário mensal':'Salário','Pacote mensal':'Pacote','Por sessão':'Sessões','Por diária':'Diária'};
const REM_L={'Salário mensal':'Salário atual','Por sessão':'Valor da sessão','Por diária':'Valor da diária','Pacote mensal':'Pacote mensal'};
const remLabel=p=>REM_L[(p&&p.remun)||'']||'Salário atual';
const semAdmissao=pid=>!admissao(pid)&&movsOf(pid).some(m=>m.tipo==='Registro inicial');
function salarioAtual(pid){const h=salaryHist(pid).filter(m=>m.data<=todayISO());return h.length?+h[h.length-1].valor:null;}
function admissao(pid){const m=movsOf(pid).filter(x=>x.tipo==='Admissão');return m.length?m[m.length-1].data:'';}
function isActive(pid){let a=true;movsOf(pid).forEach(m=>{if(m.data>todayISO())return;if(m.tipo==='Desligamento')a=false;else if(m.tipo==='Admissão')a=true;});return a;}
function escalaOf(pid,date){const es=recs('dp-esc').filter(e=>e.pessoa===pid&&(!e.inicio||e.inicio<=date)&&(!e.fim||e.fim>=date)).sort((a,b)=>String(b.inicio).localeCompare(String(a.inicio)));return es[0]||null;}
function worksOn(e,date){
  if(!e)return null;if(e.padrao==='Sob demanda')return null;
  if(e.padrao==='12x36'){return e.inicio?(daysBetween(e.inicio+'T12:00:00',date+'T12:00:00')%2===0):null;}
  const dow=new Date(date+'T12:00:00').getDay();const dias=Array.isArray(e.dias)?e.dias.map(Number):[];
  if(!dias.includes(dow))return false;
  if(e.padrao==='Semanas alternadas'&&e.inicio){const w=Math.round(daysBetween(weekStart(e.inicio)+'T12:00:00',weekStart(date)+'T12:00:00')/7);return ((w%2)+2)%2===0;}
  return true;
}
function dayStatus(pid,date){
  const ab=movsOf(pid).find(m=>(m.tipo==='Férias'||m.tipo==='Afastamento')&&m.data<=date&&(m.dataFim||m.data)>=date);
  if(ab)return {k:ab.tipo==='Férias'?'ferias':'afast',l:ab.tipo==='Férias'?'Férias':'Afastado'};
  const oc=recs('dp-oc').find(o=>o.pessoa===pid&&o.tipo==='Atestado'&&o.data<=date&&addDays(o.data,Math.max(1,+o.dias||1)-1)>=date);
  if(oc)return {k:'atest',l:'Atestado'};
  const w=worksOn(escalaOf(pid,date),date);
  if(w===true)return {k:'trab',l:'Trabalha'};
  if(w===false)return {k:'folga',l:'Folga'};
  return null;
}
const escLink=e=>e&&/^https:\/\//.test(String(e.link||'').trim())?'<a class="sub-drive" href="'+esc(String(e.link).trim())+'" target="_blank" rel="noopener">Ver escala completa</a>':'';
function escalaText(e){
  if(!e)return 'Sem escala cadastrada';
  if(e.padrao==='Sob demanda'||e.padrao==='12x36')return e.padrao+(e.horario?' · '+e.horario:'');
  const d=(Array.isArray(e.dias)?e.dias.map(Number):[]).sort((a,b)=>((a+6)%7)-((b+6)%7)).map(x=>DOW[x]).join(', ');
  return e.padrao+(d?' · '+d:'')+(e.horario?' · '+e.horario:'');
}
function dpFiltered(){
  const f=S.dpF;const q=(f.q||'').trim().toLowerCase();
  return equipe().filter(p=>{
    if(f.vinculo&&p.vinculo!==f.vinculo)return false;
    if(f.funcao&&p.relacao!==f.funcao)return false;
    if(f.local&&p.local!==f.local)return false;
    if(f.exec&&!(p.executivo===f.exec||p.executivo==='ambos'))return false;
    const act=isActive(p.id);if(f.ativos==='sim'&&!act)return false;if(f.ativos==='nao'&&act)return false;
    if(q&&!String(p.nome||'').toLowerCase().includes(q))return false;
    return true;});
}

/* ---------- Facilities: regras ---------- */
const recLate=r=>!r.encerrada&&r.proxima&&r.proxima<todayISO();
const recSoon=r=>!r.encerrada&&r.proxima&&r.proxima>=todayISO()&&r.proxima<=addDays(todayISO(),+r.antecedencia||30);
function facFiltered(){
  const f=S.facF;const q=(f.q||'').trim().toLowerCase();
  return recs('fac-ch').filter(c=>{
    if(f.ativo&&c.ativo!==f.ativo)return false;
    if(f.tipo&&c.tipo!==f.tipo)return false;
    if(f.forn&&c.fornecedor!==f.forn)return false;
    if(f.status==='abertos'&&!FAC_OPEN.includes(c.status||'Aberto'))return false;
    if(f.status==='concluidos'&&!(c.status==='Concluído'||c.status==='Cancelado'))return false;
    if(f.tipoAtivo){const a=ativoById(c.ativo);if(!a||a.tipo!==f.tipoAtivo)return false;}
    if(f.exec&&!facExecOk(ativoById(c.ativo)))return false;
    if(q&&!(String(c.titulo||'')+' '+String(c.descricao||'')).toLowerCase().includes(q))return false;
    return true;});
}

/* ---------- UI comum ---------- */
function selHtml(id,cur,opts,label){return '<select class="sel" id="'+id+'" aria-label="'+esc(label)+'">'+opts.map(([v,l])=>'<option value="'+esc(v)+'"'+(String(cur||'')===String(v)?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';}
function kpi(l,v,c,sub){return '<div class="kpi"><span>'+esc(l)+'</span><b class="'+(c||'')+'">'+v+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>';}
function filesHtml(list){const n=(list||[]).length;return n?'<span class="tag info">'+n+(n>1?' anexos':' anexo')+'</span>':'';}
function rowBtn(type,r,inner,cls){return '<li><button class="item '+(cls||'')+'" data-rec="'+type+':'+esc(r.id)+'"><span class="sev"></span>'+inner+'</button></li>';}
const ST_TONE={'Aberto':'info','Orçamento':'info','Agendado':'info','Em execução':'warn','Aguardando':'warn','Concluído':'ok','Cancelado':'','Previsto':'warn','Pago':'ok'};

