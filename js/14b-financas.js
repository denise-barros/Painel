"use strict";
/* =================== Métricas financeiras ===================
   Fonte única para a Capa (cartão Financeiro), o módulo Financeiro (Visão geral e Relatórios do módulo)
   e o Report. Tudo lê S.fin, que espelha as coleções abas/<aba>/linhas do banco.
   Regras:
   - Cronograma = só os pagamentos recorrentes cadastrados. Não é o total de despesas nem de pagamentos.
   - Despesas = prestação de contas (as grades "Fluxo de caixa" de cada pessoa), por competência.
   - Saldos (reembolsos, empréstimos, parcelas) são posições de hoje.
   - Valor ausente fica null ("—"), nunca zero. */

const FIN_DONO={fernando:'fernando',shayer:'fernando','fernando shayer':'fernando',luciano:'fernando',
  leticia:'leticia','letícia':'leticia','leticia lyle':'leticia',camburi:'leticia','crianças':'leticia',criancas:'leticia','mauá':'leticia',maua:'leticia',
  mindset:'leticia',mistaria:'leticia',serengetti:'fernando','serengetti chase participações ltda':'fernando'};
function finDono(v){return FIN_DONO[String(v||'').trim().toLowerCase()]||null;}
const finOk=(ex,v)=>!ex||finDono(v)===ex;
/* prestação de contas: de quem é cada fluxo e quais grupos são despesa */
const FDC_DONO={'fdc-leticia':'leticia','fdc-luciano':'fernando','fdc-fernando':'fernando','fdc-camburi':'leticia','fdc-criancas':'leticia'};
const FDC_NOME={'fdc-leticia':'Leticia','fdc-luciano':'Luciano','fdc-fernando':'Fernando','fdc-camburi':'Camburi','fdc-criancas':'Crianças'};
const FDC_DESP={'fdc-leticia':['fix','var'],'fdc-luciano':['fix','var'],'fdc-fernando':['desp','cart'],'fdc-camburi':['sai'],'fdc-criancas':['leticia']};
/* empréstimos: titular da linha; linhas antigas sem titular são da Leticia */
const empDono=r=>finDono(r.titular)||'leticia';
/* periodicidade do cronograma: vazio = mensal; os demais contam a partir do mês de referência */
const PER_N={Mensal:1,Bimestral:2,Trimestral:3,Semestral:6,Anual:12};
function cronoDue(r,ym){const p=r.period||'Mensal';if(p==='Mensal'||!r.mesref)return true;if(p==='Única')return ym===r.mesref;const n=PER_N[p];if(!n)return true;
  const d=(+ym.slice(0,4)-+r.mesref.slice(0,4))*12+(+ym.slice(5,7)-+r.mesref.slice(5,7));return ((d%n)+n)%n===0;}
/* linha do cronograma que paga a fatura de cada cartão */
const FAT_CRONO=[[/the\s*one/i,'Itaú The One'],[/latam/i,'Itaú LATAM'],[/personnalit/i,'Itaú Personnalité'],[/\bc6\b/i,'C6 Bank'],[/\baa\b|aadvantage|santander/i,'Santander Black']];

const fnum=v=>v===''||v==null||isNaN(+v)?null:+v;
const fPrevYm=ym=>{let[y,m]=ym.split('-').map(Number);m--;if(!m){m=12;y--;}return y+'-'+String(m).padStart(2,'0');};
const fAddYm=(ym,n)=>{let[y,m]=ym.split('-').map(Number);m+=n;y+=Math.floor((m-1)/12);m=((m-1)%12+12)%12+1;return y+'-'+String(m).padStart(2,'0');};
const fYmEnd=ym=>{const[y,m]=ym.split('-').map(Number);return ym+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0');};
const fDays=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(String(a).slice(0,10)+'T12:00:00'))/864e5);
const fPct=(a,b)=>a==null||b==null||!b?null:(a-b)/Math.abs(b)*100;
function fatCardOf(r){if(!/^fatura\b/i.test(String(r.despesa||'')))return null;const hit=FAT_CRONO.find(([re])=>re.test(r.despesa));if(!hit)return null;
  const f=(S.fin.faturas||[]).find(x=>x.cartao===hit[1]);const dono=f?finDono(f.titular):null;return dono&&finDono(r.quem)===dono?hit[1]:null;}

