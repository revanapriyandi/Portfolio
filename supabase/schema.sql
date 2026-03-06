-- =====================================================
-- Portfolio CMS — Supabase SQL Schema (v2)
-- Jalankan di: Supabase Dashboard → SQL Editor
-- =====================================================

-- ─── Extensions ──────────────────────────────────────
create extension if not exists "uuid-ossp";

-- =====================================================
-- HAPUS TABEL LAMA (jika ada)
-- =====================================================
drop table if exists portfolio_certifications cascade;
drop table if exists portfolio_education cascade;
drop table if exists portfolio_experience cascade;
drop table if exists portfolio_skills cascade;
drop table if exists portfolio_projects cascade;
drop table if exists portfolio_personal cascade;
drop table if exists portfolio_pages cascade;
drop table if exists portfolio_settings cascade;
drop table if exists portfolio_system_settings cascade;
drop table if exists portfolio_templates cascade;
drop table if exists portfolio_services cascade;
drop table if exists portfolio_testimonials cascade;

-- =====================================================
-- 1. PERSONAL INFO (single row)
-- =====================================================
create table portfolio_personal (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  role            text,
  roles           text[],
  bio             text,
  bio_short       text,
  location        text,
  email           text,
  phone           text,
  website         text,
  -- Social Media
  github          text,
  linkedin        text,
  twitter         text,
  instagram       text,
  youtube         text,
  tiktok          text,
  -- Professional
  avatar          text,
  resume_url      text,
  fastwork_username text,
  open_to_work    boolean default true,
  availability_text text default 'Available for freelance projects',
  -- Stats
  years_of_exp    int default 0,
  projects_completed int default 0,
  updated_at      timestamptz default now()
);

-- =====================================================
-- 2. PROJECTS
-- =====================================================
create table portfolio_projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  tags        text[],
  category    text default 'General',
  image_url   text,
  demo_video  text,
  github      text,
  live        text,
  featured    boolean default false,
  status      text default 'published' check (status in ('published', 'draft')),
  start_date  date,
  end_date    date,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================================================
-- 3. SKILLS
-- =====================================================
create table portfolio_skills (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  items       text[],
  item_icons  jsonb default '{}',
  sort_order  int default 0,
  updated_at  timestamptz default now()
);

