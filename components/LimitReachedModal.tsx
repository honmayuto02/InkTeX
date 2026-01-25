"use client";

import React from "react";
import { X, Zap, Crown } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { useRouter } from "next/navigation";

interface LimitReachedModalProps {
    onClose: () => void;
}

export function LimitReachedModal({ onClose }: LimitReachedModalProps) {
    const { t } = useLanguage();
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Header Graphic */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rotate-12 bg-[radial-gradient(circle,_#ffffff_0%,_transparent_60%)]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-4 shadow-inner ring-4 ring-white/10 animate-bounce">
                            <Zap size={32} className="text-yellow-300 fill-yellow-300 drop-shadow-md" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                            {t("limit.title") || "Free Limit Reached"}
                        </h2>
                        <p className="text-white/90 text-sm font-bold max-w-[280px] mx-auto bg-white/10 py-1 px-3 rounded-full border border-white/10">
                            {t("limit.subtitle") || "Upgrade required to continue."}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <Crown size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm mb-1">{t("limit.pro_title") || "Upgrade to Pro"}</h4>
                                <p className="text-xs text-indigo-700 leading-relaxed">
                                    {t("limit.pro_desc") || "Get unlimited conversions, faster processing, and priority support."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onClose();
                            router.push("/pricing");
                        }}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>{t("btn.upgrade") || "Upgrade Now"}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
                    >
                        {t("settings.close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
