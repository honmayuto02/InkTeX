"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { clsx } from "clsx";

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={clsx(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        )}>
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-sm bg-opacity-95">
                <div className="bg-white/20 p-1 rounded-full">
                    <Check size={16} strokeWidth={3} />
                </div>
                <span className="font-bold text-sm tracking-wide">{message}</span>
            </div>
        </div>
    );
}
