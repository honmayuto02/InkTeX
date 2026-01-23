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

    // Result
    "result.title": { ja: "変換結果", en: "Result" },
    "result.copy": { ja: "コピー", en: "Copy" },
    "result.copied": { ja: "コピー完了", en: "Copied!" },
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
    "faq.a1": { ja: "はい、InkTeXは基本的に無料で利用可能です。手書き数式のLaTeX変換を回数制限なく（またはGemini APIの無料枠内で）試すことができます。", en: "Yes, InkTeX is basically free to use within the Gemini API free tier limits." },
    "faq.q2": { ja: "スマホやタブレットでも使えますか？", en: "Does it work on mobile/tablet?" },
    "faq.a2": { ja: "はい、完全レスポンシブ対応です。iPadなどのタブレットで手書き入力し、PCでコードを受け取るといった連携機能も備えています。", en: "Yes, it is fully responsive. You can also use the Device Sync feature to write on a tablet and receive code on PC." },
    "faq.q3": { ja: "どのような数式に対応していますか？", en: "What math is supported?" },
    "faq.a3": { ja: "積分、微分、行列、シグマ、極限（lim）など、高校数学から大学レベルの複雑な数式まで、AIが文脈を判断してLaTeX化します。", en: "It supports everything from high school math to advanced university topics like integrals, matrices, limits, etc." },
    "faq.q4": { ja: "読み取り精度を上げるコツはありますか？", en: "How to improve accuracy?" },
    "faq.a4": { ja: "「筆跡キャリブレーション機能（ペンツールアイコン）」を使って自分の字のクセを登録すると、AIの認識精度が大幅に向上します。", en: "Use the 'Calibration' feature (pen tool icon) to register your handwriting style for better accuracy." },

    // Host Page
    "host.title": { ja: "デバイス連携", en: "Device Sync" },
    "host.scan_qr": { ja: "QRコードを読み取って接続", en: "Scan QR code to connect" },
    "host.back": { ja: "← 戻る", en: "← Back" },
    "host.manual_ip_title": { ja: "⚠️ 接続できない場合", en: "⚠️ Connection Issues?" },
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
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>("ja");

    // Persist to localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem("inktex_lang") as Language;
        if (saved && (saved === "ja" || saved === "en")) {
            setLangState(saved);
        }
    }, []);

    const setLang = (l: Language) => {
        setLangState(l);
        localStorage.setItem("inktex_lang", l);
    };

    const t = (key: string): string => {
        const entry = translations[key];
        if (!entry) return key;
        return entry[lang] || entry["ja"];
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
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
