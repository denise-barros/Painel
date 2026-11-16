/* =================== Painel → Google Drive (Apps Script) ===================
   Ponte entre o site do Painel (denise-barros.github.io/Painel) e o Google Drive da Denise.
   Publicado como "App da Web" na conta denise.barros@caminoschool.com.br:
     Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa
   Tudo é gravado no Drive da Denise, não importa quem anexou pelo Painel.
   Segurança: cada pedido traz o login do Painel (token do Supabase); o script confere
   esse login no Supabase antes de fazer qualquer coisa. Sem login válido, nada acontece.
   Só mexe em arquivos e pastas dentro da pasta raiz do Painel (Central Executiva).
   Cópia de referência: o código que roda é o que está colado no script.google.com. */

var SUPABASE_URL = 'https://itkcvvovzjjepkeblffe.supabase.co';
var SUPABASE_ANON = 'sb_publishable_d5abNAgZSKY4BB-HOrJGUg_4Yu8mTN1'; // chave pública do site
var RAIZ = '1Vne9tQl8NuetZV7oOHWPQf1YlGx5pEzd';                        // pasta Central Executiva

function doGet() {
  return json_({ ok: true, painel: 'drive' });
}

function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var user = usuario_(req.token);
    if (!user) return json_({ ok: false, code: 'not_granted', error: 'Login do Painel inválido ou expirado.' });
    var quem = (user.user_metadata && (user.user_metadata.name || user.user_metadata.nome)) || String(user.email || '').split('@')[0];
    var a = req.args || {};
    if (req.tool === 'create_file') return json_({ ok: true, payload: criar_(a, quem) });
    if (req.tool === 'update_file') return json_({ ok: true, payload: renomear_(a) });
    return json_({ ok: false, code: 'bad_request', error: 'Ação desconhecida: ' + req.tool });
  } catch (err) {
    return json_({ ok: false, code: 'error', error: String(err && err.message || err) });
  }
}

/* confere o login no Supabase */
function usuario_(token) {
  if (!token) return null;
  var r = UrlFetchApp.fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) return null;
  return JSON.parse(r.getContentText());
}

/* só aceita pastas que estejam dentro da pasta raiz do Painel */
function dentroDaRaiz_(folder) {
  var f = folder, guarda = 0;
  while (f && guarda++ < 30) {
    if (f.getId() === RAIZ) return true;
    var pais = f.getParents();
    f = pais.hasNext() ? pais.next() : null;
  }
  return false;
}

function pasta_(id) {
  var p = DriveApp.getFolderById(id || RAIZ);
  if (!dentroDaRaiz_(p)) throw new Error('Pasta fora do Painel.');
  return p;
}

function saida_(item, pasta) {
  var isFolder = item.getMimeType && item.getMimeType() === 'application/vnd.google-apps.folder';
  return {
    id: item.getId(),
    title: item.getName(),
    parentId: pasta ? pasta.getId() : null,
    mimeType: isFolder ? 'application/vnd.google-apps.folder' : item.getMimeType(),
    viewUrl: item.getUrl()
  };
}

function criar_(a, quem) {
  var pasta = pasta_(a.parentId);
  var tipo = a.mimeType || a.contentMimeType || 'application/octet-stream';
  if (tipo === 'application/vnd.google-apps.folder') {
    var nova = pasta.createFolder(a.title || 'Nova pasta');
    return { id: nova.getId(), title: nova.getName(), parentId: pasta.getId(), mimeType: tipo, viewUrl: nova.getUrl() };
  }
  if (a.subfolder) {
    var subs = pasta.getFoldersByName(a.subfolder);
    pasta = subs.hasNext() ? subs.next() : pasta.createFolder(a.subfolder);
  }
  var blob;
  if (a.base64Content) blob = Utilities.newBlob(Utilities.base64Decode(a.base64Content), tipo, a.title || 'arquivo');
  else blob = Utilities.newBlob(a.textContent || '', tipo, a.title || 'arquivo');
  var arq = pasta.createFile(blob);
  arq.setDescription('Enviado pelo Painel por ' + quem);
  return saida_(arq, pasta);
}

function renomear_(a) {
  var item;
  try { item = DriveApp.getFolderById(a.fileId); } catch (e) { item = DriveApp.getFileById(a.fileId); }
  var pais = item.getParents();
  if (!pais.hasNext() || !dentroDaRaiz_(pais.next())) throw new Error('Item fora do Painel.');
  if (a.title) item.setName(a.title);
  return { id: item.getId(), title: item.getName(), viewUrl: item.getUrl() };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Rode esta função uma vez no editor para autorizar o acesso ao Drive. */
function autorizar() {
  Logger.log(DriveApp.getFolderById(RAIZ).getName());
  UrlFetchApp.fetch(SUPABASE_URL + '/auth/v1/health', { headers: { apikey: SUPABASE_ANON }, muteHttpExceptions: true });
}
