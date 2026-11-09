"use strict";
/* =================== gaveta de registros =================== */
function richText(t){
  const blocks=String(t||'').replace(/\r/g,'').split(/\n\s*\n/);
  const line=l=>{l=esc(l.trim());return l.replace(/^(\d{2}\/\d{2}(?:\/\d{4})?)\s*[–-]\s*/,'<span class="rt-d">$1</span>');};
  return blocks.map(b=>{const ls=b.split('\n').filter(x=>x.trim());if(!ls.length)return '';
    let h='';let i=0;
    if(!/^[•\-]\s/.test(ls[0])){const m=ls[0].match(/^([^:]{2,24}):\s*(.*)$/);
      if(m&&ls.length>1&&!m[2])h+='<div class="rt-h">'+esc(m[1])+'</div>';
      else if(m)h+='<p><span class="rt-l">'+esc(m[1])+':</span> '+line(m[2])+'</p>';
      else h+='<p>'+line(ls[0])+'</p>';i=1;}
    const items=ls.slice(i);const bul=items.filter(x=>/^[•\-]\s/.test(x));
    if(items.length&&bul.length===items.length)h+='<ul>'+items.map(x=>'<li>'+line(x.replace(/^[•\-]\s*/,''))+'</li>').join('')+'</ul>';
    else h+=items.map(x=>'<p>'+line(x.replace(/^[•\-]\s*/,''))+'</p>').join('');
    return h;}).join('');
}
function openRec(type,id,pre){
  const R=REC[type];const r=id?recs(type).find(x=>x.id===id):null;if(id&&!r)return;
  if(!S.db){toast('Os dados não estão disponíveis nesta visualização.');return;}
  dr={type:'rec',rt:type,id:id||null,arm:false,files:(r&&Array.isArray(r.anexos))?r.anexos.slice():[]};
  const val=f=>r?r[f.k]:(pre&&pre[f.k]!=null?pre[f.k]:(f.def?f.def():(f.opts?f.opts[0]:'')));
  const body=R.fields.map(f=>{
    if(f.onlyNew&&r)return '';
    const v=val(f);const fid='rf-'+f.k;const lab='<label for="'+fid+'">'+esc(f.l)+'</label>';const hint=f.hint?'<span class="hint">'+esc(f.hint)+'</span>':'';
    if(f.t==='people'){const cur=Array.isArray(v)?v:[];return '<div class="fld"><label>'+esc(f.l)+'</label><div class="days-pick" id="'+fid+'">'+(S.view==='sau'?sauPessoas():familia()).map(p=>'<label><input type="checkbox" value="'+esc(p.id)+'"'+(cur.includes(p.id)?' checked':'')+'><span>'+esc(p.nome.split(' ')[0])+'</span></label>').join('')+'</div>'+hint+'</div>';}
    if(f.ref){const rows=refRows(f.ref);return '<div class="fld">'+lab+'<select id="'+fid+'"><option value="">'+(f.req?'Escolha…':'—')+'</option>'+(f.ref==='ativos'?ativoGroups(v,''):rows.map(x=>'<option value="'+esc(x.id)+'"'+(x.id===v?' selected':'')+'>'+esc(x.nome)+'</option>').join(''))+(v&&!rows.some(x=>x.id===v)?'<option value="'+esc(v)+'" selected>'+esc(refName(f.ref,v))+'</option>':'')+'</select>'+(!rows.length?'<span class="hint">Nada cadastrado ainda. Cadastre em Cadastros.</span>':'')+hint+'</div>';}
    if(f.opts)return '<div class="fld">'+lab+'<select id="'+fid+'">'+f.opts.map(o=>'<option value="'+esc(o)+'"'+((v||'')===o?' selected':'')+'>'+esc(f.lab?(o?f.lab(o):'—'):(o||'—'))+'</option>').join('')+'</select>'+hint+'</div>';
    if(f.long)return '<div class="fld">'+lab+'<textarea id="'+fid+'"'+(v?' class="has-ro"':'')+'>'+esc(v||'')+'</textarea>'+(v?'<div class="ro-text">'+richText(v)+'</div>':'')+hint+'</div>';
    if(f.t==='days'){const cur=Array.isArray(v)?v.map(Number):[1,2,3,4,5];return '<div class="fld"><label>'+esc(f.l)+'</label><div class="days-pick" id="'+fid+'">'+[1,2,3,4,5,6,0].map(d=>'<label><input type="checkbox" value="'+d+'"'+(cur.includes(d)?' checked':'')+'><span>'+DOW[d]+'</span></label>').join('')+'</div>'+hint+'</div>';}
    if(f.t==='check')return '<label class="check-row"><input type="checkbox" id="'+fid+'"'+(v?' checked':'')+'><span>'+esc(f.l)+'</span></label>';
    if(f.t==='files')return '<div class="fld"><label for="'+fid+'">'+esc(f.l)+'</label><div id="rf-files-list" class="files">'+filesEdit()+'</div>'+((S.assets||mcpNs)?'<input type="file" id="'+fid+'" multiple class="file-in">'+(mcpNs?'<span class="hint">Vai para a pasta certa no Drive.</span>':''):'<span class="hint">Anexos indisponíveis nesta visualização.</span>')+'</div>';
    const type_=f.t==='time'?'time':f.t==='date'?'date':f.t==='month'?'month':f.t==='num'?'number':'text';
    return '<div class="fld">'+lab+'<input id="'+fid+'" type="'+type_+'"'+(f.t==='money'?' inputmode="decimal" data-money':'')+(f.t==='num'?' step="1" min="0"':'')+' value="'+esc(f.t==='money'?moneyFmtInput(v):(v==null?'':v))+'" placeholder="'+esc(f.ph||(f.t==='money'?'0,00':''))+'" autocomplete="off">'+hint+'</div>';
  }).join('');
  let extra='';
  if(type==='fac-rec'&&r&&!r.encerrada)extra='<button class="btn" data-done="'+esc(r.id)+'">Registrar como feito</button>';
  if(type==='fac-ch'&&r&&r.taskId&&S.tasks.get(r.taskId))extra='<span class="hint">Demanda #'+esc(S.tasks.get(r.taskId).num)+' na Operação</span>';
  if(type==='sau-ev'&&r&&retornoDue(r))extra+='<button class="btn" data-retorno="'+esc(r.id)+'">Agendar retorno</button>';
  if(type==='sau-ev'&&r&&r.reembolso==='Com reembolso')extra+='<button class="btn" data-lancar-reemb="'+esc(r.id)+'">Lançar reembolso</button>';
  if(type==='sau-med'&&r&&medActive(r))extra+='<button class="btn" data-comprou="'+esc(r.id)+'">Comprei</button>';
  if(type==='neg-obr'&&r&&!r.encerrada)extra+='<button class="btn" data-obr-done="'+esc(r.id)+'">Registrar como feita</button>';
  const cut=t=>{t=String(t||'').split('\n')[0];return t.length>70?t.slice(0,68).trim()+'…':t;};
  const title=r?(r.titulo||r.nome||(r.pessoa?refName('equipe',r.pessoa)+' · '+(r.tipo||R.one)+(r.data?' · '+fmtDateFull(r.data):''):'')||cut(r.descricao)||r.emissor||R.one):(R.fem?'Nova ':'Novo ')+R.one;
  drawerShell(title,body,(r?'<button class="btn danger" id="rf-del">Excluir</button>':'')+extra+'<span class="grow"></span><button class="btn" data-close>Cancelar</button><button class="btn primary" id="rf-save">'+(r?'Salvar':'Registrar')+'</button>',!!r);
}
function filesEdit(){return (dr.files||[]).map((a,i)=>'<span class="file"><a href="'+(a.url?esc(a.url):'/_blob/'+encodeURIComponent(a.id))+'" target="_blank" rel="noopener">'+esc(a.name||'arquivo')+'</a><button class="x" data-unfile="'+i+'" aria-label="Remover '+esc(a.name||'arquivo')+'">×</button></span>').join('');}
function drawerVals(){const v={};['pessoa','ativo','empresa','board','viagem'].forEach(k=>{const el=$('#rf-'+k);if(el)v[k]=el.value;});return v;}
async function uploadFiles(input){
  if(!input.files||!input.files.length)return;const files=[...input.files];input.value='';
  for(const f of files){
    toast('Enviando '+f.name+'…');
    try{
      let item=null;
      if(mcpNs){try{const r=await driveUpload(f,{rt:dr.rt,id:dr.id,vals:drawerVals()});item={id:r.id,name:f.name,size:f.size,type:f.type,drive:true,url:r.url};}
        catch(e){if(!S.assets){toast(driveUpErr(e,f.name));continue;}toast(driveUpErr(e,f.name)+' Salvo só no Painel.');}}
      if(!item&&S.assets){const r=await S.assets.upload(f);item={id:r.id,name:f.name,size:r.sizeBytes||f.size,type:r.contentType||f.type};}
      if(!item){toast('Anexos indisponíveis nesta visualização.');continue;}
      if(!dr)return;dr.files.push(item);const l=$('#rf-files-list');if(l)l.innerHTML=filesEdit();
    }catch(e){toast(e&&e.code==='too_large'?f.name+' passa do limite de 20 MB.':'Não foi possível enviar '+f.name+'.');}
  }
  toast('Anexo pronto. Salve para manter.');
}
async function saveRec(){
  const R=REC[dr.rt];const old=dr.id?recs(dr.rt).find(x=>x.id===dr.id):null;const obj={};
  for(const f of R.fields){
    if(f.onlyNew&&old)continue;
    const el=$('#rf-'+f.k);
    if(f.t==='files'){obj[f.k]=dr.files||[];continue;}
    if(f.t==='days'){obj[f.k]=[...document.querySelectorAll('#rf-'+f.k+' input:checked')].map(x=>+x.value);continue;}
    if(f.t==='people'){obj[f.k]=[...document.querySelectorAll('#rf-'+f.k+' input:checked')].map(x=>x.value);continue;}
    if(f.t==='check'){obj[f.k]=!!(el&&el.checked);continue;}
    let v=el?el.value:'';if(typeof v==='string')v=v.trim();
    if(f.t==='money'&&v!=='')v=moneyParse(v);else if(f.t==='num'&&v!=='')v=Math.round(parseFloat(String(v).replace(',','.'))*100)/100;
    if((f.t==='money'||f.t==='num')&&(v===''||isNaN(v)))v=f.t==='num'&&f.k==='antecedencia'?30:'';
    if(f.req&&(v===''||v==null)){toast('Preencha: '+f.l+'.');if(el)el.focus();return;}
    obj[f.k]=v;
  }
  if(dr.rt==='dp-mov'&&(obj.tipo==='Férias'||obj.tipo==='Afastamento')&&obj.dataFim&&obj.dataFim<obj.data){toast('A data final vem antes da inicial.');return;}
  if(dr.rt==='fac-ch'&&obj.status==='Concluído'&&!obj.concluidoEm)obj.concluidoEm=todayISO();
  if(dr.rt==='via-pts'&&(!old||String(old.pts||'')!==String(obj.pts||'')||(old.venc||'')!==(obj.venc||''))&&(obj.atual||'')===((old&&old.atual)||''))obj.atual=todayISO();
  if(dr.rt==='sau-ev'&&obj.medico&&!obj.local){const md=S.cad.medicos.find(x=>x.id===obj.medico);if(md&&md.endereco)obj.local=md.endereco;}
  const now=new Date().toISOString();obj.criadoEm=old&&old.criadoEm?old.criadoEm:now;obj.atualizadoEm=now;
  if(old){['taskId','encerrada','origem','retornoAgendado','finReembId','compras','historico','drive','checklist','reembLancado','reembId'].forEach(k=>{if(old[k]!=null)obj[k]=old[k];});}
  const extra=(!old&&dr.extra)?dr.extra:null;if(extra)Object.assign(obj,extra);
  if(dr.rt==='neg-obr'&&old&&old.encerrada&&obj.proxima&&obj.proxima!==old.proxima)obj.encerrada=false;
  if(dr.rt==='fac-rec'&&old&&old.encerrada&&obj.proxima&&obj.proxima!==old.proxima)obj.encerrada=false;
  const wantTask=dr.rt==='fac-ch'&&!old;delete obj.criarDemanda;
  const docId=dr.id||uid(dr.rt.replace('-',''));const b=$('#rf-save');b.disabled=true;b.textContent='Salvando…';
  try{
    if(wantTask){const tid=await createTaskFromChamado(obj);if(tid)obj.taskId=tid;}
    await S.db.collection(R.col).doc(docId).set(obj);
    if(extra&&extra.origem&&R.col==='sau-ev'){try{await S.db.collection('sau-ev').doc(extra.origem).update({retornoAgendado:true,atualizadoEm:now});}catch(e){}}
    closeDrawer();toast(old?'Alterações salvas':(R.fem?'Registrada':'Registrado')+(wantTask&&obj.taskId?' e enviado à Operação':''));
    if(dr===null&&R.col==='brd-boards')driveAfterSave('brd',docId,obj,old);
    if(dr===null&&R.col==='via-viagens')driveAfterSave('via',docId,obj,old);
  }catch(e){b.disabled=false;b.textContent=old?'Salvar':'Registrar';toast(e&&e.code==='quota_exceeded'?'Limite de armazenamento atingido.':'Não foi possível salvar agora. Tente de novo em instantes.');}
}
async function createTaskFromChamado(c){
  const now=new Date().toISOString();let num=0;S.tasks.forEach(t=>{if((t.num||0)>num)num=t.num;});num++;
  const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);const a=ativoById(c.ativo);
  const cat=catById('c-'+c.ativo)?'c-'+c.ativo:(catById('p-fac')?'p-fac':null);
  const t={id,num,title:c.titulo+(a?' · '+a.nome:''),status:'nova',sphere:'pessoal',categoryId:cat,executive:a&&a.executivo?a.executivo:null,
    priority:c.prioridade==='Crítica'?'critica':c.prioridade==='Alta'?'alta':c.prioridade==='Média'?'media':c.prioridade==='Baixa'?'baixa':null,due:c.prazo||null,
    assignees:[],attachments:[],checklist:[],fields:{},notes:'Chamado de Facilities'+(c.descricao?': '+c.descricao:''),sessions:[],timerStart:null,waitingFor:'',waitingSince:null,
    history:[{at:now,text:'Demanda criada a partir de um chamado de Facilities'}],statusLog:[{s:'nova',at:now}],createdAt:now,updatedAt:now,completedAt:null};
  await S.db.doc('tasks/'+id).set(t);return id;
}
async function delRec(){
  const b=$('#rf-del');if(!dr.arm){dr.arm=true;b.classList.add('armed');b.textContent='Confirmar exclusão';return;}
  const rt=dr.rt,old=recs(rt).find(x=>x.id===dr.id);
  try{await S.db.collection(REC[rt].col).doc(dr.id).delete();closeDrawer();toast('Registro excluído');if(rt==='brd')driveAfterDelete('brd',old);if(rt==='via'){driveAfterDelete('via',old);if(S.viaSel===old.id)S.viaSel=null;}}catch(e){toast('Não foi possível excluir agora.');}
}

