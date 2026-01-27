"use client";

import React, { useState, useRef } from "react";
import Canvas from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ErrorPopup } from "@/components/ErrorPopup";
import { Settings, Smartphone, PenTool } from "lucide-react";
import { CalibrationModal } from "@/components/CalibrationModal";
import { SettingsModal } from "@/components/SettingsModal";
import { LimitReachedModal } from "@/components/LimitReachedModal";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
import { FeatureSection } from "@/components/FeatureSection";
import { Toast } from "@/components/Toast";
import { UpgradeButton } from "@/components/UpgradeButton";
import { UserMenu } from "@/components/UserMenu";
import { HelpModal } from "@/components/HelpModal";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [penSize, setPenSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(40);

  const currentSize = tool === "pen" ? penSize : eraserSize;
  const setSize = (s: number) => {
    if (tool === "pen") setPenSize(s);
    else setEraserSize(s);
  };

  const [isConverting, setIsConverting] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [latexResult, setLatexResult] = useState<string>("");
  const [usageInfo, setUsageInfo] = useState<{ label: string, remaining: number } | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [autoCopy, setAutoCopy] = useState(false);

  // Load Settings
  React.useEffect(() => {
    const savedAutoCopy = localStorage.getItem("inktex_autocopy");
    if (savedAutoCopy) setAutoCopy(savedAutoCopy === "true");


  }, []);



  const [palmRejection, setPalmRejection] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load Palm Rejection setting
  React.useEffect(() => {
    const saved = localStorage.getItem("inktex_palm_rejection");
    if (saved) {
      setPalmRejection(saved === "true");
    }
    // Check Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const togglePalmRejection = () => {
    const newVal = !palmRejection;
    setPalmRejection(newVal);
    localStorage.setItem("inktex_palm_rejection", String(newVal));
  };

  const toggleAutoCopy = () => {
    const newVal = !autoCopy;
    setAutoCopy(newVal);
    localStorage.setItem("inktex_autocopy", String(newVal));
  };

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
      // Add Auth Header
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/gemini", { method: "POST", body: formData, headers });

      if (res.status === 402) throw new Error("LIMIT_REACHED");

      if (res.status === 429) {
        // Rate limit hit
        if (retries > 0) {
          console.warn(`Rate limit hit, retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          return callGeminiWithRetry(formData, retries - 1, delay * 2);
        } else {
          // Explicit message for rate limit
          throw new Error("RATE_LIMIT");
        }
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || t("err.unexpected"));
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
      // Guest Check
      if (!user) {
        const guestUsage = parseInt(localStorage.getItem("inktex_guest_usage") || "0", 10);
        if (guestUsage >= 5) {
          throw new Error("LIMIT_REACHED");
        }
      }

      // Use new exportImage method for better AI recognition (handling transparency)
      const canvas = canvasRef.current as any;
      let blob = null;
      if (canvas && canvas.exportImage) {
        blob = await canvas.exportImage('image/jpeg', 0.8);
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
      setLatexResult(data.latex || "No result");

      let nextUsageInfo = null;

      // Increment Guest Usage
      if (!user && data.latex) {
        const current = parseInt(localStorage.getItem("inktex_guest_usage") || "0", 10);
        const next = current + 1;
        localStorage.setItem("inktex_guest_usage", String(next));
        window.dispatchEvent(new Event("inktex_guest_usage_updated"));

        const remaining = Math.max(0, 5 - next);
        nextUsageInfo = { label: t("toast.guest"), remaining };
      } else if (typeof data.usage === 'number') {
        // Dispatch event for UserMenu update
        window.dispatchEvent(new CustomEvent("inktex_user_usage_updated", { detail: { usage: data.usage } }));

        // Only show if NOT Pro and within limit
        if (!data.isPro && data.usage <= 20) {
          const remaining = Math.max(0, 20 - data.usage);
          nextUsageInfo = { label: t("toast.usage"), remaining };
        }
      }

      setUsageInfo(nextUsageInfo);

      // Show Toast / Auto Copy
      if (autoCopy && data.latex) {
        navigator.clipboard.writeText(data.latex)
          .then(() => setShowToast(t("result.copied")))
          .catch(err => console.error("Auto Copy failed:", err));
      }

    } catch (error: any) {
      console.error("Conversion failed:", error);
      // Translate known errors
      if (error.message === "RATE_LIMIT") {
        setErrorMsg(t("err.rate_limit_msg"));
      } else if (error.message === "LIMIT_REACHED") {
        setShowLimitModal(true);
      } else {
        setErrorMsg(error.message || t("err.unexpected"));
      }
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

  const [showHelp, setShowHelp] = useState(false);

  return (
    <main className="flex flex-col min-h-screen w-full bg-[#f9f9f9]">
      <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />
      {showToast && <Toast message={showToast} onClose={() => setShowToast(null)} />}

      {/* Header Bar (Fixed) */}
      <header className="flex-none bg-[#28426d] text-white px-4 h-14 flex items-center justify-between z-50 sticky top-0 shadow-md">
        {/* Left: Branding & Back (Simulated) */}
        <div className="flex items-center gap-4">
          <div className="rounded cursor-default">
            <span className="font-bold tracking-tight select-none text-2xl">InkTeX</span>
          </div>
          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-2" />
        </div>

        {/* Center: Language Toggle Removed (Moved to Settings) */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <UpgradeButton />

          <div className="h-6 w-px bg-white/20 mx-1 hidden md:block" />

          <Tooltip text={t("header.sync")}>
            <button
              onClick={() => router.push("/host")}
              className="p-2 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-all"
            >
              <Smartphone size={20} />
            </button>
          </Tooltip>

          {/* New Calibration Button */}
          <Tooltip text={t("header.calibration")}>
            <button
              onClick={() => setShowCalibration(true)}
              className="p-2 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-all flex items-center gap-2"
            >
              <PenTool size={20} />
            </button>
          </Tooltip>

          {/* Settings Button */}
          <Tooltip text={t("header.settings")}>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-full text-white/90 hover:text-white transition-all"
            >
              <Settings size={20} />
            </button>
          </Tooltip>

          <div className="pl-2 border-l border-white/10 ml-1">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Secondary Toolbar (Sticky below header) */}
      <div className="flex-none bg-[#f0f4f8] border-b border-slate-300 h-14 flex items-center justify-center relative z-40 sticky top-14">
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
          onHelp={() => setShowHelp(true)}
        />
      </div>

      {/* Main Content Area (Canvas) - Fixed height relative to viewport to ensure drawing feels app-like */}
      {/* Main Content Area (Canvas) - Fixed height relative to viewport to ensure drawing feels app-like */}
      {/* Wrapper to allow touches on sides to scroll page on mobile */}
      <div className="relative w-full h-[85vh] z-0 bg-[#f9f9f9] flex justify-center md:block py-2 md:py-0 px-2 md:px-0">
        <div
          className="relative w-full h-full max-w-[100%] md:max-w-none bg-white md:bg-[#f9f9f9] cursor-crosshair overflow-hidden touch-none rounded-xl md:rounded-none border border-slate-200 md:border-none shadow-sm md:shadow-none"
          style={{
            touchAction: "none" // Prevents scrolling while drawing on touch devices
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
                usageInfo={usageInfo}
              />
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <FeatureSection />

      {/* FAQ / SEO Section */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-800">{t("faq.title")}</h2>
            <p className="text-slate-500">{t("faq.subtitle")}</p>
          </div>

          <div className="space-y-8 divide-y divide-slate-100">
            <FaqItem
              q={t("faq.q1")}
              a={t("faq.a1")}
            />
            <FaqItem
              q={t("faq.q2")}
              a={t("faq.a2")}
            />
            <FaqItem
              q={t("faq.q3")}
              a={t("faq.a3")}
            />
            <FaqItem
              q={t("faq.q4")}
              a={t("faq.a4")}
            />
          </div>

        </div>
      </section>

      {/* Footer with Links */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200 text-center">
        <div className="flex justify-center gap-6 mb-8 text-sm font-medium text-slate-600">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">{t("footer.privacy")}</Link>
          <span className="text-slate-300">|</span>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">{t("footer.terms")}</Link>
          <span className="text-slate-300">|</span>
          <Link href="/legal/commercial" className="hover:text-blue-600 transition-colors">{t("footer.commercial")}</Link>
          <span className="text-slate-300">|</span>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">{t("footer.contact")}</Link>
        </div>

        <div className="mb-8">
          <UpgradeButton variant="large" />
        </div>

        <div className="text-sm text-slate-400">
          {t("footer.copyright")}
        </div>
      </footer>

      {/* Calibration Modal */}
      {showCalibration && (
        <CalibrationModal
          onClose={() => setShowCalibration(false)}
          onSave={() => {/* No-op */ }}
        />
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <LimitReachedModal onClose={() => setShowLimitModal(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          autoCopy={autoCopy}
          onToggleAutoCopy={toggleAutoCopy}
          palmRejection={palmRejection}
          onTogglePalmRejection={togglePalmRejection}

        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </main>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="pt-8 first:pt-0">
      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-start gap-2">
        <span className="text-blue-600">Q.</span> {q}
      </h3>
      <p className="text-slate-600 leading-relaxed pl-6">
        <span className="font-bold text-slate-400 mr-2">A.</span>
        {a}
      </p>
    </div>
  );
}


