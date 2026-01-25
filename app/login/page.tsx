"use client";

import LoginButton from "@/components/LoginButton";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function LoginPage() {
    const [user, setUser] = useState<User | null>(null);

    // Example of Auth State Monitoring
    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // 2. Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session) {
                console.log("Logged in as:", session.user.email);
                // You could redirect here if not handled by button logic
                // router.push('/'); 
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    InkTeX アカウント
                </h1>

                <p className="text-slate-600">
                    ログインして、セッション履歴を同期したり<br />設定を保存したりしましょう。
                </p>

                {user ? (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                        <p>ログイン済み: {user.email}</p>
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="mt-4 text text-sm underline hover:no-underline"
                        >
                            ログアウト
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <LoginButton />
                    </div>
                )}
            </div>
        </div>
    );
}
