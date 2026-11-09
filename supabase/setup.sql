-- Painel · configuração do Supabase
-- Rode este arquivo inteiro uma única vez em: Supabase → SQL Editor → New query → Run.

-- 1) Tabela única onde ficam todos os registros do Painel
create table if not exists public.painel_docs (
  path       text primary key,              -- ex.: "tasks/t123", "abas/cronograma/linhas/cr001"
  col        text not null,                 -- coleção: tudo antes do último "/"
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists painel_docs_col_idx on public.painel_docs (col);

-- 2) Só quem fez login lê e grava (sem login, nada aparece)
alter table public.painel_docs enable row level security;
drop policy if exists "painel: usuarios logados" on public.painel_docs;
create policy "painel: usuarios logados" on public.painel_docs
  for all to authenticated using (true) with check (true);

-- 3) Atualização em tempo real entre quem está com o Painel aberto
alter table public.painel_docs replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.painel_docs;
exception when duplicate_object then null; end $$;

-- 4) Anexos: bucket privado "anexos", acessível só para quem fez login
insert into storage.buckets (id, name, public, file_size_limit)
values ('anexos', 'anexos', false, 20971520)
on conflict (id) do nothing;

drop policy if exists "painel anexos: ler"    on storage.objects;
drop policy if exists "painel anexos: enviar" on storage.objects;
drop policy if exists "painel anexos: apagar" on storage.objects;
create policy "painel anexos: ler"    on storage.objects for select to authenticated using (bucket_id = 'anexos');
create policy "painel anexos: enviar" on storage.objects for insert to authenticated with check (bucket_id = 'anexos');
create policy "painel anexos: apagar" on storage.objects for delete to authenticated using (bucket_id = 'anexos');
