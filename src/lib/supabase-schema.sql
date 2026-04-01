-- =============================================
-- CuisineFacile - Lot 2 - Schéma Supabase
-- =============================================

-- Extension pour les UUIDs
create extension if not exists "pgcrypto";

-- =============================================
-- TABLE: foyers
-- =============================================
create table if not exists foyers (
  id uuid primary key default gen_random_uuid(),
  nom text not null default 'Notre Foyer',
  temps_defaut_midi integer not null default 30,
  temps_defaut_soir integer not null default 60,
  code_invitation text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Migration : ajouter created_by si la table existe déjà
-- alter table foyers add column if not exists created_by uuid references auth.users(id) on delete set null;

-- =============================================
-- TABLE: profiles (extension de auth.users)
-- =============================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text,
  email text,
  foyer_id uuid references foyers(id),
  created_at timestamptz default now()
);

-- Trigger pour créer le profil auto à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, nom)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- TABLE: recettes
-- =============================================
create table if not exists recettes (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid references foyers(id) on delete cascade,
  nom text not null,
  categorie text not null default 'Autre',
  prep_time integer not null default 10,
  cook_time integer not null default 20,
  instructions text default '',
  portions_defaut integer not null default 2,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- TABLE: ingredients (dans les recettes)
-- =============================================
create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  recette_id uuid references recettes(id) on delete cascade,
  nom text not null,
  quantite numeric not null default 1,
  unite text not null default 'pièce',
  rayon text not null default 'Épicerie salée',
  ordre integer default 0
);

-- =============================================
-- TABLE: planification
-- =============================================
create table if not exists planification (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid references foyers(id) on delete cascade,
  date date not null,
  repas_type text not null check (repas_type in ('midi', 'soir')),
  recette_id uuid references recettes(id) on delete set null,
  is_reste boolean not null default false,
  created_at timestamptz default now(),
  unique (foyer_id, date, repas_type)
);

-- =============================================
-- TABLE: liste_courses
-- =============================================
create table if not exists liste_courses (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid references foyers(id) on delete cascade,
  ingredient_nom text not null,
  quantite numeric not null default 1,
  unite text not null default 'pièce',
  rayon text not null default 'Épicerie salée',
  coche boolean not null default false,
  created_at timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table foyers enable row level security;
alter table profiles enable row level security;
alter table recettes enable row level security;
alter table ingredients enable row level security;
alter table planification enable row level security;
alter table liste_courses enable row level security;

-- Profiles : lecture/écriture sur son propre profil
create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

-- Fonction helper pour éviter la récursion RLS (security definer = bypass RLS)
create or replace function get_my_foyer_id()
returns uuid language sql security definer stable as $$
  select foyer_id from profiles where id = auth.uid();
$$;

-- Profiles : lecture des membres du même foyer (select uniquement)
create policy "profiles_foyer_members" on profiles
  for select using (
    foyer_id is not null and foyer_id = get_my_foyer_id()
  );

-- Migration : si les politiques existent déjà
-- drop policy if exists "profiles_foyer_members" on profiles;
-- drop function if exists get_my_foyer_id();

-- Foyers : membres du foyer uniquement (ou créateur)
create policy "foyers_member" on foyers
  for all using (
    id in (select foyer_id from profiles where id = auth.uid())
    or created_by = auth.uid()
  );

-- Recettes : membres du même foyer
create policy "recettes_foyer" on recettes
  for all using (
    foyer_id in (select foyer_id from profiles where id = auth.uid())
  );

-- Ingredients : via recette du foyer
create policy "ingredients_foyer" on ingredients
  for all using (
    recette_id in (
      select r.id from recettes r
      join profiles p on p.foyer_id = r.foyer_id
      where p.id = auth.uid()
    )
  );

-- Planification : membres du même foyer
create policy "planification_foyer" on planification
  for all using (
    foyer_id in (select foyer_id from profiles where id = auth.uid())
  );

-- Liste courses : membres du même foyer
create policy "courses_foyer" on liste_courses
  for all using (
    foyer_id in (select foyer_id from profiles where id = auth.uid())
  );

-- =============================================
-- FONCTIONS RPC
-- =============================================

-- Supprime un foyer et détache tous ses membres (Security Definer = bypass RLS)
create or replace function delete_foyer(p_foyer_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Vérifier que l'appelant est bien membre de ce foyer
  if not exists (
    select 1 from profiles where id = auth.uid() and foyer_id = p_foyer_id
  ) then
    raise exception 'Non autorisé : vous n''êtes pas membre de ce foyer';
  end if;

  -- Détacher tous les membres
  update profiles set foyer_id = null where foyer_id = p_foyer_id;

  -- Supprimer le foyer (cascade sur recettes, planification, liste_courses)
  delete from foyers where id = p_foyer_id;
end;
$$;

-- =============================================
-- REALTIME
-- =============================================
alter publication supabase_realtime add table planification;
alter publication supabase_realtime add table liste_courses;
alter publication supabase_realtime add table recettes;
