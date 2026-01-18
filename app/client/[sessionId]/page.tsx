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
            const blob = await new Promise<Blob | null>((resolve) =>
                canvasRef.current?.toBlob(resolve, 'image/png')
            );

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
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="pointer-events-auto w-full h-full relative">
                    {/* Reusing Toolbar component but hijacking onConvert */}
                    <Toolbar
                        tool={tool}
                        setTool={setTool}
                        size={size}
                        setSize={setSize}
                        onClear={handleClear}
                        onConvert={handleSend} // client sends to host instead of direct convert
                        isConverting={isSending}
                        onUndo={() => {
                            const canvas = canvasRef.current as any;
                            if (canvas && canvas.undo) {
                                canvas.undo();
                            }
                        }}
                    />
                </div>

                {/* Success Overlay */}
                {sentSuccess && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                        <Check size={18} />
                        <span className="font-medium">ホストに送信しました</span>
                    </div>
                )}

                {/* Session Info (Discreet) */}
                <div className="absolute bottom-4 left-4 text-xs text-slate-300 font-mono pointer-events-auto">
                    ID: {sessionId}
                </div>
            </div>
        </main>
    );
}
