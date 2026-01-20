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
        ? "absolute bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-white/95 backdrop-blur shadow-xl rounded-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        : "w-full bg-transparent";

    return (
        <div className={clsx(containerInfo, className)}>
            {!compact && (
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">{t("result.title")}</h3>
                    <div className="flex items-center gap-2">
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
            <div className={clsx("overflow-y-auto", compact ? "p-3 space-y-2" : "max-h-[60vh] md:max-h-[400px] p-4 space-y-4")}>

                {!isEditing ? (
                    <>
                        {/* Rendered Math */}
                        <div
                            className={clsx("flex justify-center items-center", compact ? "py-1 min-h-[40px]" : "py-4 min-h-[80px]")}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />

                        {/* Code Block */}
                        <div className={clsx("bg-slate-900 rounded-lg relative group", compact ? "p-2" : "p-3")}>
                            {compact && (
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-1 right-1 text-slate-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy Source"
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            )}
                            <code className={clsx("text-slate-100 font-mono break-all whitespace-pre-wrap block", compact ? "text-xs max-h-16 overflow-y-auto" : "text-sm")}>
                                {latex}
                            </code>
                        </div>

                        {/* Feedback Trigger - Hide in compact */}
                        {!compact && (
                            <div className="mt-2 text-center">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors"
                                >
                                    <Edit3 size={12} />
                                    {t("result.feedback_trigger")}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="text-xs font-bold text-slate-500">{t("result.feedback_prompt")}</div>
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
    );
}
