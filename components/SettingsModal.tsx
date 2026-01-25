"use client";

import React from "react";
import { X, Languages, Clipboard, Check, Hand, Zap } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { clsx } from "clsx";

interface SettingsModalProps {
    onClose: () => void;
    autoCopy: boolean;
    onToggleAutoCopy: () => void;
    palmRejection?: boolean;
    onTogglePalmRejection?: () => void;
}

export function SettingsModal({ onClose, autoCopy, onToggleAutoCopy, palmRejection, onTogglePalmRejection }: SettingsModalProps) {
    const { t, lang, setLang } = useLanguage();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        {t("settings.title")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Palm Rejection Setting */}
                    {onTogglePalmRejection && typeof palmRejection === "boolean" && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                                <Hand size={18} />
                                <span>{t("settings.palm")}</span>
                            </div>
                            <button
                                onClick={onTogglePalmRejection}
                                className={clsx(
                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                                    palmRejection
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                )}
                            >
                                <span className="font-bold text-sm">
                                    {palmRejection ? t("settings.palm_on") : t("settings.palm_off")}
                                </span>
                                <div className={clsx(
                                    "w-10 h-6 rounded-full relative transition-colors shadow-inner",
                                    palmRejection ? "bg-blue-600" : "bg-slate-300"
                                )}>
                                    <div className={clsx(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                        palmRejection ? "left-5" : "left-1"
                                    )} />
                                </div>
                            </button>
                        </div>
                    )}



                    {/* Auto Copy Setting */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                            <Clipboard size={18} />
                            <span>{t("settings.auto_copy")}</span>
                        </div>
                        <button
                            onClick={onToggleAutoCopy}
                            className={clsx(
                                "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                                autoCopy
                                    ? "bg-blue-50 border-blue-300 text-blue-700"
                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            )}
                        >
                            <span className="font-bold text-sm">
                                {autoCopy ? "ON" : "OFF"}
                            </span>
                            <div className={clsx(
                                "w-10 h-6 rounded-full relative transition-colors shadow-inner",
                                autoCopy ? "bg-blue-600" : "bg-slate-300"
                            )}>
                                <div className={clsx(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                    autoCopy ? "left-5" : "left-1"
                                )} />
                            </div>
                        </button>
                    </div>

                    {/* Language Setting */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                            <Languages size={18} />
                            <span>{t("settings.language")}</span>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setLang("ja")}
                                className={clsx(
                                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                                    lang === "ja" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                日本語
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={clsx(
                                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                                    lang === "en" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                English
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        {t("settings.close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
