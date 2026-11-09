"use strict";
/* =================== sincronização com o Google Drive =================== */
const GD='Google Drive';
const DRIVE_SUB={casas:'1oPAKtilXU9W_AYjQdlkUznJawFBbM7jT',carros:'1_O4-IgjmCTtPbdfcayqR65SjWxJkSxMn',escritorios:'1JlOnG-pd70hvg0zHfU_8y7Tj27x8EyZE',servicos:'1sfgqsrzx67nkjI7cREav7Qz2tOcaVFJM'};
const DRIVE_COL={pessoas:'cad-pessoas',ativos:'cad-ativos',empresas:'cad-empresas',brd:'brd-boards',via:'via-viagens',pets:'fam-pet'};
const driveName=(kind,r)=>kind==='via'?((r.inicio?r.inicio.slice(0,7)+' · ':'')+(r.titulo||'Viagem')):(r.nome||'');
let mcpNs;
async function getMcp(){if(mcpNs!==undefined)return mcpNs;try{mcpNs=(window.claude&&typeof window.claude.use==='function')?await window.claude.use('mcp'):null;}catch(e){mcpNs=null;}return mcpNs;}
function driveTargets(kind,r){
  if(!r||!driveName(kind,r))return [];
  if(kind==='via')return [{key:'via',parent:DRIVE.via}];
  if(kind==='pessoas'){if(r.grupo==='Funcionário(a)'||r.grupo==='Prestador(a)')return [{key:'dp',parent:DRIVE.dp}];if(r.grupo==='Executivo'||r.grupo==='Família')return [{key:'sau',parent:DRIVE.sau},{key:'fam',parent:DRIVE.fam}];if(r.grupo==='Saúde')return [{key:'sau',parent:DRIVE.sau}];return [];}
  if(kind==='ativos')return [{key:'fac',parent:r.tipo==='Casa'?DRIVE_SUB.casas:r.tipo==='Carro'?DRIVE_SUB.carros:r.tipo==='Escritório'?DRIVE_SUB.escritorios:r.tipo==='Serviço'?DRIVE_SUB.servicos:DRIVE.fac}];
  if(kind==='empresas'){const pa=r.pai&&empById(r.pai);return [{key:'neg',parent:(pa&&pa.drive&&pa.drive.neg)||DRIVE.neg}];}
  if(kind==='brd')return [{key:'brd',parent:DRIVE.brd}];
  if(kind==='pets')return [{key:'fam',parent:DRIVE_PETS}];
  return [];
}
async function gd(tool,input){const m=await getMcp();if(!m)throw {code:'not_granted'};const res=await m.callTool(GD,tool,input);return res&&res.payload;}
function gdErr(e){const c=e&&e.code;
  if(c==='server_not_connected')return 'O Google Drive não está conectado. Conecte em Configurações › Conectores do claude.ai.';
  if(c==='needs_reauth')return 'A conexão com o Google Drive expirou. Reconecte em Configurações › Conectores do claude.ai.';
  if(c==='selection_required')return 'Escolha qual conta do Google Drive o Painel deve usar.';
  if(c==='not_in_manifest'||c==='approval_required'||c==='consent_required')return 'O Painel precisa da sua permissão para mexer no Google Drive. Permita quando ela pedir.';
  if(c==='not_granted'||c==='capability_disabled'||c==='capability_removed')return 'O Google Drive não está disponível nesta visualização. Abra o Painel pelo claude.ai.';
  if(c==='blocked_by_policy')return 'A política da sua organização não permite este uso do Google Drive.';
  return 'Não foi possível atualizar a pasta no Drive. Em Cadastros, use “Sincronizar com o Drive”.';}
