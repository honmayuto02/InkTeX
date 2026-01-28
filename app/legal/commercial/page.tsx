"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CommercialPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 flex items-center px-4 md:px-8 bg-white sticky top-0 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-slate-600 hover:text-[#28426d] transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ホームに戻る</span>
                </Link>
            </header>

            <main className="max-w-3xl mx-auto py-12 px-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">商取引に関する開示(特定商取引法に基づく表記)</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <Section title="販売事業者名">
                        <p>本間 勇翔</p>
                    </Section>

                    <Section title="代表責任者">
                        <p>本間 勇翔</p>
                    </Section>

                    <Section title="所在地">
                        <p className="text-sm text-slate-500 mt-1">請求があった場合、遅滞なく開示いたします。</p>
                    </Section>

                    <Section title="お問い合わせ先">
                        <p>メールアドレス: inktex.official@gmail.com</p>
                        <p>または、サイト内のお問い合わせフォームよりご連絡ください。</p>
                        <p>電話番号: 請求があった場合、遅滞なく開示いたします。</p>
                    </Section>

                    <Section title="販売価格">
                        <p>各プランの案内ページに記載された価格に基づきます（表示価格は消費税を含みます）。</p>
                    </Section>

                    <Section title="商品代金以外の必要料金">
                        <p>インターネット接続料金、通信料金等はお客様の負担となります。</p>
                    </Section>

                    <Section title="お支払い方法">
                        <p>クレジットカード決済（Stripe）</p>
                    </Section>

                    <Section title="支払時期">
                        <p>各カード会社の引き落とし日となります。</p>
                    </Section>

                    <Section title="商品の引渡時期">
                        <p>決済完了後、直ちにご利用いただけます。</p>
                    </Section>

                    <Section title="返品・交換・キャンセルについて">
                        <p>デジタルコンテンツの性質上、決済後の返品・返金はお受けできません。</p>
                        <p>解約をご希望の場合は、アカウント設定よりいつでも次回更新の停止が可能です。</p>
                    </Section>

                    <Section title="動作環境">
                        <p>推奨ブラウザ: Google Chrome, Safari, Firefox, Edge の最新版</p>
                    </Section>
                </div>
            </main>

            <footer className="py-8 bg-slate-50 border-t border-slate-200 mt-12 text-center text-sm text-slate-500">
                &copy; 2026 InkTeX Project.
            </footer>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="border-b border-slate-100 pb-8 last:border-0">
            <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
            <div className="text-slate-600">
                {children}
            </div>
        </div>
    );
}
