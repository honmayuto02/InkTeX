"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Loader2 } from "lucide-react";

import { ErrorPopup } from "@/components/ErrorPopup";

export default function HostPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [clientUrl, setClientUrl] = useState<string>("");
    const [latexResult, setLatexResult] = useState<string>("");
    const [lastUpdated, setLastUpdated] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Initialize Session
    useEffect(() => {
        async function createSession() {
            try {
                const res = await fetch("/api/sync?action=create");
                const data = await res.json();
                setSessionId(data.sessionId);

                // Detect localhost and warn/suggest
                const host = window.location.hostname;
                let baseUrl = window.location.origin;

                if (host === "localhost" || host === "127.0.0.1") {
                    // Try to guess? We can't. Just default to localhost but show UI to change it.
                    // For now, set it, but we'll add an input to override it.
                }

                setClientUrl(`${baseUrl}/client/${data.sessionId}`);
                setLoading(false);
            } catch (e) {
                console.error("Failed to create session", e);
                setErrorMsg("セッションの作成に失敗しました。");
                setLoading(false);
            }
        }
        createSession();
    }, []);

    const updateHostIp = (newIp: string) => {
        if (!sessionId) return;
        const protocol = window.location.protocol;
        const port = window.location.port;
        const newOrigin = `${protocol}//${newIp}${port ? `:${port}` : ""}`;
        setClientUrl(`${newOrigin}/client/${sessionId}`);
    };

    // Poll for data
    useEffect(() => {
        if (!sessionId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/sync?sessionId=${sessionId}`);
                const data = await res.json();

                if (data && data.lastUpdated > lastUpdated) {
                    setLastUpdated(data.lastUpdated);
                    if (data.imageData) {
                        processImage(data.imageData);
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [sessionId, lastUpdated]);

    // Helper: Retry API Call
    const callGeminiWithRetry = async (formData: FormData, retries = 3, delay = 1000): Promise<any> => {
        const res = await fetch("/api/gemini", { method: "POST", body: formData });
        if (res.status === 429) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, delay));
                return callGeminiWithRetry(formData, retries - 1, delay * 2);
            }
            throw new Error("Rate limit exceeded");
        }
        return res; // Return Raw Response
    };

    const processImage = async (dataUrl: string) => {
        // Convert DataURL to Blob
        try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Call Gemini
            const formData = new FormData();
            formData.append("image", blob);

            const apiRes = await callGeminiWithRetry(formData);
            const apiData = await apiRes.json();

            if (apiData.latex) {
                setLatexResult(apiData.latex);
            } else if (apiData.error) {
                setErrorMsg(`変換エラー: ${apiData.error}`);
            }
        } catch (e: any) {
            console.error("Conversion error", e);
            if (e.message === "Rate limit exceeded") {
                setErrorMsg("AIサーバーが混雑しています。少し待機します...");
            } else {
                setErrorMsg("変換処理中にエラーが発生しました。");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-[#f9f9f9]">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#f9f9f9] p-8 space-y-8">
            <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

            <div className="absolute top-4 left-4 z-50">
                <a
                    href="/"
                    className="p-2 bg-white/80 hover:bg-white backdrop-blur shadow-sm border border-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 px-4"
                >
                    <span className="text-sm font-medium">← 戻る</span>
                </a>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">InkTeX ホスト (PC)</h1>
                <p className="text-slate-500">タブレット等でQRコードを読み取って接続してください。</p>
                <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg max-w-md mx-auto mt-2">
                    QRコードが「localhost」の場合は、接続できない可能性があります。<br />
                    PCのIPアドレス (例: 192.168.x.x) を入力して更新してください。
                    <input
                        type="text"
                        placeholder="例: 192.168.1.5"
                        className="mt-2 w-full px-3 py-1 border border-yellow-300 rounded bg-white text-slate-800"
                        onChange={(e) => updateHostIp(e.target.value || "localhost")}
                    />
                </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-100">
                {clientUrl && (
                    <QRCodeSVG value={clientUrl} size={200} level="H" />
                )}
            </div>

            <div className="text-sm text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded">
                Session ID: {sessionId}
            </div>

            {/* Result Display - Always visible if result exists */}
            {latexResult && (
                <div className="w-full max-w-2xl mt-8">
                    <ResultDisplay latex={latexResult} />
                </div>
            )}
        </main>
    );
}
