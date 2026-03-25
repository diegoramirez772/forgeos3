-- ============================================================
-- ForgeOS Sentinel — SQL Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- Tabla para guardar consultas del Sentinel
create table if not exists sentinel_queries (
  id           uuid primary key default uuid_generate_v4(),
  query        text        not null,
  domain       text        not null default 'agrotech',
  summary      text        not null default '',
  risk_level   text        not null default 'Bajo',
  raw_response text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_sentinel_queries_created on sentinel_queries(created_at desc);
create index if not exists idx_sentinel_queries_domain  on sentinel_queries(domain);

alter table sentinel_queries enable row level security;
create policy "service_all" on sentinel_queries for all using (true) with check (true);

-- Verificar
select 'sentinel_queries table ready' as status, count(*) as rows from sentinel_queries;
