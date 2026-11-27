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
    'Despesas: prestação de contas (fluxos de cada pessoa), competência '+per+'. Recorrentes: só os pagamentos recorrentes cadastrados no cadastro de contas; não representam o total de despesas nem de pagamentos do período'+(EX.n?' (pagamentos extraordinários no período: '+fmtMoney(EX.v)+')':'')+'. Reembolsos, empréstimos e parcelas: saldos de hoje.');
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
  /* ===== dados do PDF (definido em 27/11/2026): abertura em texto; precisa de vocês, atenção e próximos 30 dias;
     cada área com uma frase e as listas do que foi feito no período e do que segue em aberto ===== */
  const PD=(()=>{
    const N=t=>[t],B1=t=>[t,1],R2=t=>[t,2];const pl=(n,s,p)=>n+' '+(n===1?s:p);
    const jseg=ps=>{const o=[];ps.forEach((p,i)=>{if(i)o.push(N(i===ps.length-1?' e ':', '));o.push(...p);});return o;};
    const MESN=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const lastD=ym=>{const[y,m]=ym.split('-').map(Number);return new Date(y,m,0).getDate();};
    const oneM=a.slice(0,7)===b.slice(0,7)&&a.slice(8)==='01'&&+b.slice(8)===lastD(b.slice(0,7));
    const perTxt=oneM?'Em '+MESN[+a.slice(5,7)-1]:'Entre '+brD(a).slice(0,5)+' e '+brD(b);
    const cap=s=>String(s||'').replace(/^./,c=>c.toUpperCase());const mv0=v=>v==null||v===''?'–':fmtMoney(v);const d5=s=>s?brD(s).slice(0,5):'–';
    const nm=pid=>refName('equipe',pid)||'–';
    const areas=[];const area=(t,frase,resumo,blocks)=>{const bl=blocks.filter(x=>x&&x.rows.length);areas.push({t,frase,resumo,blocks:bl,vazio:!bl.length&&frase.length===1&&/^(Nada registrado|Nenhuma demanda)/.test(frase[0][0])});};
    /* Operação */
    const doneS=done.slice().sort((x,y)=>String(x.completedAt).localeCompare(String(y.completedAt)));
    area('Operação',!tk.length?[N('Nenhuma demanda registrada.')]:[N('Entraram '),B1(String(novas.length)),N(' e foram concluídas '),B1(String(done.length)),N(cicloM==null?'':', em média em '+(cicloM===0?'menos de um dia útil':String(cicloM).replace('.',',')+(cicloM===1?' dia útil':' dias úteis'))),N('. Seguem '),B1(abertas.length+' em aberto')].concat(atras.length?[N(', das quais '),R2(pl(atras.length,'atrasada','atrasadas'))]:[]).concat([N('.')]),
      tk.length?pl(done.length,'concluída','concluídas')+(atras.length?' · '+pl(atras.length,'atrasada','atrasadas'):''):'Nenhuma demanda registrada',
      [{t:'Concluídas no período',head:['Demanda','Categoria','Concluída em'],w:[0.6,0.22,0.18],rows:doneS.map(t=>[t.title||'',catN(t)||'Sem categoria',brD(String(t.completedAt||'').slice(0,10))])},
       {t:'Atrasadas',head:['Demanda','Categoria','Prazo'],w:[0.6,0.22,0.18],rows:atras.slice().sort((x,y)=>x.due.localeCompare(y.due)).map(t=>[t.title||'',catN(t)||'Sem categoria',brD(t.due)])},
       oRows.length>2?{t:'Por categoria',head:['Categoria','Entradas','Concluídas','Em aberto','Atrasadas'],w:[0.36,0.16,0.16,0.16,0.16],total:true,rows:oRows.map(r=>r.slice(0,5).map(String))}:null]);
    /* Financeiro */
    const pagos=FMs.flatMap(f=>f.crono.pagos.map(i=>Object.assign({ym:f.ym},i))).sort((x,y)=>String(x.t).localeCompare(String(y.t),'pt'));const pagN=pagos.length;
    const porCat={};FMs.forEach(f=>Object.entries(f.desp.porCat||{}).forEach(([k,v])=>{porCat[k]=(porCat[k]||0)+v;}));
    let cats=Object.entries(porCat).filter(x=>x[1]).sort((x,y)=>y[1]-x[1]);if(cats.length>10){const rest=cats.slice(9).reduce((s,x)=>s+x[1],0);cats=cats.slice(0,9).concat([['Outras categorias',rest]]);}
    const pagoD=FMs.reduce((s,f)=>s+(f.desp.pago||0),0),aPagD=FMs.reduce((s,f)=>s+(f.desp.naoPago||0),0);
    const exItems=FMs.flatMap(f=>f.extra.items);
    const fOpen=[];
    pendI.forEach(i=>fOpen.push([i.t+(i.quem?', '+i.quem:''),'Conta recorrente',d5(i.d),i.v==null?'Sem valor':fmtMoney(i.v)]));
    sol.filter(r=>!(r.venc&&r.venc<t0)).forEach(r=>fOpen.push([r.descr||'Solicitação de pagamento','Pagamento extraordinário',r.venc?brD(r.venc):'–',mv0(r.valor)]));
    CA.cards.filter(cc=>cc.status!=='Vencida').forEach(cc=>fOpen.push(['Fatura '+cc.cartao+(cc.titular?', '+cc.titular:''),'Cartão ('+String(cc.status||'').toLowerCase()+')',cc.venc?brD(cc.venc):'–',cc.total==null?'Sem valor':fmtMoney(cc.total)]));
    RB.items.forEach(x=>fOpen.push([(x.tipo==='Médico'?[x.r.paciente,x.r.descr].filter(Boolean).join(', ')||'Reembolso médico':x.r.descr||'Reembolso corporativo')+(x.r.pessoa||x.r.titular?', '+(x.r.pessoa||x.r.titular):''),'Reembolso a receber',x.r.data?brD(x.r.data):'–',fmtMoney(x.v)]));
    RB.pagar.items.filter(r=>!(r.venc&&r.venc<t0)).forEach(r=>fOpen.push([(r.descr||'Reembolso')+(r.pessoa?', '+r.pessoa:''),'Reembolso a pagar',r.venc?brD(r.venc):'–',mv0(r.valor)]));
    EM.items.filter(x=>!(x.r.prevista&&x.r.prevista<t0)).forEach(x=>fOpen.push([(x.r.razao||'Empréstimo')+', '+(x.r.titular||'Leticia'),'Empréstimo a '+(x.lado==='receber'?'receber':'pagar'),x.r.prevista?brD(x.r.prevista):'–',fmtMoney(x.v)]));
    FL.assin.anuais.filter(x=>x.renova&&x.renova<=addDays(t0,90)).forEach(x=>fOpen.push([x.descr,'Renovação de assinatura anual',brD(x.renova),mv0(x.v)]));
    FMs.forEach(f=>f.desp.pend.forEach(p=>fOpen.push([p.cat+', '+p.pessoa,'Despesa a pagar ('+fmtYm(f.ym)+')','–',fmtMoney(p.v)])));
    const fFr=[];if(desp!=null){fFr.push(N('As despesas somaram '),B1(fmtMoney(desp)));if(despVar!=null&&Math.abs(despVar)>=0.05)fFr.push(N(', '+String(Math.abs(Math.round(despVar*10)/10)).replace('.',',')+'% '+(despVar>0?'acima':'abaixo')+' do período anterior'));fFr.push(N(pagoD||aPagD?'; '+fmtMoney(pagoD)+' pagos e '+fmtMoney(aPagD)+' a pagar. ':'. '));}
    if(pagN)fFr.push(B1(pl(pagN,'conta recorrente paga','contas recorrentes pagas')),N(pago>0?', somando '+fmtMoney(pago)+'. ':'. '));
    if(vencI.length)fFr.push(R2(pl(vencI.length,'conta vencida','contas vencidas')),N(' sem pagamento. '));
    if(RB.aReceber)fFr.push(N('Há '),B1(fmtMoney(RB.aReceber)),N(' em reembolsos a receber. '));
    if(!fFr.length)fFr.push(N('Nada registrado no período.'));
    area('Financeiro',fFr,[desp!=null?fmtMoney(desp)+' em despesas':pl(pagN,'conta paga','contas pagas'),vencI.length?pl(vencI.length,'conta vencida','contas vencidas'):''].filter(Boolean).join(' · '),
      [cats.length?{t:'Despesas por categoria',head:['Categoria','Valor'],w:[0.7,0.3],total:true,rows:cats.map(x=>[x[0],fmtMoney(x[1])]).concat([['Total',fmtMoney(desp||0)]])}:null,
       {t:'Contas recorrentes pagas',head:nM>1?['Conta','Responsável','Mês','Valor']:['Conta','Responsável','Valor'],w:nM>1?[0.46,0.2,0.16,0.18]:[0.56,0.24,0.2],rows:pagos.map(i=>nM>1?[i.t,i.quem||'–',fmtYm(i.ym),mv0(i.v)]:[i.t,i.quem||'–',mv0(i.v)])},
       {t:'Pagamentos extraordinários',head:['Descrição','Situação','Data','Valor'],w:[0.46,0.2,0.16,0.18],rows:exItems.map(r=>[r.descr||'Pagamento',r.status||'Pendente',brD(r.data||r.venc)||'–',mv0(r.valor)])},
       {t:'A pagar e a receber',head:['Item','Tipo','Data','Valor'],w:[0.36,0.24,0.18,0.22],rows:fOpen}]);
    /* DP */
    {const ocr=ocResumo(a,b).filter(r=>pOk(r.pid));const fdD=ocr.reduce((x,r)=>x+r.fd,0),adD=ocr.reduce((x,r)=>x+r.ad,0);
     const gp={};pgPago.forEach(p=>{const k=p.pessoa+'|'+(p.tipo||'Pagamento');(gp[k]=gp[k]||{p:p.pessoa,t:p.tipo||'Pagamento',n:0,v:0});gp[k].n++;gp[k].v+=+p.valor||0;});
     const gpr=Object.values(gp).sort((x,y)=>nm(x.p).localeCompare(nm(y.p),'pt'));const pgV=pgPago.reduce((s,p)=>s+(+p.valor||0),0);
     const mvS=mv.filter(m=>m.tipo!=='Outro'&&m.tipo!=='Registro inicial').sort((x,y)=>String(x.data).localeCompare(String(y.data)));
     const ocS=oc.slice().sort((x,y)=>String(x.data).localeCompare(String(y.data)));
     const frt=dpEventos().filter(e=>(!e.p||ownerOk(e.p.executivo))&&e.d>=ref&&e.d<=addDays(ref,90)).sort((x,y)=>x.d.localeCompare(y.d));
     const fr=[];if(pgPago.length)fr.push(B1(pl(pgPago.length,'pagamento','pagamentos')),N(' à equipe'+(pgV?', somando '+fmtMoney(pgV):'')+'. '));
     if(mvS.length)fr.push(B1(pl(mvS.length,'movimentação','movimentações')),N(' no período. '));
     if(fdD+adD)fr.push(N('Ausências: '),B1(pl(fdD+adD,'dia','dias')),N(' ('+[fdD?fdD+' de falta':'',adD?adD+' de atestado':''].filter(Boolean).join(', ')+'). '));
     if(frt.length)fr.push(N('Próxima obrigação: '),B1(frt[0].t.replace(' · ',', ')),N(' em '+d5(frt[0].d)+'.'));
     if(!fr.length)fr.push(N('Nada registrado no período.'));
     area('DP',fr,[pgPago.length?pl(pgPago.length,'pagamento','pagamentos'):'',fdD+adD?pl(fdD+adD,'dia de ausência','dias de ausência'):'',frt.length?frt[0].t.split(' · ')[0]+' em '+d5(frt[0].d):''].filter(Boolean).join(' · ')||'Nada no período',
      [{t:'Pagamentos à equipe',head:['Pessoa','Tipo','Quantidade','Valor'],w:[0.38,0.26,0.16,0.2],rows:gpr.map(g=>[nm(g.p),g.t,String(g.n),fmtMoney(g.v)])},
       {t:'Movimentações',head:['Pessoa','Movimentação','Detalhe','Data'],w:[0.24,0.22,0.36,0.18],rows:mvS.map(m=>[nm(m.pessoa),m.tipo||'Movimentação',String(m.descricao||m.obs||'').split('\n')[0].slice(0,90)||'–',brD(m.data)+(m.dataFim?' a '+brD(m.dataFim):'')])},
       {t:'Faltas, atestados e ocorrências',head:['Pessoa','Tipo','Data'],w:[0.5,0.3,0.2],rows:ocS.map(o=>[nm(o.pessoa),(o.tipo||'Ocorrência')+(+o.dias>1?' ('+o.dias+' dias)':''),brD(o.data)])},
       {t:'Pela frente',head:['Obrigação','Detalhe','Data'],w:[0.34,0.48,0.18],rows:frt.map(e=>[e.t.replace(' · ',', '),String(e.s||'').slice(0,90)||'–',brD(e.d)])}]);}
    /* Facilities */
    const anm=id=>{const x=ativoById(id);return x?x.nome:'–';};
    area('Facilities',chAb.length+chCon.length+chOpen.length+svc.length+venc.length?[N('Foram abertos '),B1(String(chAb.length)),N(' chamados e concluídos '),B1(String(chCon.length)),N('. ')].concat(chOpen.length?[B1(pl(chOpen.length,'segue em aberto','seguem em aberto')),N('. ')]:[]).concat(svc.length?[N('Serviços registrados custaram '),B1(fmtMoney(sum(svc,'custo'))),N('. ')]:[]).concat(venc.length?[N('Vencimentos nos próximos 30 dias: '),venc.some(r=>r.proxima<t0)?R2(String(venc.length)):B1(String(venc.length)),N('.')]:[]):[N('Nada registrado no período.')],
      chAb.length+chCon.length+chOpen.length?pl(chCon.length,'chamado concluído','chamados concluídos')+' · '+chOpen.length+' em aberto':'Nada no período',
      [{t:'Chamados concluídos',head:['Chamado','Item','Concluído em'],w:[0.5,0.3,0.2],rows:chCon.map(t=>[t.title||'',facItem(t)||'–',brD(String(t.completedAt||'').slice(0,10))])},
       {t:'Serviços registrados',head:['Serviço','Local','Data','Custo'],w:[0.4,0.24,0.16,0.2],rows:svc.map(c=>[c.titulo||'Serviço',anm(c.ativo),brD(c.concluidoEm),mv0(c.custo)])},
       {t:'Em aberto',head:['Chamado','Situação','Prazo'],w:[0.5,0.3,0.2],rows:chOpen.map(t=>[t.title||'',ST[t.status]||'Aberto',t.due?brD(t.due):'–'])},
       {t:'Vencimentos nos próximos 30 dias',head:['Item','Local','Data'],w:[0.5,0.3,0.2],rows:venc.slice().sort((x,y)=>x.proxima.localeCompare(y.proxima)).map(r=>[r.titulo||'',anm(r.ativo),brD(r.proxima)])}]);
    /* Saúde: só agenda e reembolsos */
    area('Saúde',svR.length+svP.length+rm.length?[N('Consultas e exames no período: '),B1(String(svR.length)),N('; agendados para os próximos 30 dias: '),B1(String(svP.length)),N('. ')].concat(rm.length?[B1(fmtMoney(sum(rm,'valor'))),N(' em reembolsos médicos em aberto.')]:[]):[N('Nada registrado no período.')],
      svR.length+svP.length?pl(svR.length,'consulta','consultas')+' · '+svP.length+' agendada(s)':'Nada no período',
      [{t:'Agendados nos próximos 30 dias',head:['Pessoa','Tipo','Data'],w:[0.4,0.36,0.24],rows:svP.map(e=>[fn(e.pessoa),e.tipo||'Consulta',brD(e.data)])}]);
    /* Negócios */
    const enm=id=>{const e=empById(id);return e?e.nome:'–';};
    area('Negócios',obAt.length+obPx.length+dc.length?[].concat(obAt.length?[R2(pl(obAt.length,'obrigação atrasada','obrigações atrasadas')),N('; ')]:[]).concat([B1(String(obPx.length)),N(' prevista(s) para os próximos 30 dias. ')]).concat(dc.length?[B1(pl(dc.length,'contrato vencido ou a vencer','contratos vencidos ou a vencer')),N(' em 60 dias.')]:[]):[N('Nada registrado no período.')],
      obAt.length+obPx.length+dc.length?[obAt.length?pl(obAt.length,'obrigação atrasada','obrigações atrasadas'):'',obPx.length+' em 30 dias'].filter(Boolean).join(' · '):'Nada no período',
      [{t:'Obrigações',head:['Obrigação','Empresa','Situação','Data'],w:[0.4,0.24,0.18,0.18],rows:obAt.map(o=>[o.titulo||'',enm(o.empresa),'Atrasada',brD(o.proxima)]).concat(obPx.map(o=>[o.titulo||'',enm(o.empresa),'Próxima',brD(o.proxima)]))},
       {t:'Contratos',head:['Contrato','Empresa','Situação','Vencimento'],w:[0.4,0.24,0.18,0.18],rows:dc.map(d=>[d.titulo||'',enm(d.empresa),d.vencimento<t0?'Vencido':'A vencer',brD(d.vencimento)])}]);
    /* Conselhos e Programas */
    const bnm=id=>{const x=boardById(id);return x?x.nome:'–';};
    area('Conselhos e Programas',rrP.length+rrN.length+evP.length+evN.length?[B1(pl(rrP.length,'reunião','reuniões')),N(' no período'),N(evP.length?' e ':'. '),...(evP.length?[B1(pl(evP.length,'evento','eventos')),N('. ')]:[]),N('Nos próximos 30 dias: '),B1(pl(rrN.length,'reunião','reuniões')),N(evN.length?' e '+pl(evN.length,'evento','eventos')+'.':'.')]:[N('Nada registrado no período.')],
      rrP.length+rrN.length?pl(rrP.length,'reunião','reuniões')+' · '+rrN.length+' nos próximos 30 dias':'Nada no período',
      [{t:'Reuniões no período',head:['Reunião','Conselho ou programa','Situação','Data'],w:[0.38,0.28,0.16,0.18],rows:rrP.slice().sort((x,y)=>x.data.localeCompare(y.data)).map(r=>[r.titulo||'Reunião',bnm(r.board),r.status||'Agendada',brD(r.data)])},
       {t:'Eventos no período',head:['Evento','Conselho ou programa','Data'],w:[0.46,0.34,0.2],rows:evP.map(e=>[e.titulo||'Evento',bnm(e.board),brD(e.data)])},
       /* as reuniões de conselho (fixas) ficam só aqui, não no Próximos 30 dias geral */
       {t:'Próximas reuniões (30 dias)',head:['Reunião','Conselho ou programa','Data'],w:[0.46,0.34,0.2],rows:rrN.slice().sort((x,y)=>x.data.localeCompare(y.data)).map(r=>[r.titulo||'Reunião',bnm(r.board),brD(r.data)])}]);
    /* Família, Rotina e Viagens */
    area('Família, Rotina e Viagens',vP.length+vN.length+fe.length+fd.length+vg.length?[B1(pl(vP.length,'viagem','viagens')),N(' no período e '+vN.length+' nos próximos 30 dias. ')].concat(vg.length?[B1(fmtMoney(sum(vg,'valor'))),N(' em gastos de viagem a reembolsar. ')]:[]).concat(fd.length?[fd.some(docLate)?R2(pl(fd.length,'documento vencido ou a vencer','documentos vencidos ou a vencer')):B1(pl(fd.length,'documento a vencer','documentos a vencer')),N('.')]:[]):[N('Nada registrado no período.')],
      [vP.length+vN.length?pl(vP.length+vN.length,'viagem','viagens'):'',fd.length?pl(fd.length,'documento a vencer','documentos a vencer'):''].filter(Boolean).join(' · ')||'Nada no período',
      [{t:'Próximas viagens',head:['Viagem','Situação','Datas'],w:[0.46,0.24,0.3],rows:vP.filter(v=>v.inicio>t0).map(v=>[v.titulo||'Viagem','Próxima',brD(v.inicio)+(v.fim&&v.fim!==v.inicio?' a '+brD(v.fim):'')]).concat(vN.filter(v=>!vP.includes(v)).map(v=>[v.titulo||'Viagem','Próxima',brD(v.inicio)+(v.fim&&v.fim!==v.inicio?' a '+brD(v.fim):'')]))},
       {t:'Eventos nos próximos 30 dias',head:['Evento','Tipo','Data'],w:[0.5,0.3,0.2],rows:fe.map(x=>[x.e.titulo||'Evento',x.e.tipo||'Evento',brD(x.n)])},
       {t:'Documentos',head:['Documento','Pessoa','Situação','Validade'],w:[0.36,0.24,0.2,0.2],rows:fd.map(d=>[d.tipo||'Documento',fn(d.pessoa)||'–',docLate(d)?'Vencido':'A vencer',brD(d.validade)])}]);
    /* atenção: tudo o que está vencido ou atrasado */
    const at=[];const A=(item,ar,sit,d,v)=>at.push({d:d||'',r:[item,ar,sit,d?brD(d):'–',v==null?'–':v]});
    atras.forEach(t=>A(t.title||'',catN(t)||'Operação','Demanda atrasada',t.due,null));
    vencI.forEach(i=>A(i.t+(i.quem?', '+i.quem:''),'Financeiro','Conta vencida',i.d,i.v==null?'Sem valor':fmtMoney(i.v)));
    sol.filter(r=>r.venc&&r.venc<t0).forEach(r=>A(r.descr||'Pagamento extraordinário','Financeiro','Pagamento vencido',r.venc,mv0(r.valor)));
    RB.pagar.items.filter(r=>r.venc&&r.venc<t0).forEach(r=>A((r.descr||'Reembolso')+(r.pessoa?', '+r.pessoa:''),'Financeiro','Reembolso a pagar vencido',r.venc,mv0(r.valor)));
    EM.items.filter(x=>x.r.prevista&&x.r.prevista<t0).forEach(x=>A((x.r.razao||'Empréstimo')+', '+(x.r.titular||'Leticia'),'Financeiro','Empréstimo vencido',x.r.prevista,fmtMoney(x.v)));
    CA.cards.filter(cc=>cc.status==='Vencida').forEach(cc=>A('Fatura '+cc.cartao+(cc.titular?', '+cc.titular:''),'Financeiro','Fatura vencida',cc.venc,cc.total==null?'Sem valor':fmtMoney(cc.total)));
    obAt.forEach(o=>A((o.titulo||'')+', '+enm(o.empresa),'Negócios','Obrigação atrasada',o.proxima,null));
    dc.filter(d=>d.vencimento<t0).forEach(d=>A((d.titulo||'')+', '+enm(d.empresa),'Negócios','Contrato vencido',d.vencimento,null));
    venc.filter(r=>r.proxima<t0).forEach(r=>A(r.titulo||'','Facilities','Vencimento em atraso',r.proxima,null));
    chOpen.filter(t=>t.due&&t.due<t0).forEach(t=>A(t.title||'','Facilities','Chamado atrasado',t.due,null));
    fd.filter(docLate).forEach(d=>A((d.tipo||'Documento')+', '+(fn(d.pessoa)||''),'Família','Documento vencido',d.validade,null));
    at.sort((x,y)=>x.d.localeCompare(y.d));
    const precisaR=tk.filter(t=>isOpen(t)&&t.needsExec).sort((x,y)=>(x.due||'9999').localeCompare(y.due||'9999')).map(t=>[t.title||'',catN(t)||'Operação',t.due?brD(t.due):'Sem prazo']);
    /* Próximos 30 dias: só o que é diferente do dia a dia (eventos, viagens, contratos, fim de mandato…); reuniões de conselho ficam em Conselhos e Programas */
    let proxR=[];try{proxR=compute(30).upcoming.filter(u=>u.date&&u.date>t0&&EXK.has(u.kind)&&u.kind!=='Reunião').map(u=>({d:u.date,r:[u.title||'',u.kind==='Conselho/Programa'?'Mandato':u.kind||'',d5(u.date)]}));}catch(e){proxR=[];}
    proxR=proxR.concat(tk.filter(t=>isOpen(t)&&t.reportRel&&t.due&&t.due>t0&&t.due<=t30).map(t=>({d:t.due,r:[t.title||'',catN(t)||'Demanda',d5(t.due)]}))).sort((x,y)=>x.d.localeCompare(y.d)).map(x=>x.r);
    /* abertura em texto */
    const fe1=[];if(done.length)fe1.push([B1(pl(done.length,'demanda concluída','demandas concluídas'))]);
    if(pagN)fe1.push([B1(pl(pagN,'conta recorrente paga','contas recorrentes pagas'))].concat(pago>0?[N(' ('+fmtMoney(pago)+')')]:[]));
    if(pgPago.length)fe1.push([B1(pl(pgPago.length,'pagamento','pagamentos')),N(' à equipe')]);
    if(chCon.length)fe1.push([B1(pl(chCon.length,'chamado de Facilities concluído','chamados de Facilities concluídos'))]);
    if(rrP.length)fe1.push([B1(pl(rrP.length,'reunião de conselho','reuniões de conselho'))]);
    if(vP.length)fe1.push([B1(pl(vP.length,'viagem','viagens'))]);
    const lede=fe1.length?[N(perTxt+', o Painel registrou ')].concat(jseg(fe1)).concat([N('. ')]):[N(perTxt+', não houve entregas registradas no Painel. ')];
    if(entregas.length){const ns=entregas.slice(0,3).map(r=>[N(r[0])]);lede.push(N('Entre as entregas: '),...jseg(ns),N(entregas.length>3?', entre outras. ':'. '));}
    const att=[];if(atras.length)att.push([R2(pl(atras.length,'demanda atrasada','demandas atrasadas'))]);
    if(vencI.length)att.push([R2(pl(vencI.length,'conta vencida','contas vencidas'))].concat(vencV?[N(' ('+fmtMoney(vencV)+')')]:[]));
    const outrasAt=at.length-atras.length-vencI.length;if(outrasAt>0)att.push([R2(pl(outrasAt,'outro item vencido','outros itens vencidos'))]);
    if(att.length)lede.push(N('Pedem atenção: '),...jseg(att),N('. '));else lede.push(N('Não há nada vencido ou atrasado. '));
    if(precisaR.length)lede.push(B1(pl(precisaR.length,'item aguarda','itens aguardam')),N(S.exec?' a sua decisão. ':' a decisão de vocês. '));
    if(proxR[0])lede.push(N('O próximo compromisso é '),B1(proxR[0][0]),N(', em '+proxR[0][2]+'.'));
    const MESC=MESN.map(cap);
    /* as áreas não listam item por item o que foi feito (decidido 27/11/2026) */
    const SO_FEITO=new Set(['Concluídas no período','Contas recorrentes pagas','Pagamentos extraordinários','Pagamentos à equipe','Movimentações','Faltas, atestados e ocorrências','Chamados concluídos','Serviços registrados','Reuniões no período','Eventos no período']);
    areas.forEach(z=>{z.blocks=z.blocks.filter(bk=>!SO_FEITO.has(bk.t));});
    return {lede,precisa:precisaR,atencao:at.map(x=>x.r),prox:proxR,areas,perLbl:oneM?MESC[+a.slice(5,7)-1]+' de '+a.slice(0,4):brD(a)+' a '+brD(b),datas:brD(a)+' a '+brD(b)};
  })();
  return {a,b,secs,pd:PD,hl:hl.slice(0,5),done:done.length,hero:{feito,entregas,precisa,prox,pT:S.exec?'Precisa de você':'Precisa de vocês',pNo:S.exec?'Nada pendente com você.':'Nada pendente com vocês.'}};
}
function relHtmlTable(s){if(!s.rows.length)return '<ul class="list"><li><div class="empty">Nada a listar neste período.</div></li></ul>';
  return '<div class="rel-tbl'+(s.cls?' '+s.cls:'')+'"><table><thead><tr>'+s.head.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i===0?' class="nm"':'')+'>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function renderRel(){
  const el=$('#v-rel');if(!el)return;const R=relBuild();
  let h='<div class="wrap"><div class="hello"><div><h2>Relatórios</h2><p>'+esc(relScopeLabel())+' · '+brD(R.a)+' a '+brD(R.b)+'. O executivo segue o filtro da barra superior.</p></div></div>';
  h+='<div class="rel-bar"><div class="seg" role="group" aria-label="Período">'+REL_PERS.map(([k,l])=>'<button data-rel-per="'+k+'" class="'+(S.rel.per===k?'on':'')+'">'+l+'</button>').join('')+'</div>'+
    (S.rel.per==='custom'?'<label class="sr" for="rel-a">De</label><input class="sel" type="date" id="rel-a" value="'+esc(R.a)+'"><span class="hint">até</span><label class="sr" for="rel-b">Até</label><input class="sel" type="date" id="rel-b" value="'+esc(R.b)+'">':'')+
    '<span class="grow"></span><div class="rx-wrap"><button class="rx-btn" data-rx-toggle aria-haspopup="true" aria-expanded="false" title="Exportar" aria-label="Exportar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button><div class="rx-menu" hidden><button data-rel-x="pdf" data-model="slides"><b>PDF · apresentação</b><small>Slides, para mostrar numa tela ou reunião</small></button><button data-rel-x="pdf" data-model="completo"><b>PDF · A4</b><small>Documento para enviar ou imprimir</small></button><button data-rel-x="xlsx"><b>Excel</b><small>Todos os dados, para conferir e filtrar</small></button><button data-rel-x="drive"><b>Salvar no Drive</b><small>Na pasta 11 Relatórios</small></button></div></div><a class="rx-ico" href="https://drive.google.com/drive/folders/'+REL_FOLDER+'" target="_blank" rel="noopener" title="Relatórios mensais no Drive" aria-label="Relatórios mensais no Drive"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></a></div>';
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

