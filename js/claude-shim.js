"use strict";
/* =================== Ponte Supabase ===================
   O Painel foi escrito para rodar como artefato no claude.ai, onde window.claude.use(...)
   entrega o banco de dados ("db"), os anexos ("assets"), os downloads ("downloads"),
   o usuário ("user") e o Google Drive ("mcp").
   Fora do claude.ai, este arquivo recria essas mesmas funções em cima do Supabase:
   - db        → tabela painel_docs (path, col, data jsonb), com atualização em tempo real
   - assets    → Supabase Storage, bucket "anexos" (privado; links assinados)
   - downloads → download direto pelo navegador
   - user      → login do Supabase (e-mail e senha)
   - mcp       → indisponível (o Drive não é usado fora do claude.ai; anexos vão para o Storage)
   Dentro do claude.ai nada disto é usado. */
(function () {
  if (window.claude && typeof window.claude.use === 'function') return;

  const CFG = window.PAINEL_SUPABASE || {};
  const TABLE = 'painel_docs';
  const BUCKET = 'anexos';
  const configured = !!(CFG.url && CFG.anonKey && window.supabase && window.supabase.createClient);
  const sb = configured ? window.supabase.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const colOf = p => p.slice(0, p.lastIndexOf('/'));
  const idOf = p => p.slice(p.lastIndexOf('/') + 1);
  const segs = p => String(p).split('/').filter(Boolean).join('/');
  const errOf = e => {
    const msg = (e && (e.message || e.error_description)) || String(e);
    const err = new Error(msg);
    err.code = /quota|exceeded/i.test(msg) ? 'quota_exceeded' : /too large|maximum allowed size|payload/i.test(msg) ? 'too_large' : (e && e.code) || 'error';
    return err;
  };

  /* ---------------- estilo da tela de login ---------------- */
  const css = document.createElement('style');
  css.textContent =
    '.sbx-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:#F5F3EF;font-family:"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,sans-serif}' +
    '.sbx-card{width:100%;max-width:360px;background:#fff;border:1px solid #E6E1D8;border-radius:16px;padding:28px 24px;box-shadow:0 10px 30px rgba(0,0,0,.06)}' +
    '.sbx-card h1{font-family:Sora,sans-serif;font-size:22px;margin:0 0 4px;letter-spacing:-.03em;color:#1D1B18}' +
    '.sbx-card p{margin:0 0 18px;color:#6B655C;font-size:13.5px;line-height:1.45}' +
    '.sbx-card label{display:block;font-size:12.5px;font-weight:600;color:#3A3630;margin:12px 0 6px}' +
    '.sbx-card input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #D9D3C8;border-radius:10px;font:inherit;font-size:14px;background:#fff;color:#1D1B18}' +
    '.sbx-card input:focus{outline:2px solid #2F7A70;outline-offset:1px;border-color:#2F7A70}' +
    '.sbx-card button{margin-top:18px;width:100%;padding:11px 12px;border:0;border-radius:10px;background:#2F7A70;color:#fff;font:inherit;font-weight:700;font-size:14px;cursor:pointer}' +
    '.sbx-card button[disabled]{opacity:.6;cursor:default}' +
    '.sbx-err{margin-top:12px;color:#B3261E;font-size:13px;min-height:1em}' +
    '.sbx-out{position:fixed;left:12px;bottom:12px;z-index:9000;padding:6px 10px;border-radius:8px;border:1px solid #E6E1D8;background:#fff;color:#6B655C;font:600 12px "Plus Jakarta Sans",sans-serif;cursor:pointer;opacity:.75}' +
    '.sbx-out:hover{opacity:1}' +
    '@media (prefers-color-scheme:dark){.sbx-ov{background:#161513}.sbx-card{background:#1F1D1A;border-color:#34302A}.sbx-card h1{color:#F2EEE7}.sbx-card p{color:#A39C90}.sbx-card label{color:#D6D0C5}.sbx-card input{background:#161513;color:#F2EEE7;border-color:#3A362F}.sbx-out{background:#1F1D1A;border-color:#34302A;color:#A39C90}}';
  document.head.appendChild(css);

  function overlay(html) {
    const ov = document.createElement('div');
    ov.className = 'sbx-ov';
    ov.innerHTML = '<div class="sbx-card">' + html + '</div>';
    (document.body || document.documentElement).appendChild(ov);
    return ov;
  }

  function showLogin() {
    return new Promise(resolve => {
      const ov = overlay(
        '<h1>Painel</h1><p>Entre com o e-mail e a senha cadastrados.</p>' +
        '<form id="sbx-f"><label for="sbx-e">E-mail</label><input id="sbx-e" type="email" autocomplete="username" required>' +
        '<label for="sbx-p">Senha</label><input id="sbx-p" type="password" autocomplete="current-password" required>' +
        '<button id="sbx-b" type="submit">Entrar</button><div class="sbx-err" id="sbx-m" role="alert"></div></form>'
      );
      const f = ov.querySelector('#sbx-f'), b = ov.querySelector('#sbx-b'), m = ov.querySelector('#sbx-m');
      setTimeout(() => { const e = ov.querySelector('#sbx-e'); if (e) e.focus(); }, 50);
      f.addEventListener('submit', async ev => {
        ev.preventDefault();
        b.disabled = true; b.textContent = 'Entrando…'; m.textContent = '';
        const { data, error } = await sb.auth.signInWithPassword({
          email: ov.querySelector('#sbx-e').value.trim(),
          password: ov.querySelector('#sbx-p').value
        });
        if (error || !data.session) {
          b.disabled = false; b.textContent = 'Entrar';
          m.textContent = /invalid/i.test((error && error.message) || '') ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente de novo.';
          return;
        }
        ov.remove();
        resolve(data.session);
      });
    });
  }

  function addLogout() {
    const b = document.createElement('button');
    b.className = 'sbx-out'; b.type = 'button'; b.textContent = 'Sair'; b.title = 'Sair do Painel';
    b.addEventListener('click', async () => { try { await sb.auth.signOut(); } catch (e) {} location.reload(); });
    document.body.appendChild(b);
  }

  async function start() {
    if (!configured) {
      const go = () => overlay('<h1>Painel</h1><p>O Supabase ainda não foi configurado. Preencha <b>url</b> e <b>anonKey</b> no arquivo <code>js/supabase-config.js</code>.</p>');
      if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
      return null;
    }
    let { data } = await sb.auth.getSession();
    let session = data && data.session;
    if (!session) {
      if (!document.body) await new Promise(r => document.addEventListener('DOMContentLoaded', r));
      session = await showLogin();
    }
    sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.reload(); });
    if (document.body) addLogout(); else document.addEventListener('DOMContentLoaded', addLogout);
    /* guarda o nome de quem entrou, para mostrar "por Fulano" nos anexos */
    try {
      const u = session.user;
      const name = (u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name)) || String(u.email || '').split('@')[0];
      sb.from(TABLE).upsert({ path: 'perfis/' + u.id, col: 'perfis', data: { name, email: u.email }, updated_at: new Date().toISOString() }).then(() => {}, () => {});
    } catch (e) {}
    return session;
  }
  const ready = start();

  /* ---------------- banco de dados ---------------- */
  const cache = new Map();          // path → data
  const colL = new Map();           // coleção → Set(listener)
  const docL = new Map();           // path → Set(listener)
  let pending = new Set(), flushT = null, loaded = null;

  function notify(path) {
    pending.add(path);
    if (flushT) return;
    flushT = setTimeout(() => {
      const paths = pending; pending = new Set(); flushT = null;
      const cols = new Set();
      paths.forEach(p => {
        cols.add(colOf(p));
        (docL.get(p) || []).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
      });
      cols.forEach(c => (colL.get(c) || []).forEach(fn => { try { fn(); } catch (e) { console.error(e); } }));
    }, 0);
  }

  async function fetchAll() {
    const all = new Map();
    const size = 1000;
    for (let from = 0; ; from += size) {
      const { data, error } = await sb.from(TABLE).select('path,data').order('path').range(from, from + size - 1);
      if (error) throw error;
      data.forEach(r => all.set(r.path, r.data));
      if (data.length < size) break;
    }
    return all;
  }
  async function resync() {
    try {
      const all = await fetchAll();
      cache.forEach((_, p) => { if (!all.has(p)) { cache.delete(p); notify(p); } });
      all.forEach((d, p) => { if (JSON.stringify(cache.get(p)) !== JSON.stringify(d)) { cache.set(p, d); notify(p); } });
    } catch (e) {}
  }
  function load() {
    if (loaded) return loaded;
    loaded = (async () => {
      const all = await fetchAll();
      all.forEach((d, p) => cache.set(p, d));
      let first = true;
      sb.channel('painel-docs')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, p => {
          if (p.eventType === 'DELETE') {
            const path = p.old && p.old.path;
            if (path && cache.has(path)) { cache.delete(path); notify(path); }
            return;
          }
          const r = p.new;
          if (!r || !r.path) return;
          if (JSON.stringify(cache.get(r.path)) === JSON.stringify(r.data)) return;
          cache.set(r.path, r.data); notify(r.path);
        })
        .subscribe(status => {
          if (status !== 'SUBSCRIBED') return;
          if (first) { first = false; return; }
          resync(); /* reconectou: busca o que mudou enquanto estava fora */
        });
      let hiddenAt = 0;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) hiddenAt = Date.now();
        else if (hiddenAt && Date.now() - hiddenAt > 60000) resync();
      });
    })();
    return loaded;
  }

  async function write(path, data) {
    const had = cache.has(path), prev = cache.get(path);
    if (data === null) cache.delete(path); else cache.set(path, clone(data));
    notify(path);
    try {
      const q = data === null
        ? sb.from(TABLE).delete().eq('path', path)
        : sb.from(TABLE).upsert({ path, col: colOf(path), data: clone(data), updated_at: new Date().toISOString() });
      const { error } = await q;
      if (error) throw error;
    } catch (e) {
      if (had) cache.set(path, prev); else cache.delete(path);
      notify(path);
      throw errOf(e);
    }
  }

  function docSnap(path) {
    const has = cache.has(path);
    return { id: idOf(path), exists: has, ref: docRef(path), data: () => (has ? clone(cache.get(path)) : undefined) };
  }
  function colSnap(col) {
    const docs = [];
    cache.forEach((_, p) => { if (colOf(p) === col) docs.push(docSnap(p)); });
    docs.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f) };
  }
  function listen(map, key, snap, cb, onErr) {
    const fn = () => cb(snap());
    let set = map.get(key); if (!set) map.set(key, set = new Set());
    let active = true;
    load().then(() => { if (!active) return; set.add(fn); fn(); }, e => { if (onErr) onErr(errOf(e)); });
    return () => { active = false; set.delete(fn); };
  }
  const autoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

  function docRef(path) {
    path = segs(path);
    return {
      id: idOf(path),
      path,
      collection: sub => colRef(path + '/' + segs(sub)),
      set: data => write(path, data || {}),
      update: patch => load().then(() => write(path, Object.assign({}, cache.get(path) || {}, clone(patch) || {}))),
      delete: () => write(path, null),
      get: () => load().then(() => docSnap(path)),
      onSnapshot: (cb, onErr) => listen(docL, path, () => docSnap(path), cb, onErr)
    };
  }
  function colRef(col) {
    col = segs(col);
    return {
      id: idOf(col),
      path: col,
      doc: id => docRef(col + '/' + (id ? segs(id) : autoId())),
      add: data => { const r = docRef(col + '/' + autoId()); return r.set(data).then(() => r); },
      get: () => load().then(() => colSnap(col)),
      onSnapshot: (cb, onErr) => listen(colL, col, () => colSnap(col), cb, onErr)
    };
  }
  const db = { collection: colRef, doc: docRef };

  /* ---------------- anexos (Supabase Storage) ---------------- */
  const safeName = n => String(n || 'arquivo').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\-]+/g, '_').slice(-80);
  const urlCache = new Map();
  async function signedUrl(id) {
    const c = urlCache.get(id);
    if (c && c.exp > Date.now()) return c.url;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(id, 3600);
    if (error) throw error;
    urlCache.set(id, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 });
    return data.signedUrl;
  }
  const assets = {
    async upload(file, opt) {
      if (file.size > 20 * 1024 * 1024) { const e = new Error('too large'); e.code = 'too_large'; throw e; }
      const id = (crypto.randomUUID ? crypto.randomUUID() : autoId()) + '-' + safeName(file.name);
      const type = (opt && opt.type) || file.type || 'application/octet-stream';
      const { error } = await sb.storage.from(BUCKET).upload(id, file, { contentType: type, upsert: false });
      if (error) throw errOf(error);
      return { id, sizeBytes: file.size, contentType: type };
    },
    async delete(id) {
      const { error } = await sb.storage.from(BUCKET).remove([id]);
      if (error) throw errOf(error);
    },
    url: signedUrl
  };

  /* links "/_blob/<id>" (como o claude.ai serve anexos) abrem pelo Storage */
  const blobId = href => { const i = String(href || '').indexOf('/_blob/'); if (i < 0) return null; try { return decodeURIComponent(href.slice(i + 7).split(/[?#]/)[0]); } catch (e) { return null; } };
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[href*="/_blob/"]');
    if (!a || !sb) return;
    const id = blobId(a.getAttribute('href'));
    if (!id) return;
    e.preventDefault(); e.stopPropagation();
    const w = window.open('', '_blank');
    signedUrl(id).then(u => { if (w) w.location.href = u; else location.href = u; }, () => { if (w) w.close(); alert('Não foi possível abrir o anexo.'); });
  }, true);
  /* miniaturas <img src="/_blob/..."> na página e dentro dos módulos */
  function fixImgs(root) {
    if (!sb || !root || !root.querySelectorAll) return;
    root.querySelectorAll('img[src*="/_blob/"]').forEach(img => {
      const id = blobId(img.getAttribute('src'));
      if (!id || img.dataset.sbx === id) return;
      img.dataset.sbx = id;
      signedUrl(id).then(u => { img.src = u; }, () => {});
    });
  }
  function watch(doc) {
    try {
      fixImgs(doc);
      new MutationObserver(() => {
        fixImgs(doc);
        doc.querySelectorAll('iframe').forEach(f => {
          if (f.dataset.sbxW) return;
          f.dataset.sbxW = '1';
          f.addEventListener('load', () => { try { watch(f.contentDocument); } catch (e) {} });
        });
      }).observe(doc.documentElement || doc, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.documentElement) watch(document);

  /* ---------------- downloads ---------------- */
  const downloads = {
    async save(o) {
      const data = o && o.data;
      const blob = data instanceof Blob ? data : new Blob([data == null ? '' : data], { type: (o && (o.mimeType || o.type)) || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (o && (o.filename || o.name)) || 'arquivo'; a.style.display = 'none';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      return true;
    }
  };

  /* ---------------- usuário ---------------- */
  function userNs(session) {
    return {
      id: async () => session.user.id,
      email: async () => session.user.email,
      profiles: async ids => {
        await load();
        const out = {};
        (ids || []).forEach(id => { const p = cache.get('perfis/' + id); out[id] = p ? { name: p.name } : null; });
        return out;
      }
    };
  }

  window.claude = {
    use: async name => {
      const session = await ready;
      if (!session) return null;
      if (name === 'db') { try { await load(); } catch (e) { console.error('Painel: falha ao carregar dados', e); return null; } return db; }
      if (name === 'assets') return assets;
      if (name === 'downloads') return downloads;
      if (name === 'user') return userNs(session);
      return null; /* mcp (Google Drive) e outros: indisponíveis fora do claude.ai */
    }
  };
})();
