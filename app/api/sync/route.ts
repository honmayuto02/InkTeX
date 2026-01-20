import { NextRequest, NextResponse } from "next/server";
import { store, SessionData } from "./store";
import { v4 as uuidv4 } from "uuid"; // We need uuid or just random string

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");

    // Create Session
    if (action === "create") {
        const newSessionId = generateId();
        const session: SessionData = {
            id: newSessionId,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
        };
        await store.set(newSessionId, session);
        return NextResponse.json({ sessionId: newSessionId });
    }

    // Poll Session (Host checks for data)
    if (sessionId) {
        const session = await store.get(sessionId);
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
        return NextResponse.json(session);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");

    if (action === "upload" && sessionId) {
        const session = await store.get(sessionId);
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Parse body for image
        const formData = await req.formData();
        const image = formData.get("image");

        if (!image || !(image instanceof Blob)) {
            return NextResponse.json({ error: "No image" }, { status: 400 });
        }

        // Convert to base64 for simple storage (in-memory)
        const buffer = Buffer.from(await image.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mime = image.type || "image/png";
        const dataUrl = `data:${mime};base64,${base64}`;

        session.imageData = dataUrl;
        session.lastUpdated = Date.now();
        await store.set(sessionId, session);

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
