"use client";

import React, { useState, useRef } from "react";

export function Tooltip({ text, children, placement = "bottom-end" }: { text: string, children: React.ReactNode, placement?: "bottom-start" | "bottom-end" | "bottom" }) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => setIsVisible(true), 1000); // 1s delay
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    // Position classes
    let positionClass = "right-0";
    let arrowClass = "right-4";

    if (placement === "bottom-start") {
        positionClass = "left-0";
        arrowClass = "left-4";
    } else if (placement === "bottom") {
        positionClass = "left-1/2 -translate-x-1/2";
        arrowClass = "left-1/2 -translate-x-1/2";
    }

    return (
        <div className="relative flex flex-col items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {children}
            {isVisible && (
                <div className={`absolute top-full mt-2 ${positionClass} px-3 py-1.5 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-[200] animate-in fade-in zoom-in-95 pointer-events-none`}>
                    {text}
                    {/* Arrow */}
                    <div className={`absolute -top-1 ${arrowClass} w-2 h-2 bg-slate-800 rotate-45`} />
                </div>
            )}
        </div>
    );
}
