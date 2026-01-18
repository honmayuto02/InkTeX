"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ErrorPopupProps {
    message: string | null;
    onClose: () => void;
}

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
    useEffect(() => {
        if (message) {
            // Auto-dismiss after 5 seconds if desired, but user asked for "Large Popup", maybe manual close is better.
            // Let's keep manual close for visibility.
        }
    }, [message]);

    if (!message) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[100] animate-in slide-in-from-top-full duration-300">
            <div className="mx-auto mt-4 max-w-2xl px-4">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-2xl p-6 flex items-start gap-4 relative">
                    <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-800 mb-1">エラーが発生しました</h3>
                        <p className="text-red-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
