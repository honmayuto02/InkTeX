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
                        className="py-20 md:py-24 px-6 md:px-12 w-full bg-white"
                    >
                        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">

                            {/* Image Container */}
                            <div className={clsx(
                                "flex-1 w-full flex justify-center",
                                isEven ? "md:order-1" : "md:order-2"
                            )}>
                                <div className="relative w-full max-w-[1000px] aspect-[16/9] rounded-2xl overflow-hidden">
                                    {/* Placeholder Logic Removed as requested */}
                                    <Image
                                        src={feature.image}
                                        alt={t(feature.titleKey)}
                                        fill
                                        className="object-contain"
                                        onError={(e) => {
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
