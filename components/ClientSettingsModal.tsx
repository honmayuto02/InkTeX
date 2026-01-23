"use client";

import React from "react";
import { X, Hand, Globe, Check, BookOpen } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { clsx } from "clsx";

interface ClientSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    palmRejection: boolean;
    onTogglePalmRejection: () => void;
    onOpenCalibration: () => void;
}

export function ClientSettingsModal({ isOpen, onClose, palmRejection, onTogglePalmRejection, onOpenCalibration }: ClientSettingsModalProps) {
    const { lang, setLang, t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        {t("settings.title")}
                    </h3>
                    <button onClick={onClose} className="p-1 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Palm Rejection */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                            <Hand size={18} />
                            <span>{t("settings.palm")}</span>
                        </div>
                        <button
                            onClick={onTogglePalmRejection}
                            className={clsx(
                                "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                palmRejection
                                    ? "bg-blue-50 border-blue-500/30 text-blue-700"
                                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            )}
                        >
                            <span className="font-bold">
                                {palmRejection ? t("settings.palm_on") : t("settings.palm_off")}
                            </span>
                            <div className={clsx(
                                "w-12 h-7 rounded-full relative transition-colors shadow-inner",
                                palmRejection ? "bg-blue-600" : "bg-slate-200"
                            )}>
                                <div className={clsx(
                                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                                    palmRejection ? "left-6" : "left-1"
                                )} />
                            </div>
                        </button>
                    </div>

                    {/* Calibration (New) */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                            <BookOpen size={18} />
                            <span>{t("cal.title")}</span>
                        </div>
                        <button
                            onClick={onOpenCalibration}
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 bg-white border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 transition-all font-bold"
                        >
                            <span>{t("cal.desc")}</span>
                            <BookOpen size={20} />
                        </button>
                    </div>

                    {/* Language */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold">
                            <Globe size={18} />
                            <span>{t("settings.language")}</span>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-xl">
                            <button
                                onClick={() => setLang("ja")}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    lang === "ja"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <span>日本語</span>
                                {lang === "ja" && <Check size={16} />}
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={clsx(
                                    "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    lang === "en"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <span>English</span>
                                {lang === "en" && <Check size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
