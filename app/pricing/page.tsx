"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft, Star } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

function PricingContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [tier, setTier] = React.useState<string>('free');
    const [loading, setLoading] = React.useState(true);

    // Auto-checkout effect
    React.useEffect(() => {
        const autoCheckoutPlan = searchParams.get('auto_checkout');
        if (autoCheckoutPlan && (autoCheckoutPlan === 'monthly' || autoCheckoutPlan === 'yearly')) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    // Slight delay to ensure UI is ready
                    setTimeout(() => handleCheckout(autoCheckoutPlan), 500);
                    // Clear param to prevent loop (optional, but good UX)
                    // router.replace('/pricing'); 
                }
            });
        }
    }, [searchParams]);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
                    .then(({ data }) => {
                        setTier(data?.subscription_tier || 'free');
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        });
    }, []);

    const handleCheckout = async (plan: 'monthly' | 'yearly') => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Redirect with auto_checkout param
                const redirectUrl = new URL(window.location.href);
                redirectUrl.searchParams.set('auto_checkout', plan);

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: redirectUrl.toString() }
                });
                if (error) alert("Login failed");
                return;
            }

            const priceId = plan === 'monthly'
                ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
                : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY;

            if (!priceId) {
                alert("System Configuration Error: Price ID missing");
                return;
            }

            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    priceId,
                    returnUrl: window.location.origin
                })
            });

            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert("Checkout failed: " + (data.error || "Unknown error"));

        } catch (e) {
            console.error(e);
            alert("Failed to start checkout process");
        }
    }


    const handlePortal = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: { "Authorization": `Bearer ${session.access_token}` },
                body: JSON.stringify({ returnUrl: window.location.href })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / Nav */}
            <header className="px-6 py-4">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    {t("pricing.top")}
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        {t("pricing.title")}
                    </h1>
                    <p className="text-lg text-slate-600">
                        {t("pricing.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-500 uppercase tracking-wider mb-2">Free</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900">¥0</span>
                                <span className="text-slate-500">{t("pricing.duration.month")}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">{t("pricing.free.desc")}</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            <FeatureItem active={true} text={t("pricing.free.f1")} />
                            <FeatureItem active={false} text={t("pricing.free.f2")} />
                            <FeatureItem active={true} text={t("pricing.free.f3")} />
                            <FeatureItem active={true} text={t("pricing.free.f4")} />
                        </div>

                        <button
                            onClick={tier === 'pro' ? handlePortal : undefined}
                            disabled={tier === 'free'}
                            className={`w-full py-3 px-4 font-bold rounded-xl transition-colors ${tier === 'free'
                                ? "bg-slate-100 text-slate-400 cursor-default"
                                : "bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                        >
                            {tier === 'free' ? t("pricing.current") : t("pricing.manage")}
                        </button>
                    </div>

                    {/* Pro Monthly */}
                    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-lg flex flex-col relative overflow-hidden h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("pricing.pro.title")}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900">¥320</span>
                                <span className="text-slate-500">{t("pricing.duration.month")}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">{t("pricing.pro.desc")}</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            <FeatureItem active={true} text={t("pricing.pro.f1")} highlighted />
                            <FeatureItem active={true} text={t("pricing.pro.f2")} highlighted />
                            <FeatureItem active={true} text={t("pricing.pro.f3")} />
                            <FeatureItem active={true} text={t("pricing.pro.f4")} />
                        </div>

                        <button
                            onClick={() => tier !== 'pro' && handleCheckout('monthly')}
                            disabled={tier === 'pro'}
                            className={`w-full py-3 px-4 border-2 font-bold rounded-xl transition-all ${tier === 'pro'
                                ? "bg-indigo-50 border-indigo-200 text-indigo-400 cursor-default"
                                : "bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                }`}
                        >
                            {tier === 'pro' ? t("pricing.current") : t("pricing.choose_monthly")}
                        </button>
                    </div>

                    {/* Pro Yearly */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-indigo-600 shadow-xl flex flex-col relative overflow-hidden h-full z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        {/* Recommended Badge */}
                        <div className="absolute top-0 inset-x-0 bg-indigo-600 text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1">
                            <Star size={12} fill="currentColor" />
                            {t("pricing.year.rec")}
                        </div>

                        <div className="mt-6 mb-6">
                            <h3 className="text-lg font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("pricing.year.title")}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-slate-900">¥2,980</span>
                                <span className="text-slate-500">{t("pricing.duration.year")}</span>
                            </div>
                            <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1">
                                <span>{t("pricing.year.save")}</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{t("pricing.year.save_badge")}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{t("pricing.year.monthly")}</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            <FeatureItem active={true} text={t("pricing.year.f1")} highlighted />
                            <FeatureItem active={true} text={t("pricing.year.f2")} highlighted />
                            <FeatureItem active={true} text={t("pricing.year.f3")} />
                        </div>

                        <button
                            onClick={() => tier !== 'pro' && handleCheckout('yearly')}
                            disabled={tier === 'pro'}
                            className={`w-full py-3 px-4 font-bold rounded-xl shadow-lg transition-all ${tier === 'pro'
                                ? "bg-slate-100 text-slate-400 shadow-none cursor-default"
                                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white hover:shadow-indigo-500/30"
                                }`}
                        >
                            {tier === 'pro' ? t("pricing.current") : t("pricing.choose_yearly")}
                        </button>
                    </div>
                </div>

                <p className="mt-16 text-sm text-slate-400">
                    {t("pricing.tax_note")}
                </p>
            </main>
        </div>
    );
}

function FeatureItem({ text, active, highlighted = false }: { text: string, active: boolean, highlighted?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            {active ? (
                <div className={`p-0.5 rounded-full ${highlighted ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-600"}`}>
                    <Check size={14} strokeWidth={3} />
                </div>
            ) : (
                <div className="p-0.5 rounded-full bg-slate-100 text-slate-400">
                    <X size={14} strokeWidth={3} />
                </div>
            )}
            <span className={`text-sm ${highlighted ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                {text}
            </span>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
            <PricingContent />
        </Suspense>
    );
}
