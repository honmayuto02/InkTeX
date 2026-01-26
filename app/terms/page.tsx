"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Home</span>
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100">
                    <header className="mb-12 border-b border-slate-100 pb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">利用規約</h1>
                        <p className="text-slate-500 text-sm">最終更新日: 2026年1月26日</p>
                    </header>

                    <div className="space-y-12">
                        <section>
                            <p className="text-slate-700 leading-relaxed mb-6">
                                この利用規約（以下、「本規約」といいます。）は、InkTeX（以下、「当方」といいます。）が提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第1条（適用）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第2条（利用登録）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                登録希望者が当方の定める方法によって利用登録を申請し、当方がこれを承認することによって、利用登録が完了するものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第3条（有料プランおよび支払い）</h2>
                            <ul className="list-decimal list-outside ml-5 space-y-2 text-slate-600 leading-relaxed">
                                <li>
                                    <strong>料金プラン:</strong> 本サービスの一部の機能は、有料のサブスクリプションプラン（Proプラン）として提供されます。利用料金およびサービス内容は、別途サービス上で掲示する価格表に従います。
                                </li>
                                <li>
                                    <strong>支払い方法:</strong> ユーザーは、利用料金を当方が指定する決済手段（Stripe）により支払うものとします。
                                </li>
                                <li>
                                    <strong>自動更新:</strong> 有料プランは、期間終了の24時間前までに解約手続きが行われない限り、自動的に契約期間が更新され、課金されます。
                                </li>
                                <li>
                                    <strong>解約:</strong> ユーザーはいつでも設定画面から次回の更新をキャンセルすることができます。解約後も、既に支払われた期間が終了するまではPro機能を利用可能です。
                                </li>
                                <li>
                                    <strong>返金:</strong> サービスの性質上、既にお支払いいただいた利用料金の返金には原則として応じられません。
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第4条（禁止事項）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify mb-2">
                                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                            </p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-slate-600 leading-relaxed">
                                <li>法令または公序良俗に違反する行為</li>
                                <li>犯罪行為に関連する行為</li>
                                <li>当方のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                <li>本サービスの運営を妨害するおそれのある行為</li>
                                <li>他のユーザーに成りすます行為</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第5条（本サービスの提供の停止等）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                            </p>
                            <ul className="list-disc list-outside ml-5 space-y-1 text-slate-600 leading-relaxed mt-2">
                                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                                <li>その他、当方が本サービスの提供が困難と判断した場合</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第6条（免責事項）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                当方の債務不履行責任は、当方の故意または重過失によらない場合には免責されるものとします。
                                本サービスにて生成されたLaTeXコードの正確性については保証しておりません。ユーザーは自己の責任においてこれを利用するものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第7条（サービス内容の変更等）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                当方は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">第8条（準拠法・裁判管轄）</h2>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                本規約の解釈にあたっては、日本法を準拠法とします。
                                本サービスに関して紛争が生じた場合には、当方の所在地を管轄する裁判所を専属的合意管轄とします。
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
