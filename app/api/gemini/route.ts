import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
Role: あなたは高度な数学知識を持つLaTeX変換AIです。

Task:
渡された手書き数式画像を解析し、標準的なLaTeXコードを出力してください。

Rules:
1. 出力はLaTeXのコード文字列のみを行ってください。Markdownのコードブロック(\`\`\`)や説明文は一切不要です。
2. $ や $$ で囲む必要はありません。
3. 積分、シグマ、極限、分数、行列などを正確に認識してください。
4. 単純な数字や記号（例えば "1000", "A", "="）のみの場合も、LaTeX形式（そのままテキストとして成立する場合も含む）で返してください。
5. もし数式として認識できない場合でも、可能な限り形を推測して出力してください。白紙や認識不能な場合のみ "（認識できませんでした）" と返してください。

Context (Optional - if calibration image is present):
[Image 1]: calibration image (User Style)
[Image 2]: Input image to calculate
`;

// Set max duration to 60s (pro plan) or 10s (hobby).
// Since we can't detect plan, we try to be efficient within 10s.
export const maxDuration = 60; // Attempt to extend if possible
export const runtime = 'edge';
export const preferredRegion = 'hnd1'; // Force execution in Tokyo

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API Key is not configured." },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const image = formData.get("image");
        const calibrationImage = formData.get("calibrationImage");
        const calibrationLabel = formData.get("calibrationLabel") || "\\int_{-\\infty}^{\\infty} e^{-x^2} dx"; // dynamic label

        if (!image || !(image instanceof Blob)) {
            return NextResponse.json(
                { error: "No valid image provided." },
                { status: 400 }
            );
        }

        // --- Auth & Usage Check (Start) ---
        const authHeader = req.headers.get('Authorization');
        let userId: string | null = null;
        let isPro = false;

        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const { createAdminClient, supabase } = await import("@/lib/supabase");

                // Validate user
                const { data: { user }, error: authError } = await supabase.auth.getUser(token);

                if (user && !authError) {
                    userId = user.id;
                    const admin = createAdminClient();

                    // Check profile
                    const { data: profile } = await admin
                        .from('profiles')
                        .select('subscription_tier, usage_count, last_reset_date')
                        .eq('id', userId)
                        .single();

                    if (profile) {
                        isPro = profile.subscription_tier === 'pro';
                        let usage = profile.usage_count || 0;
                        const lastReset = profile.last_reset_date ? new Date(profile.last_reset_date) : new Date(0); // Epoch if null
                        const now = new Date();

                        // Check if new month
                        if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
                            // Reset usage
                            try {
                                await admin.from('profiles').update({
                                    usage_count: 0,
                                    last_reset_date: now.toISOString()
                                }).eq('id', userId);
                                usage = 0; // Reset local variable for check below
                            } catch (e) {
                                console.error("Failed to reset monthly usage", e);
                            }
                        }

                        if (!isPro && usage >= 20) {
                            return NextResponse.json(
                                { error: "Free plan limit reached (20/20). Please upgrade to Pro." },
                                { status: 402 }
                            );
                        }
                    }
                }
            } catch (e) {
                console.warn("Auth check failed:", e);
            }
        }
        // --- Auth & Usage Check (End) ---

        // Convert Blob to Base64 (Input)
        const buffer = Buffer.from(await image.arrayBuffer());
        const base64Image = buffer.toString("base64");

        // Prepare prompt parts
        const promptParts: any[] = [SYSTEM_PROMPT];

        // If calibration exists, add it first
        if (calibrationImage && calibrationImage instanceof Blob) {
            console.log("Using calibration image with label:", calibrationLabel);
            const calBuffer = Buffer.from(await calibrationImage.arrayBuffer());
            const calBase64 = calBuffer.toString("base64");

            promptParts.push({
                inlineData: {
                    data: calBase64,
                    mimeType: calibrationImage.type || "image/png",
                }
            });
            promptParts.push(`This is the calibration image (Image 1, user style sample). The content written in this image is: ${calibrationLabel}. Use this to understand the user's specific handwriting style.`);
        }

        // Add Target Image
        promptParts.push({
            inlineData: {
                data: base64Image,
                mimeType: image.type || "image/png",
            }
        });
        promptParts.push("This is the input image (Image 2). Convert this to LaTeX.");

        const genAI = new GoogleGenerativeAI(apiKey);

        // Model priority selection
        const speedPref = req.headers.get("X-Model-Speed") || "fast";

        // Fast: Flash -> Flash Lite -> Pro
        let MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

        // [Restriction] Block Pro-only models for free users
        if (!isPro) {
            // Remove gemini-3-flash-preview if not Pro
            MODELS = MODELS.filter(m => m !== "gemini-3-flash-preview");
        }

        // If precise mode, prioritize Pro
        if (speedPref === "precise") {
            MODELS = ["gemini-3-flash-preview", "gemini-2.5-pro", "gemini-2.5-flash"];
            if (!isPro) {
                MODELS = MODELS.filter(m => m !== "gemini-3-flash-preview");
            }
        }

        let lastError: any = null;

        // Timeout helper
        const generateWithTimeout = async (model: any, prompt: any, timeoutMs: number) => {
            let timeoutHandle: NodeJS.Timeout;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutHandle = setTimeout(() => reject(new Error("Model Timeout")), timeoutMs);
            });
            const apiPromise = model.generateContent(prompt).then((res: any) => {
                clearTimeout(timeoutHandle);
                const responseText = res.response.text(); // Ensure text access works before resolving
                return res;
            });
            return Promise.race([apiPromise, timeoutPromise]);
        };

        const startTime = Date.now();
        const GLOBAL_TIMEOUT = 25000; // Edge allows up to 30s usually, keep safe margin

        for (const modelName of MODELS) {
            // Check global time budget
            if (Date.now() - startTime > GLOBAL_TIMEOUT) break;

            try {
                console.log(`Attempting with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                // [Updated] Timeout extended to 5000ms as requested
                const result: any = await generateWithTimeout(model, promptParts, 5000);

                const responseText = result.response.text();

                // Clean up response
                const cleanLatex = responseText.replace(/```latex|```/g, "").trim();
                console.log(`Success with model: ${modelName}`);

                // --- Increment Usage (Start) ---
                let newUsageCount: number | undefined;
                // isPro is already determined above
                if (userId) {
                    try {
                        const { createAdminClient } = await import("@/lib/supabase");
                        const admin = createAdminClient();

                        // We use simple update + increment to avoid complex RPC logic if missing
                        // First fetch again to be safe? Or just increment blindly?
                        // Using RPC 'increment_usage' is best for concurrency, but if it doesn't support reset, we might have reset it 0 above.
                        // If we reset it to 0 above, 'increment_usage' will make it 1. That is correct.
                        // BUT if we rely on fallback, we must be careful.

                        const { error } = await admin.rpc('increment_usage', { user_id: userId });

                        if (error) {
                            // Fallback: Fetch current (which might have been reset to 0 in this same request) and increment
                            const { data: profile } = await admin.from('profiles').select('usage_count').eq('id', userId).single();
                            if (profile) {
                                await admin.from('profiles').update({ usage_count: (profile.usage_count || 0) + 1 }).eq('id', userId);
                            }
                        }

                        // Fetch updated count
                        const { data: updated } = await admin.from('profiles').select('usage_count, subscription_tier').eq('id', userId).single();
                        if (updated) {
                            newUsageCount = updated.usage_count;
                        }
                    } catch (e) {
                        console.error("Failed to increment usage:", e);
                    }
                }
                // --- Increment Usage (End) ---

                return NextResponse.json({ latex: cleanLatex, usage: newUsageCount, isPro });

            } catch (error: any) {
                console.warn(`Model ${modelName} failed:`, error.message);
                lastError = error;
                // Continue to next model
            }
        }

        // If all failed
        console.error("All Gemini models failed.");
        const errorMessage = lastError?.message || lastError?.toString() || "All models failed to process image";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Extract useful error message
        const errorMessage = error?.message || error?.toString() || "Failed to process image";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
