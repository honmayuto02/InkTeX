// Hybrid store: Vercel KV (Redis) for production, In-memory for dev.
import { kv } from "@vercel/kv";

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
}

const memoryStore = global._inkTexStore;
const IS_KV_ENABLED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export const store = {
    get: async (key: string): Promise<SessionData | undefined> => {
        if (IS_KV_ENABLED) {
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
        if (IS_KV_ENABLED) {
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
