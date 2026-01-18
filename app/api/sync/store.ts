// Simple in-memory store for development
// In production (Vercel serverless), this map will only persist if the lambda helper stays warm, 
// OR if we use Vercel KV. For now, we assume global variable survival or single-instance dev server.

// To make it slightly more robust in dev, attach to global
declare global {
    var _inkTexStore: Map<string, any>;
}

if (!global._inkTexStore) {
    global._inkTexStore = new Map();
}

export const store = global._inkTexStore;

export interface SessionData {
    id: string;
    createdAt: number;
    lastUpdated: number;
    imageData?: string; // Base64
}
