"use strict";
/* =================== Facilities =================== */
function facMenu(){
  const t0=todayISO();const items=[{l:'Visão geral',nav:'fac|geral|',on:!S.facF.ativo&&!S.facF.tipoAtivo&&S.facTab!=='venc',ic:MIC.geral},{l:'Vencimentos e recorrências',nav:'fac|venc|',on:!S.facF.ativo&&!S.facF.tipoAtivo&&S.facTab==='venc',ic:MIC.rec,cnt:recs('fac-rec').filter(recLate).length||'',alert:true}];
  const all=refRows('ativos').filter(facExecOk);
  [['Casa','Casas','casa'],['Carro','Carros','carro'],['Escritório','Escritórios','escr'],['Serviço','Serviços','serv'],['Outro','Outros','outro']].forEach(([t,l,ic])=>{const g=all.filter(a=>(a.tipo||'Outro')===t);if(!g.length)return;
    const kids=g.map(a=>{const aset=catById('c-'+a.id)?descendants('c-'+a.id):new Set();const op=[...S.tasks.values()].filter(x=>isOpen(x)&&aset.has(x.categoryId)).length;const late=recs('fac-rec').some(r=>r.ativo===a.id&&recLate(r));
      return {l:a.nome,nav:'fac|venc|'+a.id,on:S.facF.ativo===a.id,child:true,cnt:(op+recs('fac-rec').filter(r=>r.ativo===a.id&&recLate(r)).length)||'',alert:late};});
    items.push({l,nav:'fac|geral|tipo:'+t,on:S.facF.tipoAtivo===t&&!S.facF.ativo&&S.facTab!=='venc',ic:MIC[ic],cnt:kids.reduce((s,k)=>s+(+k.cnt||0),0)||'',alert:kids.some(k=>k.alert)});
    kids.forEach(k=>items.push(k));});
  items.push({add:'+ Adicionar item',attr:'data-add="ativos"'});
  return sideNav({mark:'FA',title:'Facilities',sub:'Casas, carros e escritórios',items});
}
function renderFac(){
  const el=$('#v-fac');const t0=todayISO();const ym=ymOf(t0);
  const all=recs('fac-ch');const facT=modTasks('p-fac');const open=facT.filter(isOpen);
  const late=open.filter(t=>t.due&&t.due<t0).length;
  if(S.facTab==='ch'||S.facTab==='ativos'||!S.facTab)S.facTab='geral';
  if(S.facF.ativo&&!ativoById(S.facF.ativo))S.facF.ativo='';
  if(S.facF.ativo&&catById('c-'+S.facF.ativo))S.demSub['p-fac']='c-'+S.facF.ativo;
  const custoMes=all.filter(c=>c.status==='Concluído'&&String(c.concluidoEm||'').slice(0,7)===ym).reduce((a,c)=>a+(+c.custo||0),0);
  const venc=recs('fac-rec');const vLate=venc.filter(recLate).length;const v30=venc.filter(r=>!r.encerrada&&r.proxima&&r.proxima>=t0&&r.proxima<=addDays(t0,30)).length;
  const it=S.facF.ativo&&ativoById(S.facF.ativo);let h='';
  if(it){
    h+='<div class="plan-hero"><div><h2>'+esc(it.nome)+'</h2><p>'+esc([it.tipo,it.ident,it.executivo?EXEC[it.executivo]:''].filter(Boolean).join(' · '))+'</p></div><div class="acts">'+subDrive(it,'fac')+'<button class="btn" data-edit="ativos:'+esc(it.id)+'">Editar cadastro</button><button class="btn primary" data-new-rec="fac-rec">Vencimento</button></div></div>';
    h+=demBlock('p-fac',null,{title:'Chamados',newLbl:'+ Abrir chamado',none:'Nenhum chamado',masc:true});
    h+='<div><div class="sec-h"><h3>Vencimentos e recorrências</h3></div>'+facVenc()+'</div>';
  }else if(S.facTab==='venc'){
    h+='<div class="plan-hero"><div><h2>Vencimentos e recorrências</h2><p>IPVA, licenciamento, seguros, revisões, dedetização e tudo que se repete.</p></div><div class="acts"><button class="btn primary" data-new-rec="fac-rec">Vencimento</button></div></div>';
    h+=facVenc();
  }else{
    h+='<div class="plan-hero"><div><h2>Facilities</h2><p>Chamados, vencimentos e serviços das casas, dos carros e dos escritórios.</p></div>'+
      '<div class="acts"><button class="btn primary" data-new-rec="fac-rec">Vencimento</button></div></div>';
    h+='<div class="kpis">'+kpi('Chamados abertos',String(open.length))+kpi('Com prazo vencido',String(late),late?'neg':'')+kpi('Vencimentos atrasados',String(vLate),vLate?'neg':'')+kpi('Vencem em 30 dias',String(v30),v30?'warn':'')+kpi('Custo em '+fmtYm(ym),fmtMoney(custoMes),'','serviços registrados')+'</div>';
    h+=demBlock('p-fac',null,{title:'Chamados',newLbl:'+ Abrir chamado',none:'Nenhum chamado',masc:true});
    h+='<div><div class="sec-h"><h3>Itens</h3></div>'+facAtivos()+'</div>';
  }
  el.innerHTML=sideWrap(facMenu(),h);
}
function facFiltersHtml(withStatus){
  const f=S.facF;
  return '<div class="filters">'+selHtml('facf-tipoAtivo',f.tipoAtivo,[['','Todos os tipos de item'],['Casa','Só casas'],['Carro','Só carros'],['Escritório','Só escritórios'],['Serviço','Só serviços']],'Tipo de ativo')+
    '<select class="sel" id="facf-ativo" aria-label="Item de Facilities"><option value="">'+(f.tipoAtivo==='Casa'?'Todas as casas':f.tipoAtivo==='Carro'?'Todos os carros':f.tipoAtivo==='Escritório'?'Todos os escritórios':f.tipoAtivo==='Serviço'?'Todos os serviços':'Todos os itens')+'</option>'+ativoGroups(f.ativo,f.tipoAtivo,f.exec)+'</select>'+FAC_EXEC_SEL(f)+
    (withStatus?selHtml('facf-tipo',f.tipo,[['','Todos os tipos']].concat(REC['fac-ch'].fields[2].opts.map(o=>[o,o])),'Tipo de chamado')+
    selHtml('facf-status',f.status,[['abertos','Em aberto'],['concluidos','Concluídos e cancelados'],['','Todos os status']],'Status'):'')+
    selHtml('facf-forn',f.forn,[['','Todos os prestadores e fornecedores']].concat(S.cad.prestadores.concat(S.cad.fornecedores).map(x=>[x.id,x.nome])),'Prestador ou fornecedor')+
    '<input class="sel qsearch" id="facf-q" type="search" placeholder="Buscar" value="'+esc(f.q||'')+'" aria-label="Buscar chamado"></div>';
}
function chItem(c){
  const t0=todayISO();const open=FAC_OPEN.includes(c.status||'Aberto');const late=open&&c.prazo&&c.prazo<t0;const a=ativoById(c.ativo);
  const task=c.taskId?S.tasks.get(c.taskId):null;
  return rowBtn('fac-ch',c,'<span style="min-width:0"><span class="tt">'+esc(c.titulo)+'</span><span class="mm"><span class="tag '+(ST_TONE[c.status||'Aberto']||'')+'">'+esc(c.status||'Aberto')+'</span>'+(a?'<span class="tag">'+esc(a.nome)+'</span>':'')+(c.tipo?'<span class="tag">'+esc(c.tipo)+'</span>':'')+(c.prioridade==='Crítica'?'<span class="tag" style="background:#DB4479;color:#fff;border-color:#DB4479">Crítica</span>':'')+(c.prioridade==='Alta'?'<span class="tag" style="background:#fff;color:#D0638C;border-color:#EFA0B4">Alta</span>':'')+(c.prioridade==='Média'?'<span class="tag" style="background:#fff;color:#2F7A70;border-color:#BFDDD7">Média</span>':'')+(c.fornecedor?'<span class="tag">'+esc(refName('fornecedores',c.fornecedor))+'</span>':'')+(c.prazo&&open?'<span class="tag '+(late?'bad':'')+'">Prazo '+esc(fmtDate(c.prazo))+'</span>':'')+(task?'<span class="tag info">Demanda #'+esc(task.num)+' · '+esc(ST[task.status]||'')+'</span>':'')+filesHtml(c.anexos)+'</span></span><span class="rr">'+(+c.custo?'<b>'+fmtMoney(c.custo)+'</b>':'')+(c.status==='Concluído'&&c.concluidoEm?'<small>'+esc(fmtDateFull(c.concluidoEm))+'</small>':'')+'</span>',late?'bad':open?(c.status==='Aguardando'?'warn':'info'):'ok');
}
function facCh(){
  const rows=facFiltered();let h=facFiltersHtml(true);
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhum chamado com esses filtros</b>Abra um chamado para registrar um conserto, serviço ou compra.</div></li></ul>';
  const order=['Aberto','Orçamento','Agendado','Em execução','Aguardando','Concluído','Cancelado'];
  const g={};rows.forEach(c=>{const s=c.status||'Aberto';(g[s]=g[s]||[]).push(c);});
  order.filter(s=>g[s]).forEach(s=>{const list=g[s].sort((a,b)=>String(a.prazo||'9').localeCompare(String(b.prazo||'9'))||String(b.abertura||'').localeCompare(String(a.abertura||'')));
    const tot=list.reduce((a,c)=>a+(+c.custo||0),0);
    h+='<div><div class="sec-h"><h3>'+esc(s)+'</h3><span class="cnt">'+list.length+'</span>'+(tot?'<span class="act hint">'+fmtMoney(tot)+'</span>':'')+'</div><ul class="list">'+list.map(chItem).join('')+'</ul></div>';});
  return h;
}
function facVenc(){
  const f=S.facF;const t0=todayISO();
  const rows=recs('fac-rec').filter(r=>(!f.ativo||r.ativo===f.ativo)&&(!f.forn||r.fornecedor===f.forn)&&(!f.tipoAtivo||((ativoById(r.ativo)||{}).tipo===f.tipoAtivo))&&facExecOk(ativoById(r.ativo))&&(!f.q||String(r.titulo||'').toLowerCase().includes(f.q.toLowerCase())))
    .sort((a,b)=>(a.encerrada?1:0)-(b.encerrada?1:0)||String(a.proxima||'9').localeCompare(String(b.proxima||'9')));
  let h=facFiltersHtml(false);
  if(!rows.length)return h+'<ul class="list"><li><div class="empty"><b>Nenhum vencimento cadastrado</b>Cadastre IPVA, licenciamento, seguros, revisões, dedetização e outros compromissos que se repetem.</div></li></ul>';
  return h+'<ul class="list">'+rows.map(r=>{const a=ativoById(r.ativo);const late=recLate(r),soon=recSoon(r);
    const when=r.encerrada?'Concluído':r.proxima?(late?'Venceu '+fmtDate(r.proxima):'Vence '+fmtDate(r.proxima)+(r.proxima.slice(0,4)!==t0.slice(0,4)?' de '+r.proxima.slice(0,4):'')):'Sem data';
    return '<li><div class="item '+(late?'bad':soon?'warn':r.encerrada?'ok':'')+'"><span class="sev"></span><button class="item-main" data-rec="fac-rec:'+esc(r.id)+'"><span class="tt">'+esc(r.titulo)+'</span><span class="mm"><span class="tag '+(late?'bad':soon?'warn':'')+'">'+esc(when)+'</span>'+(a?'<span class="tag">'+esc(a.nome)+'</span>':'')+(r.categoria?'<span class="tag">'+esc(r.categoria)+'</span>':'')+'<span class="tag">'+esc(r.frequencia||'Anual')+'</span>'+(r.fornecedor?'<span class="tag">'+esc(refName('fornecedores',r.fornecedor))+'</span>':'')+filesHtml(r.anexos)+'</span></button><span class="rr">'+(+r.valor?'<b>'+fmtMoney(r.valor)+'</b>':'')+(!r.encerrada?'<button class="btn sm" data-done="'+esc(r.id)+'">Registrar como feito</button>':'')+'</span></div></li>';}).join('')+'</ul>';
}
function facAtivos(){
  const t0=todayISO();const ano=t0.slice(0,4);const list=refRows('ativos').filter(a=>(!S.facF.tipoAtivo||a.tipo===S.facF.tipoAtivo)&&facExecOk(a));
  let h='<div class="filters">'+selHtml('facf-tipoAtivo',S.facF.tipoAtivo,[['','Todos os tipos de item'],['Casa','Só casas'],['Carro','Só carros'],['Escritório','Só escritórios'],['Serviço','Só serviços']],'Tipo de ativo')+FAC_EXEC_SEL(S.facF)+'<span class="grow"></span><button class="btn sm" data-add="ativos">Adicionar item</button></div>';
  if(!list.length)return h+'<ul class="list"><li><div class="empty"><b>Nada cadastrado</b>Cadastre em Cadastros › Casas, carros, escritórios e serviços.</div></li></ul>';
  return h+'<div class="pulse">'+list.map(a=>{
    const chs=recs('fac-ch').filter(c=>c.ativo===a.id);const aset=catById('c-'+a.id)?descendants('c-'+a.id):new Set();const op=[...S.tasks.values()].filter(t=>isOpen(t)&&aset.has(t.categoryId));
    const custo=chs.filter(c=>c.status==='Concluído'&&String(c.concluidoEm||'').startsWith(ano)).reduce((x,c)=>x+(+c.custo||0),0);
    const nx=recs('fac-rec').filter(r=>r.ativo===a.id&&!r.encerrada&&r.proxima).sort((x,y)=>x.proxima.localeCompare(y.proxima))[0];
    return '<div role="button" tabindex="0" class="card" data-fac-ativo="'+esc(a.id)+'"><div class="card-h"><span class="chip">'+(a.tipo==='Carro'?IC.car:IC.fac)+'</span><div style="flex:1;min-width:0"><h4>'+esc(a.nome)+'</h4><small class="sub">'+esc([a.tipo,a.ident,a.executivo?EXEC[a.executivo]:''].filter(Boolean).join(' · '))+'</small></div></div>'+
      '<div class="kv"><div><span>Chamados abertos</span><b>'+op.length+'</b></div><div><span>Custo em '+ano+'</span><b>'+fmtMoney(custo)+'</b></div></div>'+
      '<div class="foot">'+(nx?'<span class="tag '+(recLate(nx)?'bad':recSoon(nx)?'warn':'')+'">'+esc(nx.titulo)+' · '+esc(fmtDateFull(nx.proxima))+'</span>':'<span>Sem vencimentos cadastrados</span>')+subDrive(a,'fac')+'</div></div>';}).join('')+'</div>';
}
async function registrarFeito(id){
  const r=recs('fac-rec').find(x=>x.id===id);if(!r||!S.db)return;const t0=todayISO();const now=new Date().toISOString();
  const tipo=r.categoria==='Documento'||r.categoria==='Imposto ou taxa'?'Documentação':r.categoria==='Manutenção preventiva'?'Manutenção':'Serviço';
  try{
    await S.db.collection('fac-ch').doc(uid('cha')).set({titulo:r.titulo+(r.proxima?' · venc. '+fmtDateFull(r.proxima):''),ativo:r.ativo||'',tipo,status:'Concluído',prioridade:'',fornecedor:r.fornecedor||'',abertura:t0,prazo:r.proxima||'',concluidoEm:t0,custo:+r.valor||0,descricao:'Registrado a partir do vencimento “'+r.titulo+'”.',anexos:[],origem:id,criadoEm:now,atualizadoEm:now});
    const m=FREQ_M[r.frequencia||'Anual'];
    const patch=m?{proxima:addMonthsISO(r.proxima||t0,m),atualizadoEm:now}:{encerrada:true,atualizadoEm:now};
    await S.db.collection('fac-rec').doc(id).update(patch);
    toast(m?'Feito. Próximo vencimento: '+fmtDateFull(patch.proxima):'Feito. Vencimento encerrado.');
  }catch(e){toast('Não foi possível registrar agora. Tente de novo em instantes.');}
}

