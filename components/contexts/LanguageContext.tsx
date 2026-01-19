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

    // Errors
    "err.rate_limit_title": { ja: "アクセス集中", en: "High Traffic" },
    "err.rate_limit_msg": { ja: "アクセス集中によりAIが応答できません。しばらく待ってから再試行してください。", en: "AI is busy due to high traffic. Please try again later." },
    "err.unexpected": { ja: "予期せぬエラーが発生しました。", en: "An unexpected error occurred." },
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>("ja");

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
