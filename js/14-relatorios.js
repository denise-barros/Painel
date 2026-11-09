"use strict";
/* =================== Relatórios =================== */
const REL_FOLDER='1YAlbc9fqx4SNpLhqXnBZ10hC6yYf5Qzr';
S.rel=S.rel||{per:'mes',a:'',b:''};
/* o período sempre começa em "Este mês" ao abrir (decidido 27/10) */
const REL_PERS=[['semana','Esta semana'],['semana-ant','Semana passada'],['mes','Este mês'],['mes-ant','Mês passado'],['tri','Últimos 3 meses'],['custom','Personalizado']];
function relRange(){const t0=todayISO();const d=new Date(t0+'T12:00:00');const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  const p=S.rel.per;
  if(p==='semana'||p==='semana-ant'){const mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7)-(p==='semana-ant'?7:0));const sun=new Date(mon);sun.setDate(mon.getDate()+6);return[iso(mon),iso(sun)];}
  if(p==='mes')return[t0.slice(0,8)+'01',iso(new Date(d.getFullYear(),d.getMonth()+1,0))];
  if(p==='mes-ant')return[iso(new Date(d.getFullYear(),d.getMonth()-1,1)),iso(new Date(d.getFullYear(),d.getMonth(),0))];
  if(p==='tri')return[iso(new Date(d.getFullYear(),d.getMonth()-2,1)),iso(new Date(d.getFullYear(),d.getMonth()+1,0))];
  const a=S.rel.a||t0.slice(0,8)+'01',b=S.rel.b||t0;return a<=b?[a,b]:[b,a];}
