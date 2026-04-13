-- ============================================================
-- MOOSEEKA V2 - Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  username text unique,
  avatar_url text,
  cover_url text,
  roles text[] default '{}',   -- e.g. ['artist', 'producer']
  bio text,
  location text,
  website text,
  followers_count int default 0,
  following_count int default 0,
  services_count int default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, roles)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data->'roles' is not null
      then array(select jsonb_array_elements_text(new.raw_user_meta_data->'roles'))
      else '{}'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FOLLOWS
-- ============================================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- ============================================================
-- POSTS
-- ============================================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('work', 'service', 'achievement', 'product', 'course')),
  content text not null,
  media_url text,
  metadata jsonb default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now()
);

-- Post likes
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Post comments
create table public.post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- SERVICES
-- ============================================================
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null check (category in (
    'production', 'mixing', 'mastering', 'composition',
    'design', 'marketing', 'legal', 'vocal', 'other'
  )),
  cover_url text,
  pricing jsonb default '{}',  -- { basic: {...}, standard: {...}, premium: {...} }
  tags text[] default '{}',
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  sales_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Service reviews
create table public.service_reviews (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(service_id, reviewer_id)
);

-- ============================================================
-- ORDERS (Marketplace)
-- ============================================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) not null,
  buyer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  plan text not null check (plan in ('basic', 'standard', 'premium')),
  price decimal(10,2) not null,
  status text default 'pending' check (status in ('pending', 'in_progress', 'delivered', 'completed', 'disputed', 'cancelled')),
  stripe_payment_intent_id text,
  requirements text,
  delivery_url text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.services enable row level security;
alter table public.service_reviews enable row level security;
alter table public.orders enable row level security;
alter table public.follows enable row level security;

-- Profiles: public read, own write
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Posts: public read, own write
create policy "Posts are public" on public.posts for select using (true);
create policy "Users can create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Post likes
create policy "Likes are public" on public.post_likes for select using (true);
create policy "Users can like posts" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike posts" on public.post_likes for delete using (auth.uid() = user_id);

-- Services: public read, own write
create policy "Services are public" on public.services for select using (true);
create policy "Users can create services" on public.services for insert with check (auth.uid() = user_id);
create policy "Users can update own services" on public.services for update using (auth.uid() = user_id);

-- Orders: parties only
create policy "Buyers can see their orders" on public.orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers can create orders" on public.orders for insert with check (auth.uid() = buyer_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index services_user_id_idx on public.services(user_id);
create index services_category_idx on public.services(category);
create index services_rating_idx on public.services(rating desc);
create index orders_buyer_id_idx on public.orders(buyer_id);
create index orders_seller_id_idx on public.orders(seller_id);
