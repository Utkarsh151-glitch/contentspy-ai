import { CompetitorReport } from "./types";

// ─── Types ────────────────────────────────────────────
export interface SavedReport {
    id: string;
    report: CompetitorReport;
    createdAt: number; // unix ms
    url: string;
}

const KV_KEY_PREFIX = "contentspy_reports_";

// ─── Helpers ──────────────────────────────────────────
function generateId(): string {
    return `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getUserKey(userId: string): string {
    return `${KV_KEY_PREFIX}${userId}`;
}

async function getPuter(): Promise<typeof window.puter> {
    if (typeof window === "undefined") throw new Error("Browser only");
    // Wait for Puter SDK to load
    for (let i = 0; i < 20; i++) {
        if (window.puter?.kv) return window.puter;
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error("Puter SDK not available");
}

// ─── Public API ───────────────────────────────────────

/**
 * Save a report to Puter KV. Returns the generated ID.
 */
export async function saveReport(report: CompetitorReport, url: string, userId: string): Promise<string> {
    const puter = await getPuter();
    const all = await getReports(userId);
    const id = generateId();
    const entry: SavedReport = { id, report, url, createdAt: Date.now() };
    all.push(entry);
    await puter.kv.set(getUserKey(userId), JSON.stringify(all));
    return id;
}

/**
 * Get all saved reports for the current user, newest first.
 */
export async function getReports(userId: string): Promise<SavedReport[]> {
    try {
        const puter = await getPuter();
        const raw = await puter.kv.get(getUserKey(userId));
        if (!raw) return [];
        const parsed = JSON.parse(raw as string) as SavedReport[];
        return parsed.sort((a, b) => b.createdAt - a.createdAt);
    } catch {
        return [];
    }
}

/**
 * Get a single report by ID.
 */
export async function getReportById(id: string, userId: string): Promise<SavedReport | null> {
    const all = await getReports(userId);
    return all.find((r) => r.id === id) || null;
}

/**
 * Delete a report by ID.
 */
export async function deleteReport(id: string, userId: string): Promise<void> {
    const puter = await getPuter();
    const all = await getReports(userId);
    const filtered = all.filter((r) => r.id !== id);
    await puter.kv.set(getUserKey(userId), JSON.stringify(filtered));
}

/**
 * Delete ALL reports (danger zone).
 */
export async function deleteAllReports(userId: string): Promise<void> {
    const puter = await getPuter();
    await puter.kv.del(getUserKey(userId));
}
