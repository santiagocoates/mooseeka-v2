-- ============================================
-- MOOSEEKA V2 — DATABASE SCHEMA
-- ============================================

create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  name text not null,
  email text,
  avatar_url text,
  cover_url text,
  bio text,
  role text,
  location text,
  is_seller boolean default false,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), '[^a-z0-9]', '', 'g'))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- SELLER APPLICATIONS
-- ============================================
create table if not exists seller_applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null,
  genres text[] default '{}',
  why text not null,
  portfolio_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================
-- SERVICES
-- ============================================
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('service','digital_product')),
  title text not null,
  description text,
  category text,
  price numeric(10,2) not null,
  currency text default 'EUR',
  delivery_days int,
  revisions int default 2,
  includes text[] default '{}',
  cover_url text,
  audio_url text,
  is_active boolean default true,
  sales_count int default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ORDERS
-- ============================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references profiles(id) not null,
  seller_id uuid references profiles(id) not null,
  service_id uuid references services(id) not null,
  status text default 'pending' check (status in ('pending','in_progress','delivered','revision','completed','disputed','cancelled')),
  project_name text not null,
  notes text,
  deadline date,
  price numeric(10,2) not null,
  currency text default 'EUR',
  revisions_used int default 0,
  stripe_payment_intent text,
  escrow_released boolean default false,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- ============================================
-- POSTS
-- ============================================
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  type text default 'regular' check (type in ('work','service','product','course','achievement','regular')),
  content text not null,
  embed_type text check (embed_type in ('youtube','spotify','link')),
  embed_url text,
  embed_meta jsonb,
  service_id uuid references services(id),
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- FOLLOWS
-- ============================================
create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table seller_applications enable row level security;
alter table services enable row level security;
alter table orders enable row level security;
alter table posts enable row level security;
alter table follows enable row level security;

create policy "Profiles are public" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own applications" on seller_applications for select using (auth.uid() = user_id);
create policy "Users can submit applications" on seller_applications for insert with check (auth.uid() = user_id);
create policy "Admins can manage applications" on seller_applications for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "Services are public" on services for select using (is_active = true);
create policy "Sellers can manage own services" on services for all using (auth.uid() = seller_id);

create policy "Users can view own orders" on orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers can create orders" on orders for insert with check (auth.uid() = buyer_id);
create policy "Parties can update orders" on orders for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Posts are public" on posts for select using (true);
create policy "Users can manage own posts" on posts for all using (auth.uid() = author_id);

create policy "Follows are public" on follows for select using (true);
create policy "Users can manage own follows" on follows for all using (auth.uid() = follower_id);
