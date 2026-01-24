"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(true);

    // Placeholder URL - User should update this
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdkJnbelRZRHUR8i_nUekvUGK8VvQf8OR2RyL1W-Am9hy9V9w/viewform?embedded=true";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-12 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Home</span>
                </Link>

                <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-100">
                    <header className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">お問い合わせ</h1>
                        <p className="text-slate-500 text-sm mb-6">ご意見・ご要望・バグ報告などは以下のフォームよりお願いします。</p>
                        <div className="w-16 h-1 bg-blue-500 rounded-full mx-auto opacity-20"></div>
                    </header>

                    <div className="relative w-full min-h-[600px] flex justify-center">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-0 h-[400px]">
                                <Loader2 size={32} className="animate-spin text-blue-500" />
                                <p className="text-sm font-medium">Loading Form...</p>
                            </div>
                        )}

                        <iframe
                            src={GOOGLE_FORM_URL}
                            width="100%"
                            height="1200"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            className="relative z-10 w-full"
                            style={{ border: "none", overflow: "hidden" }}
                            onLoad={() => setIsLoading(false)}
                            title="Contact Form"
                        >
                            読み込んでいます…
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}
