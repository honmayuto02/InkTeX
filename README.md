# InkTeX

![InkTeX Banner](public/globe.svg) *Note: Replace with actual screenshot if available*

InkTeX is an AI-powered handwriting-to-LaTeX converter built with Next.js and Google Gemini API. It features real-time device synchronization, allowing you to use your smartphone or tablet as an input device for your PC.

## Features

- **AI-Powered Conversion**: Converts handwritten math formulas to LaTeX using Google's Gemini models (Default: `gemini-2.0-flash`).
- **Device Sync Mode**:
  - **Host (PC)**: Generates a QR code to create a session.
  - **Client (Mobile/Tablet)**: Scans the QR code to use the device as a drawing pad.
  - **Real-time Updates**: Strokes drawn on the client appear instantly on the host (visual only) and are sent for processing upon request.
- **Calibration & Feedback Loop**:
  - **Calibration**: Practice specific symbols to train the AI on your handwriting style (One-shot learning via prompt context).
  - **Feedback**: Correct AI errors directly in the UI to improve future accuracy for similar inputs.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inktex.git
   cd inktex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and add your API key.
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Technologies

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Gemini API (`gemini-2.0-flash`, `gemini-1.5-flash`)
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX

---

# InkTeX (日本語)

InkTeXは、Next.jsとGoogle Gemini APIを使用した、AI搭載の手書き数式 to LaTeX変換ツールです。
デバイス連携機能を備えており、スマホやタブレットをPCのペンタブレット代わりに使用することができます。

## 主な機能

- **AIによる高精度変換**: 手書きの数式をGoogle Geminiモデル（デフォルト: `gemini-2.0-flash`）を使用してLaTeX形式に変換します。
- **デバイス連携モード (Device Sync)**:
  - **ホスト (PC)**: QRコードを表示してセッションを作成します。
  - **クライアント (スマホ/タブレット)**: QRコードを読み取ることで、手元の端末を入力デバイスとして使用できます。
  - **リアルタイム連携**: クライアントで描いた線がホスト側に送信され、変換を実行できます。
- **キャリブレーション & フィードバックループ**:
  - **キャリブレーション**: 自分の筆跡（特定の記号や数式）を登録することで、AIの認識精度を向上させます（プロンプトコンテキストによるワンショット学習）。
  - **フィードバック機能**: 変換結果が間違っていた場合、その場で正しいLaTeXを入力して修正・保存することで、次回の認識精度を改善します。
- **レスポンシブデザイン**: Tailwind CSSによるモダンで使いやすいUI。

## 始め方

### 必須環境

- Node.js 18以上
- Google Gemini APIキー

### インストール手順

1. リポジトリをクローンします:
   ```bash
   git clone https://github.com/yourusername/inktex.git
   cd inktex
   ```

2. 依存パッケージをインストールします:
   ```bash
   npm install
   ```

3. 環境変数を設定します:
   `.env.local.example` をコピーして `.env.local` を作成し、APIキーを設定します。
   ```bash
   cp .env.local.example .env.local
   ```
   `.env.local` を編集:
   ```env
   GEMINI_API_KEY=あなたのAPIキー
   ```

4. 開発サーバーを起動します:
   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使用技術

- **フレームワーク**: Next.js 15 (App Router)
- **AI**: Google Gemini API (`gemini-2.0-flash`, `gemini-1.5-flash`)
- **スタイリング**: Tailwind CSS
- **数式レンダリング**: KaTeX
