import React, { useState, useEffect, useRef } from "react";
import { Pen, Eraser, Trash2, ArrowRightLeft, Loader2, Info, Undo2, Redo2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "./contexts/LanguageContext";

interface ToolbarProps {
    tool: "pen" | "eraser";
    setTool: (t: "pen" | "eraser") => void;
    size: number;
    setSize: (s: number) => void;
    onClear: () => void;
    onConvert: () => void;
    isConverting: boolean;
    showConvert?: boolean;
    className?: string;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function Toolbar({
    tool,
    setTool,
    size,
    setSize,
    onClear,
    onConvert,
    isConverting,
    showConvert = true, // Default to true
    className,
    onUndo,
    onRedo
}: ToolbarProps) {
    const [activePopup, setActivePopup] = useState<"pen" | "eraser" | null>(null);

    // Keep popup open when switching tools? No, close on click outside.
    // Simulating "Goodnotes": Clicking icon toggles popup if already selected.

    // Size Presets
    const PenSizes = [2, 4, 8];
    const EraserSizes = [20, 40, 80];

    // Fake Colors (for now hardcoded black in parent, but UI can show options)
    const Colors = ["#000000", "#EF4444", "#3B82F6"];

    const handleToolClick = (t: "pen" | "eraser") => {
        if (tool === t) {
            // Already selected, toggle popup
            setActivePopup(activePopup === t ? null : t);
        } else {
            setTool(t);
            setActivePopup(null); // Close other popups
        }
    };

    // Close popup on outside click (simple version)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.toolbar-popup') && !target.closest('.tool-btn')) {
                setActivePopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { t } = useLanguage();

    return (
        <div className={twMerge("flex items-center gap-6 px-4 h-full", className)}>
            {/* Pen Tool */}
            <div className="relative flex flex-col items-center">
                <Tooltip text={t("tip.pen")}>
                    <button
                        className={clsx(
                            "tool-btn p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 w-16",
                            tool === "pen" ? "bg-blue-100 text-blue-700 shadow-inner" : "text-slate-500 hover:bg-slate-100"
                        )}
                        onClick={() => handleToolClick("pen")}
                    >
                        <Pen size={24} />
                        {tool === "pen" && <span className="text-[10px] font-bold leading-none">{size}px</span>}
                    </button>
                </Tooltip>

                {/* Popup */}
                {activePopup === "pen" && (
                    <div className="toolbar-popup absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-60 z-[100] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                        {/* Triangle */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45" />

                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t("toolbar.size")}</div>
                            <div className="flex justify-between bg-slate-100 p-1 rounded-lg">
                                {PenSizes.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={clsx(
                                            "flex-1 py-2 rounded-md flex items-center justify-center transition-all",
                                            size === s ? "bg-white shadow text-blue-600" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <div className="bg-current rounded-full" style={{ width: s * 1.5, height: s * 1.5 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Eraser Tool */}
            <div className="relative flex flex-col items-center">
                <Tooltip text={t("tip.eraser")}>
                    <button
                        className={clsx(
                            "tool-btn p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 w-16",
                            tool === "eraser" ? "bg-blue-100 text-blue-700 shadow-inner" : "text-slate-500 hover:bg-slate-100"
                        )}
                        onClick={() => handleToolClick("eraser")}
                    >
                        <Eraser size={24} />
                        {tool === "eraser" && <span className="text-[10px] font-bold leading-none">{size}px</span>}
                    </button>
                </Tooltip>

                {/* Popup */}
                {activePopup === "eraser" && (
                    <div className="toolbar-popup absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-60 z-[100] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45" />
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t("toolbar.eraserSize")}</div>
                            <div className="flex justify-between bg-slate-100 p-1 rounded-lg">
                                {EraserSizes.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setSize(s)}
                                        className={clsx(
                                            "flex-1 py-2 rounded-md flex items-center justify-center transition-all",
                                            size === s ? "bg-white shadow text-blue-600" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <div className="bg-slate-300 rounded-full" style={{ width: s / 2, height: s / 2 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-px h-8 bg-slate-200 mx-2" />

            {/* Undo */}
            <Tooltip text={t("tip.undo")}>
                <button
                    onClick={onUndo}
                    className="p-3 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Undo2 size={24} strokeWidth={2.5} />
                </button>
            </Tooltip>

            {/* Redo */}
            <Tooltip text={t("tip.redo")}>
                <button
                    onClick={onRedo}
                    className="p-3 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Redo2 size={24} strokeWidth={2.5} />
                </button>
            </Tooltip>

            <div className="w-px h-8 bg-slate-200 mx-2" />

            {/* Clear */}
            <Tooltip text={t("tip.clear")}>
                <button
                    onClick={onClear}
                    className="p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                    <Trash2 size={22} />
                </button>
            </Tooltip>

            {/* Convert - Optional */}
            {onConvert && showConvert !== false && (
                <Tooltip text={t("tip.convert")}>
                    <button
                        onClick={onConvert}
                        disabled={isConverting}
                        className={clsx(
                            "ml-auto flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-sm transition-all text-sm",
                            isConverting
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#28426d] text-white hover:bg-[#1e3252] hover:shadow-md active:scale-95"
                        )}
                    >
                        {isConverting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <ArrowRightLeft size={18} />
                        )}
                        <span>{t("toolbar.convert")}</span>
                    </button>
                </Tooltip>
            )}
        </div>
    );
}

// Simple Tooltip Component with Delay
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
                <div className="absolute top-full mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[200] animate-in fade-in zoom-in-95 pointer-events-none">
                    {text}
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                </div>
            )}
        </div>
    );
}
