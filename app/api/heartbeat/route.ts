import { NextResponse } from "next/server";

export async function POST() {
    // Legacy endpoint: Old clients might still be polling this.
    // Return 200 to silence 404/405 errors in logs.
    return NextResponse.json({ status: "ok", legacy: true });
}
