# Stripe Subscription Integration Guide

このガイドは、InkTeXプロジェクトにStripeサブスクリプション機能を実装するための詳細な手順書です。

## 1. 前提条件
- Stripeアカウント（開発者登録済み）
- Supabaseプロジェクト（作成済み）

## 2. 必要なパッケージのインストール
まず、Stripe関連のパッケージをインストールします。

```bash
npm install stripe @stripe/stripe-js
```

## 3. Stripeダッシュボードでの設定

### 3.1. APIキーの取得
Stripeダッシュボード > 開発者 > APIキー から以下を取得し、`.env.local` に追加します。

```env
# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (後ほど取得)
```

### 3.2. 商品（Product）の作成
Stripeダッシュボード > 商品カタログ > 商品を追加

1. **Pro Plan (Monthly)**
   - 名前: InkTeX Pro (Monthly)
   - 価格: ¥320 / 月
   - IDをコピー（例: `price_monthly_...`）

2. **Pro Plan (Yearly)**
   - 名前: InkTeX Pro (Yearly)
   - 価格: ¥2980 / 年
   - IDをコピー（例: `price_yearly_...`）

これらのIDを環境変数に追加します。

```env
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

## 4. Supabaseデータベースの更新
`profiles` テーブルにStripeとの連携用カラムを追加します。以下のSQLをSupabaseのSQLエディタで実行してください。

```sql
alter table public.profiles
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text;

-- インデックスの作成（検索高速化）
create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
```

## 5. 実装ステップ（コーディング）

これから以下のファイルを実装していく必要があります。

### 5.1. Stripe初期化 (`lib/stripe.ts`)
Stripeクライアントの初期化コードを作成します。

### 5.2. Checkout API (`app/api/stripe/checkout/route.ts`)
ユーザーが「アップグレード」を押したときに、Stripeの決済画面（Checkout Session）を作成するAPIです。
- ユーザーのログイン確認
- `stripe_customer_id` の確認（なければ作成して保存）
- Stripeセッションの作成とURLの返却

### 5.3. Webhook API (`app/api/webhooks/stripe/route.ts`)
Stripeでの決済完了や定期課金の更新・キャンセルを検知して、Supabaseのデータを更新するAPIです。
**重要**: このエンドポイントは `stripe listen` コマンドでローカルテストを行います。

- `checkout.session.completed`: サブスクリプション開始 -> `subscription_tier` を `pro` に更新
- `invoice.payment_succeeded`: 更新成功 -> 有効期限の延長など（今回はシンプルにTier維持）
- `customer.subscription.deleted`: 解約 -> `subscription_tier` を `free` に戻す

### 5.4. カスタマーポータル API (`app/api/stripe/portal/route.ts`)
Proユーザーがプランの解約やカード変更を行える「カスタマーポータル」へのリンクを作成するAPIです。

### 5.5. フロントエンドの統合 (`app/pricing/page.tsx`)
料金プラン画面のボタンから、上記のAPIを呼び出す処理を実装します。

---

## 6. ローカルでのWebhookテスト手順

開発中はローカル環境（`http://localhost:3000`）にStripeからの通知（Webhook）を届けるために、Stripe CLIを使用します。

1. **Stripe CLIのインストール** (Windows)
   ```powershell
   scoop install stripe
   # または公式サイトからダウンロード
   ```

2. **ログイン**
   ```powershell
   stripe login
   ```

3. **リッスン開始**
   ```powershell
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Webhook Secretの取得**
   コマンドを実行すると `whsec_...` で始まるシークレットが表示されます。これを `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定します。

---

## 次のアクション
このマニュアルの内容などをもとに、実装を進めていきますか？
承認いただければ、必要なファイルの作成を開始します。
