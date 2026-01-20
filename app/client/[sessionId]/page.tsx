"use client";

import React, { useState, useRef, use } from "react";
import Canvas from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { Send, Check } from "lucide-react";

import { ErrorPopup } from "@/components/ErrorPopup";

export default function ClientPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);

    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [size, setSize] = useState(4);
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasKey, setCanvasKey] = useState(0);

    const handleClear = () => {
        if (confirm("キャンバスを消去しますか？")) {
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

            if (!blob) throw new Error("キャンバスが空です");

            const formData = new FormData();
            formData.append("image", blob);

            const res = await fetch(`/api/sync?action=upload&sessionId=${sessionId}`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("アップロードに失敗しました");

            // Success animation
            setSentSuccess(true);
            setTimeout(() => setSentSuccess(false), 2000);

        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "送信に失敗しました");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="relative w-screen h-screen bg-[#f9f9f9] overflow-hidden overscroll-none">
            <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

            {/* Canvas Layer - Force black color */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    key={canvasKey}
                    ref={canvasRef}
                    tool={tool}
                    color="#000000"
                    size={size}
                />
            </div>

            {/* UI Layer */}
            <>
                {/* Scrollable container for Toolbar if needed, or just fixed top */}

                {/* ID Display - Moved to bottom left to avoid conflict with top toolbar */}
                <div className="fixed bottom-4 left-4 z-50 pointer-events-auto bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-slate-500 border border-slate-200 shadow-sm">
                    ID: {sessionId}
                </div>

                {/* Toolbar - Fixed Top Bar */}
                <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto w-full bg-white border-b border-slate-200 pt-[env(safe-area-inset-top)] shadow-sm">
                    <div className="max-w-3xl mx-auto">
                        <Toolbar
                            tool={tool}
                            setTool={setTool}
                            size={size}
                            setSize={setSize}
                            onClear={handleClear}
                            onConvert={handleSend}
                            isConverting={isSending}
                            className="h-16 py-1 justify-center"
                            onUndo={() => {
                                const canvas = canvasRef.current as any;
                                if (canvas && canvas.undo) {
                                    canvas.undo();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Success Overlay */}
                {sentSuccess && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                        <Check size={18} />
                        <span className="font-medium">ホストに送信しました</span>
                    </div>
                )}
            </>
        </main>
    );
}
