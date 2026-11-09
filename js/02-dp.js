"use strict";
/* =================== DP =================== */
function renderDP(){
  const el=$('#v-dp');const t0=todayISO();const ym=ymOf(t0);
  const people=dpFiltered();const ids=new Set(people.map(p=>p.id));
  if(S.dpPerson&&personById(S.dpPerson)){el.innerHTML='<div class="wrap"><div class="side-layout">'+dpMenu()+'<div class="side-main">'+fichaHtml(S.dpPerson).replace(/^<div class="wrap">/,'').replace(/<\/div>$/,'')+'</div></div></div>';return;}
  S.dpPerson=null;
  const active=equipe().filter(p=>isActive(p.id));
  const pagMes=recs('dp-pag').filter(p=>p.competencia===ym&&ids.has(p.pessoa));
  const pagoMes=pagMes.filter(p=>p.status==='Pago').reduce((a,p)=>a+(+p.valor||0),0);
  const prevMes=pagMes.filter(p=>p.status!=='Pago').reduce((a,p)=>a+(+p.valor||0),0);
  const ocMes=recs('dp-oc').filter(o=>String(o.data||'').slice(0,7)===ym&&ids.has(o.pessoa)).length;
  const foraL=active.map(p=>({p,s:dayStatus(p.id,t0)})).filter(x=>x.s&&(x.s.k==='ferias'||x.s.k==='afast'||x.s.k==='atest'));const fora=foraL.length;
  const TAB=['ind','equipe','pag','mov','esc','oc'].includes(S.dpTab)?S.dpTab:'ind';
  const HERO={ind:['Departamento pessoal','Indicadores, avisos, demandas e o que vem pela frente.'],equipe:['Equipe','Funcionários e prestadores.'],pag:['Pagamentos','Salários, extras, 13º, férias e guias, mês a mês.'],mov:['Movimentações','O que já aconteceu: admissões, reajustes, férias e desligamentos. O que ainda vem fica em Visão geral › Pela frente.'],esc:['Escalas','Escalas de trabalho da equipe.'],oc:['Ocorrências','Faltas, atestados e outras ocorrências.']};
  const wrapDp=b=>'<div class="wrap"><div class="side-layout">'+dpMenu()+'<div class="side-main">'+b+'</div></div></div>';
  let h='<div class="plan-hero"><div><h2>'+HERO[TAB][0]+'</h2><p>'+HERO[TAB][1]+'</p></div>'+
    '<div class="acts">'+({pag:'<button class="btn primary" data-new-rec="dp-pag">Lançar pagamento</button>',mov:'<button class="btn primary" data-new-rec="dp-mov">Nova movimentação</button>',oc:'<button class="btn primary" data-new-rec="dp-oc">Nova ocorrência</button>',esc:''}[TAB]!==undefined?{pag:'<button class="btn primary" data-new-rec="dp-pag">Lançar pagamento</button>',mov:'<button class="btn primary" data-new-rec="dp-mov">Nova movimentação</button>',oc:'<button class="btn primary" data-new-rec="dp-oc">Nova ocorrência</button>',esc:''}[TAB]:'<details class="newmenu"><summary class="btn primary">+ Novo</summary><div class="nm-pop"><button class="btn" data-new-rec="dp-pag">Pagamento</button><button class="btn" data-new-rec="dp-mov">Movimentação</button><button class="btn" data-new-rec="dp-oc">Ocorrência</button></div></details>')+'</div></div>';
  if(TAB==='ind'){h+=dpIndKpis(active,foraL)+dpAvisosHtml()+demBlock('p-dp')+(equipe().length?dpInd():'');el.innerHTML=wrapDp(h);return;}
  const SLIM=TAB==='mov'||TAB==='oc';
  const SEARCH='<input class="sel qsearch" id="dpf-q" type="search" placeholder="Buscar pessoa" value="'+esc(S.dpF.q||'')+'" aria-label="Buscar pessoa">';
  if(!SLIM)h+='<div class="filters">'+(selHtml('dpf-vinculo',S.dpF.vinculo,[['','Todos os vínculos'],['CLT','CLT'],['CLT doméstica','CLT doméstica'],['PJ','PJ'],['MEI','MEI'],['Autônomo(a)','Autônomo(a)']],'Vínculo')+
    
    selHtml('dpf-local',S.dpF.local,[['','Todos os locais principais']].concat(refRows('casas').map(c=>[c.id,c.nome])),'Local principal')+
    selHtml('dpf-ativos',S.dpF.ativos,[['sim','Só ativos'],['nao','Só desligados'],['','Ativos e desligados']],'Situação'))+
    SEARCH+'</div>';
  if(!equipe().length){h+='<ul class="list"><li><div class="empty"><b>Nenhum funcionário ou prestador cadastrado</b>Cadastre em Cadastros › Funcionários.<br><button class="btn sm" data-add="funcionarios" style="margin-top:8px">Adicionar pessoa</button></div></li></ul>';el.innerHTML=wrapDp(h);return;}
  if(TAB==='equipe')h+=dpEquipe(people);
  else if(TAB==='pag')h+=dpPag(people);
  else if(TAB==='mov')h+=dpMov(ids,SEARCH);
  else if(TAB==='esc')h+=dpEsc(people);
  else h+=dpOc(ids,SEARCH);
  el.innerHTML=wrapDp(h);
}
function dpMenu(){
  const on=k=>(S.dpPerson?k==='equipe':S.dpTab===k)?' on':'';
  const I=d=>'<span class="nm-chip"><svg viewBox="0 0 24 24">'+d+'</svg></span>';
  const IC_={equipe:'<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.5a3 3 0 0 1 0 5.5M18 14.5c1.8.7 3 2.3 3 4.5"/>',
    ind:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
    pag:'<rect x="3.5" y="6" width="17" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    mov:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    esc:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    oc:'<path d="M12 4 3 19h18zM12 10v4M12 17v.5"/>'};
  const L=[['ind','Visão geral'],['equipe','Equipe'],['esc','Escalas'],['mov','Movimentações'],['pag','Pagamentos'],['oc','Ocorrências']];
  return '<nav class="neg-menu" aria-label="Departamento pessoal"><div class="nm-head"><div class="nm-mark">DP</div><div><b>Departamento pessoal</b><small>Funcionários e prestadores</small></div></div><div class="nm-list">'+
    L.map(([k,l])=>'<div class="nm-grp"><button class="nm-item nm-g'+on(k)+'" data-dp-tab="'+k+'">'+I(IC_[k])+'<b class="lbl">'+l+'</b></button></div>').join('')+'</div></nav>';
}
function dpEquipe(people){
  if(!people.length)return '<ul class="list"><li><div class="empty"><b>Ninguém com esses filtros</b>Ajuste os filtros acima.</div></li></ul>';
  const t0=todayISO();
  return '<div class="people">'+people.map(p=>{
    const s=dayStatus(p.id,t0);const sal=salarioAtual(p.id);const act=isActive(p.id);
    const last=recs('dp-pag').filter(x=>x.pessoa===p.id&&x.status==='Pago').sort((a,b)=>String(b.competencia).localeCompare(String(a.competencia)))[0];
    return '<div role="button" tabindex="0" class="card person" data-person="'+esc(p.id)+'"><div class="card-h"><span class="avatar">'+esc(initials(p.nome))+'</span><div style="flex:1;min-width:0"><h4>'+esc(p.nome)+'</h4><small class="sub">'+esc([p.relacao,p.vinculo].filter(Boolean).join(' · ')||'Sem função cadastrada')+'</small></div>'+
      (!act?'<span class="tag">Desligado(a)</span>':s?'<span class="tag st-'+s.k+'">'+esc(s.l)+' hoje</span>':'')+'</div>'+
      '<div class="kv"><div><span>'+esc(remLabel(p))+'</span><b>'+(sal!=null?fmtMoney(sal):'—')+'</b></div><div><span>Último pagamento</span><b class="small">'+(last?esc(fmtYm(last.competencia)):'—')+'</b></div></div>'+
      '<div class="foot"><span>'+esc(escalaText(escalaOf(p.id,t0)))+'</span>'+(p.vt==='Sim'?'<span class="tag info">VT'+(+p.vtValor?' '+esc(fmtMoney(p.vtValor)):'')+'</span>':'')+(p.local?'<span class="tag">'+esc(refName('casas',p.local))+'</span>':'')+subDrive(p,'dp')+'</div></div>';}).join('')+'</div>';
}
function initials(n){return String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();}
function dpPag(people){
  const ym=S.dpMonth;const ids=new Set(people.map(p=>p.id));
  let h='<div class="toolbar"><div class="seg"><button data-dp-month="-1" aria-label="Mês anterior">‹</button><button class="on" style="min-width:96px">'+esc(fmtYm(ym))+'</button><button data-dp-month="1" aria-label="Próximo mês">›</button></div>'+
    '<div class="seg"><button data-dp-pagview="mes" class="'+(S.dpPagView==='mes'?'on':'')+'">Mês</button><button data-dp-pagview="hist" class="'+(S.dpPagView==='hist'?'on':'')+'">Histórico mês a mês</button></div>'+
    '<span class="grow"></span><button class="btn sm" id="dp-gerar">Gerar folha de '+esc(fmtYm(ym))+'</button></div>';
  if(S.dpPagView==='hist'){
    const months=[];let m=ym;for(let i=0;i<6;i++){months.unshift(m);m=prevYm(m);}
    const sum=(pid,mm)=>recs('dp-pag').filter(x=>x.pessoa===pid&&x.competencia===mm);
    h+='<div class="tbl-wrap"><table class="num-t"><thead><tr><th>Pessoa</th>'+months.map(x=>'<th class="r">'+esc(fmtYm(x))+'</th>').join('')+'</tr></thead><tbody>';
    const tot={};
    people.forEach(p=>{h+='<tr data-person="'+esc(p.id)+'"><td class="nm">'+esc(p.nome)+'</td>'+months.map(mm=>{const rs=sum(p.id,mm);const pago=rs.filter(x=>x.status==='Pago').reduce((a,x)=>a+(+x.valor||0),0);const prev=rs.filter(x=>x.status!=='Pago').reduce((a,x)=>a+(+x.valor||0),0);tot[mm]=(tot[mm]||0)+pago+prev;
      return '<td class="r">'+(pago?fmtMoney(pago):'')+(prev?'<small class="prev">'+fmtMoney(prev)+' a pagar</small>':'')+(!pago&&!prev?'<span class="dim">—</span>':'')+'</td>';}).join('')+'</tr>';});
    h+='</tbody><tfoot><tr><td>Total</td>'+months.map(mm=>'<td class="r">'+fmtMoney(tot[mm]||0)+'</td>').join('')+'</tr></tfoot></table></div><p class="hint">Inclui salário, extras e demais pagamentos lançados para cada competência.</p>';
    return h;
  }
  const rows=recs('dp-pag').filter(x=>x.competencia===ym&&ids.has(x.pessoa)).sort((a,b)=>refName('equipe',a.pessoa).localeCompare(refName('equipe',b.pessoa),'pt')||String(a.tipo).localeCompare(String(b.tipo)));
  const pago=rows.filter(x=>x.status==='Pago').reduce((a,x)=>a+(+x.valor||0),0),prev=rows.filter(x=>x.status!=='Pago').reduce((a,x)=>a+(+x.valor||0),0);
  h+='<div class="sumline"><span>Total do mês <b>'+fmtMoney(pago+prev)+'</b></span><span>Pago <b class="pos">'+fmtMoney(pago)+'</b></span><span>A pagar <b class="'+(prev?'warn':'')+'">'+fmtMoney(prev)+'</b></span></div>';
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhum pagamento em '+esc(fmtYm(ym))+'</b>Use “Gerar folha” para criar os pagamentos previstos de quem tem valor cadastrado, ou lance um pagamento avulso.</div></li></ul>'+dpPres(people,ym)+dpExtras(people,ym);
  h+='<ul class="list">'+rows.map(r=>{const late=r.status!=='Pago'&&r.dataPag&&r.dataPag<todayISO();
    return rowBtn('dp-pag',r,'<span style="min-width:0"><span class="tt">'+esc(refName('equipe',r.pessoa))+' · '+esc(r.tipo||'Pagamento')+'</span><span class="mm"><span class="tag '+(ST_TONE[r.status]||'')+'">'+esc(r.status||'Previsto')+'</span>'+(r.dataPag?'<span class="tag '+(late?'bad':'')+'">'+(r.status==='Pago'?'Pago em ':'Pagar até ')+esc(fmtDateFull(r.dataPag))+'</span>':'')+(r.forma?'<span class="tag">'+esc(r.forma)+'</span>':'')+(/^Guia|^13º|^Férias|^Rescisão/.test(r.tipo||'')&&(personById(r.pessoa)||{}).esocial?'<span class="tag">eSocial: '+esc(EXEC[personById(r.pessoa).esocial])+'</span>':'')+filesHtml(r.anexos)+'</span></span><span class="rr"><b>'+fmtMoney(r.valor)+'</b></span>',late?'bad':r.status==='Pago'?'ok':'warn');}).join('')+'</ul>';
  return h+dpPres(people,ym)+dpExtras(people,ym);
}
const PRES_UN={'Por diária':['diária','diárias'],'Por sessão':['sessão','sessões']};
function presDias(p,ym,marc){const [y,m]=ym.split('-').map(Number);const n=new Date(y,m,0).getDate();const out=[];for(let d=1;d<=n;d++){const ds=ym+'-'+pad2(d);if(worksOn(escalaOf(p.id,ds),ds)===true||(marc&&marc.has(ds)))out.push(ds);}return out;}
function presHtml(p,ym){
  if(!PRES_UN[p.remun])return '';const tipo=FOLHA_T[p.remun];const v=salarioAtual(p.id);const un=PRES_UN[p.remun];
  const diaria=p.remun==='Por diária';
  const pag=diaria?null:recs('dp-pag').find(x=>x.pessoa===p.id&&x.competencia===ym&&x.tipo===tipo);
  const marc=diaria?new Set(diariasPagas(p.id,ym).map(r=>r.dia)):new Set(pag&&Array.isArray(pag.diasTrab)?pag.diasTrab:[]);const dias=presDias(p,ym,marc);const pago=pag&&pag.status==='Pago';
  const n=dias.filter(d=>marc.has(d)).length;
  const pend=diaria?dias.filter(d=>!marc.has(d)&&d<=todayISO()).length:0;
  const valBox=v==null?'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="hint" style="margin:0">Valor da '+un[0]+':</span><input class="sel" style="width:120px;text-align:right" inputmode="decimal" data-money data-val-input placeholder="0,00" aria-label="Valor da '+un[0]+'"><button class="btn sm primary" data-val-save="'+esc(p.id)+'">Salvar valor</button></div>'
    :'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="hint" style="margin:0">Valor da '+un[0]+': <b>'+esc(fmtMoney(v))+'</b></span><button class="btn sm ghost" data-new-rec="dp-mov" data-pre-pessoa="'+esc(p.id)+'" data-pre-tipo="Reajuste salarial">Alterar valor</button></div>';
  return '<div data-pres-box="'+esc(p.id)+'" style="display:flex;flex-direction:column;gap:8px">'+valBox+
    (dias.length?'<div class="days-pick">'+dias.map(d=>{const dt=new Date(d+'T12:00:00');const ext=worksOn(escalaOf(p.id,d),d)!==true;return '<label title="'+esc(fmtDateFull(d))+(ext?' · dia extra (desmarque para remover)':'')+'"><input type="checkbox" data-pres="'+esc(p.id)+'|'+ym+'|'+d+'"'+(marc.has(d)?' checked':'')+(pago?' disabled':'')+'><span>'+DOW[dt.getDay()]+' '+dt.getDate()+(ext?' · extra':'')+'</span></label>';}).join('')+'</div>'
      :'<p class="hint" style="margin:0">Sem dias na escala deste mês.</p>')+
    (pago?'':'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input type="date" class="sel" style="width:150px" data-pres-date min="'+ym+'-01" max="'+ym+'-'+pad2(new Date(+ym.slice(0,4),+ym.slice(5,7),0).getDate())+'" aria-label="Data do dia extra"><button class="btn sm" data-pres-add="'+esc(p.id)+'|'+ym+'">+ '+(un[0]==='diária'?'Diária extra paga':'Sessão extra')+'</button></div>')+
    '<p class="hint" style="margin:0">'+(v==null?'Preencha o valor da '+un[0]+' acima para calcular.':diaria?'<b>'+n+'</b> '+(n===1?'diária paga':'diárias pagas')+' = <b>'+esc(fmtMoney(diariasPagas(p.id,ym).reduce((a,r)=>a+(+r.valor||0),0)))+'</b>'+(pend?' · <span style="color:var(--warn)">'+pend+' '+(pend===1?'dia da escala sem pagamento marcado':'dias da escala sem pagamento marcado')+'</span>':'')+' · marque quando pagar':'<b>'+n+'</b> '+(n===1?un[0]:un[1])+' × '+esc(fmtMoney(v))+' = <b>'+esc(fmtMoney(n*v))+'</b>'+(pago?' · já pago':''))+'</p></div>';
}
function diariasPagas(pid,ym){return recs('dp-pag').filter(x=>x.pessoa===pid&&x.competencia===ym&&x.tipo==='Diária'&&x.dia);}
async function diariaToggle(pid,ym,d,on){
  const p=personById(pid);const v=salarioAtual(pid);
  if(v==null){toast('Cadastre o valor da diária em Movimentações (Registro inicial).');return false;}
  const ex=diariasPagas(pid,ym).find(r=>r.dia===d);const now=new Date().toISOString();
  try{
    if(on&&!ex)await S.db.collection('dp-pag').doc(uid('pag')).set({pessoa:pid,competencia:ym,tipo:'Diária',dia:d,valor:v,status:'Pago',dataPag:d,forma:'',obs:'Diária de '+fmtDateFull(d),anexos:[],criadoEm:now,atualizadoEm:now});
    else if(!on&&ex)await S.db.collection('dp-pag').doc(ex.id).delete();
    toast(on?'Diária de '+fmtDate(d)+' paga · '+fmtMoney(v):'Pagamento da diária de '+fmtDate(d)+' removido');return true;
  }catch(err){toast('Não foi possível salvar agora. Tente de novo.');return false;}
}
function dpPres(people,ym){
  const ps=people.filter(p=>isActive(p.id)&&PRES_UN[p.remun]);if(!ps.length)return '';
  return '<div class="sec-h" style="margin-top:6px"><h3>Diárias e sessões de '+esc(fmtYm(ym))+'</h3><span class="cnt">diárias: marque quando pagar · sessões: marque as realizadas</span></div><ul class="list">'+
    ps.map(p=>'<li style="padding:12px 16px;display:grid;grid-template-columns:minmax(140px,200px) minmax(0,1fr);gap:12px;align-items:start"><div><b style="font-weight:600">'+esc(p.nome)+'</b><small class="sub" style="display:block;color:var(--muted)">'+esc(p.remun)+'</small></div>'+presHtml(p,ym)+'</li>').join('')+'</ul>';
}
document.addEventListener('change',async e=>{
  const el=e.target.closest&&e.target.closest('[data-pres]');if(!el||!S.db)return;
  const [pid,ym]=el.dataset.pres.split('|');const p=personById(pid);if(!p||!PRES_UN[p.remun])return;
  const tipo=FOLHA_T[p.remun];const un=PRES_UN[p.remun];const v=salarioAtual(pid);
  if(v==null){el.checked=!el.checked;toast('Cadastre o valor da '+un[0]+' em Movimentações (Registro inicial).');return;}
  if(p.remun==='Por diária'){if(!(await diariaToggle(pid,ym,el.dataset.pres.split('|')[2],el.checked)))el.checked=!el.checked;return;}
  const box=el.closest('[data-pres-box]');const dias=[...box.querySelectorAll('input[data-pres]:checked')].map(x=>x.dataset.pres.split('|')[2]).sort();
  if(!(await presSave(pid,ym,dias)))el.checked=!el.checked;
});
document.addEventListener('click',async e=>{
  const sb=e.target.closest&&e.target.closest('[data-val-save]');if(!sb||!S.db)return;
  const pid=sb.dataset.valSave;const p=personById(pid);const inp=sb.parentElement.querySelector('[data-val-input]');const v=inp?moneyParse(inp.value):NaN;
  if(isNaN(v)||!v){toast('Digite o valor.');if(inp)inp.focus();return;}
  const now=new Date().toISOString();const un=(PRES_UN[p&&p.remun]||['valor'])[0];
  try{await S.db.collection('dp-mov').doc(uid('mov')).set({pessoa:pid,tipo:'Registro inicial',data:ymOf(todayISO())+'-01',dataFim:'',valor:v,descricao:'Valor da '+un+' cadastrado pela ficha.',anexos:[],criadoEm:now,atualizadoEm:now});toast('Valor da '+un+' salvo: '+fmtMoney(v));}
  catch(err){toast('Não foi possível salvar agora. Tente de novo.');}
});
document.addEventListener('click',async e=>{
  const b=e.target.closest&&e.target.closest('[data-pres-add]');if(!b||!S.db)return;
  const [pid,ym]=b.dataset.presAdd.split('|');const box=b.closest('[data-pres-box]');const inp=box&&box.querySelector('[data-pres-date]');const d=inp&&inp.value;
  if(!d){toast('Escolha a data do dia extra.');if(inp)inp.focus();return;}
  if(d.slice(0,7)!==ym){toast('Escolha uma data dentro de '+fmtYm(ym)+'.');return;}
  const p=personById(pid);if(!p||!PRES_UN[p.remun])return;
  if(p.remun==='Por diária'){if(diariasPagas(pid,ym).some(r=>r.dia===d)){toast('Essa diária já está marcada como paga.');return;}await diariaToggle(pid,ym,d,true);return;}
  const pag=recs('dp-pag').find(x=>x.pessoa===pid&&x.competencia===ym&&x.tipo===FOLHA_T[p.remun]);
  const dias=new Set(pag&&Array.isArray(pag.diasTrab)?pag.diasTrab:[]);
  if(dias.has(d)){toast('Esse dia já está marcado.');return;}
  dias.add(d);await presSave(pid,ym,[...dias].sort());
});
async function presSave(pid,ym,dias){
  const p=personById(pid);if(!p||!PRES_UN[p.remun])return false;const tipo=FOLHA_T[p.remun];const un=PRES_UN[p.remun];const v=salarioAtual(pid);
  if(v==null){toast('Cadastre o valor da '+un[0]+' em Movimentações (Registro inicial).');return false;}
  const pag=recs('dp-pag').find(x=>x.pessoa===pid&&x.competencia===ym&&x.tipo===tipo);
  if(pag&&pag.status==='Pago'){toast('Esse pagamento já está marcado como pago.');return false;}
  const n=dias.length;const valor=Math.round(n*v*100)/100;const now=new Date().toISOString();
  const obs=n+' '+(n===1?un[0]:un[1])+' × '+fmtMoney(v)+', marcadas no Painel.';
  try{
    if(pag&&!n)await S.db.collection('dp-pag').doc(pag.id).delete();
    else if(pag)await S.db.collection('dp-pag').doc(pag.id).update({diasTrab:dias,valor,obs,atualizadoEm:now});
    else if(n)await S.db.collection('dp-pag').doc(uid('pag')).set({pessoa:pid,competencia:ym,tipo,valor,status:'Previsto',dataPag:'',forma:'',obs,anexos:[],diasTrab:dias,criadoEm:now,atualizadoEm:now});
    toast(n+' '+(n===1?un[0]:un[1])+' · '+fmtMoney(valor));return true;
  }catch(err){toast('Não foi possível salvar agora. Tente de novo.');return false;}
}
function dpExtras(people,ym){
  const act=people.filter(p=>isActive(p.id));if(!act.length)return '';
  const cell=(p,tipo)=>{const ex=recs('dp-pag').filter(x=>x.pessoa===p.id&&x.competencia===ym&&x.tipo===tipo);const tot=ex.reduce((a,x)=>a+(+x.valor||0),0);
    return '<td class="r">'+(ex.length>1?'<span title="Mais de um lançamento neste mês: edite pela lista de pagamentos">'+fmtMoney(tot)+'</span>':'<input class="sel" style="width:120px;text-align:right" inputmode="decimal" data-money data-dp-extra="'+esc(p.id)+'" data-dp-tipo="'+esc(tipo)+'" placeholder="0,00" aria-label="'+esc(tipo)+' de '+esc(p.nome)+'" value="'+(ex[0]?esc(moneyFmtInput(ex[0].valor)):'')+'">')+'</td>';};
  return '<div class="sec-h" style="margin-top:6px"><h3>Extras e vale-transporte de '+esc(fmtYm(ym))+'</h3><span class="cnt">digite o valor e saia do campo para salvar</span></div><div class="tbl-wrap" style="min-height:0;max-height:none"><table class="num-t" style="min-width:0"><thead><tr><th>Pessoa</th><th>Remuneração</th><th class="r">Extra do mês</th><th class="r">Vale-transporte</th></tr></thead><tbody>'+
    act.map(p=>'<tr style="cursor:default"><td class="nm">'+esc(p.nome)+'</td><td>'+esc(p.remun||'—')+'</td>'+cell(p,'Extra')+(p.vt==='Sim'?cell(p,'Vale-transporte').replace('placeholder="0,00"','placeholder="'+(+p.vtValor?esc(moneyFmtInput(p.vtValor)):'0,00')+'"'):'<td class="r"><span class="dim" title="Sem VT no cadastro">—</span></td>')+'</tr>').join('')+
    '</tbody></table></div>';
}
document.addEventListener('change',async e=>{
  const el=e.target.closest&&e.target.closest('[data-dp-extra]');if(!el||!S.db)return;
  const pid=el.dataset.dpExtra,tipo=el.dataset.dpTipo||'Extra',ym=S.dpMonth;const v=el.value.trim()===''?0:moneyParse(el.value);
  if(isNaN(v)){toast('Valor inválido.');return;}
  const ex=recs('dp-pag').find(x=>x.pessoa===pid&&x.competencia===ym&&x.tipo===tipo);const now=new Date().toISOString();
  const nome=tipo==='Extra'?'Extra':'Vale-transporte';
  try{
    if(ex&&!v)await S.db.collection('dp-pag').doc(ex.id).delete();
    else if(ex)await S.db.collection('dp-pag').doc(ex.id).update({valor:v,atualizadoEm:now});
    else if(v)await S.db.collection('dp-pag').doc(uid('pag')).set({pessoa:pid,competencia:ym,tipo,valor:v,status:'Previsto',dataPag:'',forma:'',obs:'',anexos:[],criadoEm:now,atualizadoEm:now});
    else return;
    toast(nome+(v?' salvo':' removido'));
  }catch(err){toast('Não foi possível salvar agora. Tente de novo.');}
});
const dpPessoaSel=ids=>selHtml('dp-f-pessoa',S.dpFp||'',[['','Todas as pessoas']].concat(equipe().filter(p=>ids.has(p.id)).sort((a,b)=>String(a.nome).localeCompare(String(b.nome),'pt')).map(p=>[p.id,p.nome])),'Pessoa');
function dpMov(ids,SEARCH){
  const t0=todayISO();const ymNow=ymOf(t0);if(S.dpMovMes==null)S.dpMovMes=ymNow;
  const base=recs('dp-mov').filter(m=>ids.has(m.pessoa)&&(!S.dpFp||m.pessoa===S.dpFp)&&String(m.data||'')<=t0);
  const meses=[...new Set(base.map(m=>String(m.data||'').slice(0,7)).filter(Boolean).concat([ymNow]))].sort().reverse();
  const q=!!(S.dpF.q||S.dpFp);const mes=q?'':S.dpMovMes;
  const rows=base.filter(m=>!mes||String(m.data||'').startsWith(mes)).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  const tb='<div class="toolbar">'+selHtml('dp-mov-mes',S.dpMovMes,[['','Todos os meses']].concat(meses.map(m=>[m,fmtYm(m)])),'Mês')+dpPessoaSel(ids)+'<span class="hint" style="margin-left:6px">'+rows.length+' movimentaç'+(rows.length===1?'ão':'ões')+(mes?' em '+esc(fmtYm(mes)):' no total')+(q&&S.dpMovMes?' · a busca e a pessoa consideram todos os meses':'')+'</span>'+(SEARCH||'')+'</div>';
  if(!rows.length)return tb+'<ul class="list"><li><div class="empty"><b>Nenhuma movimentação</b>Registre admissões, reajustes, férias, afastamentos e desligamentos.</div></li></ul>';
  return tb+'<ul class="list">'+rows.map(m=>rowBtn('dp-mov',m,'<span style="min-width:0"><span class="tt">'+esc(refName('equipe',m.pessoa))+' · '+esc(m.tipo)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(m.data))+(m.dataFim?' a '+esc(fmtDateFull(m.dataFim)):'')+'</span>'+filesHtml(m.anexos)+'</span>'+(m.descricao?'<span class="desc-line">'+esc(String(m.descricao).split('\n')[0])+'</span>':'')+'</span><span class="rr">'+(+m.valor?'<b>'+fmtMoney(m.valor)+'</b><small>novo salário</small>':'')+'</span>',m.tipo==='Desligamento'?'bad':m.tipo==='Férias'||m.tipo==='Afastamento'?'warn':'info')).join('')+'</ul>';
}
function dpEsc(people){
  const ws=S.dpWeek||weekStart(todayISO());const days=[0,1,2,3,4,5,6].map(i=>addDays(ws,i));const t0=todayISO();
  let h='<div class="toolbar"><div class="seg"><button data-dp-week="-7" aria-label="Semana anterior">‹</button><button class="on">'+esc(days[0].slice(8)+'/'+days[0].slice(5,7)+' a '+days[6].slice(8)+'/'+days[6].slice(5,7))+'</button><button data-dp-week="7" aria-label="Próxima semana">›</button></div>'+(ws!==weekStart(t0)?'<button class="btn sm ghost" data-dp-week="0">Esta semana</button>':'')+'<span class="grow"></span><button class="btn sm" data-new-rec="dp-esc">Nova escala</button></div>';
  const act=people.filter(p=>isActive(p.id));
  h+='<div class="tbl-wrap"><table class="week"><thead><tr><th>Pessoa</th>'+days.map(d=>{const dt=new Date(d+'T12:00:00');return '<th class="c'+(d===t0?' today':'')+'">'+DOW[dt.getDay()]+' '+dt.getDate()+'</th>';}).join('')+'</tr></thead><tbody>'+
    act.map(p=>'<tr data-person="'+esc(p.id)+'"><td class="nm">'+esc(p.nome)+'</td>'+days.map(d=>{const s=dayStatus(p.id,d);return '<td class="c'+(d===t0?' today':'')+'">'+(s?'<span class="cell st-'+s.k+'">'+esc(s.l)+'</span>':'<span class="dim">—</span>')+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>';
  const es=recs('dp-esc').filter(e=>people.some(p=>p.id===e.pessoa)).sort((a,b)=>refName('equipe',a.pessoa).localeCompare(refName('equipe',b.pessoa),'pt'));
  h+='<div class="sec-h" style="margin-top:6px"><h3>Escalas cadastradas</h3><span class="cnt">'+es.length+'</span></div>';
  h+=es.length?'<ul class="list">'+es.map(e=>rowBtn('dp-esc',e,'<span style="min-width:0"><span class="tt">'+esc(refName('equipe',e.pessoa))+'</span><span class="mm"><span class="tag">'+esc(escalaText(e))+'</span><span class="tag">Desde '+esc(fmtDateFull(e.inicio))+(e.fim?' até '+esc(fmtDateFull(e.fim)):'')+'</span>'+(e.local?'<span class="tag">'+esc(refName('casas',e.local))+'</span>':'')+(e.link?'<span class="tag info">Documento anexado</span>':'')+'</span></span><span class="rr"></span>','info')).join('')+'</ul>'
    :'<ul class="list"><li><div class="empty"><b>Nenhuma escala</b>Cadastre a escala de cada pessoa para ver quem trabalha em cada dia.</div></li></ul>';
  return h;
}
function byYear(rows,fn){const cy=String(new Date().getFullYear());const g={};rows.forEach(r=>{const y=String(r.data||'').slice(0,4)||'—';(g[y]=g[y]||[]).push(r);});const ys=Object.keys(g).sort().reverse();const open=ys.includes(cy)?cy:ys.filter(y=>y<=cy)[0]||ys[ys.length-1];
  return ys.map(y=>{const ul='<ul class="list">'+g[y].map(fn).join('')+'</ul>';const hd=esc(y)+' · '+g[y].length;return y===open?'<div class="dem-sub-h">'+hd+'</div>'+ul:'<details style="margin-top:6px"><summary class="dem-sub-h" style="cursor:pointer">'+hd+'</summary>'+ul+'</details>';}).join('');}
function dpOc(ids,SEARCH){
  const f=S.dpOcTipo;const ymNow=ymOf(todayISO());if(S.dpOcMes==null)S.dpOcMes=ymNow;
  const base=recs('dp-oc').filter(o=>ids.has(o.pessoa)&&(!S.dpFp||o.pessoa===S.dpFp));
  const meses=[...new Set(base.map(o=>String(o.data||'').slice(0,7)).filter(Boolean).concat([ymNow]))].sort().reverse();
  const q=!!(S.dpF.q||f||S.dpFp);const mes=q?'':S.dpOcMes;
  const rows=base.filter(o=>(!f||o.tipo===f)&&(!mes||String(o.data||'').startsWith(mes))).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  let h='<div class="toolbar">'+selHtml('dp-oc-mes',S.dpOcMes,[['','Todos os meses']].concat(meses.map(m=>[m,fmtYm(m)])),'Mês')+dpPessoaSel(ids)+selHtml('dp-oc-tipo',f,[['','Todos os tipos']].concat(REC['dp-oc'].fields[1].opts.map(o=>[o,o])),'Tipo de ocorrência')+'<span class="hint" style="margin-left:6px">'+rows.length+(mes?' em '+esc(fmtYm(mes)):' no total')+(q&&S.dpOcMes?' · busca, pessoa e tipo consideram todos os meses':'')+'</span>'+(SEARCH||'')+'</div>';
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhuma ocorrência</b>Atestados, faltas, atrasos e advertências aparecem aqui.</div></li></ul>';
  return h+'<ul class="list">'+rows.map(o=>rowBtn('dp-oc',o,'<span style="min-width:0"><span class="tt">'+esc(refName('equipe',o.pessoa))+' · '+esc(o.tipo)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(o.data))+'</span>'+(+o.dias?'<span class="tag warn">'+esc(o.dias)+' dia'+(+o.dias>1?'s':'')+'</span>':'')+filesHtml(o.anexos)+'</span>'+(o.descricao?'<span class="desc-line">'+esc(String(o.descricao).split('\n')[0])+'</span>':'')+'</span><span class="rr"></span>',o.tipo==='Advertência'||o.tipo==='Falta'?'bad':o.tipo==='Elogio'?'ok':'warn')).join('')+'</ul>';
}
function fichaHtml(pid){
  const p=personById(pid);const t0=todayISO();const sal=salarioAtual(pid);const hist=salaryHist(pid);
  const pags=recs('dp-pag').filter(x=>x.pessoa===pid).sort((a,b)=>String(b.competencia).localeCompare(String(a.competencia))||String(a.tipo).localeCompare(String(b.tipo)));
  const ocs=recs('dp-oc').filter(x=>x.pessoa===pid).sort((a,b)=>String(b.data).localeCompare(String(a.data)));
  const movs=movsOf(pid).slice().reverse();const e=escalaOf(pid,t0);const s=dayStatus(pid,t0);
  const ano=String(new Date().getFullYear());const pagoAno=pags.filter(x=>x.status==='Pago'&&String(x.competencia).startsWith(ano)).reduce((a,x)=>a+(+x.valor||0),0);
  const week=[0,1,2,3,4,5,6].map(i=>addDays(weekStart(t0),i));
  const eNext=e?null:recs('dp-esc').filter(x=>x.pessoa===pid&&x.inicio&&x.inicio>t0).sort((a,b)=>String(a.inicio).localeCompare(String(b.inicio)))[0];
  const escNote=e&&e.inicio&&e.inicio>week[0]?' · vale a partir de '+fmtDateFull(e.inicio):eNext?' · escala cadastrada começa em '+fmtDateFull(eNext.inicio):'';
  let h='<div class="wrap"><div class="back-row"><button class="back-home" data-person="">‹ Voltar para a equipe</button></div>';
  h+='<div class="plan-hero"><div style="display:flex;gap:14px;align-items:center"><span class="avatar lg">'+esc(initials(p.nome))+'</span><div><h2>'+esc(p.nome)+'</h2><p>'+esc([p.relacao,p.vinculo,p.local?refName('casas',p.local):'',p.executivo?'Ligado(a) a '+EXEC[p.executivo]:'',p.esocial?'eSocial em nome de '+EXEC[p.esocial]:'',p.vt==='Sim'?'VT'+(+p.vtValor?' '+fmtMoney(p.vtValor)+'/mês':''):''].filter(Boolean).join(' · ')||'Complete o cadastro')+(p.contato?' · '+esc(p.contato):'')+'</p></div></div>'+
    '<div class="acts">'+subDrive(p,'dp')+'<button class="btn" data-edit="pessoas:'+esc(pid)+'">Editar cadastro</button><button class="btn primary" data-new-rec="dp-pag" data-pre-pessoa="'+esc(pid)+'">Lançar pagamento</button></div></div>';
  h+='<div class="kpis">'+kpi(remLabel(p),sal!=null?fmtMoney(sal):'—','',hist.length>1?'desde '+fmtDateFull(hist.filter(m=>m.data<=t0).slice(-1)[0].data):'')+kpi('Admissão',admissao(pid)?fmtDateFull(admissao(pid)):semAdmissao(pid)?'Não informada':'—')+kpi('Pago em '+ano,fmtMoney(pagoAno),'pos')+kpi('Hoje',s?s.l:(isActive(pid)?'—':'Desligado(a)'))+kpi('Ocorrências em '+ano,String(ocs.filter(o=>String(o.data||'').startsWith(ano)).length),'',ocs.filter(o=>String(o.data||'').slice(0,7)===ymOf(t0)).length+' neste mês')+'</div>';
  h+='<div class="grid2"><div style="display:flex;flex-direction:column;gap:22px">';
  h+='<div><div class="sec-h"><h3>Pagamentos</h3><span class="cnt">'+pags.length+'</span></div>'+(pags.length?'<ul class="list">'+pags.slice(0,24).map(r=>rowBtn('dp-pag',r,'<span style="min-width:0"><span class="tt">'+esc(fmtYm(r.competencia))+' · '+esc(r.tipo||'Pagamento')+'</span><span class="mm"><span class="tag '+(ST_TONE[r.status]||'')+'">'+esc(r.status||'Previsto')+'</span>'+(r.dataPag?'<span class="tag">'+esc(fmtDateFull(r.dataPag))+'</span>':'')+filesHtml(r.anexos)+'</span></span><span class="rr"><b>'+fmtMoney(r.valor)+'</b></span>',r.status==='Pago'?'ok':'warn')).join('')+'</ul>':'<ul class="list"><li><div class="empty">Nenhum pagamento lançado.</div></li></ul>')+'</div>';
  h+='<div><div class="sec-h"><h3>Ocorrências e atestados</h3><span class="cnt">'+ocs.length+'</span><span class="act"><button class="btn sm ghost" data-new-rec="dp-oc" data-pre-pessoa="'+esc(pid)+'">Registrar</button></span></div>'+(ocs.length?byYear(ocs,o=>rowBtn('dp-oc',o,'<span style="min-width:0"><span class="tt">'+esc(o.tipo)+' · '+esc(fmtDateFull(o.data))+'</span><span class="mm">'+(+o.dias?'<span class="tag warn">'+esc(o.dias)+' dia(s)</span>':'')+filesHtml(o.anexos)+'</span>'+(o.descricao?'<span class="desc-line">'+esc(String(o.descricao).split('\n')[0])+'</span>':'')+'</span><span class="rr"></span>','warn')):'<ul class="list"><li><div class="empty">Nenhuma ocorrência.</div></li></ul>')+'</div>';
  h+='</div><div style="display:flex;flex-direction:column;gap:22px">';
  h+='<div class="panel"><div class="sec-h"><h3>Escala</h3><span class="act"><button class="btn sm ghost" data-'+(e?'rec="dp-esc:'+esc(e.id)+'"':'new-rec="dp-esc" data-pre-pessoa="'+esc(pid)+'"')+'>'+(e?'Editar':'Cadastrar')+'</button></span></div><p class="hint" style="margin:0 0 10px">'+esc(escalaText(e)+escNote)+'</p>'+(escLink(e)?'<p style="margin:0 0 10px">'+escLink(e)+'</p>':'')+
     '<div class="mini-week">'+week.map(d=>{const st=dayStatus(pid,d);const dt=new Date(d+'T12:00:00');return '<div class="'+(d===t0?'today':'')+'"><span>'+DOW[dt.getDay()]+'</span>'+(st?'<i class="st-'+st.k+'" title="'+esc(st.l)+'"></i>':'<i></i>')+'</div>';}).join('')+'</div></div>';
  h+=pacoteHtml(p);
  if(PRES_UN[p.remun]){const ymc=ymOf(t0);h+='<div class="panel"><div class="sec-h"><h3>'+(p.remun==='Por sessão'?'Sessões':'Diárias pagas')+' de '+esc(fmtYm(ymc))+'</h3></div>'+presHtml(p,ymc)+'</div>';}
  h+='<div><div class="sec-h"><h3>Histórico de remuneração</h3></div>'+(hist.length?'<ul class="list">'+hist.slice().reverse().map((m,i,arr)=>{const prev=arr[i+1];const pct=prev&&+prev.valor?((+m.valor/ +prev.valor-1)*100):null;return rowBtn('dp-mov',m,'<span style="min-width:0"><span class="tt">'+esc(fmtDateFull(m.data))+'</span><span class="mm"><span class="tag">'+esc(m.tipo)+'</span>'+(pct!=null?'<span class="tag '+(pct>=0?'ok':'bad')+'">'+(pct>=0?'+':'')+pct.toFixed(1).replace('.',',')+'%</span>':'')+'</span></span><span class="rr"><b>'+fmtMoney(m.valor)+'</b></span>','info');}).join('')+'</ul>':'<ul class="list"><li><div class="empty">Registre a admissão com o valor para começar o histórico. Se a data de admissão não é conhecida, use o tipo “Registro inicial”.<br><button class="btn sm" data-new-rec="dp-mov" data-pre-pessoa="'+esc(pid)+'" style="margin-top:8px">Registrar</button></div></li></ul>')+'</div>';
  h+='<div><div class="sec-h"><h3>Movimentações</h3><span class="act"><button class="btn sm ghost" data-new-rec="dp-mov" data-pre-pessoa="'+esc(pid)+'">Registrar</button></span></div>'+(movs.length?byYear(movs,m=>rowBtn('dp-mov',m,'<span style="min-width:0"><span class="tt">'+esc(m.tipo)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(m.data))+(m.dataFim?' a '+esc(fmtDateFull(m.dataFim)):'')+'</span>'+filesHtml(m.anexos)+'</span></span><span class="rr"></span>','info')):'<ul class="list"><li><div class="empty">Nenhuma movimentação.</div></li></ul>')+'</div>';
  h+='</div></div></div>';
  return h;
}
/* =================== Indicadores de DP =================== */
const isCLT=p=>/CLT/.test((p&&p.vinculo)||'');
const EXK=e=>e==='fernando'||e==='leticia'?e:'nd';
const EXL={fernando:'Fernando',leticia:'Leticia',nd:'Sem executivo'};
function custoPrev(p,ym){
  if(!isActive(p.id))return null;
  if(p.rateio&&typeof p.rateio==='object'&&Object.keys(p.rateio).length){const o={};Object.entries(p.rateio).forEach(([k,v])=>{o[EXK(k)]=(o[EXK(k)]||0)+(+v||0);});return o;}
  const v=salarioAtual(p.id);if(v==null)return null;let tot=v;
  if(p.remun==='Por sessão'||p.remun==='Por diária'){const n=presDias(p,ym).length;
    if(n)tot=v*n;else{const pg=recs('dp-pag').filter(x=>x.pessoa===p.id&&/Diária|Sessões/.test(x.tipo||''));const last=pg.map(x=>x.competencia).sort().pop();tot=last?pg.filter(x=>x.competencia===last).reduce((a,x)=>a+(+x.valor||0),0):0;}}
  return {[EXK(p.executivo)]:tot};
}
function custoSplit(ym){const out={fernando:{v:0,n:[]},leticia:{v:0,n:[]},nd:{v:0,n:[]}};
  equipe().forEach(p=>{const c=custoPrev(p,ym);if(!c)return;Object.entries(c).forEach(([k,v])=>{if(!v)return;out[k].v+=v;out[k].n.push({p,v});});});return out;}
function avos13(pid,year){const adm=admissao(pid);if(!adm)return 12;const y=adm.slice(0,4);if(y>String(year))return 0;if(y<String(year))return 12;
  const m=+adm.slice(5,7),d=+adm.slice(8,10);return Math.max(0,12-m+(d<=16?1:0));}
const recebe13=p=>p.recebe13==='Sim'||(isCLT(p)&&p.recebe13!=='Não');
function decimo(year){return equipe().filter(p=>isActive(p.id)&&recebe13(p)).map(p=>{const v=salarioAtual(p.id);if(v==null)return null;const av=avos13(p.id,year);const tot=Math.round(v*av/12*100)/100;
  const pg=recs('dp-pag').filter(x=>x.pessoa===p.id&&x.tipo==='13º salário'&&String(x.competencia||'').startsWith(String(year)));
  const pago=pg.filter(x=>x.status==='Pago').reduce((a,x)=>a+(+x.valor||0),0);
  return {p,av,tot,p1:Math.round(tot/2*100)/100,p2:Math.round((tot-tot/2)*100)/100,pago};}).filter(Boolean);}
const addYears=(d,n)=>(+d.slice(0,4)+n)+d.slice(4);
const dDiff=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
function feriasInfo(p){
  const adm=admissao(p.id);if(!adm||!isCLT(p)||!isActive(p.id))return null;const t0=todayISO();
  let k=0;while(addYears(adm,k+1)<=t0)k++;
  const curIni=addYears(adm,k);const proxDireito=addYears(adm,k+1);
  const fer=movsOf(p.id).filter(m=>m.tipo==='Férias');
  const dias=m=>m.dataFim&&m.dataFim>m.data?dDiff(m.data,m.dataFim)+1:30;
  let venc=null;
  if(k>=1){const ini=curIni,lim=addDays(addYears(curIni,1),-1);const fs=fer.filter(m=>m.data>=ini&&m.data<=lim);
    const usados=fs.filter(m=>m.data<=t0).reduce((a,m)=>a+dias(m),0),agend=fs.filter(m=>m.data>t0).reduce((a,m)=>a+dias(m),0);
    venc={per:addYears(adm,k-1).slice(0,4)+'/'+curIni.slice(2,4),usados:Math.min(30,usados),agend:Math.min(30-Math.min(30,usados),agend),falta:Math.max(0,30-usados-agend),lim,ult:fs.filter(m=>m.data<=t0).map(m=>m.data).pop()||'',progd:fs.filter(m=>m.data>t0).map(m=>m.data)[0]||''};}
  const prox=fer.filter(m=>m.data>t0).sort((a,b)=>a.data.localeCompare(b.data));
  return {adm,curIni,proxDireito,venc,prox,sal:salarioAtual(p.id)};
}
function ocResumo(a,b){const m={};recs('dp-oc').filter(o=>(o.tipo==='Falta'||o.tipo==='Atestado')&&o.data>=a&&o.data<=b).forEach(o=>{const r=m[o.pessoa]||(m[o.pessoa]={pid:o.pessoa,f:0,fd:0,at:0,ad:0,last:''});const d=+o.dias||1;if(o.tipo==='Falta'){r.f++;r.fd+=d;}else{r.at++;r.ad+=d;}if(o.data>r.last)r.last=o.data;});
  return Object.values(m).sort((x,y)=>(y.fd+y.ad)-(x.fd+x.ad));}
function pacoteOf(p){const pac=+p.pacoteDiarias;if(!pac)return null;const t0=todayISO();const ini=p.pacoteInicio||ymOf(t0);const cur=ymOf(t0);const meses=[];
  let ym=ini;while(ym<=cur){meses.push(ym);const [y,m]=ym.split('-').map(Number);ym=m===12?(y+1)+'-01':y+'-'+pad2(m+1);}
  const dm=p.diarias||{};let saldo=0,pend=0;const rows=meses.map(ym=>{const v=dm[ym];const has=v!==undefined&&v!==null&&v!=='';if(has&&ym<cur)saldo+=pac-(+v);else if(!has&&ym<cur)pend++;return {ym,v:has?+v:null,esc:presDias(p,ym).length,dif:has?pac-(+v):null};});
  return {pac,rows,saldo,pend,cur:rows.find(r=>r.ym===cur)};}
const pacSaldoTxt=s=>s>0?s+' diária(s) a usar':s<0?(-s)+' folga(s) para ela':'zerado';
function pacoteHtml(p,compact){const k=pacoteOf(p);if(!k)return '';
  const sl=pacSaldoTxt(k.saldo);
  return '<div class="panel"><div class="sec-h"><h3>Pacote de diárias'+(compact?' · '+esc(String(p.nome).split(' ')[0]):'')+'</h3><span class="act"><span class="tag '+(k.saldo>0?'warn':k.saldo<0?'ok':'')+'">Saldo: '+esc(sl)+'</span></span></div>'+
    '<p class="hint" style="margin:0 0 10px">Pacote mensal de '+k.pac+' diárias. O que ela não cumpre no mês fica de saldo para usar depois, por exemplo nas férias da Neiva ou em folgas das outras. O que ela faz a mais vira folga para ela. Lance as diárias feitas conforme a escala em PDF que ela devolve; o mês atual só entra no saldo quando fechar.</p>'+
    '<table class="pac"><thead><tr><th>Mês</th><th class="c">Feitas</th><th class="c">Saldo do mês</th></tr></thead><tbody>'+
    k.rows.slice().reverse().map(r=>{const isCur=k.cur&&r.ym===k.cur.ym;const dif=r.v==null?null:k.pac-r.v;
      return '<tr><td>'+esc(fmtYm(r.ym))+'</td><td class="c"><input class="pac-in" type="number" min="0" max="31" inputmode="numeric" data-pac-p="'+esc(p.id)+'" data-pac-ym="'+r.ym+'" value="'+(r.v!=null?r.v:'')+'" placeholder="—" aria-label="Diárias feitas em '+esc(fmtYm(r.ym))+'"> <small class="sub">de '+k.pac+'</small></td><td class="c">'+
      (isCur?'<small class="sub">'+(dif==null?'mês em andamento':dif>0?'faltam '+dif+' (em andamento)':dif<0?(-dif)+' a mais (em andamento)':'pacote cumprido')+'</small>':dif==null?'<span class="sub">—</span>':dif>0?'<b class="warn">'+dif+'</b> <small class="sub">a usar</small>':dif<0?'<b class="pos">'+(-dif)+'</b> <small class="sub">de folga</small>':'0')+'</td></tr>';}).join('')+
    '</tbody></table>'+(k.pend?'<p class="hint" style="margin:8px 0 0">'+k.pend+' mês(es) já fechado(s) sem lançamento.</p>':'')+'</div>';}
function feriasProx(){const t0=todayISO();const out=[];equipe().forEach(p=>{const f=feriasInfo(p);if(!f)return;f.prox.forEach(m=>{const dias=m.dataFim&&m.dataFim>m.data?dDiff(m.data,m.dataFim)+1:30;out.push({p,m,dias,em:dDiff(t0,m.data),pagar:addDays(m.data,-2),v:f.sal?Math.round(f.sal*dias/30*4/3*100)/100:null});});});return out.sort((a,b)=>a.m.data.localeCompare(b.m.data));}
function dpEventos(){const t0=todayISO();const y=+t0.slice(0,4);
  const ev=[];const dc=decimo(y);
  if(dc.length&&t0<=y+'-12-20'){
    if(t0<=y+'-11-30')ev.push({pay:1,d:y+'-11-30',t:'13º salário · 1ª parcela',v:dc.reduce((a,r)=>a+r.p1,0),s:dc.map(r=>String(r.p.nome).split(' ')[0]+(r.av<12?' ('+r.av+'/12)':'')).join(', ')+'.'});
    ev.push({pay:1,d:y+'-12-20',t:'13º salário · 2ª parcela',v:dc.reduce((a,r)=>a+r.p2,0),s:'INSS e IR são descontados nesta parcela.'});}
  equipe().forEach(p=>{const f=feriasInfo(p);if(!f)return;const nm=String(p.nome).split(' ')[0];
    f.prox.forEach(m=>{const dias=m.dataFim&&m.dataFim>m.data?dDiff(m.data,m.dataFim)+1:30;ev.push({p,pay:1,d:m.data,t:'Férias '+nm+' · '+fmtDateFull(m.data)+(m.dataFim?' a '+fmtDateFull(m.dataFim):''),v:f.sal?Math.round(f.sal*dias/30*4/3*100)/100:null,s:dias+' dias. Pagar até '+fmtDateFull(addDays(m.data,-2))+'.'});});
    if(f.venc&&f.venc.falta>0)ev.push({p,d:f.venc.lim,t:'Limite das férias de '+nm+' ('+f.venc.per+')',v:null,s:f.venc.falta+' dia(s) ainda sem data. Depois desse dia, as férias são pagas em dobro.',bad:dDiff(t0,f.venc.lim)<=90});
  });
  const MV={'Reajuste salarial':'Reajuste','Dissídio':'Dissídio','Alteração contratual':'Alteração contratual','Mudança de função':'Mudança de função','Afastamento':'Afastamento','Desligamento':'Desligamento','Admissão':'Admissão','Outro':'Movimentação'};
  recs('dp-mov').filter(m=>m.data>t0&&m.tipo!=='Férias'&&m.tipo!=='Registro inicial').forEach(m=>{const p=personById(m.pessoa);if(!p)return;const nm=String(p.nome).split(' ')[0];const ant=salarioAtual(p.id);
    const sal=(m.tipo==='Reajuste salarial'||m.tipo==='Dissídio')&&+m.valor;
    ev.push({p,d:m.data,mov:m.id,t:(MV[m.tipo]||m.tipo)+' · '+nm,v:sal?+m.valor:null,s:sal?'Novo valor a partir de '+fmtDateFull(m.data)+'.':String(m.descricao||m.obs||'').split('\n')[0].slice(0,140)});});
  return ev.sort((a,b)=>a.d.localeCompare(b.d));
}
function feriasVencer(n){const t0=todayISO();return equipe().map(p=>({p,f:feriasInfo(p)})).filter(x=>x.f&&x.f.venc&&x.f.venc.falta>0&&x.f.venc.lim>=t0&&dDiff(t0,x.f.venc.lim)<=n).map(x=>({p:x.p,lim:x.f.venc.lim,falta:x.f.venc.falta}));}
function dpObrig(n){const t0=todayISO();return dpEventos().filter(e=>(/^13º/.test(e.t)||e.mov)&&e.d>=t0&&dDiff(t0,e.d)<=n);}
function dpAvisos(){const t0=todayISO();const y=+t0.slice(0,4);const av=[];const nm=p=>String(p.nome).split(' ')[0];
  feriasProx().filter(x=>x.em<=60).forEach(x=>av.push({d:x.m.data,bad:x.em<=15,t:'Férias de '+nm(x.p)+' começam em '+fmtDateFull(x.m.data)+' (em '+x.em+' dia'+(x.em===1?'':'s')+')'+'. Pagar até '+fmtDateFull(x.pagar)+' e combinar a cobertura.'}));
  equipe().forEach(p=>{const f=feriasInfo(p);if(f&&f.venc&&f.venc.falta>0&&dDiff(t0,f.venc.lim)<=60)av.push({d:f.venc.lim,bad:true,t:nm(p)+' tem '+f.venc.falta+' dia(s) de férias sem data e precisa tirar até '+fmtDateFull(f.venc.lim)+'. Depois disso, paga em dobro.'});});
  const dc=decimo(y);if(dc.length){[[y+'-11-30','1ª parcela do 13º',dc.reduce((a,r)=>a+r.p1,0)],[y+'-12-20','2ª parcela do 13º',dc.reduce((a,r)=>a+r.p2,0)]].forEach(([d,t,v])=>{const e=dDiff(t0,d);if(e>=0&&e<=30)av.push({d,bad:e<=7,t:t+' vence em '+fmtDateFull(d)+' (em '+e+' dia'+(e===1?'':'s')+') para '+dc.length+' pessoa(s).'});});}
  dpEventos().filter(e=>e.mov&&dDiff(t0,e.d)<=30).forEach(e=>av.push({d:e.d,bad:false,t:e.t+' em '+fmtDateFull(e.d)+'.'}));
  return av.sort((a,b)=>a.d.localeCompare(b.d));}
function dpAvisosHtml(){const av=dpAvisos();if(!av.length)return '';return '<div class="dp-av">'+av.map(a=>'<div class="'+(a.bad?'bad':'')+'"><b>'+(a.bad?'Atenção':'Aviso')+'</b><span>'+esc(a.t)+'</span></div>').join('')+'</div>';}
function dpIndKpis(active,foraL){const t0=todayISO();const y=t0.slice(0,4);
  const oc=ocResumo(y+'-01-01',t0);const fd=oc.reduce((a,r)=>a+r.fd,0),ad=oc.reduce((a,r)=>a+r.ad,0);
  const dc=decimo(+y);const d1=dc.reduce((a,r)=>a+r.p1,0),d2=dc.reduce((a,r)=>a+r.p2,0);
  const fp=feriasProx();const f60=fp.filter(x=>x.em<=60);const fn=fp[0];
  const pacP=equipe().find(p=>+p.pacoteDiarias&&isActive(p.id));const pk=pacP&&pacoteOf(pacP);
  const nm=p=>String(p.nome).split(' ')[0];
  return '<div class="kpis">'+kpi('Ausentes hoje',String(foraL.length),foraL.length?'warn':'',foraL.length?foraL.map(x=>esc(nm(x.p))+' ('+esc(x.s.l.toLowerCase())+')').join(', '):'ninguém de férias, afastado ou de atestado')+
    (()=>{const o=dpObrig(30);return kpi('Obrigações em 30 dias',String(o.length),o.length?'warn':'',o.length?o.map(e=>esc(e.t.replace(' · ',' ')+' em '+fmtDateFull(e.d))).join(', '):'13º, dissídio e movimentações');})()+
    (()=>{const fv=feriasVencer(60);const n=f60.length+fv.length;const parts=f60.map(x=>esc(nm(x.p))+' sai em '+esc(fmtDateFull(x.m.data))).concat(fv.map(x=>esc(nm(x.p))+' vence em '+esc(fmtDateFull(x.lim))));
      return kpi('Férias em 60 dias',String(n),fv.length?'neg':n?'warn':'',n?(f60.length+' programada(s) · '+fv.length+' a vencer<br>'+parts.join(', ')):(fn?'próximas: '+esc(nm(fn.p))+' em '+esc(fmtDateFull(fn.m.data)):'nada programado nem a vencer'));})()+
    kpi('Faltas e atestados em '+y,String(fd+ad)+' dia(s)',fd+ad?'warn':'',fd+' de falta · '+ad+' de atestado').replace('<div class="kpi">','<div class="kpi click" role="button" tabindex="0" data-dp-tab="ind" data-dp-go="fa" title="Ver quem e quando">').replace('</small></div>','</small><small class="lnk-h">ver quais ›</small></div>')+
    (pk?kpi(nm(pacP)+' em '+fmtYm(pk.cur?pk.cur.ym:ymOf(t0)),(pk.cur&&pk.cur.v!=null?pk.cur.v:'—')+' de '+pk.pac,'','saldo: '+pacSaldoTxt(pk.saldo)+(pk.pend?' · '+pk.pend+' mês(es) sem lançamento':'')):kpi('Equipe ativa',String(active.length)))+'</div>';}
function dpInd(){const t0=todayISO();const ym=ymOf(t0);const y=+t0.slice(0,4);let h='';
  const ev=dpEventos();
  h+='<div class="dp-ind"><div class="panel"><div class="sec-h"><h3>Pela frente</h3><span class="cnt">'+ev.length+'</span></div>'+(ev.length?'<div class="dp-sc"><ul class="list">'+ev.map(e=>'<li>'+(e.mov?'<button class="item" data-rec="dp-mov:'+esc(e.mov)+'">':'<div class="item" style="cursor:default">')+'<span class="sev"></span><span style="min-width:0"><span class="tt">'+esc(e.t)+'</span><span class="mm"><span class="tag '+(e.bad?'bad':'')+'">'+esc(fmtDateFull(e.d))+'</span><span class="desc-line">'+esc(e.s)+'</span></span></span><span class="rr"></span>'+(e.mov?'</button>':'</div>')+'</li>').join('')+'</ul></div>':'<ul class="list"><li><div class="empty">Nada previsto.</div></li></ul>')+'</div>';
  // faltas e atestados
  const a=y+'-01-01';const oc=ocResumo(a,t0);const oc12=ocResumo(addDays(t0,-365),t0);const m12={};oc12.forEach(r=>m12[r.pid]=r);
  const lista=recs('dp-oc').filter(o=>(o.tipo==='Falta'||o.tipo==='Atestado')&&String(o.data||'').startsWith(String(y))).sort((x,z)=>String(z.data).localeCompare(String(x.data)));
  let hfa='<div class="panel wide" id="dp-fa"><div class="sec-h"><h3>Faltas e atestados em '+y+'</h3><span class="cnt">'+lista.length+'</span><span class="hint" style="margin-left:8px">últimas 3</span><span class="act"><button class="btn sm ghost" data-dp-tab="oc">Ver todas as ocorrências ›</button></span></div>'+
    (lista.length?'<div class="fa-grid"><div><table class="pac"><thead><tr><th>Pessoa</th><th class="c">Faltas</th><th class="c">Atestados</th><th class="c">12 meses</th></tr></thead><tbody>'+
      [...new Set(oc.map(r=>r.pid).concat(oc12.map(r=>r.pid)))].map(pid=>{const r=oc.find(x=>x.pid===pid)||{f:0,fd:0,at:0,ad:0};const q=m12[pid]||{fd:0,ad:0};
        return '<tr><td><button class="lnk" data-person="'+esc(pid)+'">'+esc(refName('equipe',pid).split(' ')[0])+'</button></td><td class="c">'+(r.fd?r.fd+' dia(s)':'—')+'</td><td class="c">'+(r.ad?r.ad+' dia(s) <small class="sub">('+r.at+')</small>':'—')+'</td><td class="c">'+((q.fd+q.ad)||'—')+'</td></tr>';}).join('')+'</tbody></table></div>'+
      '<ul class="list">'+lista.slice(0,3).map(o=>rowBtn('dp-oc',o,'<span style="min-width:0"><span class="tt">'+esc(refName('equipe',o.pessoa))+' · '+esc(o.tipo)+'</span><span class="mm"><span class="tag">'+esc(fmtDateFull(o.data))+'</span>'+(+o.dias?'<span class="tag warn">'+esc(o.dias)+' dia'+(+o.dias>1?'s':'')+'</span>':'')+filesHtml(o.anexos)+'</span>'+(o.descricao?'<span class="desc-line">'+esc(String(o.descricao).split('\n')[0])+'</span>':'')+'</span><span class="rr"></span>',o.tipo==='Falta'?'bad':'warn')).join('')+'</ul></div>':'<p class="hint">Nenhuma falta ou atestado registrado em '+y+'.</p>')+'</div>';
  // pacotes
  let hpc='';equipe().filter(p=>+p.pacoteDiarias&&isActive(p.id)).forEach(p=>{hpc+=pacoteHtml(p,true);});
  // ferias status
  const fi=equipe().map(p=>({p,f:feriasInfo(p)})).filter(x=>x.f);
  const hfv=fi.length?'<div class="panel"><div class="sec-h"><h3>Férias por funcionária CLT</h3></div><table class="pac"><thead><tr><th>Pessoa</th><th>Férias a tirar</th><th>Direito a novas férias em</th></tr></thead><tbody>'+fi.map(({p,f})=>'<tr><td><button class="lnk" data-person="'+esc(p.id)+'">'+esc(p.nome.split(' ')[0])+'</button></td><td>'+(f.venc?esc(f.venc.per)+': '+(f.venc.falta?'<b class="warn">'+f.venc.falta+' dia(s) sem data</b><br><small class="sub">tirar até '+esc(fmtDateFull(f.venc.lim))+'</small>':f.venc.progd&&!f.venc.ult?'<b>Programadas</b> em '+esc(fmtDateFull(f.venc.progd))+(f.venc.agend?'':''):f.venc.progd?'tiradas em '+esc(fmtDateFull(f.venc.ult))+' <small class="sub">(+ programadas '+esc(fmtDateFull(f.venc.progd))+')</small>':'<b class="pos">Tiradas</b> em '+esc(fmtDateFull(f.venc.ult))):'<span class="sub">Ainda no 1º ano</span>')+'</td><td>'+esc(fmtDateFull(f.proxDireito))+'</td></tr>').join('')+'</tbody></table><p class="hint" style="margin:8px 0 0">Calculado pela data de admissão e pelas férias registradas em Movimentações. Férias vindas do eSocial sem data de fim contam como 30 dias.</p></div>':'';
  h+='<div class="dp-col">'+hfv+hpc+'</div>'+hfa+'</div>';return h;}
document.addEventListener('change',async e=>{const el=e.target.closest&&e.target.closest('[data-pac-ym]');if(!el||!S.db)return;
  const p=personById(el.dataset.pacP);if(!p)return;const ym=el.dataset.pacYm;const raw=el.value.trim();const v=raw===''?null:Math.max(0,Math.round(+raw));
  if(raw!==''&&isNaN(+raw)){toast('Número inválido.');return;}
  const dm=Object.assign({},p.diarias||{});if(v==null)delete dm[ym];else dm[ym]=v;
  try{await S.db.collection('cad-pessoas').doc(p.id).update({diarias:dm,atualizadoEm:new Date().toISOString()});toast('Diárias de '+fmtYm(ym)+(v==null?' removidas':' salvas'));}
  catch(err){toast('Não foi possível salvar agora. Tente de novo.');}});

function diasNoMes(pid,ym){const [y,m]=ym.split('-').map(Number);const n=new Date(y,m,0).getDate();let c=0;for(let d=1;d<=n;d++){const ds=ym+'-'+pad2(d);if(worksOn(escalaOf(pid,ds),ds)===true)c++;}return c;}
async function gerarFolha(){
  if(!S.db)return;const ym=S.dpMonth;const ids=new Set(dpFiltered().map(p=>p.id));const now=new Date().toISOString();
  const items=[],semEsc=[];
  equipe().filter(p=>ids.has(p.id)&&isActive(p.id)).forEach(p=>{
    if(p.vt==='Sim'&&+p.vtValor&&!recs('dp-pag').some(x=>x.pessoa===p.id&&x.competencia===ym&&x.tipo==='Vale-transporte'))items.push({pessoa:p.id,competencia:ym,tipo:'Vale-transporte',valor:+p.vtValor,status:'Previsto',dataPag:'',forma:'',obs:'Valor do cadastro',anexos:[],criadoEm:now,atualizadoEm:now});
    const v=salarioAtual(p.id);if(v==null)return;const rm=p.remun||'Salário mensal';if(rm==='Por diária')return;const tipo=FOLHA_T[rm]||'Salário';
    if(recs('dp-pag').some(x=>x.pessoa===p.id&&x.competencia===ym&&x.tipo===tipo))return;
    let valor=v,obs='',diasTrab=null;
    if(rm==='Por sessão'||rm==='Por diária'){const n=diasNoMes(p.id,ym);if(!n){semEsc.push(String(p.nome||'').split(' ')[0]);return;}
      valor=Math.round(n*v*100)/100;diasTrab=presDias(p,ym);obs=n+(rm==='Por sessão'?(n>1?' sessões':' sessão'):(n>1?' diárias':' diária'))+' × '+fmtMoney(v)+', pela escala. Ajuste se houve falta ou dia a mais.';}
    const it={pessoa:p.id,competencia:ym,tipo,valor,status:'Previsto',dataPag:'',forma:'',obs,anexos:[],criadoEm:now,atualizadoEm:now};if(diasTrab)it.diasTrab=diasTrab;items.push(it);});
  if(!items.length){toast(semEsc.length?'Sem escala no mês para '+semEsc.join(', ')+'.':'Nada a gerar: todos já têm a remuneração lançada em '+fmtYm(ym)+' ou não têm valor cadastrado.');return;}
  try{for(const it of items)await S.db.collection('dp-pag').doc(uid('pag')).set(it);
    toast(items.length+' pagamento(s) previsto(s) em '+fmtYm(ym)+(semEsc.length?' · sem escala: '+semEsc.join(', '):''));}
  catch(e){toast('Não foi possível gerar agora. Tente de novo em instantes.');}
}