/* A. Cronograma: compromissos recorrentes da competência */
function finCrono(ym,ex,t0){
  t0=t0||todayISO();
  const o={ym,n:0,naoAplica:0,previsto:0,prevSemValor:0,pago:0,pagoN:0,pagoSemValor:0,cartoes:0,
    venc:{n:0,v:0,semValor:0,items:[]},aVencer:{n:0,v:0,semValor:0,items:[]},semData:{n:0,v:0,semValor:0,items:[]},pend:[]};
  (S.fin.cronograma||[]).filter(r=>r.despesa&&finOk(ex,r.quem)).forEach(r=>{
    const x=(r.meses||{})[ym]||{};if(x.s==='Não se aplica'||!cronoDue(r,ym)){o.naoAplica++;return;}
    o.n++;const med=fnum(r.medio),pv=fnum(x.v),paid=x.s==='Pago'||x.s==='Emitido';
    const prev=med>0?med:(paid&&pv>0?pv:null);
    if(prev==null)o.prevSemValor++;else{o.previsto+=prev;if(fatCardOf(r))o.cartoes+=prev;}
    if(paid){o.pagoN++;if(pv==null)o.pagoSemValor++;else o.pago+=pv;return;}
    const d=+r.venc?dayIn(ym,+r.venc):null;
    const b=!d?o.semData:d<t0?o.venc:o.aVencer;
    b.n++;if(prev==null)b.semValor++;else b.v+=prev;
    const it={id:r.id,t:r.despesa,quem:r.quem||'',d,v:prev,s:x.s||'',ym};b.items.push(it);
    if(x.s==='Pendente'||x.s==='Verificar')o.pend.push(it);});
  [o.venc,o.aVencer,o.semData].forEach(b=>b.items.sort((a,c)=>String(a.d).localeCompare(String(c.d))));
  if(!o.n){o.previsto=null;o.pago=null;}
  return o;}
/* recorrentes não pagos com vencimento entre hoje e hoje+dias (competência atual e seguinte) */
function finCronoProx(ex,dias,t0){
  t0=t0||todayISO();const lim=addDays(t0,dias||7);const ym=t0.slice(0,7);
  return [ym,fAddYm(ym,1)].flatMap(m=>finCrono(m,ex,t0).aVencer.items).filter(i=>i.d&&i.d>=t0&&i.d<=lim).sort((a,b)=>a.d.localeCompare(b.d));}

/* B. Despesas e prestação de contas (grades de cada pessoa) */
function finDespesas(ym,ex){
  const y=+ym.slice(0,4),i=+ym.slice(5,7);let tot=0,cel=0,pago=0,aPagar=0,semStatus=0,semStatusV=0,semComp=0;const porPessoa={},porCat={},porExec={fernando:null,leticia:null},pend=[];
  Object.keys(FDC_DESP).forEach(id=>{const dn=FDC_DONO[id];if(ex&&dn!==ex)return;
    (S.fin[id]||[]).filter(r=>+r.ano===y&&FDC_DESP[id].includes(r.grupo)).forEach(r=>{const v=fnum((r.m||{})[i]);if(v==null)return;
      cel++;tot+=v;const st=(r.st||{})[i],cp=(r.cp||{})[i];
      if(st==='Pago'){pago+=v;if(!cp)semComp++;}else if(st==='A pagar'){aPagar+=v;pend.push({pessoa:FDC_NOME[id],cat:r.cat||'Sem nome',v,tid:id});}else{semStatus++;semStatusV+=v;}
      porPessoa[FDC_NOME[id]]=(porPessoa[FDC_NOME[id]]||0)+v;const c=String(r.cat||'Sem nome').trim();porCat[c]=(porCat[c]||0)+v;porExec[dn]=(porExec[dn]||0)+v;});});
  /* status por valor do mês (decidido 27/10): Pago / A pagar / sem status; comprovante por valor */
  return {ym,total:cel?tot:null,lancamentos:cel,porPessoa,porCat,porExec,pago:cel?pago:null,naoPago:cel?aPagar:null,semStatus,semStatusV,semComp,pend};}
/* pagamentos extraordinários: Novas solicitações de pagamento (não recorrentes) */
function finExtra(ym,ex){
  const rows=(S.fin.solicitacoes||[]).filter(r=>(r.descr||r.valor)&&finOk(ex,r.pagador)&&r.status!=='Cancelado'&&String(r.data||r.venc||'').slice(0,7)===ym);
  const o={n:rows.length,v:0,pago:0,pend:0,semValor:0,semComp:0,items:rows};
  rows.forEach(r=>{const v=fnum(r.valor);if(v==null){o.semValor++;return;}o.v+=v;if(r.status==='Pago')o.pago+=v;else o.pend+=v;});
  o.semComp=rows.filter(r=>r.status==='Pago'&&!r.comp).length;
  if(!o.n){o.v=null;o.pago=null;o.pend=null;}
  return o;}