const inR=(x,a,b)=>!!x&&String(x).slice(0,10)>=a&&String(x).slice(0,10)<=b;
const brD=s=>s?String(s).slice(8,10)+'/'+String(s).slice(5,7)+'/'+String(s).slice(0,4):'';
function relYms(a,b){const out=[];let y=+a.slice(0,4),m=+a.slice(5,7);const ey=+b.slice(0,4),em=+b.slice(5,7);while(y<ey||(y===ey&&m<=em)){out.push(y+'-'+String(m).padStart(2,'0'));m++;if(m>12){m=1;y++;}}return out;}
function relScopeLabel(){return S.exec?EXEC[S.exec]:'Fernando e Leticia';}
function relBuild(){
  const [a,b]=relRange();const t0=todayISO();const ref=b<t0?b:t0;const secs=[];
  const sec=(t,kpis,head,rows,note)=>{secs.push({t,kpis:kpis.filter(Boolean),head,rows,note});};
  // Operação
  const tk=[...S.tasks.values()].filter(taskExec);
  const done=tk.filter(t=>t.status==='concluido'&&inR(t.completedAt,a,b));
  const novas=tk.filter(t=>inR(t.createdAt,a,b));
  const abertas=tk.filter(isOpen);const atras=abertas.filter(t=>t.due&&t.due<ref);const aguard=abertas.filter(t=>t.status==='aguardando');
  /* ciclo médio em dias úteis (feriados de SP capital, Carnaval e emendas), como no Relatório detalhado da Operação */
  const hol=y=>{const a1=y%19,b1=Math.floor(y/100),c1=y%100,d1=Math.floor(b1/4),e1=b1%4,f1=Math.floor((b1+8)/25),g1=Math.floor((b1-f1+1)/3),h1=(19*a1+b1-d1-g1+15)%30,i1=Math.floor(c1/4),k1=c1%4,l1=(32+2*e1+2*i1-h1-k1)%7,m1=Math.floor((a1+11*h1+22*l1)/451),mo=Math.floor((h1+l1-7*m1+114)/31),da=((h1+l1-7*m1+114)%31)+1;const ea=new Date(y,mo-1,da);const rel=n=>{const x=new Date(ea);x.setDate(ea.getDate()+n);return x;};const key=x=>String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');const days=['01-01','01-25','04-21','05-01','07-09','09-07','10-12','11-02','11-15','11-20','12-25'].map(k=>new Date(y,+k.slice(0,2)-1,+k.slice(3))).concat([rel(-48),rel(-47),rel(-2),rel(60)]);const set=new Set(days.map(key));days.forEach(d=>{const w=d.getDay();if(w===2||w===4){const x=new Date(d);x.setDate(d.getDate()+(w===2?-1:1));set.add(key(x));}});return set;};
  const hc={};const isBiz=d=>{const w=d.getDay();if(w===0||w===6)return false;const y=d.getFullYear();hc[y]=hc[y]||hol(y);return !hc[y].has(String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));};
  const biz=(x,y)=>{const s0=new Date(x),e0=new Date(y);const d=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate()),e=new Date(e0.getFullYear(),e0.getMonth(),e0.getDate());let n=0;while(d<e){d.setDate(d.getDate()+1);if(isBiz(d))n++;}return n;};
  const cyc=done.filter(t=>t.createdAt).map(t=>biz(t.createdAt,t.completedAt));const cicloM=cyc.length?Math.round(cyc.reduce((x,y)=>x+y,0)/cyc.length*10)/10:null;
  const rootOfT=t=>{const p=t.categoryId&&catById(t.categoryId)?catPath(t.categoryId):[];return p[0]||null;};
  const roots=S.cats.filter(c=>!c.parentId).sort((x,y)=>(x.order??0)-(y.order??0));
  const opCnt=(arr,rid)=>arr.filter(t=>{const r=rootOfT(t);return rid?r&&r.id===rid:!r;}).length;
  const oRows=roots.concat([null]).map(r=>{const id=r?r.id:null;return [r?r.name:'Sem categoria',opCnt(novas,id),opCnt(done,id),opCnt(abertas,id),opCnt(atras,id),opCnt(aguard,id)];}).filter(x=>x[1]||x[2]||x[3]);
  if(oRows.length)oRows.push(['Total',novas.length,done.length,abertas.length,atras.length,aguard.length]);
  sec('Operação',[['Entradas no período',novas.length],['Concluídas no período',done.length],['Em aberto agora',abertas.length],['Atrasadas agora',atras.length,atras.length?'neg':''],['Ciclo médio',cicloM==null?'—':(cicloM===0?'mesmo dia':String(cicloM).replace('.',',')+(cicloM===1?' dia útil':' dias úteis'))]],
    ['Categoria','Entradas','Concluídas','Em aberto','Atrasadas','Aguardando'],oRows.map(r=>r.map(String)),
    'Por categoria. Entradas e conclusões contam dentro do período; em aberto, atrasadas e aguardando mostram a situação de agora. Responsáveis, prioridades e SLA ficam no relatório detalhado.');secs[secs.length-1].cls='op';
  // Financeiro: métricas de 14b-financas.js (mesma fonte da Capa e do módulo Financeiro)
  const sum=(l,k)=>l.reduce((s,r)=>s+(+r[k]||0),0);
  const yms=relYms(a,b);const nM=yms.length;const FMs=yms.map(ym=>finMetrics({ym,t0}));const FL=FMs[FMs.length-1];const mesL=ym=>fmtYm(ym);
  const prvYms=yms.map(ym=>{let[y,m]=ym.split('-').map(Number);m-=nM;while(m<1){m+=12;y--;}return y+'-'+String(m).padStart(2,'0');});
  const dSum=l=>{const v=l.filter(x=>x.total!=null);return v.length?v.reduce((s,x)=>s+x.total,0):null;};
  const desp=dSum(FMs.map(f=>f.desp)),despAnt=dSum(prvYms.map(ym=>finDespesas(ym,S.exec)));const despVar=desp!=null&&despAnt?(desp-despAnt)/Math.abs(despAnt)*100:null;
  const pctTxt=v=>v==null?'':(v>0?'+':'')+String(Math.round(v*10)/10).replace('.',',')+'%';
  let prev=0,pago=0,semV=0;const vencI=[],pendI=[];
  FMs.forEach(f=>{const c=f.crono;prev+=c.previsto||0;pago+=c.pago||0;semV+=c.prevSemValor;vencI.push(...c.venc.items);pendI.push(...c.pend.filter(i=>!(i.d&&i.d<t0)));});
  const vencV=vencI.reduce((s,i)=>s+(i.v||0),0);
  const pend=vencI.concat(pendI);/* usado nos destaques */
  const RB=FL.reemb,EM=FL.emp,CA=FL.cart,EX=FMs.reduce((o,f)=>{o.n+=f.extra.n;o.v+=f.extra.v||0;o.pend+=f.extra.pend||0;o.semComp+=f.extra.semComp;return o;},{n:0,v:0,pend:0,semComp:0});
  const rm=(S.fin['reemb-med']||[]).filter(r=>finExec(r.titular)&&r.status!=='Pago'&&r.status!=='Negado'&&+r.valor);/* Saúde */
  const sol=FL.sol.items;
  const fRows=[];
  vencI.forEach(i=>fRows.push([i.t+(i.quem?' · '+i.quem:''),'Recorrente vencido e não pago · venceu '+brD(i.d),i.v==null?'sem valor definido':fmtMoney(i.v)]));
  pendI.forEach(i=>fRows.push([i.t+(i.quem?' · '+i.quem:''),'Recorrente '+i.s.toLowerCase()+' · '+mesL(i.ym)+(i.d?' · vence '+brD(i.d):''),i.v==null?'sem valor definido':fmtMoney(i.v)]));
  sol.forEach(r=>fRows.push([r.descr||'Solicitação','Pagamento extraordinário · '+(r.status||'Pendente')+(r.venc?(r.venc<t0?' · venceu ':' · vence ')+brD(r.venc):''),r.valor!==''&&r.valor!=null?fmtMoney(r.valor):'sem valor']));
  RB.items.forEach(x=>fRows.push([(x.tipo==='Médico'?[x.r.paciente,x.r.descr].filter(Boolean).join(' · ')||'Reembolso médico':x.r.descr||'Reembolso corporativo')+(x.r.pessoa||x.r.titular?' · '+(x.r.pessoa||x.r.titular):''),'Reembolso a receber · '+(x.r.status||(x.tipo==='Médico'?'Pendente':'A solicitar'))+(x.dias!=null?' · '+x.dias+' dias em aberto':'')+(!x.r.comp?' · sem comprovante':''),fmtMoney(x.v)]));
  RB.pagar.items.forEach(r=>fRows.push([(r.descr||'Reembolso a pagar')+(r.pessoa?' · '+r.pessoa:''),'Reembolso a pagar'+(r.credor?' a '+r.credor:'')+(r.venc?(r.venc<t0?' · venceu ':' · prazo ')+brD(r.venc):''),fmtMoney(r.valor)]));
  EM.items.forEach(x=>fRows.push([(x.r.razao||'Empréstimo')+' · '+(x.r.titular||'Leticia'),'Empréstimo a '+(x.lado==='receber'?'receber':'pagar')+(x.r.prevista?(x.r.prevista<t0?' · venceu ':' · previsto para ')+brD(x.r.prevista):' · sem data prevista'),fmtMoney(x.v)]));
  CA.cards.forEach(cc=>fRows.push(['Fatura '+cc.cartao+' · '+(cc.titular||''),'Cartão · '+mesL(FL.ym)+' · '+cc.status+(cc.venc?' · vence '+brD(cc.venc):''),cc.total==null?'sem valor':fmtMoney(cc.total)]));
  if(CA.futuras!=null)fRows.push(['Parcelas de cartão a vencer','Após a fatura de '+mesL(CA.ref)+' · próximas 3 faturas: '+CA.prox.map(fmtMoney).join(' · '),fmtMoney(CA.futuras)]);
  if(CA.reembNaoSolic.n)fRows.push(['Compras no cartão reembolsáveis',CA.reembNaoSolic.n+' parcelamento(s) com reembolso ainda não solicitado',fmtMoney(CA.reembNaoSolic.v)]);
  CA.diverg.forEach(cc=>fRows.push(['Divergência · '+cc.cartao,'Fatura indica '+fmtMoney(cc.aVencerFatura)+' a vencer; planilha de parcelas soma',fmtMoney(cc.aVencer)]));
  FL.assin.anuais.filter(x=>x.renova&&x.renova<=addDays(t0,90)).forEach(x=>fRows.push(['Assinatura anual · '+x.descr,'Renovação prevista em '+brD(x.renova),x.v==null?'sem valor':fmtMoney(x.v)]));
  FMs.forEach(f=>f.desp.pend.forEach(p=>fRows.push([p.cat+' · '+p.pessoa,'Despesa a pagar · '+mesL(f.ym),fmtMoney(p.v)])));
  {const sc=FMs.reduce((s,f)=>s+f.desp.semComp,0);if(sc)fRows.push(['Despesas pagas sem comprovante',sc+' valor(es) na prestação de contas','']);}
  if(EX.semComp)fRows.push(['Pagamentos extraordinários sem comprovante',EX.semComp+' pago(s) sem comprovante anexado','']);
  const per=nM>1?mesL(yms[0])+' a '+mesL(yms[nM-1]):mesL(yms[0]);
  sec('Financeiro',[
    ['Despesas do período',desp==null?'—':fmtMoney(desp),'',desp==null?'sem lançamentos na prestação de contas':(despVar==null?'sem base no período anterior':pctTxt(despVar)+' vs período anterior')+' · pago '+fmtMoney(FMs.reduce((s,f)=>s+(f.desp.pago||0),0))+' · a pagar '+fmtMoney(FMs.reduce((s,f)=>s+(f.desp.naoPago||0),0))],
    ['Recorrentes previstos',fmtMoney(prev),'','pago '+fmtMoney(pago)+(semV?' · '+semV+' sem valor definido':'')],
    ['Recorrentes vencidos não pagos',fmtMoney(vencV),vencI.length?'neg':'',vencI.length+' item(ns)'+(vencI.some(i=>i.v==null)?' · há itens sem valor':'')],
    ['Reembolsos a receber',RB.aReceber==null?'—':fmtMoney(RB.aReceber),'',(RB.aReceber==null?'nenhum registrado':(RB.corp.n+RB.med.n)+' item(ns) · recebido '+fmtMoney(FMs.reduce((s,f)=>s+f.reemb.recebidoMes,0)))+(RB.aPagar!=null?' · a pagar '+fmtMoney(RB.aPagar):'')],
    ['Empréstimos: a receber · a pagar',EM.has?fmtMoney(EM.receber.v)+' · '+fmtMoney(EM.pagar.v):'—','',EM.has?(EM.receber.n+EM.pagar.n)+' em aberto'+(EM.receber.venc.n+EM.pagar.venc.n?' · '+(EM.receber.venc.n+EM.pagar.venc.n)+' vencido(s)':''):'nenhum registrado']],
    ['Item','Situação','Valor'],fRows,
    'Despesas: prestação de contas (fluxos de cada pessoa), competência '+per+'. Recorrentes: só os pagamentos recorrentes cadastrados no cronograma; não representam o total de despesas nem de pagamentos do período'+(EX.n?' (pagamentos extraordinários no período: '+fmtMoney(EX.v)+')':'')+'. Reembolsos, empréstimos e parcelas: saldos de hoje.');
  // DP
  const pOk=pid=>{const p=personById(pid);return !p||ownerOk(p.executivo);};
  const pg=recs('dp-pag').filter(p=>pOk(p.pessoa)&&inR(p.dataPag,a,b));const pgPago=pg.filter(p=>p.status==='Pago');
  const mv=recs('dp-mov').filter(m=>pOk(m.pessoa)&&inR(m.data,a,b));const oc=recs('dp-oc').filter(o=>pOk(o.pessoa)&&inR(o.data,a,b));
  const cnt=(l,k)=>{const o={};l.forEach(x=>{const v=x[k]||'Outro';o[v]=(o[v]||0)+1;});return Object.entries(o).map(([k,v])=>k+': '+v).join(' · ');};
  {const yy=+ref.slice(0,4);const dc=decimo(yy).filter(r=>ownerOk(r.p.executivo));
  const ocr=ocResumo(a,b).filter(r=>pOk(r.pid));const fd=ocr.reduce((x,r)=>x+r.fd,0),ad=ocr.reduce((x,r)=>x+r.ad,0);
  const pacP=equipe().find(p=>+p.pacoteDiarias&&isActive(p.id)&&ownerOk(p.executivo));const pk=pacP&&pacoteOf(pacP);
  const fr=dpEventos().filter(e=>(!e.p||ownerOk(e.p.executivo))&&e.d>=ref&&e.d<=addDays(ref,90)).map(e=>['Pela frente',e.t,String(e.s||'').slice(0,90),brD(e.d)]);
  const fp=feriasProx().filter(x=>ownerOk(x.p.executivo)&&x.m.data>=ref&&x.m.data<=addDays(ref,60));
  sec('DP',[
    (()=>{const o=dpObrig(30).filter(e=>!e.p||ownerOk(e.p.executivo));return ['Obrigações em 30 dias',o.length,o.length?'warn':'',o.length?o.map(e=>e.t.replace(' · ',' ')+' em '+brD(e.d)).join(', '):'13º, dissídio e movimentações'];})(),
    (()=>{const fv=feriasVencer(60).filter(x=>ownerOk(x.p.executivo));const n=fp.length+fv.length;return ['Férias em 60 dias',n,fv.length?'neg':n?'warn':'',n?fp.length+' programada(s) · '+fv.length+' a vencer'+(n?': '+fp.map(f=>String(f.p.nome).split(' ')[0]+' sai em '+brD(f.m.data)).concat(fv.map(x=>String(x.p.nome).split(' ')[0]+' vence em '+brD(x.lim))).join(', '):''):'nada programado nem a vencer'];})(),
    ['Faltas e atestados',(fd+ad)+' dia(s)',fd+ad?'warn':'',fd+' de falta · '+ad+' de atestado'],
    pk?['Saldo de diárias · '+String(pacP.nome).split(' ')[0],pacSaldoTxt(pk.saldo),'','meses fechados, pacote de '+pk.pac+' por mês']:null,
    ['Movimentações',mv.length]],
    ['Grupo','Registro','Detalhe','Data'],
    fr.concat(mv.filter(m=>m.tipo!=='Outro'&&m.tipo!=='Registro inicial').map(m=>['Movimentação no período',refName('equipe',m.pessoa)+' · '+(m.tipo||'Movimentação'),String(m.descricao||m.obs||'').split('\n')[0].slice(0,90),brD(m.data)+(m.dataFim?' a '+brD(m.dataFim):'')])).concat(ocr.map(r=>['Faltas e atestados',refName('equipe',r.pid),[r.fd?r.fd+' dia(s) de falta':'',r.ad?r.ad+' dia(s) de atestado':''].filter(Boolean).join(' · '),brD(r.last)])).concat(oc.filter(o=>o.tipo!=='Falta'&&o.tipo!=='Atestado').length?[['Outras ocorrências','',cnt(oc.filter(o=>o.tipo!=='Falta'&&o.tipo!=='Atestado'),'tipo'),'']]:[]),
    'Pela frente: 13º, férias, reajustes, dissídio e outras movimentações com data nos próximos 90 dias. Registros do eSocial sem tipo definido ficam de fora.');}
  // Facilities
  const aOk=id=>{const x=ativoById(id);return !x||ownerOk(x.executivo);};
  const ch=recs('fac-ch').filter(c=>aOk(c.ativo));const svc=ch.filter(c=>inR(c.concluidoEm,a,b));
  const fset=descendants('p-fac');const ft=[...S.tasks.values()].filter(t=>fset.has(t.categoryId)&&taskExec(t));const facItem=t=>{const pth=t.categoryId?catPath(t.categoryId):[];return pth.length>1?pth[pth.length-1].name:'';};
  const chAb=ft.filter(t=>inR(t.createdAt,a,b));const chCon=ft.filter(t=>!isOpen(t)&&inR(t.completedAt,a,b));const chOpen=ft.filter(isOpen);
  const venc=recs('fac-rec').filter(r=>aOk(r.ativo)&&!r.encerrada&&r.proxima&&r.proxima<=addDays(ref,30));
  sec('Facilities',[['Chamados abertos no período',chAb.length],['Concluídos no período',chCon.length],['Em aberto hoje',chOpen.length,chOpen.length?'warn':''],['Custo de serviços registrados',fmtMoney(sum(svc,'custo'))],['Vencimentos (30 dias)',venc.length,venc.some(r=>r.proxima<t0)?'neg':'']],
    ['Item','Situação','Data'],
    chCon.map(t=>[t.title+(facItem(t)?' · '+facItem(t):''),'Concluído',brD(String(t.completedAt||'').slice(0,10))])
      .concat(chOpen.map(t=>[t.title+(facItem(t)?' · '+facItem(t):''),ST[t.status]||'Aberto',t.due?'prazo '+brD(t.due):'']))
      .concat(venc.sort((x,y)=>x.proxima.localeCompare(y.proxima)).map(r=>[r.titulo+(ativoById(r.ativo)?' · '+ativoById(r.ativo).nome:''),(r.proxima<t0?'Vencido':'Vence')+(r.categoria?' · '+r.categoria:''),brD(r.proxima)])));
  // Saúde: só agenda e reembolsos
  const sv=recs('sau-ev').filter(e=>pOk(e.pessoa));const svR=sv.filter(e=>inR(e.data,a,b));const svP=sv.filter(e=>e.data&&e.data>t0&&e.data<=addDays(t0,30)&&e.status!=='Cancelado');
  const fn=pid=>{const p=personById(pid);return p?p.nome.split(' ')[0]:'';};
  sec('Saúde',[['Agenda no período',svR.length],['Próximos 30 dias',svP.length],['Reembolsos médicos em aberto',fmtMoney(sum(rm,'valor')),'',rm.length+' item(ns)']],
    ['Pessoa','Tipo','Data'],
    svR.sort((x,y)=>x.data.localeCompare(y.data)).map(e=>[fn(e.pessoa),(e.tipo||'Consulta')+' · realizado no período',brD(e.data)]).concat(svP.sort((x,y)=>x.data.localeCompare(y.data)).map(e=>[fn(e.pessoa),(e.tipo||'Consulta')+' · agendado',brD(e.data)])),
    'Somente agenda e reembolsos; sem detalhes clínicos.');
  // Negócios
  const eOk=id=>{const e=empById(id);return !e||ownerOk(e.executivo);};
  const ob=obrList().filter(o=>eOk(o.empresa)&&!o.encerrada&&o.proxima);const obAt=ob.filter(o=>o.proxima<t0);const obPx=ob.filter(o=>o.proxima>=t0&&o.proxima<=addDays(t0,30));
  const dc=recs('neg-doc').filter(d=>eOk(d.empresa)&&d.status!=='Encerrado'&&d.vencimento&&d.vencimento<=addDays(t0,60));
  const en=id=>{const e=empById(id);return e?' · '+e.nome:'';};
  sec('Negócios',[['Obrigações atrasadas',obAt.length,obAt.length?'neg':''],['Obrigações em 30 dias',obPx.length],['Contratos vencidos ou em 60 dias',dc.length,dc.length?'warn':'']],
    ['Item','Situação','Data'],
    obAt.map(o=>[o.titulo+en(o.empresa),'Atrasada',brD(o.proxima)]).concat(obPx.map(o=>[o.titulo+en(o.empresa),'Próxima'+(o.categoria?' · '+o.categoria:''),brD(o.proxima)])).concat(dc.map(d=>[d.titulo+en(d.empresa),d.vencimento<t0?'Contrato vencido':'Contrato vence',brD(d.vencimento)])));
  // Boards
  const rr=recs('brd-reun').filter(r=>brdOwnerOk(r.board));const bn=id=>{const x=boardById(id);return x?' · '+x.nome:'';};
  const rrP=rr.filter(r=>inR(r.data,a,b)&&r.status!=='Cancelada');const rrN=rr.filter(r=>reunUp(r)&&r.data<=addDays(t0,30));
  const ev=brdEvs();const evP=ev.filter(e=>inR(e.data,a,b));const evN=ev.filter(e=>e.data>t0&&e.data<=addDays(t0,30));
  sec('Conselhos e Programas',[['Reuniões no período',rrP.length],['Reuniões nos próximos 7 dias',rr.filter(r=>reunUp(r)&&r.data<=addDays(t0,7)).length],['Eventos no período',evP.length],['Eventos nos próximos 30 dias',evN.length]],
    ['Reunião ou evento','Situação','Data'],
    rrP.map(r=>[(r.titulo||'Reunião')+bn(r.board),'Reunião · '+(r.status||'Agendada'),brD(r.data)]).concat(rrN.map(r=>[(r.titulo||'Reunião')+bn(r.board),'Reunião · próxima',brD(r.data)])).concat(evP.map(e=>[(e.titulo||'Evento')+bn(e.board),'Evento · no período',brD(e.data)])).concat(evN.map(e=>[(e.titulo||'Evento')+bn(e.board),'Evento · próximo',brD(e.data)])));
  // Família e Viagens
  const fe=recs('fam-ev').filter(e=>!e.pessoa||pOk(e.pessoa)).map(e=>({e,n:nextOcc(e)})).filter(x=>x.n&&x.n>=t0&&x.n<=addDays(t0,30));
  const fd=recs('fam-doc').filter(d=>d.validade&&pOk(d.pessoa)&&(docLate(d)||docSoon(d)));
  const vs=recs('via').filter(v=>ownerOk(v.executivo)&&v.status!=='Cancelada'&&v.inicio);const vP=vs.filter(v=>v.inicio<=b&&(v.fim||v.inicio)>=a);const vN=vs.filter(v=>v.inicio>t0&&v.inicio<=addDays(t0,30));
  const vg=recs('via-gasto').filter(g=>{const v=viaById(g.viagem);return v&&vs.includes(v)&&g.reembolsavel==='Sim'&&!g.reembLancado;});
  sec('Família, Rotina e Viagens',[['Viagens no período',vP.length],['Viagens em 30 dias',vN.length],['Gastos a reembolsar',fmtMoney(sum(vg,'valor')),vg.length?'warn':'',vg.length+' gasto(s)'],['Eventos em 30 dias',fe.length],['Documentos a vencer',fd.length,fd.some(docLate)?'neg':fd.length?'warn':'']],
    ['Item','Situação','Data'],
    vP.map(v=>[v.titulo,'Viagem no período',brD(v.inicio)+(v.fim&&v.fim!==v.inicio?' a '+brD(v.fim):'')]).concat(vN.map(v=>[v.titulo,'Próxima viagem',brD(v.inicio)])).concat(fe.map(x=>[x.e.titulo,x.e.tipo||'Evento',brD(x.n)])).concat(fd.map(d=>[(d.tipo||'Documento')+' · '+fn(d.pessoa),docLate(d)?'Vencido':'A vencer',brD(d.validade)])));
  // destaques
  const hl=[];if(atras.length)hl.push(atras.length+' demanda(s) atrasada(s) na Operação');if(vencI.length)hl.push(vencI.length+' pagamento(s) recorrente(s) vencido(s) e não pago(s)');if(sol.some(r=>r.venc&&r.venc<t0))hl.push('Pagamento(s) extraordinário(s) vencido(s)');
  if(obAt.length)hl.push(obAt.length+' obrigação(ões) de empresa atrasada(s)');if(fd.some(docLate))hl.push('Documento(s) da família vencido(s)');
  if(chOpen.length)hl.push(chOpen.length+' chamado(s) de Facilities em aberto');if(vg.length)hl.push(fmtMoney(sum(vg,'valor'))+' em gastos de viagem a reembolsar');
  // abertura do report: o que foi feito, precisa de você, próximos 30 dias
  const kv=(st,lb)=>{const x=secs.find(q=>q.t===st);const k=x&&x.kpis.find(q=>q[0]===lb);return k?k[1]:null;};
  const catN=t=>{const p=t.categoryId&&catById(t.categoryId)?catPath(t.categoryId):[];return p[0]?p[0].name:'';};
  const nz=v=>v!=null&&v!==0&&v!=='0'&&v!=='R$ 0,00'&&v!=='—';
  const feito=[];if(done.length)feito.push([String(done.length),done.length>1?'demandas concluídas':'demanda concluída']);
  if(pago>0)feito.push([fmtMoney(pago),'pagos no cronograma (recorrentes)']);
  const dpg=kv('DP','Pagamentos no período');if(nz(dpg))feito.push([String(dpg),'pagamentos da equipe']);
  const reu=kv('Conselhos e Programas','Reuniões no período');if(nz(reu))feito.push([String(reu),+reu>1?'reuniões de conselho e comitês':'reunião de conselho ou comitê']);
  const vgp=kv('Família, Rotina e Viagens','Viagens no período');if(nz(vgp))feito.push([String(vgp),+vgp>1?'viagens no período':'viagem no período']);
  const entregas=done.filter(t=>t.reportRel).sort((x,y)=>String(x.completedAt).localeCompare(String(y.completedAt))).map(t=>[t.title||'',catN(t),brD(t.completedAt)]);
  const precisa=tk.filter(t=>isOpen(t)&&t.needsExec).sort((x,y)=>(x.due||'9999').localeCompare(y.due||'9999')).map(t=>[t.title||'',catN(t),t.due?'até '+brD(t.due):'sem prazo']);
  const t30=addDays(t0,30);const EXK=new Set(['Reunião','Conselho/Programa','Viagem','Visitante','Evento','Família','Contrato','Agendamento']);
  let prox=[];try{prox=compute(30).upcoming.filter(u=>u.date&&u.date>t0&&EXK.has(u.kind)).map(u=>[u.title||'',u.kind==='Conselho/Programa'?'Mandato':u.kind||'',u.date]);}catch(e){prox=[];}
  prox=prox.concat(tk.filter(t=>isOpen(t)&&t.reportRel&&t.due&&t.due>t0&&t.due<=t30).map(t=>[t.title||'',catN(t),t.due])).sort((x,y)=>x[2].localeCompare(y[2])).map(r=>[r[0],r[1],brD(r[2])]);
  return {a,b,secs,hl:hl.slice(0,5),done:done.length,hero:{feito,entregas,precisa,prox,pT:S.exec?'Precisa de você':'Precisa de vocês',pNo:S.exec?'Nada pendente com você.':'Nada pendente com vocês.'}};
}
function relHtmlTable(s){if(!s.rows.length)return '<ul class="list"><li><div class="empty">Nada a listar neste período.</div></li></ul>';
  return '<div class="rel-tbl'+(s.cls?' '+s.cls:'')+'"><table><thead><tr>'+s.head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i===0?' class="nm"':'')+'>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function renderRel(){
  const el=$('#v-rel');if(!el)return;const R=relBuild();
  let h='<div class="wrap"><div class="hello"><div><h2>Relatórios</h2><p>'+esc(relScopeLabel())+' · '+brD(R.a)+' a '+brD(R.b)+'. O executivo segue o filtro da barra superior.</p></div></div>';
  h+='<div class="rel-bar"><div class="seg" role="group" aria-label="Período">'+REL_PERS.map(([k,l])=>'<button data-rel-per="'+k+'" class="'+(S.rel.per===k?'on':'')+'">'+l+'</button>').join('')+'</div>'+
    (S.rel.per==='custom'?'<label class="sr" for="rel-a">De</label><input class="sel" type="date" id="rel-a" value="'+esc(R.a)+'"><span class="hint">até</span><label class="sr" for="rel-b">Até</label><input class="sel" type="date" id="rel-b" value="'+esc(R.b)+'">':'')+
    '<span class="grow"></span><div class="rx-wrap"><button class="rx-btn" data-rx-toggle aria-haspopup="true" aria-expanded="false" title="Exportar" aria-label="Exportar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button><div class="rx-menu" hidden><button data-rel-x="pdf" data-orient="paisagem"><b>PDF · paisagem</b><small>Como apresentação, um slide por categoria</small></button><button data-rel-x="pdf" data-orient="retrato"><b>PDF · retrato</b><small>A4, seções em sequência</small></button><button data-rel-x="xlsx"><b>Excel</b><small>Todos os dados, para conferir e filtrar</small></button><button data-rel-x="drive"><b>Salvar no Drive</b><small>Na pasta 11 Relatórios</small></button></div></div><a class="rx-ico" href="https://drive.google.com/drive/folders/'+REL_FOLDER+'" target="_blank" rel="noopener" title="Relatórios mensais no Drive" aria-label="Relatórios mensais no Drive"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></a></div>';
  {const Hh=R.hero;const li=(r)=>'<li><span class="t">'+esc(r[0])+'</span><span class="m">'+esc([r[1],r[2]].filter(Boolean).join(' · '))+'</span></li>';
   h+='<div class="sec-h"><h3>Destaques</h3></div><div class="hero3">'+
    '<div class="h3c"><h4>O que foi feito</h4>'+(Hh.feito.length?'<div class="h3n">'+Hh.feito.map(f=>'<div><b>'+esc(f[0])+'</b><span>'+esc(f[1])+'</span></div>').join('')+'</div>':'<p class="hint">Sem registros no período.</p>')+
      (Hh.entregas.length?'<h5>Entregas em destaque</h5><ul>'+Hh.entregas.slice(0,6).map(li).join('')+'</ul>'+(Hh.entregas.length>6?'<p class="hint">+ '+(Hh.entregas.length-6)+'</p>':''):'<p class="hint h3tip">Marque “Relevante para o executivo” nas demandas para que as entregas apareçam aqui.</p>')+'</div>'+
    '<div class="h3c"><h4>'+esc(Hh.pT)+'</h4>'+(Hh.precisa.length?'<ul>'+Hh.precisa.slice(0,8).map(li).join('')+'</ul>':'<p class="h3ok">'+esc(Hh.pNo)+'</p>')+'</div>'+
    '<div class="h3c"><h4>Próximos 30 dias</h4>'+(Hh.prox.length?'<ul>'+Hh.prox.slice(0,8).map(li).join('')+'</ul>'+(Hh.prox.length>8?'<p class="hint">+ '+(Hh.prox.length-8)+' na agenda</p>':''):'<p class="hint">Nada agendado.</p>')+'</div></div>';}
  R.secs.forEach(s=>{h+='<section><div class="sec-h"><h3>'+esc(s.t)+'</h3>'+(s.cls?'':'<span class="cnt">'+s.rows.length+'</span>')+(s.cls==='op'?'<button class="sec-link" data-op-rep>Ver relatório detalhado ›</button>':'')+'</div><div class="kpis">'+s.kpis.map(k=>kpi(k[0],esc(String(k[1])),k[2]||'',k[3]?esc(k[3]):'')).join('')+'</div>'+(s.note?'<p class="hint" style="margin:6px 2px 8px">'+esc(s.note)+'</p>':'<div style="height:8px"></div>')+relHtmlTable(s)+'</section>';});
  h+='<p class="hint">Todo dia 1º, às 7h54, um relatório do mês anterior (Fernando, Leticia e os dois) é salvo automaticamente na pasta 11 Relatórios do Drive.</p></div>';
  el.innerHTML=h;
}
function relFileBase(R){return 'Report-'+(S.exec||'os-dois')+'-'+R.a+'-a-'+R.b;}

