import { NextResponse } from "next/server";

// Global variables to track state across requests
// checking if they are preserved in dev mode (usually yes for module-level vars in route.ts in recent Next.js, but standard globalThis is safer)

declare global {
    var lastHeartbeat: number;
    var heartbeatInterval: NodeJS.Timeout | null;
}

if (!global.lastHeartbeat) {
    global.lastHeartbeat = Date.now();
}

if (!global.heartbeatInterval) {
    global.heartbeatInterval = null;
}

// Config
const SHUTDOWN_TIMEOUT_MS = 5000; // 5 seconds of silence kills the server
const CHECK_INTERVAL_MS = 1000;   // Check every second

function startHeartbeatCheck() {
    if (global.heartbeatInterval) return;

    console.log("[Heartbeat] Monitoring started...");
    global.heartbeatInterval = setInterval(() => {
        const now = Date.now();
        const diff = now - global.lastHeartbeat;

        if (diff > SHUTDOWN_TIMEOUT_MS) {
            console.log(`[Heartbeat] No activity for ${diff}ms. Shutting down...`);
            // Clean up interval just in case
            if (global.heartbeatInterval) clearInterval(global.heartbeatInterval);
            process.exit(0);
        }
    }, CHECK_INTERVAL_MS);
}

export async function POST() {
    // Update last heartbeat
    global.lastHeartbeat = Date.now();

    // Ensure the checker is running
    startHeartbeatCheck();

    return NextResponse.json({ status: "alive", last: global.lastHeartbeat });
}
