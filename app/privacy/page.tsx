"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Home</span>
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100">
                    <header className="mb-12 border-b border-slate-100 pb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">プライバシーポリシー</h1>
                        <p className="text-slate-500 text-sm">最終更新日: 2026年1月24日</p>
                    </header>

                    <div className="space-y-12">
                        <section>
                            <p className="text-slate-700 leading-relaxed mb-6">
                                <strong>InkTeX</strong>（以下、「当アプリ」）における、ユーザー個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」）を定めます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                                個人情報の収集・利用について
                            </h2>
                            <p className="text-slate-600 leading-loose text-justify">
                                当アプリは、手書き数式をLaTeXに変換する機能を提供するために、ユーザーがキャンバスに入力した画像データを一時的にサーバーへ送信し、Google Gemini APIを使用して解析を行います。
                                これらの画像データは解析処理が完了次第速やかに破棄され、当アプリのサーバー上に永続的に保存されることはありません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                                アクセス解析ツールについて
                            </h2>
                            <p className="text-slate-600 leading-loose text-justify mb-4">
                                当アプリでは、Googleによるアクセス解析ツール「<strong>Googleアナリティクス</strong>」を利用しています。
                                このGoogleアナリティクスはトラフィックデータの収集のためにCookie（クッキー）を使用しています。
                                このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                            </p>
                            <p className="text-slate-600 leading-loose text-justify">
                                この機能は、Cookieを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。
                                Googleアナリティクスの規約に関する詳細は<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="nofollow noopener noreferrer" className="text-blue-600 hover:underline">こちら</a>をご覧ください。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">3</span>
                                広告の配信について
                            </h2>
                            <p className="text-slate-600 leading-loose text-justify mb-4">
                                当アプリは、第三者配信の広告サービス「<strong>Google Adsense</strong>」を利用しています。
                                広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                                Googleアドセンスに関する詳細は<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="nofollow noopener noreferrer" className="text-blue-600 hover:underline">「Googleポリシーと規約 - 広告」</a>をご覧ください。
                            </p>
                            <p className="text-slate-600 leading-loose text-justify">
                                また、当アプリは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">4</span>
                                免責事項
                            </h2>
                            <p className="text-slate-600 leading-loose text-justify">
                                当アプリの変換精度は100%を保証するものではありません。生成されたLaTeXコードの利用によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                                また、当アプリからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">5</span>
                                お問い合わせ
                            </h2>
                            <p className="text-slate-600 leading-loose">
                                本ポリシーに関するお問い合わせは、<Link href="/contact" className="text-blue-600 hover:underline font-bold">お問い合わせフォーム</Link>よりお願いいたします。
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