function finSolAbertas(ex,t0){t0=t0||todayISO();
  const rows=(S.fin.solicitacoes||[]).filter(r=>(r.descr||r.valor)&&finOk(ex,r.pagador)&&(r.status==='Pendente'||r.status==='Aguardando transferência'||!r.status));
  return {n:rows.length,v:rows.reduce((a,r)=>a+(fnum(r.valor)||0),0),vencidas:rows.filter(r=>r.venc&&r.venc<t0),items:rows};}

/* C. Empréstimos e movimentações entre sócios */
const empSaldo=r=>(fnum(r.valor)||0)+(fnum(r.juros)||0)-(fnum(r.devolvido)||0);
const empAberto=r=>r.status!=='Quitado'&&r.status!=='Não será cobrado';
function finEmprest(ym,ex,t0){
  t0=t0||todayISO();
  /* empréstimo entre os dois executivos: a receber para quem emprestou é a pagar para quem tomou */
  const flip=r=>!!ex&&empDono(r)!==ex&&finDono(r.razao)===ex;
  const rows=(S.fin.emprestimos||[]).filter(r=>(r.razao||r.valor)&&(!ex||empDono(r)===ex||flip(r)));
  const side=r=>{const p=r.tipo==='Entrada'?'pagar':'receber';return flip(r)?(p==='pagar'?'receber':'pagar'):p;};
  const blank=()=>({v:0,n:0,venc:{n:0,v:0},d30:0,d60:0,d90:0,semPrev:{n:0,v:0},porContra:{}});
  const o={has:rows.length>0,receber:blank(),pagar:blank(),mes:{recebido:0,pago:0,concedido:0,tomado:0},ant:{receber:0,pagar:0},items:[]};
  const fimAnt=fYmEnd(fPrevYm(ym));
  rows.forEach(r=>{const s=o[side(r)];
    if(empAberto(r)){const v=empSaldo(r);if(v>0.005){s.v+=v;s.n++;const c=flip(r)?(r.titular||'Leticia'):(r.razao||'Sem nome');s.porContra[c]=(s.porContra[c]||0)+v;o.items.push({r,v,lado:side(r)});
      if(!r.prevista){s.semPrev.n++;s.semPrev.v+=v;}
      else if(r.prevista<t0){s.venc.n++;s.venc.v+=v;}
      else{const d=fDays(t0,r.prevista);if(d<=30)s.d30+=v;else if(d<=60)s.d60+=v;else if(d<=90)s.d90+=v;}}}
    if(String(r.datadev||'').slice(0,7)===ym){const dv=fnum(r.devolvido)||0;if(side(r)==='receber')o.mes.recebido+=dv;else o.mes.pago+=dv;}
    if(String(r.data||'').slice(0,7)===ym){const vv=fnum(r.valor)||0;if(side(r)==='receber')o.mes.concedido+=vv;else o.mes.tomado+=vv;}
    if(r.status!=='Não será cobrado'&&r.data&&r.data<=fimAnt){const dv=r.datadev&&r.datadev<=fimAnt?(fnum(r.devolvido)||0):0;o.ant[side(r)]+=Math.max(0,(fnum(r.valor)||0)+(fnum(r.juros)||0)-dv);}});
  if(!o.has){o.receber.v=null;o.pagar.v=null;}
  return o;}
function finRepasses(ym){
  const f=S.fin['rep-fech']||[],t=S.fin['rep-transf']||[],c=S.fin['rep-contas']||[];
  const has=f.length+t.length+c.length>0;
  const sm=(l,p)=>l.filter(p).reduce((a,r)=>a+(fnum(r.valor)||0),0);
  const fech=sm(f,r=>r.mes===ym),rec=sm(t,r=>r.mes===ym),acc=sm(t,r=>r.mes&&r.mes<=ym)-sm(f,r=>r.mes&&r.mes<=ym);
  const ab=c.filter(r=>r.status!=='Quitado');
  return {has,fech:f.some(r=>r.mes===ym)?fech:null,rec:t.some(r=>r.mes===ym)?rec:null,acumulado:has?acc:null,
    pendShayer:ab.filter(r=>String(r.lado||'').startsWith('Shayer')).reduce((a,r)=>a+(fnum(r.valor)||0),0),
    pendLeticia:ab.filter(r=>!String(r.lado||'').startsWith('Shayer')).reduce((a,r)=>a+(fnum(r.valor)||0),0),pendN:ab.length};}

