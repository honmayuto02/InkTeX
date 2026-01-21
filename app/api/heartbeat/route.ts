import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Vercel / Serverless environment:
    // Just return alive immediately to prevent timeouts (Hobby plan limit < 10s)
    // We do not want to use long-polling or process.exit() here.
    return NextResponse.json({ status: 'alive', timestamp: Date.now() });
}

export async function GET(request: Request) {
    // Also handle GET just in case simple polling is used
    return NextResponse.json({ status: 'alive', timestamp: Date.now() });
}
