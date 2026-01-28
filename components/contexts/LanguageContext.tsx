"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "ja" | "en";

interface Dictionary {
    [key: string]: {
        ja: string;
        en: string;
    };
}

const translations: Dictionary = {
    // Toolbar
    "toolbar.pen": { ja: "ペン", en: "Pen" },
    "toolbar.eraser": { ja: "消しゴム", en: "Eraser" },
    "toolbar.undo": { ja: "元に戻す", en: "Undo" },
    "toolbar.redo": { ja: "やり直す", en: "Redo" },
    "toolbar.clear": { ja: "消去", en: "Clear" },
    "toolbar.convert": { ja: "変換", en: "Convert" },
    "toolbar.size": { ja: "太さ", en: "Size" },
    "toolbar.eraserSize": { ja: "消しゴムの大きさ", en: "Eraser Size" },

    // Header
    "header.shutdown": { ja: "終了", en: "Shutdown" },
    "header.sync": { ja: "デバイス連携", en: "Device Sync" },
    "header.calibration": { ja: "キャリブレーション", en: "Calibration" },
    "header.settings": { ja: "設定", en: "Settings" },

    // Settings Modal
    "settings.title": { ja: "設定", en: "Settings" },
    "settings.language": { ja: "表示言語", en: "Language" },
    "settings.close": { ja: "閉じる", en: "Close" },
    "settings.palm": { ja: "パームリジェクション", en: "Palm Rejection" },
    "settings.palm_on": { ja: "オン (ペンのみ)", en: "On (Pen Only)" },
    "settings.palm_off": { ja: "オフ (タッチも反応)", en: "Off (Touch & Pen)" },
    "settings.auto_copy": { ja: "変換結果を自動コピー", en: "Auto Copy Result" },

    // Result
    "result.title": { ja: "変換結果", en: "Result" },
    "result.copy": { ja: "コピー", en: "Copy" },
    "result.copied": { ja: "コピー完了", en: "Copied!" },
    "result.copied_failed_bg": { ja: "自動コピーに失敗しました。サイトの設定で「クリップボード」を許可してください。", en: "Background copy failed. Allow 'Clipboard' in site settings." },
    "result.feedback_trigger": { ja: "結果が間違っている場合", en: "Report incorrect result" },
    "result.feedback_prompt": { ja: "正しいLaTeXを入力してください:", en: "Enter correct LaTeX:" },
    "result.feedback_submit": { ja: "AIに学習させる", en: "Teach AI" },
    "result.cancel": { ja: "キャンセル", en: "Cancel" },

    // Tips and Alerts
    "tip.pen": { ja: "ペンツール。クリックで太さや色を変更できます。", en: "Pen tool. Click to change size/color." },
    "tip.eraser": { ja: "消しゴム。クリックで大きさを変更できます。", en: "Eraser. Click to change size." },
    "tip.undo": { ja: "操作を元に戻します", en: "Undo last action" },
    "tip.redo": { ja: "操作をやり直します", en: "Redo last action" },
    "tip.clear": { ja: "キャンバスをすべて消去します", en: "Clear canvas" },
    "tip.convert": { ja: "手書き文字をAIでLaTeX形式に変換します", en: "Convert handwriting to LaTeX" },
    "tip.sync_soon": { ja: "デバイス連携モード (準備中)", en: "Device Sync (Coming Soon)" },
    "msg.clear_confirm": { ja: "キャンバスを消去しますか？", en: "Clear canvas?" },
    "msg.shutdown_confirm": { ja: "アプリケーションを終了しますか？", en: "Are you sure you want to shutdown?" },
    "msg.sync_unavailable": { ja: "デバイス連携モードは現在準備中です。\nComing soon...", en: "Device sync mode is coming soon..." },

    // Calibration
    "cal.title": { ja: "筆跡キャリブレーション", en: "Calibration" },
    "cal.desc": { ja: "AIにあなたの筆跡を学習させます", en: "Train AI with your handwriting style" },
    "cal.close": { ja: "閉じる", en: "Close" },
    "cal.section_select": { ja: "セクション選択", en: "Select Section" },
    "cal.save_next": { ja: "保存して次へ", en: "Save & Next" },
    "cal.reset_data": { ja: "学習データをリセット", en: "Reset Data" },
    "cal.example": { ja: "例", en: "Example" },
    "cal.area_label": { ja: "ここに大きく書いてください", en: "Draw Here" },
    "cal.sample_label": { ja: "見本を見て書く", en: "Copy the example" },
    "msg.cal_saved": { ja: "学習データを保存しました！", en: "Calibration saved!" },
    "msg.cal_reset": { ja: "学習データを削除しました。", en: "Calibration data reset." },
    "msg.cal_reset_confirm": { ja: "学習データを初期化しますか？", en: "Reset all calibration data?" },
    "msg.cal_next_section": { ja: "セクションが完了しました！次のセクションへ進みますか？", en: "Section completed! Proceed to next?" },
    "msg.cal_complete": { ja: "すべてのキャリブレーションが完了しました！", en: "All calibration sections completed!" },
    "msg.cal_storage_error": { ja: "保存に失敗しました。ストレージ容量が足りない可能性があります。", en: "Failed to save. Storage might be full." },
    "cal.skip": { ja: "スキップ", en: "Skip" },
    "cal.instruction_write": { ja: "以下の文字を右側のキャンバスに書いてください", en: "Write the character below on the right canvas" },

    // Calibration Sections
    "cal.sec.complex": { ja: "複雑な数式", en: "Complex Formulas" },
    "cal.desc.complex": { ja: "積分、極限、行列など、構造が複雑な数式の練習です。", en: "Practice complex structures like integrals and matrices." },
    "cal.sec.ambiguous": { ja: "紛らわしい記号", en: "Ambiguous Symbols" },
    "cal.desc.ambiguous": { ja: "AIが誤認識しやすい似た形の記号の書き分けを練習します。", en: "Practice distinguishing similar symbols." },
    "cal.sec.whiteout": { ja: "白抜き文字", en: "Blackboard Bold" },
    "cal.desc.whiteout": { ja: "\\mathbb{R} や \\mathbb{N} などの白抜き文字（黒板太字）の練習です。", en: "Practice Blackboard Bold characters like \\mathbb{R}." },
    "cal.sec.special": { ja: "特殊文字", en: "Special Characters" },
    "cal.desc.special": { ja: "\\mathfrak{g} (フラクトゥール) や \\mathcal{H} (花文字) などの特殊なフォントの練習です。", en: "Practice special fonts like Fraktur and Calligraphic." },

    // Errors
    "err.rate_limit_title": { ja: "アクセス集中", en: "High Traffic" },
    "err.rate_limit_msg": { ja: "アクセス集中によりAIが応答できません。しばらく待ってから再試行してください。", en: "AI is busy due to high traffic. Please try again later." },
    "err.unexpected": { ja: "予期せぬエラーが発生しました。", en: "An unexpected error occurred." },
    // Help Modal
    "help.title": { ja: "InkTeXの使い方", en: "How to use InkTeX" },
    "help.step1.title": { ja: "数式を書く", en: "Write Formula" },
    "help.step1.desc": { ja: "マウスやタブレットを使って、キャンバスに数式を手書きします。", en: "Write a math formula on the canvas using mouse or tablet." },
    "help.step2.title": { ja: "変換ボタンを押す", en: "Convert" },
    "help.step2.desc": { ja: "ツールバーの「変換」ボタンをクリックすると、AIがLaTeXコードに変換します。", en: "Click the Convert button in the toolbar to generate LaTeX." },
    "help.step3.title": { ja: "コピーして利用", en: "Copy & Use" },
    "help.step3.desc": { ja: "表示されたLaTeXコードをコピーして、OverleafやWordなどで利用してください。", en: "Copy the result and use it in Overleaf, Word, etc." },
    "help.sync.title": { ja: "スマホ連携モード", en: "Device Sync Mode" },
    "help.sync.desc": { ja: "右上のスマホアイコンを押すと、PCをホスト（親機）として待機状態にできます。表示されるQRコードをスマホで読み取れば、手元のスマホをペンタブレット代わりに使えます。", en: "Click the phone icon to start Host mode. Scan the QR code with your phone to use it as an input tablet." },

    // FAQ
    "faq.title": { ja: "よくある質問 / FAQ", en: "FAQ" },
    "faq.subtitle": { ja: "InkTeXについて、よくいただくご質問にお答えします。", en: "Common questions about InkTeX." },
    "faq.q1": { ja: "無料で使えますか？", en: "Is it free?" },
    "faq.a1": { ja: "はい、InkTeXは基本的に無料で利用可能です。無料プランでは月に20回まで数式変換を試すことができます。無制限に利用したい場合はProプランをご検討ください。", en: "Yes, InkTeX is basically free to use. The Free plan allows up to 20 conversions per month. For unlimited usage, please consider the Pro plan." },
    "faq.q2": { ja: "スマホやタブレットでも使えますか？", en: "Does it work on mobile/tablet?" },
    "faq.a2": { ja: "はい、完全レスポンシブ対応です。iPadなどのタブレットで手書き入力し、PCでコードを受け取るといった連携機能も備えています。", en: "Yes, it is fully responsive. You can also use the Device Sync feature to write on a tablet and receive code on PC." },
    "faq.q3": { ja: "どのような数式に対応していますか？", en: "What math is supported?" },
    "faq.a3": { ja: "積分、微分、行列、シグマ、極限（lim）など、高校数学から大学レベルの複雑な数式まで、AIが文脈を判断してLaTeX化します。", en: "It supports everything from high school math to advanced university topics like integrals, matrices, limits, etc." },
    "faq.q4": { ja: "読み取り精度を上げるコツはありますか？", en: "How to improve accuracy?" },
    "faq.a4": { ja: "「筆跡キャリブレーション機能（ペンツールアイコン）」を使って自分の字のクセを登録すると、AIの認識精度が大幅に向上します。", en: "Use the 'Calibration' feature (pen tool icon) to register your handwriting style for better accuracy." },

    // Footer & Legal
    "footer.privacy": { ja: "プライバシーポリシー", en: "Privacy Policy" },
    "footer.commercial": { ja: "特定商取引法に基づく表記", en: "Legal / Commercial" },
    "footer.terms": { ja: "利用規約", en: "Terms of Use" },
    "footer.contact": { ja: "お問い合わせ", en: "Contact" },
    "host.title": { ja: "デバイス連携", en: "Device Sync" },
    "host.scan_qr": { ja: "QRコードを読み取って接続", en: "Scan QR code to connect" },
    "host.back": { ja: "戻る", en: "Back" },
    "host.manual_ip_title": { ja: "接続できない場合", en: "Connection Issues?" },
    "host.manual_ip_prompt": { ja: "PCのIPアドレスを入力してください：", en: "Enter PC IP Address:" },
    "host.manual_wifi_msg": { ja: "同じWi-Fi/ネットワークに接続してください", en: "Ensure devices are on the same Wi-Fi" },
    "host.manual_settings": { ja: "手動設定 (開発用)", en: "Manual Settings (Dev)" },
    "host.history_title": { ja: "受信履歴", en: "Received History" },
    "host.converting": { ja: "変換中...", en: "Converting..." },
    "host.waiting": { ja: "外部デバイスからの送信を待機しています...", en: "Waiting for device input..." },
    "host.waiting_hint": { ja: "QRコードを表示するには左上のボタンを押してください", en: "Click top-left button to show QR" },
    "host.connect_error": { ja: "セッションの作成に失敗しました。", en: "Failed to create session." },
    "host.pin_tooltip": { ja: "ピン留め (自動削除されません)", en: "Pin (Prevent auto-delete)" },
    "host.unpin_tooltip": { ja: "ピン留め解除", en: "Unpin" },
    "host.delete_tooltip": { ja: "削除", en: "Delete" },
    "host.panel_expand": { ja: "QRパネルを表示", en: "Show QR Panel" },
    "host.panel_collapse": { ja: "QRパネルを隠す", en: "Hide QR Panel" },

    // Host Resume / Manual
    "host.resume_title": { ja: "前回のセッション", en: "Previous Session" },
    "host.resume_btn": { ja: "再開 ID:", en: "Resume ID:" },
    "host.manual_id": { ja: "IDを手入力", en: "Enter ID manually" },
    "host.new_session": { ja: "新しいセッションを開始", en: "Start New Session" },
    "host.client_mode_btn": { ja: "この端末を入力デバイスとして使う", en: "Use as Input Device (Client)" },
    "host.client_mode_title": { ja: "入力デバイスモード", en: "Input Device Mode" },
    "host.client_mode_desc": { ja: "PCに表示されているセッションIDを入力してください", en: "Enter Session ID shown on PC" },
    "host.connect_btn": { ja: "接続する", en: "Connect" },

    // Client Page
    "client.confirm_clear": { ja: "キャンバスを消去しますか？", en: "Clear canvas?" },
    "client.error_empty": { ja: "キャンバスが空です", en: "Canvas is empty" },
    "client.error_upload": { ja: "アップロードに失敗しました", en: "Upload failed" },
    "client.error_send": { ja: "送信に失敗しました", en: "Failed to send" },
    "client.error_session_expired": { ja: "セッションが切れました。QRを読み直してください", en: "Session expired. Rescan QR." },
    "client.success_sent": { ja: "ホストに送信しました", en: "Sent to host!" },

    // Toolbar Help
    "toolbar.help": { ja: "使い方", en: "Help" },
    "footer.copyright": { ja: "© 2026 InkTeX Project. Powered by Google Gemini.", en: "© 2026 InkTeX Project. Powered by Google Gemini." },

    // Features
    "feature.handwriting.title": { ja: "直感的な手書き入力", en: "Intuitive Handwriting Input" },
    "feature.handwriting.desc": { ja: "マウスやペンで書くだけ。一瞬でLaTeXへ。複雑な数式コマンドを覚える必要はありません。キャンバスに手書きするだけで、AIが正確にLaTeXコードに変換します。", en: "Just write with your mouse or pen. Instantly convert to LaTeX. No need to memorize complex commands. AI accurately converts your drawing to code." },

    "feature.mobile.title": { ja: "スマホ・タブレット連携モード", en: "Mobile & Tablet Sync" },
    "feature.mobile.desc": { ja: "「書きづらい」を解消。スマホをペンタブ代わりに。マウスでの手書きが苦手ですか？QRコードでスマホやiPadと連携すれば、手元のタッチスクリーンで書いた数式が、PC画面にリアルタイムで同期されます。", en: "Turn your phone into a drawing tablet. Hate drawing with a mouse? Sync with your phone or iPad via QR code, and your handwriting appears on your PC screen in real-time." },

    "feature.calibration.title": { ja: "AIによる筆跡キャリブレーション", en: "AI Handwriting Calibration" },
    "feature.calibration.desc": { ja: "使えば使うほど、あなたのクセ字を理解する。キャリブレーション機能を使えば、AIがあなたの筆跡の特徴を学習。あなただけの専用モデルとして、認識精度が劇的に向上します。", en: "The more you use it, the better it gets. Use calibration to teach AI your unique handwriting style, drastically improving recognition accuracy." },

    "feature.copy.title": { ja: "爆速の自動コピー機能", en: "Instant Auto-Copy" },
    "feature.copy.desc": { ja: "変換完了と同時に、貼り付け準備OK。数式が変換された瞬間、クリップボードに自動でコピーされます。あとはOverleafやエディタに「貼り付け」するだけ。無駄なクリックをゼロに。", en: "Ready to paste instantly. Converted logic is automatically copied to your clipboard. Just paste into Overleaf or your editor. Zero wasted clicks." },

    // Buttons
    "btn.upgrade": { ja: "Proプランにアップグレード", en: "Upgrade to Pro" },
    "btn.login": { ja: "ログイン", en: "Login" },
    "btn.logout": { ja: "ログアウト", en: "Logout" },

    // Pricing
    "pricing.title": { ja: "あなたに最適なプランを選ぼう", en: "Choose Your Plan" },
    "pricing.subtitle": { ja: "シンプルな料金体系。いつでもキャンセル可能です。", en: "Simple pricing. Cancel anytime." },
    "pricing.top": { ja: "トップへ戻る", en: "Back to Home" },
    "pricing.current": { ja: "現在のプラン", en: "Current Plan" },
    "pricing.choose_monthly": { ja: "月額プランを選択", en: "Select Monthly" },
    "pricing.choose_yearly": { ja: "年額プランを選択", en: "Select Yearly" },
    "pricing.free.desc": { ja: "まずは試してみたい方に", en: "For those just starting out" },
    "pricing.free.f1": { ja: "数式変換 (月20回まで)", en: "Math Conversions (20/mo)" },
    "pricing.free.f2": { ja: "広告表示あり", en: "Ad Supported" },
    "pricing.free.f3": { ja: "Gemini 2.5 モデル利用", en: "Gemini 2.5 Model" },
    "pricing.free.f4": { ja: "基本の手書き入力", en: "Basic Handwriting" },
    "pricing.pro.title": { ja: "Monthly", en: "Monthly" },
    "pricing.pro.desc": { ja: "短期で利用したい方に", en: "Short-term usage" },
    "pricing.pro.f1": { ja: "数式変換 (無制限)", en: "Unlimited Conversions" },
    "pricing.pro.f2": { ja: "広告非表示", en: "Ad Free" },
    "pricing.pro.f3": { ja: "Gemini 3 Flash モデル利用", en: "Gemini 3 Flash Model" },
    "pricing.pro.f4": { ja: "優先サポート", en: "Priority Support" },
    "pricing.year.title": { ja: "Yearly", en: "Yearly" },
    "pricing.year.rec": { ja: "RECOMMENDED", en: "RECOMMENDED" },
    "pricing.year.save": { ja: "2ヶ月分無料！", en: "2 Months Free!" },
    "pricing.year.save_badge": { ja: "SAVE 22%", en: "SAVE 22%" },
    "pricing.year.monthly": { ja: "月額換算 ¥248", en: "¥248 / month" },
    "pricing.year.f1": { ja: "Pro機能すべて利用可能", en: "All Pro Features" },
    "pricing.year.f2": { ja: "年間 ¥860 お得", en: "Save ¥860 / year" },
    "pricing.year.f3": { ja: "長期利用に最適", en: "Best Value" },
    "pricing.tax_note": { ja: "※ 価格は税込み表示です。", en: "* Prices include tax." },
    "pricing.alert_dev": { ja: "登録画面へ進みます（準備中）", en: "Proceeding to checkout (Coming Soon)" },
    "pricing.manage": { ja: "変更する", en: "Manage Subscription" },
    "pricing.duration.month": { ja: "/月", en: "/mo" },
    "pricing.duration.year": { ja: "/年", en: "/yr" },

    // Limit Modal
    "limit.title": { ja: "今月の無料枠を使い切りました", en: "Free Limit Reached" },
    "limit.subtitle": { ja: "さらに利用するにはProプランへのアップグレードが必要です。", en: "Upgrade to Pro to continue using InkTeX." },
    "limit.pro_title": { ja: "Proプランで無制限に", en: "Go Unlimited with Pro" },
    "limit.pro_desc": { ja: "無制限の変換、高速なモデル、優先サポートを利用できます。", en: "Get unlimited conversions, faster AI models, and priority support." },

    // Model Settings
    "settings.model_speed": { ja: "変換速度", en: "Conversion Speed" },
    "settings.speed_fast": { ja: "高速 (Flash)", en: "Fast (Flash)" },
    "settings.speed_precise": { ja: "高精度 (Pro)", en: "Precise (Pro)" },

    "host.manual_ip_placeholder": { ja: "例: 192.168.1.5", en: "Ex: 192.168.1.5" },

    // User Menu
    "menu.guest": { ja: "ゲストユーザー", en: "Guest User" },
    "menu.account": { ja: "アカウント", en: "Account" },
    "menu.usage_limit": { ja: "残り回数:", en: "Remaining:" },
    "menu.monthly_usage": { ja: "今月の使用回数", en: "Monthly Usage" },
    "menu.ends_on": { ja: "終了予定:", en: "Ends on:" },

    // Usage Toast
    "toast.usage": { ja: "残り使用回数：", en: "Remaining usage count:" },
    "toast.guest": { ja: "残り使用回数(ゲスト)：", en: "Remaining usage (Guest):" },
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>("en");

    React.useEffect(() => {
        const saved = localStorage.getItem("inktex_lang") as Language;
        if (saved) {
            setLang(saved);
        } else {
            // Auto-detect browser language
            if (typeof navigator !== 'undefined') {
                const browserLang = navigator.language.toLowerCase();
                if (browserLang.startsWith("ja")) {
                    setLang("ja");
                } else {
                    setLang("en");
                }
            }
        }
    }, []);

    const updateLang = (l: Language) => {
        setLang(l);
        localStorage.setItem("inktex_lang", l);
    };

    const t = (key: string): string => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[lang] || entry["en"];
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang: updateLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
