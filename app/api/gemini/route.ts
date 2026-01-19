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

        // Convert Blob to Base64 (Input)
        const buffer = Buffer.from(await image.arrayBuffer());
        const base64Image = buffer.toString("base64");

        // Prepare prompt parts
        const promptParts: any[] = [SYSTEM_PROMPT];

        // If calibration exists, add it first
        if (calibrationImage && calibrationImage instanceof Blob) {
            // Log for debugging
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(promptParts);

        const responseText = result.response.text();
        // Clean up response if it contains markdown blocks despite instructions
        const cleanLatex = responseText.replace(/```latex|```/g, "").trim();

        return NextResponse.json({ latex: cleanLatex });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to process image." },
            { status: 500 }
        );
    }
}