/* D. Reembolsos (devidos ao executivo) e assinaturas */
function finReemb(ym,ex,t0){
  t0=t0||todayISO();
  const rc=(S.fin['reemb-corp']||[]).filter(r=>(r.descr||r.brl)&&finOk(ex,r.pessoa)),rm=(S.fin['reemb-med']||[]).filter(r=>(r.descr||r.valor||r.paciente)&&finOk(ex,r.titular));
  const opC=rc.filter(r=>r.status!=='Pago'&&r.status!=='Negado'),opM=rm.filter(r=>r.status!=='Pago'&&r.status!=='Negado');
  const sm=(l,k)=>l.reduce((a,r)=>a+(fnum(r[k])||0),0);
  const o={has:rc.length+rm.length>0,
    corp:{aSolicitar:sm(opC.filter(r=>!r.status||r.status==='A solicitar'),'brl'),solicitado:sm(opC.filter(r=>r.status==='Solicitado'),'brl'),n:opC.length},
    med:{aEnviar:sm(opM.filter(r=>!r.status||r.status==='Pendente'),'valor'),emAnalise:sm(opM.filter(r=>r.status==='Em análise'),'valor'),n:opM.length},
    recebidoMes:sm(rc.filter(r=>r.status==='Pago'&&String(r.datareemb||r.pagoEm||'').slice(0,7)===ym),'brl')+sm(rm.filter(r=>String(r.datareemb||'').slice(0,7)===ym),'vreemb'),
    semComp:opC.filter(r=>!r.comp).length+opM.filter(r=>!r.comp&&!r.nf).length,
    mais30:{n:0,v:0},maisAntigo:null,items:[],aPagar:null};
  const age=(r,v,tipo)=>{const d=r.data?fDays(r.data,t0):null;o.items.push({r,v,tipo,dias:d});if(d!=null){if(d>30){o.mais30.n++;o.mais30.v+=v;}if(o.maisAntigo==null||d>o.maisAntigo)o.maisAntigo=d;}};
  opC.forEach(r=>age(r,fnum(r.brl)||0,'Corporativo'));opM.forEach(r=>age(r,fnum(r.valor)||0,'Médico'));
  o.aReceber=o.has?o.corp.aSolicitar+o.corp.solicitado+o.med.aEnviar+o.med.emAnalise:null;
  /* reembolsos a pagar: o que o executivo deve devolver a terceiros */
  const rp=(S.fin['reemb-pagar']||[]).filter(r=>(r.descr||r.valor)&&finOk(ex,r.pessoa)),opP=rp.filter(r=>r.status!=='Pago'&&r.status!=='Cancelado');
  o.pagar={has:rp.length>0,v:rp.length?sm(opP,'valor'):null,n:opP.length,venc:opP.filter(r=>r.venc&&r.venc<t0),
    pagoMes:sm(rp.filter(r=>r.status==='Pago'&&String(r.datapag||r.pagoEm||'').slice(0,7)===ym),'valor'),semComp:rp.filter(r=>r.status==='Pago'&&!r.comp).length,items:opP};
  o.aPagar=o.pagar.v;
  return o;}
function finAssin(ym,ex){
  const rows=(S.fin.assinaturas||[]).filter(r=>r.sit!=='Cancelada'&&finOk(ex,r.cartao));
  const m=k=>{const l=rows.filter(r=>String(r.data||'').slice(0,7)===k);return l.length?{mensal:l.filter(r=>r.rec==='Mensal').reduce((a,r)=>a+(fnum(r.brl)||0),0),anual:l.filter(r=>r.rec==='Anual').reduce((a,r)=>a+(fnum(r.brl)||0),0),unico:l.filter(r=>r.rec==='Pagamento único').reduce((a,r)=>a+(fnum(r.brl)||0),0),semRec:l.filter(r=>!r.rec).length,n:l.length}:null;};
  const cur=m(ym),ant=m(fPrevYm(ym));
  /* anuais: continuam no controle mesmo fora do mês da cobrança; última cobrança de cada uma e renovação prevista (+12 meses) */
  const last={};rows.filter(r=>r.rec==='Anual'&&r.descr).forEach(r=>{const k=String(r.descr).trim().toLowerCase()+'|'+(r.final||'');if(!last[k]||String(r.data||'')>String(last[k].data||''))last[k]=r;});
  const anuais=Object.values(last).map(r=>({r,descr:r.descr,v:fnum(r.brl),data:r.data||'',renova:r.data?addDays(r.data,0).replace(/^(\d{4})/,y=>String(+y+1)):''})).sort((a,b)=>String(a.renova||'9').localeCompare(String(b.renova||'9')));
  return {cur,ant,mensal:cur?cur.mensal:null,mensalAnt:ant?ant.mensal:null,varPct:cur&&ant?fPct(cur.mensal,ant.mensal):null,
    anuais,anualTotal:anuais.length?anuais.reduce((a,x)=>a+(x.v||0),0):null};}

