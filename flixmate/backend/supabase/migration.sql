-- Run once in the Supabase project's SQL editor.
-- Users themselves live in Supabase's built-in auth.users, not here.

create table watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  added_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

create table ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  value integer not null,
  primary key (user_id, movie_id)
);

create table chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  text text not null,
  picks jsonb,
  created_at timestamptz not null default now()
);

-- Shared TMDb keyword cache, not user data, no RLS write policy for it below.
create table movie_keywords (
  movie_id integer primary key,
  keywords jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table watchlist enable row level security;
alter table ratings enable row level security;
alter table chat_messages enable row level security;
alter table movie_keywords enable row level security;

create policy "own rows" on watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on ratings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public read" on movie_keywords for select using (true);
