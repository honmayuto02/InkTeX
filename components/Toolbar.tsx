import React, { useState, useEffect, useRef } from "react";
import { Pen, Eraser, Trash2, ArrowRightLeft, Loader2, Info, Undo2, Redo2, HelpCircle, Settings, X } from "lucide-react";
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
    onSettings?: () => void;
    orientation?: "horizontal" | "vertical";
    showTooltip?: boolean;
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
    onSettings,
    orientation = "horizontal",
    showTooltip = true
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
    // Popup Styles
    // Use fixed positioning centered on screen for mobile robustness, or near button for desktop?
    // User requested fix for "hidden" popups. Fixed centering is safest.
    // Note: We use a simple centered modal style for the popup to avoid overflow issues.
    const popupBaseClasses = "toolbar-popup fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 w-72 z-[9999] flex flex-col gap-4 animate-in fade-in zoom-in-95";
    // Overlay for closing
    const Overlay = () => (
        <div className="fixed inset-0 bg-black/20 z-[9990] backdrop-blur-[1px]" onClick={() => setActivePopup(null)} />
    );

    return (
        <div className={twMerge(
            "flex items-center gap-4 px-4 overflow-x-auto no-scrollbar",
            // Reduced padding and gap for vertical mode, allow wrap/scroll on small screens
            // Tablet/Desktop: justify-evenly to spread buttons
            // FIX: Use h-full and justify-start for vertical mode to ensure scrolling works on short screens (landscape phone)
            isVertical
                ? "flex-col h-full py-2 w-full gap-3 px-0.5 justify-start overflow-y-auto overflow-x-hidden"
                : "h-full flex-row whitespace-nowrap md:justify-evenly md:overflow-visible",
            className
        )}>
            {/* Overlay if popup active */}
            {activePopup && <Overlay />}

            {/* Pen Tool */}
            <div className="relative flex flex-col items-center flex-shrink-0">
                <Tooltip text={t("tip.pen")} disabled={!showTooltip || !!activePopup} orientation={orientation}>
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
                    <div className={popupBaseClasses}>
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t("toolbar.size")}</div>
                            <button onClick={() => setActivePopup(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="flex justify-between bg-slate-100 p-2 rounded-xl">
                            {PenSizes.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-lg flex items-center justify-center transition-all",
                                        size === s ? "bg-white shadow text-blue-600 ring-1 ring-blue-100" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <div className="bg-current rounded-full" style={{ width: s * 2, height: s * 2 }} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Eraser Tool */}
            <div className="relative flex flex-col items-center flex-shrink-0">
                <Tooltip text={t("tip.eraser")} disabled={!showTooltip || !!activePopup} orientation={orientation}>
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
                    <div className={popupBaseClasses}>
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t("toolbar.eraserSize")}</div>
                            <button onClick={() => setActivePopup(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="flex justify-between bg-slate-100 p-2 rounded-xl">
                            {EraserSizes.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-lg flex items-center justify-center transition-all",
                                        size === s ? "bg-white shadow text-blue-600 ring-1 ring-blue-100" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <div className="bg-slate-300 rounded-full" style={{ width: s / 1.5, height: s / 1.5 }} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />

            {/* Undo */}
            <Tooltip text={t("tip.undo")} orientation={orientation} disabled={!showTooltip}>
                <button
                    onClick={onUndo}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Undo2 size={22} strokeWidth={2.5} />
                </button>
            </Tooltip>

            {/* Redo */}
            <Tooltip text={t("tip.redo")} orientation={orientation} disabled={!showTooltip}>
                <button
                    onClick={onRedo}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full hover:text-blue-600 transition-colors"
                >
                    <Redo2 size={22} strokeWidth={2.5} />
                </button>
            </Tooltip>

            <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />

            {/* Clear */}
            <Tooltip text={t("tip.clear")} orientation={orientation} disabled={!showTooltip}>
                <button
                    onClick={onClear}
                    className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                    <Trash2 size={22} />
                </button>
            </Tooltip>

            {/* Convert - Optional */}
            {onConvert && showConvert !== false && (
                <Tooltip text={t("tip.convert")} orientation={orientation} disabled={!showTooltip}>
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

            {/* Settings Button (New) */}
            {onSettings && (
                <div className="relative flex flex-col items-center flex-shrink-0">
                    <Tooltip text={t("header.settings")} disabled={!showTooltip} orientation={orientation}>
                        <button
                            onClick={onSettings}
                            className="p-3 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <Settings size={22} />
                        </button>
                    </Tooltip>
                </div>
            )}

            {/* Help Button - New */}
            {onHelp && (
                <>
                    <div className={clsx("bg-slate-200 shrink-0", isVertical ? "w-8 h-px my-1" : "w-px h-8 mx-2")} />
                    <Tooltip text={t("toolbar.help")} orientation={orientation} disabled={!showTooltip}>
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