const REL_PDF_THEME='mentarosa';const REL_PDF_ORIENT='paisagem';
const REL_PDF_THEMES={
  menta:{band:[230,240,234],bandInk:[31,42,37],bandMuted:[82,97,89],dot:[219,68,121],accent:[63,122,98]},
  mentarosa:{band:[230,240,234],bandInk:[31,42,37],bandMuted:[82,97,89],dot:[219,68,121],accent:[63,122,98],accent2:[219,68,121],bar2:[219,68,121],repAccent:true},
  mentarosa2:{band:[230,240,234],bandInk:[31,42,37],bandMuted:[82,97,89],dot:[219,68,121],accent:[63,122,98],accent2:[219,68,121],bar2:[242,184,203],rule:[242,184,203]},
  rosa:{band:[251,225,234],bandInk:[58,28,40],bandMuted:[140,70,96],dot:[219,68,121],accent:[176,48,94]},
  floresta:{band:[31,59,48],bandInk:[255,255,255],bandMuted:[191,221,209],dot:[239,160,180],accent:[63,122,98]},
  branco:{band:null,dot:[219,68,121],accent:[62,150,138]}
};
let relFontB64=null;
async function relFonts(doc){
  const list=[['Sora','normal','fonts/Sora_600SemiBold.ttf'],['Jakarta','normal','fonts/PlusJakartaSans_400Regular.ttf'],['Jakarta','bold','fonts/PlusJakartaSans_600SemiBold.ttf'],['Jakarta','italic','fonts/PlusJakartaSans_400Regular_Italic.ttf']];
  try{if(!relFontB64){relFontB64=await Promise.all(list.map(async x=>{const r=await fetch(x[2]);if(!r.ok)throw new Error('font');const u=new Uint8Array(await r.arrayBuffer());let b='';for(let i=0;i<u.length;i+=8192)b+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(b);}));}
    list.forEach((x,i)=>{const fn=x[2].split('/').pop();doc.addFileToVFS(fn,relFontB64[i]);doc.addFont(fn,x[0],x[1]);});return true;}catch(e){relFontB64=null;return false;}}
