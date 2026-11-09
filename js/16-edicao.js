"use strict";
/* ---------- editar textos (corrigir qualquer texto sem pedir ao Claude) ----------
   Guarda um mapa "lugar + texto original → texto novo" em meta/rotulos. O lugar é o módulo e o tipo do elemento (menu, título, etc.), então trocar o título de uma página não muda o item de menu nem os outros módulos. Entradas antigas, sem lugar, continuam valendo para todo texto igual.
   Textos com números (valores, datas, contagens) e campos de formulário ficam de fora. */
(function(){
const SKIP='script,style,input,textarea,select,option,#edToggle,#edInput,svg,iframe,[contenteditable]';
let MAP={},EDIT=false,busy=false,timer=null;
const ORIG=new WeakMap();
try{MAP=JSON.parse(localStorage.getItem('ce-rotulos')||'{}')||{};}catch(e){MAP={};}
const ok=t=>t.length>=2&&!/\d/.test(t);
function scopeOf(n){const p=n.parentElement;if(!p)return '';const v=p.closest('.view');return (v?v.id:'')+'|'+(p.closest('nav')?'nav':p.tagName.toLowerCase());}
const keyOf=(n,orig)=>scopeOf(n)+'::'+orig;
const has=(k)=>Object.prototype.hasOwnProperty.call(MAP,k);
function nodes(){
  const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
    const p=n.parentElement;if(!p||p.closest(SKIP))return NodeFilter.FILTER_REJECT;
    return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  while(w.nextNode())out.push(w.currentNode);return out;
}
function apply(){
  if(busy)return;if(!EDIT&&!Object.keys(MAP).length)return;busy=true;
  try{nodes().forEach(n=>{
    const raw=n.nodeValue,cur=raw.trim(),orig=ORIG.get(n)||cur;
    if(!ok(orig))return;
    const sk=keyOf(n,orig);const want=has(sk)?MAP[sk]:has(orig)?MAP[orig]:orig;
    if(want!==orig)ORIG.set(n,orig);else ORIG.delete(n);
    if(cur!==want)n.nodeValue=raw.replace(cur,want);
  });}finally{busy=false;}
}
function later(){clearTimeout(timer);timer=setTimeout(apply,40);}
function save(){
  try{localStorage.setItem('ce-rotulos',JSON.stringify(MAP));}catch(e){}
  try{if(S.db)S.db.doc('meta/rotulos').set({map:MAP});}catch(e){}
}
function commit(orig,nv,sk){nv=nv.replace(/\s+/g,' ').trim();if(!nv||nv===orig){if(has(orig))MAP[sk]=orig;else delete MAP[sk];}else MAP[sk]=nv;save();later();}
function textAt(x,y){
  let n=null;
  if(document.caretRangeFromPoint){const r=document.caretRangeFromPoint(x,y);n=r&&r.startContainer;}
  else if(document.caretPositionFromPoint){const c=document.caretPositionFromPoint(x,y);n=c&&c.offsetNode;}
  if(!n||n.nodeType!==3||!n.nodeValue.trim()||n.parentElement.closest(SKIP))return null;
  return n;
}
function openEditor(n){
  const cur=n.nodeValue.trim(),orig=ORIG.get(n)||cur;if(!ok(orig))return;const sk=keyOf(n,orig);
  const rg=document.createRange();rg.selectNodeContents(n);const r=rg.getBoundingClientRect();
  const inp=document.createElement('input');inp.id='edInput';inp.value=cur;
  inp.style.cssText='position:fixed;z-index:80;left:'+Math.max(4,Math.min(r.left-8,innerWidth-264))+'px;top:'+Math.max(4,r.top-8)+'px;width:'+Math.min(innerWidth-8,Math.max(220,r.width+60))+'px;height:'+Math.max(32,r.height+12)+'px;font:inherit;padding:0 8px;border:2px solid #DB4A7B;border-radius:8px;background:#fff;color:#111;box-sizing:border-box;box-shadow:0 4px 16px rgba(0,0,0,.18)';
  document.body.appendChild(inp);inp.focus();inp.select();
  let done=false;const end=y=>{if(done)return;done=true;const v=inp.value;inp.remove();if(y)commit(orig,v,sk);};
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();end(true);}if(e.key==='Escape'){e.preventDefault();end(false);}});
  inp.addEventListener('blur',()=>end(true));
}
document.addEventListener('click',e=>{
  if(!EDIT)return;const t=e.target;
  if(t.id==='edToggle'||t.id==='edInput')return;
  e.stopPropagation();e.preventDefault();
  if(document.getElementById('edInput'))return;
  const n=textAt(e.clientX,e.clientY);if(n)openEditor(n);
},true);
let hov=null;
document.addEventListener('mousemove',e=>{
  if(!EDIT)return;const n=textAt(e.clientX,e.clientY),el=n&&n.parentElement;
  if(hov&&hov!==el)hov.classList.remove('ed-hover');
  hov=el&&ok((ORIG.get(n)||n.nodeValue.trim()))?el:null;if(hov)hov.classList.add('ed-hover');
});
const st=document.createElement('style');
st.textContent='.ed-hover{outline:2px dashed #DB4A7B;outline-offset:2px;border-radius:4px;cursor:text!important}'+
 'body.ed-mode *{cursor:text}'+
 '#edToggle{position:fixed;right:14px;bottom:14px;z-index:90;border:1px solid #d6dcd8;background:#fff;color:inherit;border-radius:999px;padding:7px 13px;font:600 12px inherit;cursor:pointer!important;box-shadow:0 2px 8px rgba(0,0,0,.08);opacity:.75}'+
 '#edToggle:hover,#edToggle.on{opacity:1}#edToggle.on{background:#DB4A7B;color:#fff;border-color:transparent}';
document.head.appendChild(st);
const b=document.createElement('button');b.id='edToggle';b.type='button';
b.title='Modo edição: clique em qualquer texto para corrigir. Enter confirma, Esc cancela, apagar tudo volta ao original. Vale só para este lugar (o módulo e o tipo de texto), não para os outros textos iguais.';
b.textContent='Editar textos';
b.addEventListener('click',e=>{e.stopPropagation();EDIT=!EDIT;b.classList.toggle('on',EDIT);document.body.classList.toggle('ed-mode',EDIT);b.textContent=EDIT?'Concluir edição':'Editar textos';if(!EDIT&&hov){hov.classList.remove('ed-hover');hov=null;}later();});
document.body.appendChild(b);
/* aplica na mesma hora (antes de a tela ser pintada), para o texto original não piscar */
new MutationObserver(()=>{if(!busy)apply();}).observe(document.body,{childList:true,subtree:true,characterData:true});
let tries=0;const iv=setInterval(()=>{
  if(S.db){clearInterval(iv);try{S.db.doc('meta/rotulos').onSnapshot(s=>{if(s.exists){const m=(s.data()||{}).map;if(m&&typeof m==='object'){MAP=JSON.parse(JSON.stringify(m));try{localStorage.setItem('ce-rotulos',JSON.stringify(MAP));}catch(e){}later();}}},()=>{});}catch(e){}}
  else if(++tries>40)clearInterval(iv);
},500);
later();
})();
