"use client";

import React, { useState, useRef } from "react";
import Canvas from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { Save, RefreshCw, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";
import katex from "katex";
import { clsx } from "clsx";
import { useLanguage } from "./contexts/LanguageContext";

interface CalibrationModalProps {
    onClose: () => void;
    onSave: () => void;
}

// Structured Calibration Data
const CALIBRATION_SECTIONS = [
    {
        id: "complex",
        title: "複雑な数式",
        description: "積分、極限、行列など、構造が複雑な数式の練習です。",
        examples: [
            "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", // Gaussian Integral
            "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1", // Limit
            "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}", // Basel Problem
            "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", // Matrix
            "\\frac{d}{dx} \\left( \\frac{u}{v} \\right) = \\frac{u'v - uv'}{v^2}", // Quotient Rule
            "\\iint_D (x^2 + y^2) dx dy", // Double Integral
            "\\det(A - \\lambda I) = 0", // Eigenvalue equation
            "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", // Maxwell (Faraday)
            "i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi", // Schrödinger
            "\\sum_{i=1}^{n} i^3 = \\left( \\frac{n(n+1)}{2} \\right)^2" // Summation identity
        ]
    },
    {
        id: "ambiguous",
        title: "紛らわしい記号",
        description: "AIが誤認識しやすい似た形の記号の書き分けを練習します。",
        examples: [
            "x \\quad \\chi \\quad \\times", // x, chi, times
            "v \\quad \\nu \\quad \\upsilon", // v, nu, upsilon
            "q \\quad 9 \\quad g", // q, 9, g
            "z \\quad 2", // z, 2
            "l \\quad 1 \\quad I", // l, 1, I
            "\\phi \\quad \\emptyset \\quad 0", // phi, empty set, 0
            "\\omega \\quad w" // omega, w
        ]
    },
    {
        id: "whiteout",
        title: "白抜き文字 (Blackboard Bold)",
        description: "\\mathbb{R}, \\mathbb{N} などの白抜き文字の練習です。",
        examples: [
            "\\mathbb{R}", // R
            "\\mathbb{N}", // N
            "\\mathbb{Z}", // Z
            "\\mathbb{Q}", // Q
            "\\mathbb{C}", // C
            "x \\in \\mathbb{R}^n" // Vector space
        ]
    },
    {
        id: "special",
        title: "特殊文字 (Fraktur/Calligraphic)",
        description: "\\mathfrak{g}, \\mathcal{H} などの特殊フォントの練習です。",
        examples: [
            "\\mathcal{L} \\quad \\mathcal{H} \\quad \\mathcal{F}", // Lagrangian, Hamiltonian, Fourier
            "\\mathfrak{g} \\quad \\mathfrak{so}(3)", // Lie algebra
            "\\mathscr{A} \\quad \\mathscr{B}", // Script (might fallback if font not available, but katex supports it)
            "\\nabla \\times \\vec{A}" // Vector notation often stylized
        ]
    }
];

export function CalibrationModal({ onClose, onSave }: CalibrationModalProps) {
    const { t } = useLanguage();
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [currentExampleIdx, setCurrentExampleIdx] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Toolbar State
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [penSize, setPenSize] = useState(4);
    const [eraserSize, setEraserSize] = useState(20);

    const currentSize = tool === "pen" ? penSize : eraserSize;
    const setSize = (s: number) => {
        if (tool === "pen") setPenSize(s);
        else setEraserSize(s);
    };

    const currentSection = CALIBRATION_SECTIONS[currentSectionIdx];
    const currentExample = currentSection.examples[currentExampleIdx];

    const sampleHtml = React.useMemo(() => {
        return katex.renderToString(currentExample, { throwOnError: false, displayMode: true });
    }, [currentExample]);

    const handleNextExample = () => {
        // Next example in current section
        if (currentExampleIdx < currentSection.examples.length - 1) {
            setCurrentExampleIdx(prev => prev + 1);
        } else {
            // End of section, try next section
            if (currentSectionIdx < CALIBRATION_SECTIONS.length - 1) {
                if (confirm(t("msg.cal_next_section"))) {
                    setCurrentSectionIdx(prev => prev + 1);
                    setCurrentExampleIdx(0);
                }
            } else {
                // All done
                addToToast(t("msg.cal_complete"));
                setTimeout(onClose, 1500);
            }
        }
    };

    const handleUndo = () => {
        const canvas = canvasRef.current as any;
        if (canvas && canvas.undo) canvas.undo();
    };

    const handleRedo = () => {
        const canvas = canvasRef.current as any;
        if (canvas && canvas.redo) canvas.redo();
    };

    const handleClear = () => {
        if (confirm(t("msg.clear_confirm"))) {
            const canvas = canvasRef.current as any;
            if (canvas && canvas.reset) canvas.reset();
        }
    };

    const addToToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSave = async () => {
        if (!canvasRef.current) return;

        // Use exportImage for better quality log if we were sending it (but here we just save locally)
        // Actually, saving local storage might be size limited, but let's assume it works for dataURL
        const canvas = canvasRef.current as any;
        let dataUrl = "";

        // For local storage, we might want transparency to layer it later? 
        // Or consistency with API? API wants white bg.
        // Let's stick to standard toDataURL for transparency unless we want to "bake" the calibration.
        // Since we send calibration to Gemini as "User style sample", transparency is fine if we prompt correctly,
        // but white background is safer. Let's use standard for now to keep it simple.
        dataUrl = canvasRef.current.toDataURL("image/png", 0.5);

        try {
            // Append to existing calibration? Or just overwrite?
            // "InkTeX" currently uses 1 image for calibration.
            // If we want detailed learning, we should accumulate data?
            // For now, the user request implies "Training the user/system".
            // Since we can only send 1 calibration image in the current `route.ts`,
            // we should probably composite them or just keep the LAST one.
            // OR change route.ts to accept multiple.
            // Given constraints, let's just save the current one as "latest sample".
            // Ideally we'd combine them, but that's complex.
            // Let's Just Save.

            localStorage.setItem("inktext_calibration", dataUrl);
            addToToast(t("msg.cal_saved"));

            // Auto-clear and next
            if (canvas && canvas.reset) canvas.reset();
            handleNextExample();
            onSave(); // Trigger parent refresh if needed
        } catch (e) {
            console.error("Storage failed", e);
            alert(t("msg.cal_storage_error"));
        }
    };

    const handleClearCalibration = () => {
        if (confirm(t("msg.cal_reset_confirm"))) {
            localStorage.removeItem("inktext_calibration");
            addToToast(t("msg.cal_reset"));
            onSave();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-[95%] h-[95vh] flex flex-col overflow-hidden relative">
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-[150] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-400" />
                        {toastMessage}
                    </div>
                )}

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 relative shrink-0">
                    <div className="z-10 bg-slate-50 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">{t("cal.title")}</h2>
                            <p className="text-xs text-slate-500">{t("cal.desc")}</p>
                        </div>
                    </div>

                    {/* Centered Toolbar */}
                    <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center pointer-events-none z-50">
                        <div className="pointer-events-auto scale-90 origin-center h-full">
                            <Toolbar
                                tool={tool}
                                setTool={setTool}
                                size={currentSize}
                                setSize={setSize}
                                onClear={handleClear}
                                onConvert={() => { }} // No-op
                                showConvert={false} // Hide convert button
                                isConverting={false}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                className="shadow-none border-none bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 z-10 bg-slate-50 pl-4">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold text-slate-700 transition-colors">
                            {t("cal.close")}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    {/* Left: Sidebar & Instruction */}
                    <div className="md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">

                        {/* Section Selector */}
                        <div className="p-4 space-y-2 overflow-y-auto max-h-[40vh] border-b border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("cal.section_select")}</h3>
                            {CALIBRATION_SECTIONS.map((section, idx) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setCurrentSectionIdx(idx);
                                        setCurrentExampleIdx(0);
                                    }}
                                    className={clsx(
                                        "w-full text-left p-3 rounded-lg text-sm font-medium transition-all border",
                                        currentSectionIdx === idx
                                            ? "bg-white border-blue-200 text-blue-700 shadow-sm"
                                            : "border-transparent text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span>{t(`cal.sec.${section.id}`)}</span>
                                        {currentSectionIdx > idx && <CheckCircle2 size={14} className="text-green-500" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">
                                        {t(`cal.desc.${section.id}`)}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Current Example View */}
                        <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 bg-white">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{t(`cal.sec.${currentSection.id}`)}</h3>
                                <p className="text-sm text-slate-500">{t(`cal.desc.${currentSection.id}`)}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                                <span>{t("cal.example")} {currentExampleIdx + 1}/{currentSection.examples.length}</span>
                                <button onClick={handleNextExample} className="hover:text-blue-500 flex items-center gap-1">
                                    <RefreshCw size={12} /> {t("cal.skip")}
                                </button>
                            </div>

                            <div className="relative group min-h-[120px] flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-4">
                                <div dangerouslySetInnerHTML={{ __html: sampleHtml }} />
                            </div>

                            <div className="mt-auto pt-4 space-y-3">
                                <button
                                    onClick={handleSave}
                                    className="w-full py-3 bg-[#28426d] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1e3252] transition-all shadow-md active:scale-95"
                                >
                                    <Save size={18} />
                                    {t("cal.save_next")}
                                </button>
                                <button
                                    onClick={handleClearCalibration}
                                    className="w-full py-2 text-red-400 hover:text-red-600 text-xs flex items-center justify-center gap-1 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <AlertTriangle size={12} />
                                    {t("cal.reset_data")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Drawing Area */}
                    <div className="flex-1 relative bg-[#f9f9f9] cursor-crosshair overflow-hidden flex flex-col">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-200 pointer-events-none flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            {t("cal.area_label")}
                        </div>

                        <div className="flex-1 relative" style={{
                            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                            backgroundSize: "24px 24px"
                        }}>
                            <Canvas
                                ref={canvasRef}
                                tool={tool}
                                size={currentSize}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
