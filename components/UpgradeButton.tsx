"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface UpgradeButtonProps {
    className?: string;
    variant?: "small" | "large";
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ className = "", variant = "small" }) => {
    const router = useRouter();
    const { t } = useLanguage();

    const handleClick = () => {
        router.push("/pricing");
    };

    if (variant === "large") {
        return (
            <button
                onClick={handleClick}
                className={`group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:from-indigo-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
            >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>{t("btn.upgrade")}</span>
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-sm hover:shadow-md hover:from-indigo-400 hover:to-blue-400 transition-all ${className}`}
        >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRO</span>
        </button>
    );
};
