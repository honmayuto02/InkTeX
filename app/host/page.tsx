"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Loader2, Maximize2, Minimize2, Settings, Smartphone, ArrowLeft } from "lucide-react";
import { SettingsModal } from "@/components/SettingsModal";
import { UserMenu } from "@/components/UserMenu";
import { LimitReachedModal } from "@/components/LimitReachedModal";

import { ErrorPopup } from "@/components/ErrorPopup";
import { Toast } from "@/components/Toast";

import { useLanguage } from "@/components/contexts/LanguageContext";
import { Tooltip } from "@/components/Tooltip";
import { supabase } from "@/lib/supabase";

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
        usageInfo?: {
            label: string;
            remaining: number;
        };
    }
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const MAX_HISTORY = 20;

    const [lastUpdated, setLastUpdated] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // FIX: Add state for stable localhost detection
    const [isLocalhost, setIsLocalhost] = useState(false);

    // Resume State
    const [lastSessionId, setLastSessionId] = useState<string | null>(null);
    const [manualId, setManualId] = useState("");
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [autoCopy, setAutoCopy] = useState(false);
    const [showToast, setShowToast] = useState<string | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);

    // Sync AutoCopy with LocalStorage & Server
    const updateAutoCopy = async (val: boolean, pushToServer = true) => {
        setAutoCopy(val);
        if (typeof window !== 'undefined') {
            localStorage.setItem("inktex_autocopy", String(val));
        }

        if (pushToServer && sessionId) {
            try {
                await fetch(`/api/sync?action=update_settings&sessionId=${sessionId}`, {
                    method: "POST",
                    body: JSON.stringify({ settings: { autoCopy: val } })
                });
            } catch (e) {
                console.error("Failed to sync settings", e);
            }
        }
    };

    // Ref to prevent re-processing same image on settings sync
    const lastProcessedImageRef = React.useRef<string | null>(null);

    // Initial Load
    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem("inktex_autocopy") : null;
        if (saved) {
            setAutoCopy(saved === "true");
        }
    }, []);

    // Initialize Session logic extracted to function
    const startSession = async (customId?: string) => {
        try {
            // If custom ID, skip creation API call if API doesn't support custom ID creation?
            // Existing API `/api/sync?action=create` generates ID. 
            // If we want to resume, we probably just use the ID. 
            // But we need to check if session is valid? Or just start polling?
            // Let's assume validation happens on poll or initial fetch.

            let id = customId;
            if (!id) {
                const res = await fetch("/api/sync?action=create");
                const data = await res.json();
                id = data.sessionId;
            }

            if (!id) throw new Error("No ID");

            setSessionId(id);
            // Save to local storage provided it's new? Or always?
            if (typeof window !== 'undefined') {
                localStorage.setItem('inktex_last_session', id);
            }

            // Detect localhost
            const host = window.location.hostname;
            const isLocal = host === "localhost" || host === "127.0.0.1";
            setIsLocalhost(isLocal);

            // Initial URL setup
            let baseUrl = window.location.origin;
            setClientUrl(`${baseUrl}/client/${id}`);
            setLoading(false);
        } catch (e) {
            console.error("Failed to create session", e);
            setErrorMsg(t("host.connect_error"));
            setLoading(false);
        }
    };

    // Initialize
    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('inktex_last_session') : null;
        if (saved) {
            setLastSessionId(saved);
        }

        // If no saved session, start new immediately? 
        // Or wait for user choice if saved session exists?
        // Let's auto-start ONLY if no saved session found, to avoid flashing new ID then asking to resume.
        if (!saved) {
            startSession();
        } else {
            setLoading(false); // Stop loading to show resume UI
        }
    }, []);

    const handleResume = () => {
        if (lastSessionId) {
            startSession(lastSessionId);
            setLastSessionId(null);
        }
    };

    const handleManual = () => {
        if (manualId.length > 0) {
            startSession(manualId);
            setIsManualEntry(false);
        }
    };

    // Reset session
    const handleResetSession = () => {
        startSession(); // Will generate new
    };

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
                    if (data.imageData && data.imageData !== lastProcessedImageRef.current) {
                        lastProcessedImageRef.current = data.imageData;
                        processImage(data.imageData, data.calibrationData);
                    }
                    if (data.settings && typeof data.settings.autoCopy === 'boolean') {
                        // Only update if different to avoid loop/flicker?
                        // Actually, if remote changed, we should accept it.
                        // But if we just toggled it locally, we don't want to revert before server confirms?
                        // We rely on 'lastUpdated' to only process NEW changes.
                        // But polling happens every 2s.
                        // If we check `autoCopy !== data.settings.autoCopy`, then update.
                        // We use `updateAutoCopy(val, false)` to NOT push back to server (prevent loop).
                        if (autoCopy !== data.settings.autoCopy) {
                            updateAutoCopy(data.settings.autoCopy, false);
                        }
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
        // Add Auth Header
        const { data: { session } } = await supabase.auth.getSession();
        const headers: HeadersInit = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/gemini", { method: "POST", body: formData, headers });

        if (res.status === 402) throw new Error("LIMIT_REACHED");

        if (res.status === 429) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, delay));
                return callGeminiWithRetry(formData, retries - 1, delay * 2);
            }
            throw new Error("Rate limit exceeded");
        }
        return res; // Return Raw Response
    };

    // Helper: Compress/Resize Image
    const compressImage = async (blob: Blob): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement("canvas");
                let { width, height } = img;
                const MAX_SIZE = 1024; // Limit max dimension

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("No canvas context");

                // Draw white background mainly for transparency handling if needed, though usually opaque
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((b) => {
                    if (b) resolve(b);
                    else reject("Compression failed");
                }, "image/jpeg", 0.8); // JPEG 80% quality
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    const processImage = async (dataUrl: string, clientCalibration?: string) => {
        setProcessing(true);
        try {
            const res = await fetch(dataUrl);
            const originalBlob = await res.blob();
            // Compress
            const blob = await compressImage(originalBlob);

            const formData = new FormData();
            formData.append("image", blob);

            // Handle Calibration
            // 1. Try Client Calibration first
            // 2. Fallback to Host Calibration
            let calibrationToUse = clientCalibration;
            if (!calibrationToUse) {
                calibrationToUse = localStorage.getItem("inktext_calibration") || undefined;
            }

            if (calibrationToUse) {
                try {
                    // Check if JSON
                    let calUrl = calibrationToUse;
                    let label = "\\int_{-\\infty}^{\\infty} e^{-x^2} dx"; // Default

                    if (calibrationToUse.startsWith("{")) {
                        const parsed = JSON.parse(calibrationToUse);
                        calUrl = parsed.image;
                        label = parsed.label || label;
                    }

                    const calRes = await fetch(calUrl);
                    const calBlob = await calRes.blob();
                    formData.append("calibrationImage", calBlob);
                    formData.append("calibrationLabel", label);
                } catch (e) {
                    console.warn("Failed to attach calibration", e);
                }
            }

            const apiRes = await callGeminiWithRetry(formData);
            const apiData = await apiRes.json();

            if (apiData.latex) {
                // Calculate usage info snapshot
                let usageInfo;
                if (typeof apiData.usage === 'number') {
                    if (!apiData.isPro && apiData.usage <= 30) {
                        usageInfo = {
                            label: t("toast.usage"),
                            remaining: Math.max(0, 30 - apiData.usage)
                        };
                    }
                }

                addToHistory(apiData.latex, dataUrl, usageInfo);

                if (autoCopy) {
                    // Try to copy
                    navigator.clipboard.writeText(apiData.latex)
                        .then(() => setShowToast(t("result.copied")))
                        .catch(async (e) => {
                            console.error("Auto Copy Failed", e);

                            // If background and failed, implies permission issue
                            if (document.visibilityState === 'hidden') {
                                // Try sending a notification if allowed
                                if (Notification.permission === "granted") {
                                    new Notification("InkTeX", {
                                        body: t("result.copied_failed_bg") || "Background copy failed. Please enable Clipboard permissions in site settings.",
                                        icon: "/favicon.ico"
                                    });
                                }
                            }
                        });
                }
            } else if (apiData.error) {
                setErrorMsg(`Error: ${apiData.error}`);
            }
        } catch (e: any) {
            console.error("Conversion error", e);
            if (e.message === "Rate limit exceeded") {
                setErrorMsg(t("err.rate_limit_msg"));
            } else if (e.message === "LIMIT_REACHED") {
                setShowLimitModal(true);
            } else {
                setErrorMsg(t("err.unexpected"));
            }
        } finally {
            setProcessing(false);
        }
    };

    const addToHistory = (latex: string, imageData: string, usageInfo?: { label: string, remaining: number }) => {
        setHistory(prev => {
            const newItem: HistoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                latex,
                imageData,
                timestamp: Date.now(),
                isPinned: false,
                usageInfo
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
            {showToast && <Toast message={showToast} onClose={() => setShowToast(null)} />}

            {/* Left Panel: Connection Info */}
            <div
                className={`
                    border-r border-slate-200 bg-white p-8 flex flex-col items-center justify-center space-y-8 shadow-sm z-10 transition-all duration-300 ease-in-out
                    ${showQrPanel ? "w-1/3 min-w-[350px] opacity-100 translate-x-0" : "w-0 min-w-0 p-0 opacity-0 -translate-x-full overflow-hidden border-none"}
                `}
            >
                <div className="absolute top-4 left-4">
                    <a href="/" className="flex items-center gap-2 group px-3 py-2 rounded-lg hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm tracking-wide">{t("host.back")}</span>
                    </a>
                </div>

                <div className="text-center space-y-2 min-w-[300px]">
                    <h1 className="text-2xl font-bold text-slate-900">{t("host.title")}</h1>
                    <p className="text-slate-500 text-sm">{t("host.scan_qr")}</p>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-[320px]">
                    {/* Resume / Manual Options */}
                    {!sessionId && lastSessionId && !isManualEntry && (
                        <div className="mb-6 space-y-3">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t("host.resume_title")}</div>

                            <button
                                onClick={handleResume}
                                className="w-full py-4 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-row items-center justify-between group"
                            >
                                <span className="text-lg font-bold">{t("host.resume_btn").replace("ID:", "")}</span>
                                <span className="font-mono text-sm opacity-80 tracking-widest bg-white/20 px-2 py-0.5 rounded">ID: {lastSessionId}</span>
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">or</span></div>
                            </div>

                            <button onClick={() => startSession()} className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                {t("host.new_session")}
                            </button>
                        </div>
                    )}

                    {/* Manual Client Entry Form (Overrides everything when active) */}
                    {isManualEntry && (
                        <div className="mb-6 space-y-4">
                            <h2 className="font-bold text-lg text-slate-700 text-center">{t("host.client_mode_title")}</h2>

                            <p className="text-xs text-slate-500 text-center">{t("host.client_mode_desc")}</p>

                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value.toLowerCase())}
                                placeholder="session id"
                                className="w-full p-3 border border-slate-200 rounded-xl font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                            />

                            <button
                                onClick={() => {
                                    if (manualId.trim().length > 0) {
                                        window.location.href = `/client/${manualId.trim()}`;
                                    }
                                }}
                                disabled={manualId.length === 0}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {t("host.connect_btn")}
                            </button>

                            {/* Cancel Button (Moved to bottom) */}
                            <button
                                onClick={() => setIsManualEntry(false)}
                                className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {t("result.cancel")}
                            </button>
                        </div>
                    )}

                    {/* Session Active View (QR) - Hidden if manual entry is active */}
                    {sessionId && !isManualEntry && (
                        <div className="flex flex-col items-center">
                            {clientUrl ? (
                                <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-100 mb-4">
                                    <QRCodeSVG value={clientUrl} size={200} level="H" className="rounded-lg" />
                                </div>
                            ) : (
                                <div className="w-52 h-52 bg-slate-100 animate-pulse rounded-xl mb-4" />
                            )}

                            <div className="flex flex-col items-center gap-2 text-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session ID</span>
                                <div className="font-mono text-3xl font-black text-slate-800 tracking-widest select-all cursor-pointer hover:text-blue-600 transition-colors">{sessionId}</div>

                                <button onClick={handleResetSession} className="mt-4 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5">
                                    {t("host.new_session")}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Initial State (No Session, No History) */}
                    {!sessionId && !lastSessionId && !isManualEntry && (
                        <div className="w-full">
                            <div className="flex flex-col items-center gap-4 py-8">
                                <button onClick={() => startSession()} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <span>{t("host.new_session")}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ALWAYS VISIBLE Client Button (Unless in manual mode) */}
                    {!isManualEntry && (
                        <div className="mt-6 pt-6 border-t border-slate-100 w-full">
                            <button
                                onClick={() => setIsManualEntry(true)}
                                className="w-full py-3 text-slate-500 font-medium text-sm hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Smartphone size={18} />
                                {t("host.client_mode_btn")}
                            </button>
                        </div>
                    )}
                </div>

                {/* Network Settings Toggles (Collapsed) */}
                <div className="mt-8 text-xs text-center w-full max-w-[320px]">
                    <details className="group">
                        <summary className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors list-none font-medium flex items-center justify-center gap-1">
                            <span>{t("host.manual_ip_title")}</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl text-left animate-in slide-in-from-top-2 fade-in">
                            {/* Replaced logic: Use stable isLocalhost state */}
                            {isLocalhost ? (
                                <>
                                    <p className="mb-2 text-slate-500">{t("host.manual_ip_prompt")}</p>
                                    <input
                                        type="text"
                                        placeholder="例: 192.168.1.5"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono text-slate-700"
                                        onChange={(e) => updateHostIp(e.target.value)}
                                    />
                                </>
                            ) : (
                                <div>
                                    <p className="mb-3 text-slate-500">{t("host.manual_wifi_msg")}</p>
                                    <div className="pt-2 border-t border-slate-200">
                                        <p className="mb-1 text-slate-400">Manual Host IP Override:</p>
                                        <input
                                            type="text"
                                            placeholder="192.168.x.x"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono text-slate-700"
                                            onChange={(e) => updateHostIp(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </details>
                </div>
            </div>

            {/* Main Content Area (Right Panel) */}
            <div className={`flex-1 bg-slate-50/50 p-8 flex flex-col h-screen overflow-hidden transition-all duration-300`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Toggle Button */}
                        <Tooltip text={showQrPanel ? t("host.panel_collapse") : t("host.panel_expand")} placement="bottom-start">
                            <button
                                onClick={() => setShowQrPanel(!showQrPanel)}
                                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all shadow-sm"
                            >
                                {showQrPanel ? <Maximize2 size={18} className="rotate-90" /> : <Maximize2 size={18} className="-rotate-90" />} {/* Using icon to signify expand/collapse */}
                            </button>
                        </Tooltip>

                        <h2 className="text-xl font-bold text-slate-700">{t("host.history_title")}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {processing && (
                            <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                                <Loader2 size={14} className="animate-spin" />
                                <span>{t("host.converting")}</span>
                            </div>
                        )}

                        <Tooltip text={t("header.settings")}>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all shadow-sm"
                            >
                                <Settings size={18} />
                            </button>
                        </Tooltip>

                        <UserMenu variant="light" />
                    </div>
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
                                <div key={item.id} className={`group bg-white rounded-xl shadow-sm border transition-all overflow-hidden h-[22rem] flex flex-col ${item.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
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
                                        className="border-none shadow-none rounded-none bg-transparent flex-1 min-h-0"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showSettings && (
                <SettingsModal
                    onClose={() => setShowSettings(false)}
                    autoCopy={autoCopy}
                    onToggleAutoCopy={() => updateAutoCopy(!autoCopy)}
                />
            )}
            {showLimitModal && <LimitReachedModal onClose={() => setShowLimitModal(false)} />}
        </main>
    );
}
