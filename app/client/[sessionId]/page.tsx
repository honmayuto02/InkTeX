"use client";

import React, { useState, useRef, use } from "react";
import Canvas from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { Send, Check, Settings } from "lucide-react";
import { ClientSettingsModal } from "@/components/ClientSettingsModal";

import { ErrorPopup } from "@/components/ErrorPopup";

import { useLanguage } from "@/components/contexts/LanguageContext";

export default function ClientPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const { t } = useLanguage();

    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [penSize, setPenSize] = useState(4);
    const [eraserSize, setEraserSize] = useState(40);

    // Dynamic size accessor
    const size = tool === "pen" ? penSize : eraserSize;
    const setSize = (newSize: number) => {
        if (tool === "pen") setPenSize(newSize);
        else setEraserSize(newSize);
    };

    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Palm Rejection Default Off
    const [palmRejection, setPalmRejection] = useState(false);
    // Settings Modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasKey, setCanvasKey] = useState(0);

    // Orientation detection
    const [isLandscape, setIsLandscape] = useState(false);

    React.useEffect(() => {
        const checkOrientation = () => {
            // Only updates on client
            if (typeof window !== 'undefined') {
                setIsLandscape(window.innerWidth > window.innerHeight);
            }
        };
        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        return () => window.removeEventListener("resize", checkOrientation);
    }, []);

    // Also prevent pull-to-refresh
    React.useEffect(() => {
        document.body.style.overscrollBehavior = "none";
        return () => { document.body.style.overscrollBehavior = ""; };
    }, []);

    const handleClear = () => {
        if (confirm(t("client.confirm_clear"))) {
            setCanvasKey((prev) => prev + 1);
            setErrorMsg(null);
        }
    };

    const handleSend = async () => {
        if (!canvasRef.current) return;
        setIsSending(true);
        setErrorMsg(null);

        try {
            // Use custom exportImage to ensure white background
            // @ts-ignore - Canvas triggers imperative handle with exportImage
            const blob = await canvasRef.current.exportImage('image/png');

            if (!blob) throw new Error(t("client.error_empty"));

            const formData = new FormData();
            formData.append("image", blob);

            const res = await fetch(`/api/sync?action=upload&sessionId=${sessionId}`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error(t("client.error_upload"));

            // Success animation
            setSentSuccess(true);
            setTimeout(() => setSentSuccess(false), 2000);

        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || t("client.error_send"));
        } finally {
            setIsSending(false);
        }
    };

    return (
        // Revert to fixed screen height (no scroll margin)
        <main className="relative w-full h-[100dvh] bg-[#f9f9f9] overscroll-none overflow-hidden touch-none">
            <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

            <ClientSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                palmRejection={palmRejection}
                onTogglePalmRejection={() => setPalmRejection(!palmRejection)}
            />

            {/* Canvas Layer - Full Screen */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    key={canvasKey}
                    ref={canvasRef}
                    tool={tool}
                    color="#000000"
                    size={size}
                    palmRejection={palmRejection}
                />
            </div>

            {/* UI Layer */}
            <>
                {/* ID Display - Bottom Right to avoid Left Toolbar */}
                <div className="fixed z-50 pointer-events-auto flex flex-col items-end gap-2 bottom-4 right-4">
                    <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-slate-500 border border-slate-200 shadow-sm">
                        ID: {sessionId}
                    </div>

                    {/* Desktop/Tablet Settings Button could go here if needed, but it's in toolbar now */}
                    {/* Palm indicator */}
                    {palmRejection && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600" title="Palm Rejection ON">
                            <span className="text-xs">🖐️</span>
                        </div>
                    )}
                </div>

                {/* Toolbar - Always Left Sidebar */}
                <div className="fixed top-0 left-0 bottom-0 w-[4.5rem] border-r z-50 pointer-events-auto bg-white border-slate-200 shadow-sm transition-all duration-300 py-2 flex flex-col items-center">
                    <div className="h-full w-full">
                        <Toolbar
                            tool={tool}
                            setTool={setTool}
                            size={size}
                            setSize={setSize}
                            onClear={handleClear}
                            onConvert={handleSend}
                            isConverting={isSending}
                            orientation="vertical"
                            className="justify-start h-full"
                            showTooltip={false}
                            onUndo={() => {
                                const canvas = canvasRef.current as any;
                                if (canvas && canvas.undo) canvas.undo();
                            }}
                            onRedo={() => {
                                const canvas = canvasRef.current as any;
                                if (canvas && canvas.redo) canvas.redo();
                            }}
                            onSettings={() => setIsSettingsOpen(true)}
                        />
                    </div>
                </div>

                {/* Success Overlay */}
                {sentSuccess && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                        <Check size={18} />
                        <span className="font-medium">{t("client.success_sent")}</span>
                    </div>
                )}
            </>
        </main>
    );
}
