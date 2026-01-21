"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

import { ErrorPopup } from "@/components/ErrorPopup";

import { useLanguage } from "@/components/contexts/LanguageContext";

export default function HostPage() {
    const { t } = useLanguage();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [clientUrl, setClientUrl] = useState<string>("");

    // History State
    interface HistoryItem {
        id: string;
        latex: string;
        imageData: string;
        timestamp: number;
        isPinned: boolean;
    }
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const MAX_HISTORY = 10;

    const [lastUpdated, setLastUpdated] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // FIX: Add state for stable localhost detection
    const [isLocalhost, setIsLocalhost] = useState(false);

    // Initialize Session
    useEffect(() => {
        async function createSession() {
            try {
                const res = await fetch("/api/sync?action=create");
                const data = await res.json();
                setSessionId(data.sessionId);

                // Detect localhost
                const host = window.location.hostname;
                const isLocal = host === "localhost" || host === "127.0.0.1";
                setIsLocalhost(isLocal);

                // Initial URL setup
                let baseUrl = window.location.origin;
                setClientUrl(`${baseUrl}/client/${data.sessionId}`);
                setLoading(false);
            } catch (e) {
                console.error("Failed to create session", e);
                setErrorMsg(t("host.connect_error"));
                setLoading(false);
            }
        }
        createSession();
    }, []);

    const updateHostIp = (newIp: string) => {
        if (!sessionId) return;
        const protocol = window.location.protocol;
        const port = window.location.port;

        // If empty input, do nothing or handle gracefully
        if (!newIp) return;

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
        setProcessing(true);
        try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            const formData = new FormData();
            formData.append("image", blob);

            const apiRes = await callGeminiWithRetry(formData);
            const apiData = await apiRes.json();

            if (apiData.latex) {
                addToHistory(apiData.latex, dataUrl);
            } else if (apiData.error) {
                setErrorMsg(`Error: ${apiData.error}`);
            }
        } catch (e: any) {
            console.error("Conversion error", e);
            if (e.message === "Rate limit exceeded") {
                setErrorMsg(t("err.rate_limit_msg"));
            } else {
                setErrorMsg(t("err.unexpected"));
            }
        } finally {
            setProcessing(false);
        }
    };

    const addToHistory = (latex: string, imageData: string) => {
        setHistory(prev => {
            const newItem: HistoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                latex,
                imageData,
                timestamp: Date.now(),
                isPinned: false
            };

            let newHistory = [newItem, ...prev];

            // Limit check & Auto-remove unpinned
            if (newHistory.filter(i => !i.isPinned).length > MAX_HISTORY) {
                // Remove oldest unpinned
                // Find index of oldest unpinned
                for (let i = newHistory.length - 1; i >= 0; i--) {
                    if (!newHistory[i].isPinned) {
                        newHistory.splice(i, 1);
                        break;
                    }
                }
            }
            return newHistory;
        });
    };

    const togglePin = (id: string) => {
        setHistory(prev => prev.map(item =>
            item.id === id ? { ...item, isPinned: !item.isPinned } : item
        ));
    };

    const deleteItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    // Feedback Logic
    const handleFeedback = (item: HistoryItem, correctedText: string) => {
        try {
            const STORAGE_KEY = "inktext_calibration"; // Fixed key
            // Ideally we append or merge, but for now we follow the existing pattern
            const calibrationData = {
                image: item.imageData,
                label: correctedText
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(calibrationData));

            // Local update
            setHistory(prev => prev.map(i => i.id === item.id ? { ...i, latex: correctedText } : i));

            alert(t("msg.cal_saved") || "Saved");
        } catch (e) {
            console.error(e);
            alert("Failed to save");
        }
    };

    const [showQrPanel, setShowQrPanel] = useState(true);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-[#f9f9f9]">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <main className="flex min-h-screen bg-[#f9f9f9] overflow-hidden relative">
            <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

            {/* Left Panel: Connection Info */}
            <div
                className={`
                    border-r border-slate-200 bg-white p-8 flex flex-col items-center justify-center space-y-8 shadow-sm z-10 transition-all duration-300 ease-in-out
                    ${showQrPanel ? "w-1/3 min-w-[350px] opacity-100 translate-x-0" : "w-0 min-w-0 p-0 opacity-0 -translate-x-full overflow-hidden border-none"}
                `}
            >
                <div className="absolute top-4 left-4">
                    <a href="/" className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
                        <span className="text-sm">{t("host.back")}</span>
                    </a>
                </div>

                <div className="text-center space-y-2 min-w-[300px]">
                    <h1 className="text-2xl font-bold text-slate-900">{t("host.title")}</h1>
                    <p className="text-slate-500 text-sm">{t("host.scan_qr")}</p>
                </div>

                <div className="p-4 bg-white rounded-xl shadow border border-slate-100 min-w-[200px]">
                    {clientUrl && (
                        <QRCodeSVG value={clientUrl} size={180} level="H" />
                    )}
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-lg w-full max-w-xs text-left">
                    {/* Replaced logic: Use stable isLocalhost state instead of volatile clientUrl check */}
                    {isLocalhost ? (
                        <>
                            <p className="font-bold mb-2">{t("host.manual_ip_title")}</p>
                            <p className="mb-2">{t("host.manual_ip_prompt")}</p>
                            <input
                                type="text"
                                placeholder="例: 192.168.1.5"
                                className="w-full px-3 py-2 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                onChange={(e) => updateHostIp(e.target.value)}
                            />
                        </>
                    ) : (
                        <div className="text-center text-slate-500">
                            <p className="mb-2">{t("host.manual_wifi_msg")}</p>
                            <details>
                                <summary className="cursor-pointer hover:text-blue-600 underline">{t("host.manual_settings")}</summary>
                                <div className="mt-2">
                                    <p className="mb-1">PC IP:</p>
                                    <input
                                        type="text"
                                        placeholder="例: 192.168.1.5"
                                        className="w-full px-3 py-2 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                        onChange={(e) => updateHostIp(e.target.value)}
                                    />
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area (Right Panel) */}
            <div className={`flex-1 bg-slate-50/50 p-8 flex flex-col h-screen overflow-hidden transition-all duration-300`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Toggle Button */}
                        <button
                            onClick={() => setShowQrPanel(!showQrPanel)}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all shadow-sm"
                            title={showQrPanel ? t("host.panel_collapse") : t("host.panel_expand")}
                        >
                            {showQrPanel ? <Maximize2 size={18} className="rotate-90" /> : <Maximize2 size={18} className="-rotate-90" />} {/* Using icon to signify expand/collapse */}
                        </button>
                        <h2 className="text-xl font-bold text-slate-700">{t("host.history_title")}</h2>
                    </div>
                    {processing && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                            <Loader2 size={14} className="animate-spin" />
                            <span>{t("host.converting")}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center relative">
                                {!showQrPanel && (
                                    <div className="absolute -left-12 top-0 p-2 animate-bounce-horizontal">
                                        ←
                                    </div>
                                )}
                                <span className="text-2xl">📡</span>
                            </div>
                            <p>{t("host.waiting")}</p>
                            {!showQrPanel && (
                                <p className="text-xs text-slate-300">{t("host.waiting_hint")}</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                            {history.map((item) => (
                                <div key={item.id} className={`group bg-white rounded-xl shadow-sm border transition-all overflow-hidden ${item.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
                                    {/* Header: Time & Pin */}
                                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="text-[10px] text-slate-400 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </div>
                                        <button
                                            onClick={() => togglePin(item.id)}
                                            className={`p-1 rounded-md transition-colors ${item.isPinned ? 'text-blue-600 bg-blue-100' : 'text-slate-300 hover:text-blue-600 hover:bg-slate-100'}`}
                                            title={item.isPinned ? t("host.unpin_tooltip") : t("host.pin_tooltip")}
                                        >
                                            📌
                                        </button>
                                    </div>

                                    {/* Latex Result - Full Mode for Feedback */}
                                    <ResultDisplay
                                        latex={item.latex}
                                        variant="inline"
                                        compact={false}
                                        onClose={() => deleteItem(item.id)}
                                        onFeedback={(text) => handleFeedback(item, text)}
                                        className="border-none shadow-none rounded-none bg-transparent"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