/* E. Cartões de crédito: fatura da competência + parcelas futuras (sem duplicar) */
function finCartoes(ym,ex,t0){
  t0=t0||todayISO();
  const fats=(S.fin.faturas||[]).filter(f=>f.mes===ym&&finOk(ex,f.titular));
  const cr=(S.fin.cronograma||[]);
  const o={has:fats.length>0,total:null,pago:0,pendente:0,vencida:0,semStatus:0,cards:[],futuras:null,prox:[0,0,0],reembNaoSolic:{n:0,v:0},semDescr:0,diverg:[],histVar:{}};
  fats.forEach(f=>{const row=cr.find(r=>fatCardOf(r)===f.cartao);const x=row?((row.meses||{})[ym]||{}):{};const paid=x.s==='Pago'||x.s==='Emitido';
    const v=fnum(f.total);const st=paid?'Paga':!row?'Sem vínculo no cronograma':f.vencimento&&f.vencimento<t0?'Vencida':'A pagar';
    if(v!=null){o.total=(o.total||0)+v;if(paid)o.pago+=v;else if(st==='Vencida'){o.vencida+=v;o.pendente+=v;}else o.pendente+=v;}
    if(!row)o.semStatus++;
    const ant=(S.fin.faturas||[]).find(z=>z.cartao===f.cartao&&z.mes===fPrevYm(ym));
    o.cards.push({cartao:f.cartao,titular:f.titular,total:v,venc:f.vencimento||'',status:st,parcelas:fnum(f.parcelas),aVencerFatura:fnum(f.aVencer),varPct:ant?fPct(v,fnum(ant.total)):null,aVencer:0});});
  /* parcelas futuras: só as que vêm depois da fatura atual (a parcela atual já está no total da fatura) */
  const ref=(S.fin.faturas||[]).map(f=>f.mes).filter(Boolean).sort().pop();
  const pa=(S.fin.parcelas||[]).filter(r=>finOk(ex,r.titular));
  if(pa.length&&ref===ym){let s=0;pa.forEach(r=>{const rest=Math.max(0,(fnum(r.total)||0)-(fnum(r.atual)||0)),vp=fnum(r.vparc)||0;s+=vp*rest;
      for(let k=1;k<=Math.min(3,rest);k++)o.prox[k-1]+=vp;const c=o.cards.find(x=>x.cartao===r.cartao);if(c)c.aVencer+=vp*rest;
      if(r.reemb==='Sim'&&r.solic==='Não'){o.reembNaoSolic.n++;o.reembNaoSolic.v+=vp*(rest+1);}if(!r.descr)o.semDescr++;});
    o.futuras=s;o.cards.forEach(c=>{if(c.aVencerFatura!=null&&Math.abs(c.aVencerFatura-c.aVencer)>1)o.diverg.push(c);});}
  else o.prox=null;
  o.ref=ref||'';
  return o;}

/* tudo junto, para uma competência e um executivo */
function finMetrics(opt){
  opt=opt||{};const t0=opt.t0||todayISO(),ym=opt.ym||t0.slice(0,7);const ex=opt.exec!==undefined?(opt.exec==='ambos'?'':opt.exec):S.exec;
  const d=finDespesas(ym,ex),da=finDespesas(fPrevYm(ym),ex);
  return {ym,ex,t0,crono:finCrono(ym,ex,t0),prox7:finCronoProx(ex,7,t0),desp:d,despAnt:da,despVar:fPct(d.total,da.total),extra:finExtra(ym,ex),sol:finSolAbertas(ex,t0),
    emp:finEmprest(ym,ex,t0),rep:finRepasses(ym),reemb:finReemb(ym,ex,t0),assin:finAssin(ym,ex),cart:finCartoes(ym,ex,t0)};}
/* o módulo Financeiro (iframe) usa as mesmas assinaturas do banco que o Painel já mantém, em vez de abrir outras
   (cada página tem um limite de assinaturas simultâneas). */
const finWatch=new Set();
function finNotify(t){finWatch.forEach(fn=>{try{fn(t);}catch(e){}});}
window.CEFIN={despGroups:id=>FDC_DESP[id]||[],metrics:finMetrics,crono:finCrono,despesas:finDespesas,dono:finDono,due:cronoDue,empDono,
  has:t=>Object.prototype.hasOwnProperty.call(S.fin,t),rows:t=>S.fin[t]||[],ready:t=>!!S.finOk[t],failed:t=>!!S.finErr[t],
  watch:fn=>{finWatch.add(fn);return ()=>finWatch.delete(fn);}};
