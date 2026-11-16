/* Configuração do Supabase.
   Preencha com os dados do seu projeto (Supabase → Project Settings → API):
   - url: "Project URL", algo como https://abcdefgh.supabase.co
   - anonKey: a chave "anon" / "publishable" (é pública por natureza; a proteção vem do login + regras do banco).
   NUNCA coloque aqui a chave "service_role" / "secret". */
window.PAINEL_SUPABASE = {
  url: 'https://itkcvvovzjjepkeblffe.supabase.co',
  anonKey: 'sb_publishable_d5abNAgZSKY4BB-HOrJGUg_4Yu8mTN1'
};

/* Google Drive: URL do App da Web do Apps Script (apps-script/Painel-Drive.gs), publicado na
   conta da Denise. Termina em /exec. Vazio = Drive desligado (anexos vão para o Supabase). */
window.PAINEL_DRIVE_URL = '';