-- =====================================================
-- 4. WORK EXPERIENCE
-- =====================================================
create table portfolio_experience (
  id          uuid primary key default gen_random_uuid(),
  role        text,
  company     text,
  type        text default 'Full-time',
  location    text,
  website     text,
  logo_url    text,
  start_date  date,
  end_date    date,
  current     boolean default false,
  description text,
  tech_stack  text[],
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================================================
-- 5. EDUCATION
-- =====================================================
create table portfolio_education (
  id              uuid primary key default gen_random_uuid(),
  degree          text,
  field_of_study  text,
  institution     text,
  logo_url        text,
  start_date      date,
  end_date        date,
  current         boolean default false,
  gpa             text,
  activities      text,
  description     text,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =====================================================
-- 6. CERTIFICATIONS
-- =====================================================
create table portfolio_certifications (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  issuer      text,
  issued_date date,
  expire_date date,
  credential_url text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- =====================================================
-- 7. SERVICES (freelance services)
-- =====================================================
create table portfolio_services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text,
  price_from  text,
  price_to    text,
  currency    text default 'IDR',
  features    text[],
  is_featured boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- =====================================================
-- 8. TESTIMONIALS
-- =====================================================
create table portfolio_testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  company     text,
  avatar      text,
  content     text not null,
  rating      int default 5 check (rating between 1 and 5),
  platform    text default 'Direct',
  is_featured boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- =====================================================
-- 9. PAGES (multi-page support)
-- =====================================================
create table portfolio_pages (
  slug        text primary key,
  title       text not null default 'Untitled Page',
  description text,
  data        jsonb not null default '{"content":[],"root":{"props":{"bgColor":"#000000","accentColor":"#6366f1","customCss":""}}}'::jsonb,
  status      text default 'published' check (status in ('published', 'draft')),
  show_in_nav boolean default true,
  nav_order   int default 0,
  og_image    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Seed: halaman home default
insert into portfolio_pages (slug, title, nav_order, data)
values (
  'home',
  'Home',
  0,
  '{"content":[],"root":{"props":{"bgColor":"#000000","accentColor":"#6366f1","customCss":""}}}'::jsonb
)
on conflict (slug) do nothing;

-- =====================================================
-- 10. SYSTEM SETTINGS (menggantikan .env)
-- =====================================================
create table portfolio_system_settings (
  id                          uuid primary key default gen_random_uuid(),
  -- Site
  site_title                  text default 'My Portfolio',
  site_description            text default 'Personal portfolio & blog',
  site_url                    text,
  og_image                    text,
  -- Template
  active_template             text default 'puck',
  -- GitHub Integration
  github_username             text,
  github_token                text,
  -- Google Analytics
  ga_measurement_id           text,
  ga4_property_id             text,
  ga_credentials_json         text,
  -- Appearance
  theme                       jsonb default '{"accent":"#6366f1","bg":"#000000","fontMono":false,"roundness":"md"}'::jsonb,
  -- Section order (untuk template minimal)
  section_order               text[] default array['hero','about','skills','projects','experience','contact'],
  visible_sections            text[] default array['hero','about','skills','projects','experience','contact'],
  -- Timestamps
  updated_at                  timestamptz default now()
);

-- Seed: row settings default
insert into portfolio_system_settings (site_title)
values ('My Portfolio')
on conflict do nothing;

-- =====================================================
-- 11. TEMPLATES (plugin system)
-- =====================================================
create table portfolio_templates (
  id            text primary key,
  name          text not null,
  description   text,
  author        text default 'Built-in',
  version       text default '1.0.0',
  preview_image text,
  is_active     boolean default false,
  is_builtin    boolean default true,
  config        jsonb default '{}',
  created_at    timestamptz default now()
);

-- Seed: template bawaan
insert into portfolio_templates (id, name, description, author, preview_image, is_active) values
  ('puck',    'Puck Builder',   'Visual drag-and-drop page builder. Full freedom to design any layout.',                   'Built-in', null, true),
  ('minimal', 'Minimal',        'Clean, minimal dark portfolio with sections: Hero, About, Skills, Projects, Experience.', 'Built-in', null, false),
  ('bento',   'Bento Grid',     'Modern bento-style grid layout inspired by macOS and Vercel design.',                    'Built-in', null, false)
on conflict (id) do nothing;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table portfolio_personal enable row level security;
alter table portfolio_projects enable row level security;
alter table portfolio_skills enable row level security;
alter table portfolio_experience enable row level security;
alter table portfolio_education enable row level security;
alter table portfolio_certifications enable row level security;
alter table portfolio_services enable row level security;
alter table portfolio_testimonials enable row level security;
alter table portfolio_pages enable row level security;
alter table portfolio_system_settings enable row level security;
alter table portfolio_templates enable row level security;

-- ─── Public READ policies ─────────────────────────────
create policy "public read personal"        on portfolio_personal        for select using (true);
create policy "public read projects"        on portfolio_projects        for select using (true);
create policy "public read skills"          on portfolio_skills          for select using (true);
create policy "public read experience"      on portfolio_experience      for select using (true);
create policy "public read education"       on portfolio_education       for select using (true);
create policy "public read certifications"  on portfolio_certifications  for select using (true);
create policy "public read services"        on portfolio_services        for select using (true);
create policy "public read testimonials"    on portfolio_testimonials    for select using (true);
create policy "public read pages"           on portfolio_pages           for select using (true);
create policy "public read settings"        on portfolio_system_settings for select using (true);
create policy "public read templates"       on portfolio_templates       for select using (true);

-- ─── Authenticated WRITE policies ────────────────────
create policy "auth write personal"        on portfolio_personal        for all using (auth.role() = 'authenticated');
create policy "auth write projects"        on portfolio_projects        for all using (auth.role() = 'authenticated');
create policy "auth write skills"          on portfolio_skills          for all using (auth.role() = 'authenticated');
create policy "auth write experience"      on portfolio_experience      for all using (auth.role() = 'authenticated');
create policy "auth write education"       on portfolio_education       for all using (auth.role() = 'authenticated');
create policy "auth write certifications"  on portfolio_certifications  for all using (auth.role() = 'authenticated');
create policy "auth write services"        on portfolio_services        for all using (auth.role() = 'authenticated');
create policy "auth write testimonials"    on portfolio_testimonials    for all using (auth.role() = 'authenticated');
create policy "auth write pages"           on portfolio_pages           for all using (auth.role() = 'authenticated');
create policy "auth write settings"        on portfolio_system_settings for all using (auth.role() = 'authenticated');
create policy "auth write templates"       on portfolio_templates       for all using (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Public read storage
create policy "public read images" on storage.objects
  for select using (bucket_id = 'portfolio');

-- Authenticated upload
create policy "auth upload images" on storage.objects
  for insert with check (bucket_id = 'portfolio' and auth.role() = 'authenticated');

-- Authenticated update
create policy "auth update images" on storage.objects
  for update using (bucket_id = 'portfolio' and auth.role() = 'authenticated');

-- Authenticated delete
create policy "auth delete images" on storage.objects
  for delete using (bucket_id = 'portfolio' and auth.role() = 'authenticated');