/* ---------- anexos direto no Drive ---------- */
async function ensureFolder(kind,rec,key){
  if(rec.drive&&rec.drive[key])return rec.drive[key];
  const t=driveTargets(kind,rec).find(x=>x.key===key);if(!t)return null;
  const pl=await gd('create_file',{title:driveName(kind,rec),mimeType:'application/vnd.google-apps.folder',parentId:t.parent});
  const nid=pl&&(pl.id||(pl.file&&pl.file.id));if(!nid)return null;
  const drive=Object.assign({},rec.drive||{},{[key]:nid});rec.drive=drive;
  try{await S.db.collection(DRIVE_COL[kind]).doc(rec.id).update({drive});}catch(e){}
  return nid;
}
async function driveFolderFor(ctx){
  const via=async(kind,rec,key,fb)=>{if(rec){try{const f=await ensureFolder(kind,rec,key);if(f)return f;}catch(e){}}return fb;};
  const pes=id=>S.cad.pessoas.find(x=>x.id===id);
  if(ctx.task){
    const t=ctx.task,f=t.fields||{};
    if(f.empresa&&empById(f.empresa))return via('empresas',empById(f.empresa),'neg',DRIVE.neg);
    if(f.board){const b=recs('brd').find(x=>x.id===f.board);if(b)return via('brd',b,'brd',DRIVE.brd);}
    if(f.pessoa&&pes(f.pessoa))return via('pessoas',pes(f.pessoa),'fam',DRIVE.fam);
    const path=[];let n=catById(t.categoryId),g=0;while(n&&g++<20){path.unshift(n);n=catById(n.parentId);}
    if(!path.length)return DRIVE.sec;
    const last=path[path.length-1];
    if(last.id.indexOf('c-emp-')===0&&empById(last.id.slice(2)))return via('empresas',empById(last.id.slice(2)),'neg',DRIVE.neg);
    if(last.id.indexOf('c-ati-')===0&&ativoById(last.id.slice(2))){const a=ativoById(last.id.slice(2));return via('ativos',a,'fac',a.tipo==='Casa'?DRIVE_SUB.casas:DRIVE_SUB.carros);}
    {const pt=recs('fam-pet').find(x=>'c-'+x.id===last.id);if(pt)return via('pets',pt,'fam',DRIVE_PETS);}
    if(last.id==='c-fac-casas')return DRIVE_SUB.casas;
    if(last.id==='c-fac-carros')return DRIVE_SUB.carros;
    return ({'p-fin':DRIVE.fin,'p-dp':DRIVE.dp,'p-fac':DRIVE.fac,'p-fam':DRIVE.fam,'p-neg':DRIVE.neg,'p-sau':DRIVE.sau,'p-brd':DRIVE.brd,'k-via':DRIVE.via,'p-age':DRIVE.age})[path[0].id]||DRIVE.sec;
  }
  if(ctx.fin)return DRIVE.fin;
  const rt=ctx.rt||'',v=ctx.vals||{};
  if(rt.indexOf('dp-')===0)return via('pessoas',pes(v.pessoa),'dp',DRIVE.dp);
  if(rt.indexOf('sau-')===0)return via('pessoas',pes(v.pessoa),'sau',DRIVE.sau);
  if(rt==='fam-pet'){const p=ctx.id&&recs('fam-pet').find(x=>x.id===ctx.id);return via('pets',p,'fam',DRIVE_PETS);}
  if(rt.indexOf('fam-')===0)return via('pessoas',pes(v.pessoa),'fam',DRIVE.fam);
  if(rt.indexOf('fac-')===0){const a=v.ativo&&ativoById(v.ativo);return via('ativos',a,'fac',a?(a.tipo==='Casa'?DRIVE_SUB.casas:DRIVE_SUB.carros):DRIVE.fac);}
  if(rt.indexOf('neg-')===0)return via('empresas',v.empresa&&empById(v.empresa),'neg',DRIVE.neg);
  if(rt.indexOf('age-')===0)return DRIVE.age;
  if(rt==='brd'){const b=ctx.id&&recs('brd').find(x=>x.id===ctx.id);return via('brd',b,'brd',DRIVE.brd);}
  if(rt==='brd-reun'){const b=v.board&&recs('brd').find(x=>x.id===v.board);return via('brd',b,'brd',DRIVE.brd);}
  if(rt==='via'){const b=ctx.id&&recs('via').find(x=>x.id===ctx.id);return via('via',b,'via',DRIVE.via);}
  if(rt.indexOf('via-')===0){const b=v.viagem&&recs('via').find(x=>x.id===v.viagem);return via('via',b,'via',DRIVE.via);}
  return DRIVE.sec;
}
const toB64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]||'');r.onerror=()=>no({code:'bad_request'});r.readAsDataURL(f);});
async function driveUpload(file,ctx){
  const m=await getMcp();if(!m)throw {code:'not_granted'};
  if(file.size>16*1048576)throw {code:'too_large'};
  const parent=(await driveFolderFor(ctx||{}))||DRIVE.sec;
  const type=file.type||'application/octet-stream';
  const args={title:file.name,parentId:parent,contentMimeType:type,disableConversionToGoogleType:true};
  let fa=false;try{const lt=await m.listTools();fa=!!(lt&&lt.fileArgs);}catch(e){}
  if(fa)args.base64Content={$file:{data:file,name:file.name,type}};
  else{if(file.size>700000)throw {code:'too_large_inline'};args.base64Content=await toB64(file);}
  const res=await m.callTool(GD,'create_file',args);const pl=res&&res.payload;
  const id=pl&&(pl.id||(pl.file&&pl.file.id));if(!id)throw {code:'no_id'};
  return {id,url:(pl&&(pl.viewUrl||pl.webViewLink))||('https://drive.google.com/file/d/'+id+'/view'),folder:parent};
}
function driveUpErr(e,name){const c=e&&e.code;
  if(c==='too_large')return '“'+name+'” passa do limite de 16 MB.';
  if(c==='too_large_inline')return '“'+name+'” é grande demais para enviar por aqui agora. Tente um arquivo menor.';
  return gdErr(e);}