const REL_PDF_MODEL='slides';
const REL_PDF_MODELS={completo:{f:'A4'},slides:{f:'apresentacao'}};
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
    /* dois modelos, ambos com as listas completas (27/11/2026): A4 (documento) e apresentação (slides 16:9) */
    const MODEL=REL_PDF_MODELS[window.__pdfModel]?window.__pdfModel:REL_PDF_MODEL;const LAND=MODEL==='slides';const P=R.pd;
    const W=LAND?960:595.28,H=LAND?540:841.89,M=LAND?60:54,CW=W-2*M,PG=LAND?[960,540]:'a4',OR=LAND?'landscape':'portrait';
    const doc=new J.jsPDF({unit:'pt',format:PG,orientation:OR});
    const fok=await relFonts(doc);const FD=fok?'Sora':'helvetica',FB=fok?'Jakarta':'helvetica';
    const C={ink:[31,42,37],muted:[82,97,89],faint:[126,140,132],line:[211,224,216],hair:[228,236,231],green:[63,122,98],rose:[200,52,104],mint:[230,240,234],mint2:[243,248,245],rose2:[219,68,121]};
    const tc=k=>doc.setTextColor(...C[k]),fc=k=>doc.setFillColor(...C[k]),dc=k=>doc.setDrawColor(...C[k]);
    const T=sz=>{doc.setFont(FD,'normal');doc.setFontSize(sz);},B=(sz,st)=>{doc.setFont(FB,st==='b'?'bold':st==='i'?'italic':'normal');doc.setFontSize(sz);};
    const newPage=()=>doc.addPage(PG,OR);const TOP=LAND?70:60,BOT=H-56;
    /* texto corrido: trechos normais, em negrito (1) ou em negrito rosa (2) */
    const rich=(segs,x,y,w,sz,lh)=>{const words=[];segs.forEach(([t,s])=>String(t).split(/(\s+)/).forEach(p=>{if(p)words.push([p,s||0]);}));
      const lines=[[]];let cx=x;words.forEach(([t,s])=>{B(sz,s?'b':'');const ww=doc.getTextWidth(t);const L=lines[lines.length-1];
        if(/^\s+$/.test(t)){if(L.length){L.push([' ',s,doc.getTextWidth(' ')]);cx+=doc.getTextWidth(' ');}return;}
        if(cx+ww>x+w&&L.length){while(L.length&&L[L.length-1][0]===' ')L.pop();lines.push([]);cx=x;}lines[lines.length-1].push([t,s,ww]);cx+=ww;});
      lines.forEach((L,i)=>{let px=x;L.forEach(([t,s,ww])=>{B(sz,s?'b':'');tc(s===2?'rose':'ink');doc.text(t,px,y+i*lh);px+=ww;});});return y+(lines.length-1)*lh;};
    const sect=(t,x,y,w,count,cont)=>{T(LAND?15:12.5);tc('green');const tt=t+(cont?' (continuação)':'');doc.text(tt,x,y);if(count!=null&&!cont){const tw=doc.getTextWidth(tt);B(LAND?10:8.5);tc('faint');doc.text(String(count),x+tw+7,y);}
      dc('line');doc.setLineWidth(0.6);doc.line(x,y+7,x+w,y+7);return y+(LAND?27:23);};
    const sub=(t,n,x,y)=>{B(LAND?9.5:8.4,'b');tc('muted');doc.text(t,x,y);const tw=doc.getTextWidth(t);B(LAND?9:8);tc('faint');doc.text(String(n),x+tw+6,y);return y+(LAND?8:7);};
    const empty=(t,x,y,head,w)=>{if(head){const hh=LAND?20:17;fc('mint');doc.roundedRect(x,y,w,hh,3,3,'F');B(LAND?8.5:7.6,'b');tc('green');const wr=head.w;let cx=x+(LAND?8:7);
        head.h.forEach((h,i)=>{const cw=wr[i]*w;doc.text(h,i===0?cx:x+wr.slice(0,i).reduce((a,b)=>a+b,0)*w+cw/2,y+hh*0.66,{align:i===0?'left':'center'});});y+=hh+(LAND?4:3);B(LAND?10:8.6,'i');tc('faint');doc.text(t,x+(LAND?8:7),y+10);return y+(LAND?18:16);}
      B(LAND?10.5:9,'i');tc('faint');doc.text(t,x,y+4);return y+(LAND?16:14);};
    let contHead=null;/* título repetido quando uma tabela continua na página seguinte */
    /* tabelas em faixas (formato C, 27/11/2026): títulos em verde sobre faixa menta arredondada, linhas alternadas, sem fios; texto longo quebra a linha */
    const table=(head,rows,x,y,w,o={})=>{if(!rows.length)return y;const wr=o.w||head.map(()=>1/head.length);const cs={};wr.forEach((f,i)=>cs[i]={cellWidth:f*w,halign:i===0?'left':'center'});
      const isTot=d=>o.total&&d.row.index===rows.length-1&&String(d.row.raw[0])==='Total';const pv=LAND?4.2:4.4,ph=LAND?8:7;
      doc.autoTable({startY:y,head:[head],body:rows,margin:{left:x,right:W-x-w,top:TOP+(contHead?28:0),bottom:LAND?36:H-BOT+4},tableWidth:w,theme:'plain',columnStyles:cs,showHead:'everyPage',rowPageBreak:'avoid',
        styles:{font:FB,fontStyle:'normal',fontSize:LAND?9:8.5,textColor:C.ink,cellPadding:{top:pv,bottom:pv,left:ph/2,right:ph/2},overflow:'linebreak',valign:'middle',lineWidth:0},
        headStyles:{font:FB,fontStyle:'bold',fontSize:LAND?8:7.6,textColor:C.green,cellPadding:{top:pv,bottom:pv,left:ph/2,right:ph/2}},
        alternateRowStyles:{fillColor:C.mint2},
        willDrawPage:d=>{if(d.pageNumber>1&&contHead)sect(contHead[0],contHead[1],TOP,contHead[2],null,true);},
        willDrawCell:d=>{if(d.section==='head'&&d.column.index===0){fc('mint');doc.roundedRect(x,d.cell.y,w,d.cell.height,3,3,'F');}},
        didParseCell:d=>{const c=d.column.index;const pad=Object.assign({},d.cell.styles.cellPadding);if(c===0)pad.left=ph;if(c===head.length-1)pad.right=ph;d.cell.styles.cellPadding=pad;
          if(d.section==='head')d.cell.styles.halign=c===0?'left':'center';
          if(d.section==='body'&&o.rose!=null&&c===o.rose)d.cell.styles.textColor=C.rose;
          if(d.section==='body'&&isTot(d)){d.cell.styles.fontStyle='bold';d.cell.styles.fillColor=C.mint;d.cell.styles.textColor=C.green;}}});
      return doc.lastAutoTable.finalY;};
    const more=(n,x,y,txt)=>{if(n<=0)return y;B(LAND?8.5:7.6,'i');tc('faint');doc.text(txt||('e mais '+n+(n===1?' item':' itens')+' no relatório completo'),x,y+11);return y+16;};
    const who=S.exec?'você':'vocês';
    const precisa=(x,y,w,max)=>{y=sect('Precisa de '+who,x,y,w,P.precisa.length);if(!P.precisa.length)return empty('Nada pendente com '+who+'.',x,y,{h:['Decisão ou assinatura','Área','Prazo'],w:[0.6,0.2,0.2]},w);
      const r=max?P.precisa.slice(0,max):P.precisa;y=table(['Decisão ou assinatura','Área','Prazo'],r,x,y,w,{w:[0.6,0.2,0.2]});return more(P.precisa.length-r.length,x,y);};
    const atencao=(x,y,w,max,compact)=>{y=sect('Atenção',x,y,w,P.atencao.length);if(!P.atencao.length)return empty('Nada vencido ou atrasado.',x,y,compact?{h:['Item','Situação','Desde'],w:[0.52,0.28,0.2]}:{h:['Item','Área','Situação','Desde','Valor'],w:[0.36,0.14,0.2,0.13,0.17]},w);
      const r=max?P.atencao.slice(0,max):P.atencao;
      y=compact?table(['Item','Situação','Desde'],r.map(z=>[z[0],z[2],z[3]]),x,y,w,{w:[0.52,0.28,0.2],rose:1}):table(['Item','Área','Situação','Desde','Valor'],r,x,y,w,{w:[0.36,0.14,0.2,0.13,0.17],rose:2});
      return more(P.atencao.length-r.length,x,y);};
    const proximos=(x,y,w,max)=>{y=sect('Próximos 30 dias',x,y,w,P.prox.length);if(!P.prox.length)return empty('Nada agendado.',x,y,{h:['Compromisso','Tipo','Data'],w:[0.6,0.24,0.16]},w);
      const r=max?P.prox.slice(0,max):P.prox;y=table(['Compromisso','Tipo','Data'],r,x,y,w,{w:[0.6,0.24,0.16]});return more(P.prox.length-r.length,x,y);};
    /* cabeçalho: só o período e de quem é o relatório (sem "gerado em" nem nome do modelo) */
    const head=y=>{T(26);tc('ink');doc.text(P.perLbl,M,y+20);B(10.5);tc('muted');doc.text(relScopeLabel(),M,y+38);dc('ink');doc.setLineWidth(0.8);doc.line(M,y+54,W-M,y+54);return y+80;};
    /* área: frase e blocos; max limita as linhas de cada bloco (slides) */
    const drawArea=(z,x,y,w,max)=>{contHead=[z.t,x,w];y=sect(z.t,x,y,w);const sz=LAND?11:9.6,lh=LAND?16:14;y=rich(z.frase,x,y,w,sz,lh)+(LAND?20:16);
      z.blocks.forEach(bk=>{if(y>BOT-60){newPage();y=sect(z.t,x,TOP,w,null,true);}y=sub(bk.t,bk.rows.length,x,y);const r=max&&bk.rows.length>max?bk.rows.slice(0,max):bk.rows;
        y=table(bk.head,r,x,y,w,{w:bk.w,total:bk.total&&r.length===bk.rows.length})+4;y=more(bk.rows.length-r.length,x,y);y+=LAND?16:14;});contHead=null;return y+(LAND?10:12);};
    if(MODEL==='completo'){let y=head(46);y=rich(P.lede,M,y,CW,10.5,15.5)+30;
      contHead=['Precisa de '+who,M,CW];y=precisa(M,y,CW)+22;contHead=['Atenção',M,CW];if(y>BOT-90){newPage();y=TOP;}y=atencao(M,y,CW)+22;contHead=['Próximos 30 dias',M,CW];if(y>BOT-90){newPage();y=TOP;}y=proximos(M,y,CW)+26;contHead=null;
      P.areas.filter(z=>!z.vazio).forEach(z=>{if(y>BOT-(z.blocks.length?130:60)){newPage();y=TOP;}y=drawArea(z,M,y,CW);});
      const vz=P.areas.filter(z=>z.vazio).map(z=>z.t);if(vz.length){if(y>BOT-30){newPage();y=TOP;}B(9,'i');tc('faint');doc.text(doc.splitTextToSize('Sem movimento no período: '+(vz.length>1?vz.slice(0,-1).join(', ')+' e '+vz[vz.length-1]:vz[0])+'.',CW),M,y);}}
    if(MODEL==='slides'){
      fc('mint');doc.rect(0,0,W,H,'F');
      T(40);tc('ink');doc.text(P.perLbl,M,100);B(14);tc('muted');doc.text(relScopeLabel(),M,126);dc('green');doc.setLineWidth(1);doc.line(M,150,W-M,150);
      rich(P.lede,M,190,CW*0.86,15,22);
      /* listas completas, sem cortar (27/11/2026): cada seção cabe numa coluna quando dá; se não couber, abre slide próprio,
         com as listas em duas colunas ou, se uma lista for maior que a coluna, na largura toda continuando nos slides seguintes */
      const cw2=(CW-44)/2,GAP=44,sz=10.5,lh=15;
      const secs=[{t:'Precisa de '+who,n:P.precisa.length,blocks:[{head:['Decisão ou assinatura','Área','Prazo'],w:[0.6,0.2,0.2],rows:P.precisa,empty:'Nada pendente com '+who+'.'}]},
        {t:'Atenção',n:P.atencao.length,blocks:[{head:['Item','Situação','Desde','Valor'],w:[0.42,0.22,0.17,0.19],rows:P.atencao.map(z=>[z[0],z[2],z[3],z[4]]),o:{rose:1},empty:'Nada vencido ou atrasado.',
          full:{head:['Item','Área','Situação','Desde','Valor'],w:[0.36,0.14,0.2,0.13,0.17],rows:P.atencao,o:{rose:2}}}]},
        {t:'Próximos 30 dias',n:P.prox.length,blocks:[{head:['Compromisso','Tipo','Data'],w:[0.6,0.24,0.16],rows:P.prox,empty:'Nada agendado.'}]}]
        .concat(P.areas.filter(z=>!z.vazio).map(z=>({t:z.t,frase:z.frase,blocks:z.blocks.map(bk=>({t:bk.t,head:bk.head,w:bk.w,rows:bk.rows,o:{total:bk.total}}))})));
      /* cada lista fica inteira num lugar só (nunca pula para a coluna ao lado): seções pequenas dividem o slide em duas colunas;
         uma seção que não cabe numa coluna abre slide próprio, com as listas lado a lado ou, se uma lista for maior que a coluna,
         na largura toda continuando no slide seguinte. Seções pequenas podem subir para aproveitar espaço livre. */
      const FS=9,PV=4.2,LHF=1.15,HDR=2*PV+8*LHF+1,TT=27,BOT=H-38;/* o rodapé tem só o número da página, à direita */
      const rowH=(r,ws,w)=>{B(FS);let ln=1;r.forEach((c,i)=>{ln=Math.max(ln,doc.splitTextToSize(String(c),ws[i]*w-8).length);});return 2*PV+ln*FS*LHF;};
      const frH=(fr,w)=>{if(!fr)return 0;B(sz,'b');return doc.splitTextToSize(fr.map(f=>f[0]).join(''),w).length*lh+16;};
      const bkH=(bk,w)=>(bk.t?16:0)+(bk.rows.length?HDR+bk.rows.reduce((a2,r)=>a2+rowH(r,bk.w,w),0):42)+12;
      const secH=(sc,w)=>TT+frH(sc.frase,w)+sc.blocks.reduce((a2,bk)=>a2+bkH(bk,w),0)+8;
      const drawBk=(bk,x,y,w,full)=>{const v=full&&bk.full?Object.assign({},bk,bk.full):bk;if(v.t)y=sub(v.t,v.rows.length,x,y);
        y=v.rows.length?table(v.head,v.rows,x,y,w,Object.assign({w:v.w},v.o||{})):empty(v.empty||'Nada a listar.',x,y,{h:v.head,w:v.w},w);return y+12;};
      /* as seções pequenas são planejadas por slide e só desenhadas no fim dele: se ninguém ocupa a coluna da direita, elas vão na largura toda */
      let cy=[TOP,TOP],pend=[];const pageEmpty=()=>cy[0]===TOP&&cy[1]===TOP;
      const drawSec=(sc,x,y,w)=>{const full=w>cw2+1;y=sect(sc.t,x,y,w,sc.n);if(sc.frase)y=rich(sc.frase,x,y,full?CW*0.86:w,sz,lh)+16;sc.blocks.forEach(bk=>{y=drawBk(bk,x,y,w,full);});return y+8;};
      const flush=()=>{if(!pend.length)return null;let e;if(pend.every(p2=>p2.c===0)){let y=pend[0].y;pend.forEach(p2=>{y=drawSec(p2.sc,M,y,CW);});e=y;}
        else{e=0;pend.forEach(p2=>{e=Math.max(e,drawSec(p2.sc,M+p2.c*(cw2+GAP),p2.y,cw2));});}pend=[];return e;};
      const openPage=()=>{flush();newPage();cy=[TOP,TOP];};
      const drawSmall=(sc,c)=>{pend.push({sc,c,y:cy[c]});cy[c]+=secH(sc,cw2);};
      const drawBig=(sc,y0)=>{let y=sect(sc.t,M,y0||TOP,CW,sc.n);if(sc.frase)y=rich(sc.frase,M,y,CW*0.86,sz,lh)+16;let yc=[y,y];
        const cont=()=>{openPage();const t=sect(sc.t,M,TOP,CW,null,true);yc=[t,t];};
        sc.blocks.forEach(bk=>{const h=bkH(bk,cw2);
          /* lista única da seção: largura toda */if(sc.blocks.length===1){let y0=Math.max(yc[0],yc[1]);if(y0+HDR+60>BOT){cont();y0=yc[0];}contHead=[sc.t,M,CW];const ye=drawBk(bk,M,y0,CW,true);contHead=null;yc=[ye,ye];return;}
          if(h<=BOT-TOP-TT){const c=yc[0]<=yc[1]?0:1;let cc=yc[c]+h<=BOT?c:(yc[1-c]+h<=BOT?1-c:-1);if(cc<0){cont();cc=0;}yc[cc]=drawBk(bk,M+cc*(cw2+GAP),yc[cc],cw2,false);return;}
          let y0=Math.max(yc[0],yc[1]);if(y0+HDR+60>BOT){cont();y0=yc[0];}contHead=[sc.t,M,CW];const ye=drawBk(bk,M,y0,CW,true);contHead=null;yc=[ye,ye];});
        const e=Math.max(yc[0],yc[1])+8;cy=[e,e];};
      const q=secs.map((sc,k)=>Object.assign(sc,{k}));openPage();
      while(q.length){let done1=false;
        /* Precisa, Atenção e Próximos 30 dias ficam sempre nessa ordem, antes das áreas; só as áreas podem subir para aproveitar espaço */
        const lim=q[0].k<3?1:q.length;
        for(let i=0;i<lim;i++){const sc=q[i],h=secH(sc,cw2);
          if(h>BOT-TOP){const used=Math.max(cy[0],cy[1]);const b0=sc.blocks[0],need=TT+frH(sc.frase,CW*0.86)+(b0?(bkH(b0,cw2)<=BOT-TOP-TT?bkH(b0,cw2):HDR+80):0);if(i===0&&(pageEmpty()||(BOT-used>(BOT-TOP)*0.5&&BOT-used>=need))){const fe=flush();drawBig(sc,pageEmpty()?TOP:(fe!=null?fe:used)+4);q.splice(0,1);done1=true;break;}continue;}
          const c=cy[0]+h<=BOT?0:(cy[1]+h<=BOT?1:-1);if(c>=0){drawSmall(sc,c);q.splice(i,1);done1=true;break;}}
        if(!done1)openPage();}
      const fe=flush(),yv=fe!=null?fe:Math.max(cy[0],cy[1]);
      const vz=P.areas.filter(z=>z.vazio).map(z=>z.t);if(vz.length){const txt='Sem movimento no período: '+(vz.length>1?vz.slice(0,-1).join(', ')+' e '+vz[vz.length-1]:vz[0])+'.';
        /* nunca abre um slide só para esta linha: vai logo abaixo do conteúdo ou no pé do último slide, à esquerda */
        B(10,'i');tc('faint');doc.text(txt,M,yv+20<=BOT?yv+4:H-28);}}
    /* rodapé */
    const np=doc.internal.getNumberOfPages();for(let pg=1;pg<=np;pg++){if(LAND&&pg===1)continue;doc.setPage(pg);
      /* faixa verde e rosa no alto de cada página, como no modelo original */const bh=LAND?5:4;fc('green');doc.rect(0,0,W,bh,'F');fc('rose2');doc.rect(W*0.72,0,W*0.28,bh,'F');
      B(LAND?8:7.5);tc('faint');doc.text(pg+' de '+np,W-M,H-28,{align:'right'});}
    return relSave(relFileBase(R)+'-'+REL_PDF_MODELS[MODEL].f+'.pdf',doc.output('blob'));}
  if(kind==='drive'){const m=await getMcp();if(!m){toast('O Google Drive não está disponível agora.');return;}
    const html='<h1>'+esc(title)+'</h1><p><i>Gerado em '+brD(todayISO())+' pelo Painel.</i></p>'+('<h2>Destaques</h2><h3>O que foi feito</h3><ul>'+R.hero.feito.map(f=>'<li><b>'+esc(String(f[0]))+'</b> '+esc(f[1])+'</li>').join('')+R.hero.entregas.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul><h3>'+R.hero.pT+'</h3>'+(R.hero.precisa.length?'<ul>'+R.hero.precisa.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul>':'<p>Nada pendente.</p>')+'<h3>Próximos 30 dias</h3>'+(R.hero.prox.length?'<ul>'+R.hero.prox.map(r=>'<li>'+esc(r[0])+' · '+esc(r[1])+' · '+esc(r[2])+'</li>').join('')+'</ul>':'<p>Nada agendado.</p>'))+
      R.secs.map(s=>'<h2>'+esc(s.t)+'</h2><ul>'+s.kpis.map(k=>'<li>'+esc(k[0])+': <b>'+esc(String(k[1]))+'</b>'+(k[3]?' ('+esc(k[3])+')':'')+'</li>').join('')+'</ul>'+(s.note?'<p><i>'+esc(s.note)+'</i></p>':'')+(s.rows.length?'<table border="1" cellpadding="4"><tr>'+s.head.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr>'+s.rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</table>':'')).join('');
    toast('Salvando no Drive…');
    try{const res=await m.callTool(GD,'create_file',{title,parentId:REL_FOLDER,textContent:html,contentMimeType:'text/html'});const pl=res&&res.payload;toast('Salvo na pasta 11 Relatórios');const u=pl&&(pl.viewUrl||pl.webViewLink);if(u)window.open(u,'_blank','noopener');}
    catch(e){toast(driveUpErr?driveUpErr(e,'o relatório'):'Não foi possível salvar no Drive.');}}
}
document.addEventListener('click',e=>{const p=e.target.closest('[data-rel-per]');if(p){S.rel.per=p.dataset.relPer;try{localStorage.setItem('ce-rel',S.rel.per);}catch(x){}renderRel();return;}
  const tg=e.target.closest('[data-rx-toggle]');const mn=document.querySelector('.rx-menu');if(tg){if(mn){mn.hidden=!mn.hidden;tg.setAttribute('aria-expanded',String(!mn.hidden));}return;}if(mn&&!mn.hidden&&!e.target.closest('.rx-menu'))mn.hidden=true;
  const x=e.target.closest('[data-rel-x]');if(x){if(mn)mn.hidden=true;if(x.dataset.model)window.__pdfModel=x.dataset.model;relExport(x.dataset.relX);}});
