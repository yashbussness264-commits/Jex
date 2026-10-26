create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  type text not null check (type in ('website', 'app', 'content')),
  prompt text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_idx on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

create policy "Users read own projects"   on public.projects for select using (auth.uid() = user_id);
create policy "Users insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users delete own projects" on public.projects for delete using (auth.uid() = user_id);
