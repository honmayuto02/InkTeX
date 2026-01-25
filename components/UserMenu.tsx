"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/contexts/LanguageContext";


interface UserMenuProps {
    variant?: "dark" | "light";
}

export const UserMenu = ({ variant = "dark" }: UserMenuProps) => {
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [usage, setUsage] = useState<number | null>(null);
    const [tier, setTier] = useState<string | null>(null);
    const [cancelAtEnd, setCancelAtEnd] = useState<boolean>(false);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [guestUsage, setGuestUsage] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load Guest Usage
    const loadGuestUsage = () => {
        const saved = localStorage.getItem("inktex_guest_usage");
        setGuestUsage(saved ? parseInt(saved, 10) : 0);
    };

    useEffect(() => {
        loadGuestUsage();
        const handleUpdate = () => loadGuestUsage();
        window.addEventListener("inktex_guest_usage_updated", handleUpdate);
        return () => window.removeEventListener("inktex_guest_usage_updated", handleUpdate);
    }, []);

    // Fetch profile on user load
    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('usage_count, subscription_tier, cancel_at_period_end, current_period_end')
                .eq('id', user.id)
                .single()
                .then(({ data, error }) => {
                    if (data) {
                        setUsage(data.usage_count ?? 0);
                        setTier(data.subscription_tier ? data.subscription_tier.toLowerCase() : 'free');
                        setCancelAtEnd(data.cancel_at_period_end);
                        setEndDate(data.current_period_end);
                    } else {
                        // Fallback if profile doesn't exist yet (latency in trigger or error)
                        console.warn("Profile missing, defaulting to free:", error);
                        setTier('free');
                        setUsage(0);
                    }
                });
        }
    });
}
    }, [user]);

// Listen for real-time usage updates from page.tsx
useEffect(() => {
    const handleUserUsageUpdate = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && typeof customEvent.detail.usage === 'number') {
            setUsage(customEvent.detail.usage);
        }
    };
    window.addEventListener("inktex_user_usage_updated", handleUserUsageUpdate);
    return () => window.removeEventListener("inktex_user_usage_updated", handleUserUsageUpdate);
}, []);

const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
};

const handleLogin = () => {
    router.push("/login");
};

// Common Meter Component
const UsageMeter = ({ count, limit }: { count: number, limit: number }) => (
    <div className="mt-3 text-xs text-slate-500">
        <div className="flex justify-between mb-1.5 items-end">
            <span className="font-medium text-slate-400">{t("menu.monthly_usage")}</span>
            <span className={count >= limit ? "text-red-500 font-bold" : "text-slate-700 font-mono"}>
                {count} <span className="text-slate-400">/ {limit}</span>
            </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-100">
            <div
                className={`h-full rounded-full transition-all duration-500 ${count >= limit ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min((count / limit) * 100, 100)}%` }}
            />
        </div>
        {count >= limit && (
            <p className="mt-1.5 text-red-500 font-bold text-[10px]">
                Limit reached. {user ? "Please upgrade to Pro." : "Please login."}
            </p>
        )}
    </div>
);

return (
    <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all shadow-sm ${tier === 'pro'
                ? "bg-white border-2 border-indigo-600"
                : "bg-white border-transparent hover:bg-slate-50"
                }`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border transition-all ${tier === 'pro'
                ? "border-2 border-indigo-600 ring-2 ring-indigo-100"
                : "border-transparent bg-slate-100"
                }`}>
                {user?.user_metadata.avatar_url ? (
                    <img
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-500">
                        <UserIcon size={16} />
                    </div>
                )}
            </div>
            <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate hidden md:block">
                {user ? (user.user_metadata.full_name || user.email) : "Guest"}
            </span>
        </button>

        {
            isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("menu.account")}</p>
                            <p className="text-sm text-slate-900 truncate font-medium mt-1 mb-2">
                                {user ? user.email : t("menu.guest")}
                            </p>

                            {/* Usage Meter Logic */}
                            {user ? (
                                <>
                                    {tier === 'free' && (
                                        <>
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-600">
                                                FREE PLAN
                                            </div>
                                            {usage !== null && <UsageMeter count={usage} limit={20} />}
                                        </>
                                    )}
                                    {tier === 'pro' && (
                                        <div className="text-left">
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">
                                                PRO PLAN
                                            </div>
                                            {cancelAtEnd && endDate && (
                                                <p className="text-[10px] text-slate-500 font-medium mt-1">
                                                    {t("menu.ends_on")} {new Date(endDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Guest Usage
                                <UsageMeter count={guestUsage} limit={5} />
                            )}
                        </div>

                        <div className="p-1">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <LogOut size={16} />
                                    <span>{t("btn.logout")}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                                >
                                    <LogIn size={16} />
                                    <span>{t("btn.login")}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )
        }
    </div >
);
};
