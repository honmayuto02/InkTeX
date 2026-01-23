"use client";

import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X } from "lucide-react";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 1. Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // 2. Check if already standalone (PWA mode)
        const isInStandaloneMode =
            (window.navigator as any).standalone === true ||
            window.matchMedia('(display-mode: standalone)').matches;

        setIsStandalone(isInStandaloneMode);

        // Show if iOS and NOT standalone
        if (ios && !isInStandaloneMode) {
            // Delay slightly to not annoy immediately? Or show immediately?
            // Let's show immediately but allow dismiss.
            // Check session storage to avoid showing again in same session if dismissed?
            const dismissed = sessionStorage.getItem("inktex_install_prompt_dismissed");
            if (!dismissed) {
                setIsVisible(true);
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("inktex_install_prompt_dismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-4 pr-6">
                    <div className="bg-blue-500/20 p-2 rounded-lg shrink-0">
                        <Share size={24} className="text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-sm">全画面表示で快適に</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            アドレスバーを消して広く使うには、<br />
                            <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600">
                                <Share size={10} /> 共有
                            </span>
                            をタップして
                            <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 mx-1">
                                <PlusSquare size={10} /> ホーム画面に追加
                            </span>
                            を選択してください。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
