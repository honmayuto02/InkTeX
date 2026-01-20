"use client";

import { useEffect } from "react";

const PING_INTERVAL_MS = 2000; // Ping every 2 seconds

export function HeartbeatManager() {
    useEffect(() => {
        // Initial ping
        ping();

        const interval = setInterval(ping, PING_INTERVAL_MS);

        function ping() {
            // Use keepalive to ensure request completes even if being unloaded (though interval handles main Logic)
            fetch("/api/heartbeat", { method: "POST" }).catch((err) => {
                // Silently fail is fine, server might be down or restarting
                // console.warn("Heartbeat failed", err);
            });
        }

        // Attempt one last ping on unload to keep alive during quick refresh?
        // Actually, refresh logic relies on the NEW page loading and sending a ping *before* the 5s timeout expires.
        // Unload triggers -> Server waits -> New page loads -> Ping.
        // Time gap is usually < 1s for refresh. 5s timeout is plenty.

        return () => clearInterval(interval);
    }, []);

    return null; // Headless component
}
