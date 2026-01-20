import React, { useState, useEffect, useRef } from "react";
import { Pen, Eraser, Trash2, ArrowRightLeft, Loader2, Info, Undo2, Redo2, HelpCircle } from "lucide-react";
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
    onHelp?: () => void;
    orientation?: "horizontal" | "vertical";
}

export function Toolbar({
    tool,
    setTool,
    size,
    setSize,
    onClear,
    onConvert,
    isConverting,
    showConvert = true,
    className,
    onUndo,
    onRedo,
    onHelp,
    orientation = "horizontal"
}: ToolbarProps) {
    const [activePopup, setActivePopup] = useState<"pen" | "eraser" | null>(null);

    // Size Presets
    const PenSizes = [2, 4, 8];
    const EraserSizes = [20, 40, 80];

    const isVertical = orientation === "vertical";

    const handleToolClick = (t: "pen" | "eraser") => {
        if (tool === t) {
            setActivePopup(activePopup === t ? null : t);
        } else {
            setTool(t);
            setActivePopup(null);
        }
    };

    // Close popup on outside click
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

    // Popup Styles based on orientation
    // Horizontal: Below button, centered
    // Vertical: Right of button (since bar is on Left), centered vertically
    const popupBaseClasses = "toolbar-popup absolute bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-60 z-[100] flex flex-col gap-4 animate-in fade-in";
    const popupPosition = isVertical
        ? "top-1/2 -translate-y-1/2 left-full ml-4 slide-in-from-left-2"
        : "top-full left-1/2 -translate-x-1/2 mt-3 slide-in-from-top-2";

    const arrowClasses = isVertical
        ? "absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white border-t border-l border-slate-200 -rotate-45"
        : "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45";

    return (
        <div className={twMerge(
            "flex items-center gap-6 px-4",
            // Reduced padding and gap for vertical mode to fit in tight landscape height
            // Changed gap-2 to gap-1, w-14 to w-12. User requested even more compact: gap-0.5, w-10.
            isVertical ? "flex-col h-auto py-1 w-full gap-0.5 px-0.5 justify-start min-h-0" : "h-full flex-row",
            className
        )}>
            {/* Pen Tool */}
            <div className="relative flex flex-col items-center flex-shrink-0">
                <Tooltip text={t("tip.pen")} disabled={!!activePopup} orientation={orientation}>
                    <button
                        className={clsx(
                            "tool-btn rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
                            isVertical ? "w-10 h-10 p-1" : "w-12 h-12 p-1.5",
                            tool === "pen" ? "bg-blue-100 text-blue-700 shadow-inner" : "text-slate-500 hover:bg-slate-100"
                        )}
                        onClick={() => handleToolClick("pen")}
                    >
                        <Pen size={20} />
                        {tool === "pen" && <span className="text-[9px] font-bold leading-none">{size}px</span>}
                    </button>
                </Tooltip>

                {/* Popup */}
                {activePopup === "pen" && (
                    <div className={clsx(popupBaseClasses, popupPosition)}>
                        <div className={arrowClasses} />
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
            <div className="relative flex flex-col items-center flex-shrink-0">
                <Tooltip text={t("tip.eraser")} disabled={!!activePopup} orientation={orientation}>
                    <button
                        className={clsx(
                            "tool-btn rounded-lg transition-all flex flex-col items-center justify-center gap-0.5",
                            isVertical ? "w-10 h-10 p-1" : "w-12 h-12 p-1.5",
                            tool === "eraser" ? "bg-blue-100 text-blue-700 shadow-inner" : "text-slate-500 hover:bg-slate-100"
                        )}
                        onClick={() => handleToolClick("eraser")}
                    >
                        <Eraser size={20} />
                        {tool === "eraser" && <span className="text-[9px] font-bold leading-none">{size}px</span>}
                    </button>
                </Tooltip>

                {/* Popup */}
                {activePopup === "eraser" && (
                    <div className={clsx(popupBaseClasses, popupPosition)}>
                        <div className={arrowClasses} />
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

            <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />

            {/* Undo */}
            <Tooltip text={t("tip.undo")} orientation={orientation}>
                <button
                    onClick={onUndo}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Undo2 size={22} strokeWidth={2.5} />
                </button>
            </Tooltip>

            {/* Redo */}
            <Tooltip text={t("tip.redo")} orientation={orientation}>
                <button
                    onClick={onRedo}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Redo2 size={22} strokeWidth={2.5} />
                </button>
            </Tooltip>

            <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />

            {/* Clear */}
            <Tooltip text={t("tip.clear")} orientation={orientation}>
                <button
                    onClick={onClear}
                    className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                    <Trash2 size={22} />
                </button>
            </Tooltip>

            {/* Convert - Optional */}
            {onConvert && showConvert !== false && (
                <Tooltip text={t("tip.convert")} orientation={orientation}>
                    <button
                        onClick={onConvert}
                        disabled={isConverting}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-sm transition-all text-sm shrink-0",
                            isVertical ? "flex-col p-2 px-1 text-[9px] gap-1 w-14 h-auto aspect-square justify-center leading-none" : "ml-auto",
                            isConverting
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#28426d] text-white hover:bg-[#1e3252] hover:shadow-md active:scale-95"
                        )}
                    >
                        {isConverting ? (
                            <Loader2 className="animate-spin" size={isVertical ? 18 : 18} />
                        ) : (
                            <ArrowRightLeft size={isVertical ? 18 : 18} />
                        )}
                        <span>{t("toolbar.convert")}</span>
                    </button>
                </Tooltip>
            )}

            {/* Help Button - New */}
            {onHelp && (
                <>
                    <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />
                    <Tooltip text={t("toolbar.help")} orientation={orientation}>
                        <button
                            onClick={onHelp}
                            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <HelpCircle size={22} />
                        </button>
                    </Tooltip>
                </>
            )}
        </div>
    );
}

// Simple Tooltip Component with Delay
function Tooltip({ text, children, disabled, orientation = "horizontal" }: { text: string, children: React.ReactNode, disabled?: boolean, orientation?: "horizontal" | "vertical" }) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (disabled) return;
        timeoutRef.current = setTimeout(() => setIsVisible(true), 1000); // 1s delay
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    if (disabled && isVisible) setIsVisible(false);

    const isVertical = orientation === "vertical";
    // Vertical Mode (Toolbar on Left) -> Tooltip on Right
    // Horizontal Mode (Toolbar on Top) -> Tooltip on Bottom

    return (
        <div className="relative flex flex-col items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
            {isVisible && (
                <div className={clsx(
                    "absolute px-3 py-1.5 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[200] animate-in fade-in zoom-in-95 pointer-events-none",
                    isVertical
                        ? "top-1/2 -translate-y-1/2 left-full ml-2" // Right side
                        : "top-full mt-2" // Bottom side
                )}>
                    {text}
                    {/* Arrow */}
                    <div className={clsx(
                        "absolute w-2 h-2 bg-slate-800 rotate-45",
                        isVertical
                            ? "top-1/2 -translate-y-1/2 -left-1" // Arrow on left of tooltip
                            : "-top-1 left-1/2 -translate-x-1/2" // Arrow on top of tooltip
                    )} />
                </div>
            )}
        </div>
    );
}