let relLibs={};
function relLoad(src,glob){if(relLibs[src])return relLibs[src];relLibs[src]=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src=src;sc.onload=()=>res(glob());sc.onerror=()=>{delete relLibs[src];rej(new Error('load'));};document.head.appendChild(sc);});return relLibs[src];}
async function relDownloads(){try{return (window.claude&&typeof window.claude.use==='function')?await window.claude.use('downloads'):null;}catch(e){return null;}}
async function relSave(name,blob){const d=await relDownloads();if(!d){toast('A exportação só funciona com a página aberta pelo claude.ai.');return;}
  try{await d.save({filename:name,data:blob});toast('Arquivo salvo');}catch(e){const c=e&&e.code;if(c==='declined')return;toast(c==='rate_limited'?'Já há um download esperando sua confirmação.':'Não foi possível salvar o arquivo.');}}
async function relExport(kind){
  const R=relBuild();const title='Report · '+relScopeLabel()+' · '+brD(R.a)+' a '+brD(R.b);
  if(kind==='xlsx'){let X;try{X=await relLoad('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>window.XLSX);}catch(e){toast('Não foi possível preparar o Excel.');return;}
    const wb=X.utils.book_new();const Hx=R.hero;const res=[[title],[],['DESTAQUES'],[],['O que foi feito']].concat(Hx.feito.map(f=>[f[1],f[0]])).concat(Hx.entregas.length?[[],['Entregas em destaque']].concat(Hx.entregas.map(r=>[r[0],r[1]+' · '+r[2]])):[]).concat([[],[Hx.pT]]).concat(Hx.precisa.length?Hx.precisa.map(r=>[r[0],r[1]+' · '+r[2]]):[['Nada pendente']]).concat([[],['Próximos 30 dias']]).concat(Hx.prox.length?Hx.prox.map(r=>[r[0],r[1]+' · '+r[2]]):[['Nada agendado']]);R.secs.forEach(s=>{res.push([],[s.t]);s.kpis.forEach(k=>res.push([k[0],String(k[1])+(k[3]?' ('+k[3]+')':'')]));});
    const ws=X.utils.aoa_to_sheet(res);ws['!cols']=[{wch:40},{wch:30}];X.utils.book_append_sheet(wb,ws,'Resumo');
    R.secs.forEach(s=>{const w=X.utils.aoa_to_sheet([s.head].concat(s.rows));w['!cols']=[{wch:55},{wch:40},{wch:30},{wch:22}];X.utils.book_append_sheet(wb,w,s.t.slice(0,31).replace(/[\\/?*\[\]:]/g,' '));});
    const buf=X.write(wb,{bookType:'xlsx',type:'array'});return relSave(relFileBase(R)+'.xlsx',new Blob([buf]));}
  if(kind==='pdf'){let J;try{J=await relLoad('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',()=>window.jspdf);await relLoad('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',()=>true);}catch(e){toast('Não foi possível preparar o PDF.');return;}
    /* PDF: paisagem 16:9 (um slide por seção) ou retrato A4 (seções em sequência) */
    const LAND=(window.__pdfOrient||REL_PDF_ORIENT)!=='retrato';
    const W=LAND?960:595.28,Hh=LAND?540:841.89,L=LAND?56:48,CW=W-2*L,PG=LAND?[960,540]:'a4',OR=LAND?'landscape':'portrait';
    const doc=new J.jsPDF({unit:'pt',format:PG,orientation:OR});
    const fok=await relFonts(doc);const FD=fok?'Sora':'helvetica',FB=fok?'Jakarta':'helvetica';
    const TH=REL_PDF_THEMES[window.__pdfTheme||REL_PDF_THEME]||REL_PDF_THEMES.menta;
    const C=Object.assign({ink:[31,42,37],muted:[82,97,89],faint:[126,140,132],line:[211,224,216],hair:[228,236,231],mag:[219,68,121],white:[255,255,255],paper:[255,255,255]},TH);if(!C.accent2)C.accent2=C.accent;if(!C.rule)C.rule=C.line;
    const tc=k=>doc.setTextColor(...C[k]),fc=k=>doc.setFillColor(...C[k]),dc=k=>doc.setDrawColor(...C[k]);
    const D=sz=>{doc.setFont(FD,'normal');doc.setFontSize(sz);},B=(sz,st)=>{doc.setFont(FB,st==='b'?'bold':st==='i'?'italic':'normal');doc.setFontSize(sz);};
    const fitD=(t,max,w)=>{let z=max;D(z);while(z>9&&doc.getTextWidth(t)>w){z-=0.5;D(z);}return z;};
    const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const sameM=R.a.slice(0,7)===R.b.slice(0,7)&&R.a.slice(8)==='01';const perLbl=sameM?(MES[+R.a.slice(5,7)-1].replace(/^./,c=>c.toUpperCase())+' de '+R.a.slice(0,4)):brD(R.a)+' a '+brD(R.b);
    const S1=LAND?1:0.78;/* escala de tipos */
    const paint=()=>{fc('paper');doc.rect(0,0,W,Hh,'F');fc('accent');doc.rect(0,0,W,LAND?5:4,'F');if(C.bar2){fc('bar2');doc.rect(W*0.72,0,W*0.28,LAND?5:4,'F');}};const newPage=()=>{doc.addPage(PG,OR);paint();};
    const secHead=(num,t,y,cont)=>{const ts=17*S1,ns=13*S1;D(ns);tc('accent2');doc.text(num,L,y-(ts-ns)*0.36);const nw=doc.getTextWidth(num);D(ts);tc('ink');doc.text(t+(cont?'  ·  continuação':''),L+nw+10*S1,y);};
    /* capa */
    if(LAND){if(C.band){fc('band');doc.rect(0,0,W,Hh,'F');}else{fc('paper');doc.rect(0,0,W,Hh,'F');fc('accent');doc.rect(0,0,8,Hh,'F');}}
    else{if(C.band){fc('band');doc.rect(0,0,W,250,'F');}else{fc('accent');doc.rect(0,0,W,4,'F');}}
    if(C.panel){fc('panel');if(LAND)doc.rect(W*0.7,0,W*0.3,Hh,'F');else doc.rect(W*0.74,0,W*0.26,250,'F');}
    if(C.bar2&&!C.panel&&!C.repAccent){fc('bar2');if(LAND)doc.rect(0,Hh-14,W,14,'F');else doc.rect(0,246,W,4,'F');}
    const ci=C.band?'bandInk':'ink',cm=C.band?'bandMuted':'muted';
    const cy=LAND?[74,250,302,338]:[60,128,170,198];
    fc('dot');doc.circle(L+4,cy[0]-3,4,'F');B(9*S1+1,'b');tc(cm);doc.text('CENTRAL EXECUTIVA',L+16,cy[0]+0.5,{charSpace:1.5});
    if(!LAND){B(8);tc(cm);doc.text('Gerado em '+brD(todayISO()),W-L,cy[0]+0.5,{align:'right'});}
    B(LAND?11:9,'b');tc(C.repAccent||C.accent2!==C.accent?'accent2':cm);doc.text('REPORT',L,cy[1],{charSpace:2});
    D(LAND?46:30);tc(ci);doc.text(relScopeLabel(),L,cy[2]);
    D(LAND?20:14);tc(cm);doc.text(perLbl+(LAND?'':'  ·  '+brD(R.a)+' a '+brD(R.b)),L,cy[3]);
    if(LAND){B(10);tc(cm);doc.text(brD(R.a)+' a '+brD(R.b)+'   ·   gerado em '+brD(todayISO()),L,Hh-60);}
    let n=1,y=LAND?0:(C.band?290:240);
    /* resumo: o que foi feito, precisa de você, próximos 30 dias */
    {const Hx=R.hero;const num=String(n).padStart(2,'0');n++;
     if(LAND){newPage();secHead(num,'Destaques',62);y=104;}else{secHead(num,'Destaques',y);y+=28;}
     const colW=LAND?(CW-48)/3:CW,gx=LAND?24:0;const y0=y;let yMax=y;
     const block=(ix,title,fn)=>{const x=L+(LAND?ix*(colW+gx):0);let yy=LAND?y0:y;if(!LAND&&yy>Hh-120){newPage();yy=64;}
       B(LAND?7.5:6.8,'b');tc('accent2');doc.text(title.toUpperCase(),x,yy,{charSpace:0.8});yy+=6;dc('ink');doc.setLineWidth(0.7);doc.line(x,yy,x+colW,yy);yy+=(LAND?18:14);
       yy=fn(x,yy);if(LAND)yMax=Math.max(yMax,yy);else y=yy+18;};
     const items=(x,yy,rows,max,empty)=>{if(!rows.length){B(LAND?10:8.6,'i');tc('faint');doc.text(empty,x,yy);return yy+16;}
       rows.slice(0,max).forEach(r=>{if(!LAND&&yy>Hh-80){newPage();yy=64;}const tl=doc.splitTextToSize(r[0],colW);B(LAND?10:8.6);tc('ink');doc.text(tl.slice(0,2),x,yy);yy+=Math.min(tl.length,2)*(LAND?12.5:10.5);
         B(LAND?8:7);tc('faint');doc.text([r[1],r[2]].filter(Boolean).join('  ·  '),x,yy);yy+=(LAND?7:5);dc('hair');doc.setLineWidth(0.5);doc.line(x,yy,x+colW,yy);yy+=(LAND?13:11);});
       if(rows.length>max){B(LAND?8:7,'i');tc('faint');doc.text('+ '+(rows.length-max)+' no detalhe',x,yy);yy+=12;}return yy;};
     block(0,'O que foi feito',(x,yy)=>{const per=LAND?2:4;const cw2=colW/per;Hx.feito.forEach((f,i)=>{const cx=x+(i%per)*cw2,cy=yy+Math.floor(i/per)*(LAND?42:36);fitD(String(f[0]),LAND?20:15,cw2-8);tc('ink');doc.text(String(f[0]),cx,cy+(LAND?14:11));B(LAND?8:7);tc('faint');doc.text(doc.splitTextToSize(f[1],cw2-8).slice(0,2),cx,cy+(LAND?26:21));});
       yy+=Math.ceil(Hx.feito.length/per)*(LAND?42:36)+(Hx.feito.length?6:0);if(!Hx.feito.length){B(LAND?10:8.6,'i');tc('faint');doc.text('Sem registros no período.',x,yy);yy+=16;}
       if(Hx.entregas.length){B(LAND?7:6.3,'b');tc('faint');doc.text('ENTREGAS EM DESTAQUE',x,yy,{charSpace:0.6});yy+=14;yy=items(x,yy,Hx.entregas,LAND?4:6,'');}return yy;});
     block(1,Hx.pT,(x,yy)=>items(x,yy,Hx.precisa,LAND?7:8,Hx.pNo));
     block(2,'Próximos 30 dias',(x,yy)=>items(x,yy,Hx.prox,LAND?7:8,'Nada agendado.'));
     if(LAND)y=yMax;else y+=10;}
    /* seções */
    R.secs.forEach(s=>{const num=String(n).padStart(2,'0');n++;
      if(LAND){newPage();secHead(num,s.t,62);y=104;}
      else{const need=120+(s.rows.length?60:0);if(y+need>Hh-60){newPage();y=64;}else{dc('rule');doc.setLineWidth(0.6);doc.line(L,y-22,W-L,y-22);}secHead(num,s.t,y);y+=26;}
      if(s.kpis.length){const k5=s.kpis.length,cw=CW/k5,gap=LAND?16:10;
        s.kpis.forEach((k,ix)=>{const x=L+ix*cw;const px=x+(ix?gap:0);const vw=cw-(ix?gap:0)-8;if(ix){dc('hair');doc.setLineWidth(0.7);doc.line(x,y,x,y+(LAND?58:46));}
          B(LAND?7.5:6.5,'b');tc('faint');const lb=doc.splitTextToSize(String(k[0]).toUpperCase(),vw);doc.text(lb.slice(0,2),px,y+9,{charSpace:0.5});
          const off=lb.length>1?(LAND?48:38):(LAND?42:32);fitD(String(k[1]),LAND?26:18,vw);tc(k[2]==='neg'?'mag':'ink');doc.text(String(k[1]),px,y+off);
          if(k[3]){B(LAND?8:7);tc('faint');doc.text(doc.splitTextToSize(String(k[3]),vw)[0],px,y+off+(LAND?14:11));}});
        y+=LAND?82:66;}
      y+=LAND?4:2;/* legendas explicativas ficam só na tela, não no PDF */
      if(s.rows.length){const numc=s.cls==='op';const cs={};s.head.forEach((h,c)=>{if((numc&&c>0)||/^valor/i.test(h))cs[c]={halign:'right'};});let first=true;
        doc.autoTable({startY:y,head:[s.head.map(h=>String(h).toUpperCase())],body:s.rows,margin:{left:L,right:L,bottom:52,top:LAND?96:60},theme:'plain',columnStyles:cs,showHead:'everyPage',
          styles:{font:FB,fontStyle:'normal',fontSize:LAND?9.5:8.2,textColor:C.ink,cellPadding:{top:LAND?6:4.5,bottom:LAND?6:4.5,left:0,right:12},overflow:'linebreak'},
          headStyles:{font:FB,fontStyle:'bold',textColor:C.faint,fontSize:LAND?7.5:6.5,cellPadding:{top:4,bottom:6,left:0,right:12}},
          willDrawPage:d=>{if(!first){paint();if(LAND)secHead(num,s.t,62,true);else secHead(num,s.t,40,true);}first=false;},
          didParseCell:d=>{if(d.section==='head'&&cs[d.column.index])d.cell.styles.halign='right';if(d.column.index===s.head.length-1)d.cell.styles.cellPadding=Object.assign({},d.cell.styles.cellPadding,{right:0});if(numc&&d.section==='body'&&String(d.row.raw[0])==='Total')d.cell.styles.fontStyle='bold';},
          didDrawCell:d=>{if(d.section==='head'){doc.setDrawColor(...C.ink);doc.setLineWidth(0.8);doc.line(d.cell.x,d.cell.y+d.cell.height,d.cell.x+d.cell.width,d.cell.y+d.cell.height);}
            else{const tot=numc&&String(d.row.raw[0])==='Total';doc.setDrawColor(...(tot?C.ink:C.hair));doc.setLineWidth(tot?0.8:0.5);if(tot)doc.line(d.cell.x,d.cell.y,d.cell.x+d.cell.width,d.cell.y);else doc.line(d.cell.x,d.cell.y+d.cell.height,d.cell.x+d.cell.width,d.cell.y+d.cell.height);}}});
        y=doc.lastAutoTable.finalY+(LAND?0:48);}
      else{B(LAND?11:9,'i');tc('faint');doc.text('Nada a listar neste período.',L,y+8);y+=LAND?0:50;}
    });
    /* rodapé */
    const np=doc.internal.getNumberOfPages();for(let pg=(LAND?2:1);pg<=np;pg++){doc.setPage(pg);B(LAND?8:7);tc('faint');doc.text('Painel  ·  '+relScopeLabel()+'  ·  '+perLbl,L,Hh-26);doc.text(String(pg).padStart(2,'0')+' / '+String(np).padStart(2,'0'),W-L,Hh-26,{align:'right'});}
    return relSave(relFileBase(R)+'.pdf',doc.output('blob'));}
  if(kind==='drive'){const m=await getMcp();if(!m){toast('O Google Drive não está disponível nesta visualização.');return;}
    const html='<h1>'+esc(title)+'</h1><p><i>Gerado em '+brD(todayISO())+' pelo Painel.</i></p>'+('<h2>Destaques</h2><h3>O que foi feito</h3><ul>'+R.hero.feito.map(f=>'<li><b>'+esc(String(f[0]))+'</b> '+esc(f[1])+'</li>').join('')+R.hero.entregas.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul><h3>'+R.hero.pT+'</h3>'+(R.hero.precisa.length?'<ul>'+R.hero.precisa.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul>':'<p>Nada pendente.</p>')+'<h3>Próximos 30 dias</h3>'+(R.hero.prox.length?'<ul>'+R.hero.prox.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul>':'<p>Nada agendado.</p>'))+
      R.secs.map(s=>'<h2>'+esc(s.t)+'</h2><ul>'+s.kpis.map(k=>'<li>'+esc(k[0])+': <b>'+esc(String(k[1]))+'</b>'+(k[3]?' ('+esc(k[3])+')':'')+'</li>').join('')+'</ul>'+(s.note?'<p><i>'+esc(s.note)+'</i></p>':'')+(s.rows.length?'<table border="1" cellpadding="4"><tr>'+s.head.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr>'+s.rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</table>':'')).join('');
    toast('Salvando no Drive…');
    try{const res=await m.callTool(GD,'create_file',{title,parentId:REL_FOLDER,textContent:html,contentMimeType:'text/html'});const pl=res&&res.payload;toast('Salvo na pasta 11 Relatórios');const u=pl&&(pl.viewUrl||pl.webViewLink);if(u)window.open(u,'_blank','noopener');}
    catch(e){toast(driveUpErr?driveUpErr(e,'o relatório'):'Não foi possível salvar no Drive.');}}
}
document.addEventListener('click',e=>{const p=e.target.closest('[data-rel-per]');if(p){S.rel.per=p.dataset.relPer;try{localStorage.setItem('ce-rel',S.rel.per);}catch(x){}renderRel();return;}
  const tg=e.target.closest('[data-rx-toggle]');const mn=document.querySelector('.rx-menu');if(tg){if(mn){mn.hidden=!mn.hidden;tg.setAttribute('aria-expanded',String(!mn.hidden));}return;}if(mn&&!mn.hidden&&!e.target.closest('.rx-menu'))mn.hidden=true;
  const x=e.target.closest('[data-rel-x]');if(x){if(mn)mn.hidden=true;if(x.dataset.orient)window.__pdfOrient=x.dataset.orient;relExport(x.dataset.relX);}});
document.addEventListener('change',e=>{if(e.target.id==='rel-a'){S.rel.a=e.target.value;renderRel();}else if(e.target.id==='rel-b'){S.rel.b=e.target.value;renderRel();}});

window.CE={empresas:()=>empresasPessoais().map(e=>({id:e.id,nome:e.nome,pai:e.pai||''})),goRel:()=>go('rel'),subList:r=>subList(r),desc:id=>[...descendants(id)],catName:id=>{const c=catById(id);return c?c.name:'';},
  newDemand:(root,o)=>openNewTask(root,o),setStatus:(id,st)=>setTaskStatus(id,st),
  driveUpload:(f,ctx)=>driveUpload(f,ctx),driveOk:async()=>!!(await getMcp()),driveErr:(e,n)=>driveUpErr(e,n),
  openTask:id=>whenFrame('sec',w=>w.CS&&w.CS.ready(id),w=>w.CS.openTask(id)),
  openFin:f=>whenFrame('fin',w=>w.FIN&&w.FIN.hasRow(f.tid,f.id),w=>{if(f.m)w.FIN.setMonth(f.m);w.FIN.go(f.tab);w.FIN.openItem(f.tid,f.id);})
};

document.addEventListener('click',()=>setTimeout(updateDriveLink,0));
document.addEventListener('change',()=>setTimeout(updateDriveLink,0));
