create extension if not exists "pgcrypto";

create table if not exists public.conversations (
  id text primary key default gen_random_uuid()::text,
  title text not null default 'Untitled conversation',
  source_language text not null,
  target_language text not null,
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  transcript jsonb not null default '[]'::jsonb check (jsonb_typeof(transcript) = 'array'),
  translated_transcript jsonb not null default '[]'::jsonb check (jsonb_typeof(translated_transcript) = 'array'),
  intent text not null default 'Pending analysis',
  topics jsonb not null default '[]'::jsonb check (jsonb_typeof(topics) = 'array'),
  summary text not null default 'Summary not generated yet',
  key_points jsonb not null default '[]'::jsonb check (jsonb_typeof(key_points) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists conversations_created_at_idx on public.conversations (created_at desc);

alter table public.conversations enable row level security;

-- Demo policy for an app using SUPABASE_ANON_KEY. Replace with authenticated,
-- user-scoped policies before storing private or production conversations.
create policy "demo conversations readable" on public.conversations for select to anon using (true);
create policy "demo conversations insertable" on public.conversations for insert to anon with check (true);
create policy "demo conversations updatable" on public.conversations for update to anon using (true) with check (true);
create policy "demo conversations deletable" on public.conversations for delete to anon using (true);
