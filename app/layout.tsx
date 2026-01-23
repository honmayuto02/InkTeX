import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkTeX - 手書き数式をAIで即座にLaTeX変換",
  description: "タブレットやマウスで手書きした数式を、Google Gemini AIが高精度でLaTeXコードに変換します。Overleafなどの論文執筆を効率化。インストール不要、ブラウザですぐに使えます。",
  keywords: ["TeX", "LaTeX", "手書き", "数学", "数式変換", "AI", "読み取り", "変換", "テフ", "Overleaf", "InkTeX", "inktex", "無料"],
  openGraph: {
    title: "InkTeX - 手書き数式をAIで即座にLaTeX変換",
    description: "タブレットやマウスで手書きした数式を、Google Gemini AIが高精度でLaTeXコードに変換します。",
    type: "website",
  },
  verification: {
    google: "PnqJIKgrLjaJWdQwMmXU0SRG-fJMWfDUafzW5DxwgBs",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InkTeX",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

import { LanguageProvider } from "@/components/contexts/LanguageContext";

import { HeartbeatManager } from "@/components/HeartbeatManager";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" translate="no" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <HeartbeatManager />
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
