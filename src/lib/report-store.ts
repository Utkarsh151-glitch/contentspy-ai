import { CompetitorReport } from "./types";

// ─── Types ────────────────────────────────────────────
export interface SavedReport {
    id: string;
    report: CompetitorReport;
    createdAt: number; // unix ms
    url: string;
}

const KV_KEY = "contentspy_reports";

// ─── Helpers ──────────────────────────────────────────
function generateId(): string {
    return `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
export async function saveReport(report: CompetitorReport, url: string): Promise<string> {
    const puter = await getPuter();
    const all = await getReports();
    const id = generateId();
    const entry: SavedReport = { id, report, url, createdAt: Date.now() };
    all.push(entry);
    await puter.kv.set(KV_KEY, JSON.stringify(all));
    return id;
}

/**
 * Get all saved reports for the current user, newest first.
 */
export async function getReports(): Promise<SavedReport[]> {
    try {
        const puter = await getPuter();
        const raw = await puter.kv.get(KV_KEY);
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
export async function getReportById(id: string): Promise<SavedReport | null> {
    const all = await getReports();
    return all.find((r) => r.id === id) || null;
}

/**
 * Delete a report by ID.
 */
export async function deleteReport(id: string): Promise<void> {
    const puter = await getPuter();
    const all = await getReports();
    const filtered = all.filter((r) => r.id !== id);
    await puter.kv.set(KV_KEY, JSON.stringify(filtered));
}

/**
 * Delete ALL reports (danger zone).
 */
export async function deleteAllReports(): Promise<void> {
    const puter = await getPuter();
    await puter.kv.del(KV_KEY);
}
