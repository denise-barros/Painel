"use strict";
/* =================== integração com a capa =================== */
function phase2Capa(attention,upcoming,t0,horizon){
  // DP: pagamentos previstos
  recs('dp-pag').forEach(p=>{if(p.status==='Pago'||!p.dataPag)return;const pe=personById(p.pessoa);if(pe&&!ownerOk(pe.executivo))return;
    const nm=refName('equipe',p.pessoa)+' · '+(p.tipo||'Pagamento');
    if(p.dataPag<t0)attention.push({sev:'bad',kind:'DP',title:nm,meta:[['bad','Pagamento venceu '+fmtDate(p.dataPag)],['',fmtYm(p.competencia)]],right:fmtMoney(p.valor),go:'dp',sort:p.dataPag});
    else if(p.dataPag<=horizon)upcoming.push({date:p.dataPag,kind:'DP',title:nm,meta:[['warn','A pagar'],['',fmtYm(p.competencia)]],right:fmtMoney(p.valor),go:'dp',sev:'warn'});});
  // DP: férias e afastamentos começando
  recs('dp-mov').forEach(m=>{if(!(m.tipo==='Férias'||m.tipo==='Afastamento'))return;const pe=personById(m.pessoa);if(pe&&!ownerOk(pe.executivo))return;
    if(m.data>=t0&&m.data<=horizon)upcoming.push({date:m.data,kind:'DP',title:refName('equipe',m.pessoa)+' · início de '+m.tipo.toLowerCase(),meta:[m.dataFim?['','Até '+fmtDate(m.dataFim)]:null],right:'',go:'dp',sev:'info'});});
  // Facilities: vencimentos
  recs('fac-rec').forEach(r=>{if(r.encerrada||!r.proxima)return;const a=ativoById(r.ativo);if(a&&!ownerOk(a.executivo))return;
    const nm=r.titulo+(a?' · '+a.nome:'');
    if(r.proxima<t0)attention.push({sev:'bad',kind:'Facilities',title:nm,meta:[['bad','Venceu '+fmtDate(r.proxima)],r.categoria?['',r.categoria]:null],right:+r.valor?fmtMoney(r.valor):'',go:'fac',sort:r.proxima});
    else if(r.proxima<=horizon)upcoming.push({date:r.proxima,kind:'Facilities',title:nm,meta:[r.categoria?['',r.categoria]:null],right:+r.valor?fmtMoney(r.valor):'',go:'fac',sev:'warn'});});
  // Facilities: chamados são demandas (aparecem pelas demandas)
}
function phase2Pulse(){
  const t0=todayISO(),ym=ymOf(t0);
  const team=equipe().filter(p=>isActive(p.id)&&ownerOk(p.executivo));const ids=new Set(team.map(p=>p.id));
  const aus=team.map(p=>({p,s:dayStatus(p.id,t0)})).filter(x=>x.s&&(x.s.k==='ferias'||x.s.k==='afast'||x.s.k==='atest'));
  const fn=p=>String(p.nome).split(' ')[0];
  const obrig=dpObrig(30).filter(e=>!e.p||ownerOk(e.p.executivo));
  const fprog=feriasProx().filter(x=>x.em<=60&&ownerOk(x.p.executivo)),fvenc=feriasVencer(60).filter(x=>ownerOk(x.p.executivo));
  const nFer=fprog.length+fvenc.length;
  const fa30=recs('dp-oc').filter(o=>(o.tipo==='Falta'||o.tipo==='Atestado')&&o.data>=addDays(t0,-30)&&o.data<=t0&&ids.has(o.pessoa));
  const faD=fa30.reduce((a,o)=>a+(+o.dias||1),0);
  const pacP=team.find(p=>+p.pacoteDiarias);const pk=pacP&&pacoteOf(pacP);
  let h='<button class="card" data-go="dp"><div class="card-h"><span class="chip">'+IC.dp+'</span><h4>DP</h4></div>'+
    '<div class="kv"><div><span>Ausentes hoje</span><b class="'+(aus.length?'warn':'')+'">'+aus.length+'</b></div>'+
    '<div><span>Obrigações em 30 dias</span><b class="'+(obrig.length?'warn':'')+'">'+obrig.length+'</b></div>'+
    '<div><span>Férias em 60 dias</span><b class="'+(fvenc.length?'neg':nFer?'warn':'')+'">'+nFer+'</b></div>'+
    '<div><span>Faltas e atestados, 30d</span><b class="'+(faD?'warn':'')+'">'+faD+(faD===1?' dia':' dias')+'</b></div></div>'+
    (pk?'<div class="foot"><span>'+esc(fn(pacP))+': '+(pk.cur&&pk.cur.v!=null?pk.cur.v:0)+' de '+pk.pac+' diárias no mês</span></div>':'')+'</button>';
  const ativos=S.cad.ativos.filter(a=>ownerOk(a.executivo));const aids=new Set(ativos.map(a=>a.id));const inScope=x=>!x.ativo||aids.has(x.ativo);
  const ch=recs('fac-ch').filter(inScope);const open=modTasks('p-fac').filter(isOpen);
  const vr=recs('fac-rec').filter(inScope);const late=vr.filter(recLate).length,soon=vr.filter(r=>!r.encerrada&&r.proxima&&r.proxima>=t0&&r.proxima<=addDays(t0,30)).length;
  const custo=ch.filter(c=>c.status==='Concluído'&&String(c.concluidoEm||'').slice(0,7)===ym).reduce((a,c)=>a+(+c.custo||0),0);
  h+='<button class="card" data-go="fac"><div class="card-h"><span class="chip">'+IC.fac+'</span><h4>Facilities</h4></div>'+
    '<div class="kv"><div><span>Chamados abertos</span><b>'+open.length+'</b></div><div><span>Custo no mês</span><b>'+fmtMoney(custo)+'</b></div><div><span>Vencimentos atrasados</span><b class="'+(late?'neg':'')+'">'+late+'</b></div><div><span>Vencem em 30 dias</span><b class="'+(soon?'warn':'')+'">'+soon+'</b></div></div>'+
    '<div class="foot">'+(open.length?open.slice(0,2).map(c=>'<span class="tag">'+esc(c.title||c.titulo||'')+'</span>').join(''):'<span>Sem chamados abertos</span>')+'</div></button>';
  return h;
}

