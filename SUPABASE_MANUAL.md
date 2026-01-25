# Supabase データベース設定マニュアル

InkTeXのユーザー管理機能を有効にするために、以下の手順でデータベースを設定してください。
所要時間は約3分です。

## 手順 1: SQLエディタを開く

1.  [Supabaseのダッシュボード](https://supabase.com/dashboard) にログインし、InkTeXのプロジェクトを開きます。
2.  左側のサイドバーから **「SQL Editor」** アイコン（紙とペンのようなアイコン）をクリックします。
3.  左上の **「+ New query」** をクリックして、新しいクエリ作成画面を開きます。

## 手順 2: コードを貼り付けて実行する

以下のSQLコードをすべてコピーし、エディタに貼り付けてください。

```sql
-- 1. profilesテーブルの作成（ユーザー情報を保存）
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro')),
  usage_count integer default 0,
  last_reset_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. セキュリティ設定（RLS）の有効化
alter table public.profiles enable row level security;

-- 3. ポリシー作成（自分のデータだけ見れるようにする）
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- 4. 自動作成関数の定義
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 5. トリガーの設定（ログイン時に自動実行）
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

貼り付けたら、右下の **「Run」** ボタン（または `Ctrl + Enter` / `Cmd + Enter`）をクリックして実行します。
画面下に「Success」と表示されれば完了です。

## 手順 3: 確認（オプション）

1.  左サイドバーの **「Table Editor」** アイコン（表のアイコン）をクリックします。
2.  `profiles` というテーブルが新しく作られていることを確認してください。
3.  まだ誰もログインしていない場合、このテーブルは空ですが、Googleログインを行うと自動的に行が追加されるようになります。

---

この設定が完了したら、教えてください。次のステップ（アプリ側での制限機能の実装）に進みます。
