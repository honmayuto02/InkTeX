"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "./contexts/LanguageContext";
import { clsx } from "clsx";

interface Feature {
    titleKey: string;
    descriptionKey: string;
    image: string;
}

const features: Feature[] = [
    {
        titleKey: "feature.handwriting.title",
        descriptionKey: "feature.handwriting.desc",
        image: "/images/feature-1.png",
    },
    {
        titleKey: "feature.mobile.title",
        descriptionKey: "feature.mobile.desc",
        image: "/images/feature-2.png",
    },
    {
        titleKey: "feature.calibration.title",
        descriptionKey: "feature.calibration.desc",
        image: "/images/feature-3.png",
    },
    {
        titleKey: "feature.copy.title",
        descriptionKey: "feature.copy.desc",
        image: "/images/feature-4.png",
    },
];

export function FeatureSection() {
    const { t } = useLanguage();

    return (
        <section className="flex flex-col">
            {features.map((feature, index) => {
                const isEven = index % 2 === 0;
                return (
                    <div
                        key={index}
                        className={clsx(
                            "py-20 md:py-24 px-6 md:px-12 w-full",
                            isEven ? "bg-white" : "bg-slate-50"
                        )}
                    >
                        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">

                            {/* Image Container */}
                            <div className={clsx(
                                "flex-1 w-full flex justify-center",
                                // On Desktop: Swap order. Even (0, 2) = Image Left. Odd (1, 3) = Image Right.
                                // Mobile: Always Image Top (Order 1), Text Bottom (Order 2) handled by flex-col default
                                isEven ? "md:order-1" : "md:order-2"
                            )}>
                                <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                                    {/* Placeholder Logic: Usually we use next/image. 
                                        Since images don't exist yet, we show a nice fallback or try to load. 
                                        We'll use standard Image component but it will break if file missing.
                                        So for now, I'll add a colored placeholder fallback if image fails or just a styled div.
                                        For this task, I will use Next/Image as requested but wrapping in a way that looks okay if empty?
                                        Actually user said "Placeholders path... (replace later)". So standard Image is correct.
                                    */}
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse" /> {/* Loading skeleton behind */}
                                    <Image
                                        src={feature.image}
                                        alt={t(feature.titleKey)}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            // Fallback visualization if needed, but usually better to let user provide images
                                            (e.target as HTMLImageElement).style.opacity = "0.5";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Text Container */}
                            <div className={clsx(
                                "flex-1 w-full space-y-4 text-center md:text-left",
                                isEven ? "md:order-2" : "md:order-1"
                            )}>
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                    {t(feature.titleKey)}
                                </h3>
                                <p className="text-base text-slate-600 leading-relaxed">
                                    {t(feature.descriptionKey)}
                                </p>
                            </div>

                        </div>
                    </div>
                );
            })}
        </section>
    );
}