document.addEventListener('change',e=>{if(e.target.id==='rel-a'){S.rel.a=e.target.value;renderRel();}else if(e.target.id==='rel-b'){S.rel.b=e.target.value;renderRel();}});

window.CE={empresas:()=>empresasPessoais().map(e=>({id:e.id,nome:e.nome,pai:e.pai||''})),goRel:()=>go('rel'),subList:r=>subList(r),desc:id=>[...descendants(id)],catName:id=>{const c=catById(id);return c?c.name:'';},
  newDemand:(root,o)=>openNewTask(root,o),setStatus:(id,st)=>setTaskStatus(id,st),
  driveUpload:(f,ctx)=>driveUpload(f,ctx),driveOk:async()=>!!(await getMcp()),driveErr:(e,n)=>driveUpErr(e,n),
  openTask:id=>whenFrame('sec',w=>w.CS&&w.CS.ready(id),w=>w.CS.openTask(id)),
  openFin:f=>whenFrame('fin',w=>w.FIN&&w.FIN.hasRow(f.tid,f.id),w=>{if(f.m)w.FIN.setMonth(f.m);w.FIN.go(f.tab);w.FIN.openItem(f.tid,f.id);})
};

document.addEventListener('click',()=>setTimeout(updateDriveLink,0));
document.addEventListener('change',()=>setTimeout(updateDriveLink,0));
