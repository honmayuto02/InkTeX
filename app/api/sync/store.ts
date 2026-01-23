// Hybrid store: Vercel KV (Redis) for production, In-memory for dev.
import { createClient } from "@vercel/kv";

// To make it slightly more robust in dev, attach to global
declare global {
    var _inkTexStore: Map<string, any>;
}

if (!global._inkTexStore) {
    global._inkTexStore = new Map();
}

export interface SessionData {
    id: string;
    createdAt: number;
    lastUpdated: number;
    imageData?: string; // Base64
    calibrationData?: string; // Data URL of calibration image from client
}

const memoryStore = global._inkTexStore;

// Support both Vercel KV standard naming and Upstash Integration naming
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_KV_ENABLED = !!(kvUrl && kvToken);

const kv = IS_KV_ENABLED ? createClient({ url: kvUrl!, token: kvToken! }) : null;

export const store = {
    get: async (key: string): Promise<SessionData | undefined> => {
        if (kv) {
            try {
                return await kv.get<SessionData>(key) || undefined;
            } catch (e) {
                console.warn("KV Get Error, falling back:", e);
                return memoryStore.get(key);
            }
        }
        return memoryStore.get(key);
    },
    set: async (key: string, value: SessionData): Promise<void> => {
        if (kv) {
            try {
                // Expire after 1 hour (3600s) to keep cleanup automatic
                await kv.set(key, value, { ex: 3600 });
                return;
            } catch (e) {
                console.warn("KV Set Error, falling back:", e);
            }
        }
        memoryStore.set(key, value);
    }
};
