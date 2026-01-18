"use client";

import React, { useState, useRef } from "react";
import Canvas from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ErrorPopup } from "@/components/ErrorPopup";
import { Settings, Smartphone } from "lucide-react";
import { CalibrationModal } from "@/components/CalibrationModal";

export default function Home() {
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [penSize, setPenSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(20);

  const currentSize = tool === "pen" ? penSize : eraserSize;
  const setSize = (s: number) => {
    if (tool === "pen") setPenSize(s);
    else setEraserSize(s);
  };

  const [isConverting, setIsConverting] = useState(false);
  const [latexResult, setLatexResult] = useState<string>("");
  const [showCalibration, setShowCalibration] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasKey, setCanvasKey] = useState(0);

  const handleClear = () => {
    if (confirm("キャンバスを消去しますか？")) {
      setCanvasKey((prev) => prev + 1);
      setLatexResult("");
      setErrorMsg(null);
    }
  };

  // API Call with Retry Logic
  const callGeminiWithRetry = async (formData: FormData, retries = 3, delay = 1000): Promise<any> => {
    try {
      const res = await fetch("/api/gemini", { method: "POST", body: formData });

      if (res.status === 429) {
        // Rate limit hit
        if (retries > 0) {
          console.warn(`Rate limit hit, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          return callGeminiWithRetry(formData, retries - 1, delay * 2);
        } else {
          throw new Error("アクセス集中によりAIが応答できません。しばらく待ってから再試行してください。");
        }
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "APIリクエストに失敗しました。");
      }

      return await res.json();
    } catch (e) {
      throw e;
    }
  };

  const handleConvert = async () => {
    if (!canvasRef.current) return;
    setIsConverting(true);
    setErrorMsg(null);

    try {
      // Use new exportImage method for better AI recognition (handling transparency)
      const canvas = canvasRef.current as any;
      let blob = null;
      if (canvas && canvas.exportImage) {
        blob = await canvas.exportImage();
      } else {
        // Fallback
        blob = await new Promise<Blob | null>((resolve) =>
          canvasRef.current?.toBlob(resolve, 'image/png')
        );
      }

      if (!blob) {
        throw new Error("画像をキャンバスから取得できませんでした。");
      }

      const formData = new FormData();
      formData.append("image", blob);

      const calibrationData = localStorage.getItem("inktext_calibration");
      if (calibrationData) {
        try {
          // Check if it is JSON (new format) or just raw string (legacy)
          let imageUrl = calibrationData;
          let label = "\\int_{-\\infty}^{\\infty} e^{-x^2} dx"; // Default fallback

          if (calibrationData.startsWith("{")) {
            const parsed = JSON.parse(calibrationData);
            imageUrl = parsed.image;
            label = parsed.label || label;
          }

          const calRes = await fetch(imageUrl);
          const calBlob = await calRes.blob();
          formData.append("calibrationImage", calBlob);
          formData.append("calibrationLabel", label);
        } catch (e) {
          console.warn("Failed to attach calibration", e);
        }
      }

      // Use retry helper
      const data = await callGeminiWithRetry(formData);
      setLatexResult(data.latex || "結果が見つかりませんでした。");

    } catch (error: any) {
      console.error("Conversion failed:", error);
      setErrorMsg(error.message || "予期せぬエラーが発生しました。");
    } finally {
      setIsConverting(false);
    }
  };

  const handleFeedback = async (correctedLatex: string) => {
    if (!canvasRef.current) return;
    try {
      // Reuse exportImage to ensure we save the exact style seen by AI (white bg)
      const canvas = canvasRef.current as any;
      // Use standard toDataURL for matching CalibrationModal format
      const dataUrl = canvasRef.current.toDataURL("image/png", 0.5);

      const calibrationData = {
        image: dataUrl,
        label: correctedLatex
      };

      localStorage.setItem("inktext_calibration", JSON.stringify(calibrationData));

      alert("学習データを保存しました。\n次回からこの筆跡を参考にします。");
      setLatexResult("");
    } catch (e) {
      console.error(e);
      alert("学習データの保存に失敗しました。");
    }
  };

  return (
    <main className="flex flex-col h-screen w-screen bg-[#f9f9f9] overflow-hidden">
      <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

      {/* Header Bar (Goodnotes Style) */}
      <header className="flex-none bg-[#28426d] text-white px-4 h-14 flex items-center justify-between z-50 relative shadow-md">
        {/* Left: Branding & Back (Simulated) */}
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-white/10 rounded cursor-default">
            <span className="font-bold tracking-tight select-none">InkTeX</span>
          </div>
          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-2" />
        </div>

        {/* Center: Toolbar is now a floating component, but user wants Goodnotes style.
            Goodnotes has a PRIMARY toolbar (dark blue) and SECONDARY toolbar (white).
            Let's put the main actions in the dark blue bar, and the PEN TOOLS in a secondary bar below.
            Wait, current Toolbar component has everything mixed.
            Let's keep the Toolbar component as the "Secondary Bar" (White) and put it BELOW the header.
        */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Tooltip text="デバイス連携モード (準備中)">
            <button
              onClick={() => alert("デバイス連携モードは現在準備中です。\nComing soon...")}
              className="p-2 hover:bg-white/10 rounded-full text-white/50 cursor-not-allowed transition-all"
              title="デバイス連携モード (Coming soon...)"
            >
              <Smartphone size={20} />
            </button>
          </Tooltip>
          <button
            onClick={() => setShowCalibration(true)}
            className="p-2 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-all"
            title="設定 / 筆跡キャリブレーション"
          >
            <Settings size={20} />
          </button>
          <Tooltip text="アプリを完全に終了し、ウィンドウを閉じます">
            <button
              onClick={async () => {
                if (confirm("アプリケーションを終了しますか？")) {
                  try {
                    await fetch("/api/shutdown", { method: "POST" });
                    window.close();
                  } catch (e) {
                    alert("終了できませんでした。");
                  }
                }
              }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 hover:text-red-50 transition-all flex items-center gap-2 group"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 group-hover:bg-red-400 shadow-sm" />
              <span className="text-xs font-bold text-red-200 group-hover:text-white">終了</span>
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Secondary Toolbar (White) */}
      <div className="flex-none bg-[#f0f4f8] border-b border-slate-300 h-14 flex items-center justify-center relative z-40">
        <Toolbar
          tool={tool}
          setTool={setTool}
          size={currentSize}
          setSize={setSize}
          onClear={handleClear}
          onConvert={handleConvert}
          isConverting={isConverting}
          className="shadow-none border-none bg-transparent py-0 h-full"
          onUndo={() => {
            const canvas = canvasRef.current as any;
            if (canvas && canvas.undo) canvas.undo();
          }}
          onRedo={() => {
            const canvas = canvasRef.current as any;
            if (canvas && canvas.redo) canvas.redo();
          }}
        />
      </div>

      {/* Main Content Area (Canvas) */}
      <div
        className="flex-1 relative w-full h-full z-0 bg-[#f9f9f9] cursor-crosshair overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px" // Grid dots
        }}
      >
        <Canvas
          key={canvasKey}
          ref={canvasRef}
          tool={tool}
          color="#000000"
          size={currentSize}
        />

        {/* Result Display (Floating Overlay) */}
        {latexResult && (
          <div className="absolute bottom-8 right-8 z-10 pointer-events-auto max-w-2xl w-full px-4 md:px-0">
            <ResultDisplay
              latex={latexResult}
              onClose={() => setLatexResult("")}
              onFeedback={handleFeedback}
            />
          </div>
        )}
      </div>

      {/* Calibration Modal */}
      {showCalibration && (
        <CalibrationModal
          onClose={() => setShowCalibration(false)}
          onSave={() => {/* No-op */ }}
        />
      )}
    </main>
  );
}

// Simple Tooltip Component (Copied for consistency, or should extract to shared)
function Tooltip({ text, children }: { text: string, children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 1000); // 1s delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div className="relative flex flex-col items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div className="absolute top-full mt-2 right-0 px-3 py-1.5 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[200] animate-in fade-in zoom-in-95 pointer-events-none">
          {text}
          {/* Arrow (Right aligned manually) */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      )}
    </div>
  );
}
