import React from "react";
import { X, Smartphone, Edit3, ArrowRightLeft, Copy } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#28426d] p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="bg-white/20 p-1 rounded-md text-sm">?</span>
                        {t("help.title")}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    <div className="space-y-4">
                        <StepItem
                            icon={<Edit3 className="text-blue-600" />}
                            num={1}
                            title={t("help.step1.title")}
                            desc={t("help.step1.desc")}
                        />
                        <StepItem
                            icon={<ArrowRightLeft className="text-green-600" />}
                            num={2}
                            title={t("help.step2.title")}
                            desc={t("help.step2.desc")}
                        />
                        <StepItem
                            icon={<Copy className="text-purple-600" />}
                            num={3}
                            title={t("help.step3.title")}
                            desc={t("help.step3.desc")}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 text-sm mb-1">{t("help.sync.title")}</h3>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {t("help.sync.desc")}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-[#28426d] hover:bg-[#1e3252] text-white rounded-full font-bold shadow-md transition-all active:scale-95"
                    >
                        {t("cal.close")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepItem({ icon, num, title, desc }: { icon: React.ReactNode, num: number, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="relative flex-none">
                <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center">
                    {icon}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {num}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-1">{desc}</p>
            </div>
        </div>
    );
}
