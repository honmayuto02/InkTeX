"use client";

import React from "react";
import "katex/dist/katex.min.css";
// We can use a simple wrapper or dangerouslySetInnerHTML with katex.renderToString
import katex from "katex";
import { Copy, Check, X, Edit3, Send } from "lucide-react";
import { clsx } from "clsx";
import { useLanguage } from "./contexts/LanguageContext";

interface ResultDisplayProps {
    latex: string;
    onClose?: () => void;
    onFeedback?: (corrected: string) => void;
    variant?: "floating" | "inline";
    compact?: boolean;
    className?: string;
}

export function ResultDisplay({ latex, onClose, onFeedback, variant = "floating", compact = false, className }: ResultDisplayProps) {
    const { t } = useLanguage();
    const [copied, setCopied] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(latex);

    // Expand State - New
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Reset edit value when latex changes
    React.useEffect(() => {
        setEditValue(latex);
        setIsEditing(false); // Reset mode on new result
    }, [latex]);

    const handleCopy = () => {
        navigator.clipboard.writeText(latex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Render LaTeX to HTML string
    const html = React.useMemo(() => {
        if (!latex) return "";
        try {
            return katex.renderToString(latex, {
                throwOnError: false,
                displayMode: true,
            });
        } catch (e) {
            return "Error rendering LaTeX";
        }
    }, [latex]);

    if (!latex) return null;

    const containerInfo = variant === "floating"
        ? clsx(
            "absolute bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 bg-white/95 backdrop-blur shadow-xl rounded-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transition-all ease-in-out",
            isExpanded ? "md:w-[800px] md:max-w-[90vw]" : "md:w-96"
        )
        : "w-full bg-transparent relative flex flex-col h-full";

    return (
        <div className={clsx(containerInfo, className, "text-slate-900")}>
            {!compact && (
                <div
                    className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => variant === "floating" && setIsExpanded(!isExpanded)}
                    title={variant === "floating" ? (isExpanded ? "Collapse" : "Expand") : ""}
                >
                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        {t("result.title")}
                        {variant === "floating" && (
                            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                                {isExpanded ? "Minimize" : "Expand"}
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
                        >
                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            {copied ? "COPY OK" : "COPY"}
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className={clsx(
                "custom-scrollbar w-full",
                // Inline mode: Flex column layout for centering, but allow scroll if overflow
                variant === "inline" ? "flex-1 flex flex-col min-h-0 pb-10 overflow-y-auto" : "overflow-y-auto",
                compact ? "p-3 space-y-2" : (variant === "inline" ? "p-3 gap-2" : clsx("p-4 space-y-4 pb-12 transition-all", isExpanded ? "max-h-[80vh]" : "max-h-[60vh] md:max-h-[400px]"))
            )}>

                {/* Always show content */}
                <div>
                    {/* Rendered Math - Centered in Inline Mode */}
                    <div
                        className={clsx(
                            "flex justify-center items-center overflow-x-auto custom-scrollbar-horizontal w-full",
                            variant === "inline" ? "flex-1 min-h-0 my-auto" : (compact ? "py-1 min-h-[40px]" : "py-4 min-h-[80px]")
                        )}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />

                    {/* Code Block */}
                    <div className={clsx("bg-slate-900 rounded-lg relative group flex-none", compact ? "p-2" : "p-3")}>
                        {compact && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-1 right-1 text-slate-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Copy Source"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                        )}
                        <code className={clsx("text-slate-100 font-mono break-all whitespace-pre-wrap block w-full custom-scrollbar",
                            compact ? "text-xs max-h-16 overflow-y-auto" : (variant === "inline" ? "text-sm max-h-24 overflow-y-auto" : "text-sm")
                        )}>
                            {latex}
                        </code>
                    </div>
                </div>

                {/* Feedback Form - Shown BELOW content */}
                {isEditing && (
                    <div className="pt-4 border-t border-slate-100 mt-2 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200 pb-2">
                        <div className="text-xs font-bold text-slate-500">{t("result.feedback_prompt")}</div>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="\int..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {t("result.cancel")}
                            </button>
                            <button
                                onClick={() => {
                                    if (onFeedback) onFeedback(editValue);
                                    setIsEditing(false);
                                }}
                                className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send size={12} />
                                {t("result.feedback_submit")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with Feedback Button - Fixed at bottom if needed */}
            {!compact && !isEditing && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/95 backdrop-blur border-t border-slate-100 flex justify-center z-10">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full flex items-center justify-center gap-1 transition-colors px-4 py-1"
                    >
                        <Edit3 size={12} />
                        {t("result.feedback_trigger")}
                    </button>
                </div>
            )}
        </div>
    );
}
