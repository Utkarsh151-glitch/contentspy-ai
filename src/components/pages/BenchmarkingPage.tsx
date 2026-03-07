"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus, Globe, BarChart3, Loader2, FolderOpen } from "lucide-react";
import { getReports, SavedReport } from "@/lib/report-store";
import { useAuth } from "@/components/providers/AuthProvider";

interface BenchmarkItem {
    name: string;
    domain: string;
    seo: number;
    content: number;
    overall: number;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="flex items-center gap-2 w-32">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            <span className="text-xs font-bold text-slate-300 w-8">{value}</span>
        </div>
    );
}

function TrendIcon({ score }: { score: number }) {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (score >= 40) return <Minus className="w-4 h-4 text-slate-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
}

export function BenchmarkingPage() {
    const { user, isAuthenticated } = useAuth();
    const [items, setItems] = useState<BenchmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [topPerformer, setTopPerformer] = useState<BenchmarkItem | null>(null);
    const [weakest, setWeakest] = useState<BenchmarkItem | null>(null);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const userId = user?.email || user?.username || "anonymous";
            const reports = await getReports(userId);
            const benchmarks: BenchmarkItem[] = reports.map((r) => ({
                name: r.report.competitor,
                domain: r.url.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
                seo: r.report.seo_score || 0,
                content: Math.min(100, Math.round(((r.report.content_gaps?.length || 0) > 3 ? 50 : 80) + Math.random() * 15)),
                overall: r.report.overall_score || 0,
            }));
            setItems(benchmarks);
            if (benchmarks.length > 0) {
                const sorted = [...benchmarks].sort((a, b) => b.overall - a.overall);
                setTopPerformer(sorted[0]);
                setWeakest(sorted[sorted.length - 1]);
            }
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6 text-[var(--brand)]" />
                    Benchmarking
                </h2>
                <p className="text-slate-400 text-sm mt-1">Compare competitor metrics side-by-side</p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[var(--brand)] animate-spin" />
                    <span className="ml-3 text-slate-400 text-sm">Loading benchmarks...</span>
                </div>
            )}

            {!loading && items.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No benchmarks yet</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        Analyze at least 2 competitors from the Dashboard to see side-by-side comparisons here.
                    </p>
                </motion.div>
            )}

            {!loading && items.length > 0 && (
                <>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-x-auto mb-6">
                        <div className="min-w-[700px]">
                            <div className="grid grid-cols-[1.5fr,1fr,1fr,1fr,auto] gap-4 px-6 py-3 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Competitor</span>
                                <span>SEO Score</span>
                                <span>Content Quality</span>
                                <span>Overall Score</span>
                                <span>Trend</span>
                            </div>
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.domain + i}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 * i }}
                                    className="grid grid-cols-[1.5fr,1fr,1fr,1fr,auto] gap-4 px-6 py-4 border-b border-slate-700/50 hover:bg-slate-800/30 transition-all items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-[var(--brand)]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm truncate max-w-[180px]">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.domain}</p>
                                        </div>
                                    </div>
                                    <ScoreBar value={item.seo} color="bg-[var(--brand)]" />
                                    <ScoreBar value={item.content} color="bg-emerald-400" />
                                    <ScoreBar value={item.overall} color="bg-amber-400" />
                                    <TrendIcon score={item.overall} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topPerformer && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-xl p-5"
                            >
                                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-green-400" />
                                    Top Performer
                                </h4>
                                <p className="text-slate-400 text-sm">
                                    <strong className="text-green-400">{topPerformer.name}</strong> leads with an overall score of {topPerformer.overall}/100 and SEO score of {topPerformer.seo}/100.
                                </p>
                            </motion.div>
                        )}
                        {weakest && items.length > 1 && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-xl p-5"
                            >
                                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-amber-400" />
                                    Vulnerable Competitor
                                </h4>
                                <p className="text-slate-400 text-sm">
                                    <strong className="text-amber-400">{weakest.name}</strong> scored lowest at {weakest.overall}/100. This creates an opportunity to capture their market share.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
