-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro')),
  usage_count integer default 0,
  last_reset_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- 3. Create policies
-- Users can read their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile (only specific fields if needed, but for now we limit logic to server)
-- Actually, strict security: Only Server (Service Role) should update usage/tier.
-- But for simplicity, we allow reading.

-- 4. Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Test Query (Optional: Run this to verify table exists)
select * from public.profiles;