async function syncDrive(kind,docId,r,old){
  const targets=driveTargets(kind,r);if(!targets.length)return 0;
  const drive=Object.assign({},(old&&old.drive)||{},r.drive||{});let created=false,n=0;
  for(const t of targets){const id=drive[t.key];
    if(id){if(old&&driveName(kind,old)&&driveName(kind,old)!==driveName(kind,r)){await gd('update_file',{fileId:id,title:driveName(kind,r)});n++;}}
    else{const pl=await gd('create_file',{title:driveName(kind,r),mimeType:'application/vnd.google-apps.folder',parentId:t.parent});const nid=pl&&(pl.id||(pl.file&&pl.file.id));if(nid){drive[t.key]=nid;created=true;n++;}}}
  if(created)await S.db.collection(DRIVE_COL[kind]).doc(docId).update({drive});
  return n;
}
async function driveAfterSave(kind,docId,r,old){
  if(!DRIVE_COL[kind])return;
  try{const n=await syncDrive(kind,docId,r,old);if(n)toast(old&&old.drive&&Object.keys(old.drive).length&&driveName(kind,old)!==driveName(kind,r)?'Pasta renomeada no Drive':'Pasta criada no Drive');}
  catch(e){toast(gdErr(e));}
}
async function driveAfterDelete(kind,old){
  if(!DRIVE_COL[kind]||!old||!old.drive)return;
  const ids=Object.values(old.drive).filter(Boolean);if(!ids.length)return;
  try{for(const id of ids)await gd('update_file',{fileId:id,title:driveName(kind,old)+' (removido do Painel)'});toast('A pasta no Drive foi mantida e marcada como removida');}
  catch(e){toast(gdErr(e));}
}
let syncing=false;
let autoSyncT=null;const autoTried=new Set();
function autoDriveSync(){
  clearTimeout(autoSyncT);
  autoSyncT=setTimeout(async()=>{
    if(syncing||!S.db)return;let m=null;try{m=await getMcp();}catch(e){}if(!m)return;
    syncing=true;let n=0;
    const lists=[['pessoas',S.cad.pessoas],['ativos',S.cad.ativos],['empresas',S.cad.empresas],['brd',recs('brd')],['via',recs('via')]];
    try{for(const[kind,rows]of lists){for(const r of (rows||[])){const t=driveTargets(kind,r);if(!t.some(x=>!(r.drive&&r.drive[x.key])))continue;const k=kind+':'+r.id;if(autoTried.has(k))continue;autoTried.add(k);try{n+=await syncDrive(kind,r.id,r,null);}catch(e){if(e&&e.code&&e.code!=='bad_request')throw e;}}}}
    catch(e){}
    syncing=false;if(n)toast(n+(n===1?' pasta criada':' pastas criadas')+' no Drive para cadastros sem pasta');
  },4000);
}
async function syncAllDrive(btn){
  if(syncing)return;syncing=true;if(btn){btn.disabled=true;btn.textContent='Sincronizando…';}
  let n=0,err=null;
  const lists=[['pessoas',S.cad.pessoas],['ativos',S.cad.ativos],['empresas',S.cad.empresas],['brd',recs('brd')],['via',recs('via')]];
  try{for(const[kind,rows]of lists){for(const r of rows){const t=driveTargets(kind,r);if(!t.some(x=>!(r.drive&&r.drive[x.key])))continue;n+=await syncDrive(kind,r.id,r,null);}}}
  catch(e){err=e;}
  syncing=false;if(btn){btn.disabled=false;btn.textContent='Sincronizar com o Drive';}
  toast(err?gdErr(err):n?n+(n===1?' pasta criada':' pastas criadas')+' no Drive':'Tudo certo: todas as pastas já existem no Drive');
}

