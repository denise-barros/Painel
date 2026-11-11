"use strict";
/* =================== menus laterais (Facilities, Saúde, Rotina e Família, Agenda) =================== */
const MI=d=>'<span class="nm-chip"><svg viewBox="0 0 24 24">'+d+'</svg></span>';
const MIC={
  geral:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  rec:'<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  hist:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  med:'<rect x="4" y="9" width="16" height="7" rx="3.5"/><path d="M12 9v7"/>',
  doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  steth:'<path d="M6 4v6a4 4 0 0 0 8 0V4"/><path d="M10 14v2a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',
  money:'<rect x="3.5" y="6" width="17" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  paw:'<circle cx="6.5" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="17.5" cy="10" r="1.8"/><path d="M8 17c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5c0 1.5-1.2 2.5-2.5 2.5h-3C9.2 19.5 8 18.5 8 17z"/>',
  ev:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  rot:'<path d="M4 6h16M4 12h16M4 18h10"/>',
  casa:'<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  carro:'<path d="M5 17v-5l2-5h10l2 5v5M5 17h14M5 17v2M19 17v2"/><circle cx="8.5" cy="14" r=".8"/><circle cx="15.5" cy="14" r=".8"/>',
  escr:'<rect x="5" y="4" width="14" height="16" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 20v-4h4v4"/>',
  serv:'<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z"/>',
  outro:'<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  reun:'<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="9" r="2.5"/><path d="M3.5 18c.5-2.6 2.3-4.3 4.5-4.3s4 1.7 4.5 4.3M11.5 18c.5-2.6 2.3-4.3 4.5-4.3s4 1.7 4.5 4.3"/>'
};
/* items: {l, nav:'view|tab|id', on, ic, child, cnt, alert, soon} | {sep:'Título'} | {add:'Texto', attr:'data-…'} */
function sideNav(o){
  const it=x=>{
    if(x.sep)return '<div class="nm-sec">'+esc(x.sep)+'</div>';
    if(x.add)return '<button class="nm-item nm-c add" '+x.attr+'><span class="lbl">'+esc(x.add)+'</span></button>';
    const tail=(x.soon?'<span class="soon">'+esc(x.soon)+'</span>':'')+(x.cnt?'<span class="cnt'+(x.alert?' alert':'')+'">'+x.cnt+'</span>':'');
    return x.child?'<button class="nm-item nm-c'+(x.on?' on':'')+'" data-snav="'+esc(x.nav)+'"><span class="lbl">'+esc(x.l)+'</span>'+tail+'</button>'
      :'<div class="nm-grp"><button class="nm-item nm-g'+(x.on?' on':'')+'" data-snav="'+esc(x.nav)+'">'+MI(x.ic||MIC.geral)+'<b class="lbl">'+esc(x.l)+'</b>'+tail+'</button></div>';};
  return '<nav class="neg-menu" aria-label="'+esc(o.title)+'"><div class="nm-head"><div class="nm-mark">'+esc(o.mark)+'</div><div><b>'+esc(o.title)+'</b><small>'+esc(o.sub)+'</small></div></div><div class="nm-list">'+o.items.map(it).join('')+'</div></nav>';
}
const sideWrap=(menu,body)=>'<div class="wrap"><div class="side-layout">'+menu+'<div class="side-main">'+body+'</div></div></div>';
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-snav]');if(!b)return;
  const [v,tab,id]=b.dataset.snav.split('|');
  if(v==='fac'){const tp=(id||'').startsWith('tipo:')?id.slice(5):'';const aid=tp?'':(id||'');S.facTab=tab||'geral';S.facF.ativo=aid;S.facF.tipoAtivo=tp;S.facF.status=aid?'':'abertos';if(aid&&catById('c-'+aid))S.demSub['p-fac']='c-'+aid;else delete S.demSub['p-fac'];saveUi();renderFac();}
  else if(v==='sau'){if(tab)S.sauTab=tab;S.sauP=id||'';saveUi();renderSau();}
  else if(v==='fam'){S.famTab=tab||'geral';if(tab==='pet'){S.famPet=id||'';const cid=id?'c-'+id:'c-fam-pets';if(catById(cid))S.demSub['p-fam']=cid;else delete S.demSub['p-fam'];}else{S.famPet='';delete S.demSub['p-fam'];S.famP=id!=null?id:S.famP;}saveUi();renderFam();}
  else if(v==='age'){S.ageTab=tab||'geral';saveUi();renderAge();}
});
/* tablet e celular: botão ☰ ao lado do título abre o menu lateral como gaveta (igual ao Financeiro) */
const NM_OPEN='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
function snavClose(){document.body.classList.remove('snav-open');}
function snavButtons(){
  document.querySelectorAll('#views .side-layout').forEach(sl=>{
    const main=sl.querySelector(':scope>.side-main');if(!main||main.querySelector('.nm-open'))return;
    const nav=sl.querySelector(':scope>.neg-menu');
    const b=document.createElement('button');b.type='button';b.className='nm-open';b.dataset.snavOpen='';
    b.setAttribute('aria-label','Abrir menu'+(nav&&nav.getAttribute('aria-label')?' · '+nav.getAttribute('aria-label'):''));b.title='Abrir menu';b.innerHTML=NM_OPEN;
    const hero=main.querySelector('.plan-hero');
    if(hero){hero.classList.add('has-nm-open');hero.prepend(b);}else main.prepend(b);
  });
}
(function(){
  const sc=document.createElement('div');sc.className='snav-scrim';sc.dataset.snavClose='';document.body.appendChild(sc);
  const v=document.getElementById('views');
  /* faixas de botões que rolam para o lado: mantém o botão marcado à vista */
  const segOn=()=>document.querySelectorAll('#v-rel .rel-bar>.seg,.seg.tabs').forEach(sg=>{if(sg.scrollWidth<=sg.clientWidth)return;const on=sg.querySelector('button.on');if(!on)return;const l=on.offsetLeft-sg.offsetLeft,r=l+on.offsetWidth;if(l<sg.scrollLeft||r>sg.scrollLeft+sg.clientWidth)sg.scrollLeft=Math.max(0,l-(sg.clientWidth-on.offsetWidth)/2);});
  if(v)new MutationObserver(()=>{snavButtons();segOn();}).observe(v,{childList:true,subtree:true});
  snavButtons();
})();
document.addEventListener('click',e=>{
  if(e.target.closest('[data-snav-open]')){document.body.classList.add('snav-open');return;}
  if(e.target.closest('[data-snav-close]')||e.target.closest('.neg-menu button')||e.target.closest('#nav button'))snavClose();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('snav-open'))snavClose();});
