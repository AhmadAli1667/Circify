-- Run once in the Supabase project's SQL editor, alongside migration.sql.
-- Single-row heartbeat table. A daily Vercel Cron job (see src/routes/cron.js)
-- upserts this row so the project always has recent API activity, which keeps
-- Supabase's free-plan 7-day inactivity auto-pause from ever triggering.

create table keepalive (
  id int primary key default 1,
  pinged_at timestamptz not null default now(),
  constraint keepalive_single_row check (id = 1)
);

alter table keepalive enable row level security;
-- No policies: only the service-role client (which bypasses RLS) ever touches this table.
