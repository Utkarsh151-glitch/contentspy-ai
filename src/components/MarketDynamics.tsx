"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Target, Zap } from "lucide-react";
import { getReports } from "@/lib/report-store";

export function MarketDynamics() {
    const [reportCount, setReportCount] = useState(0);
    const [topScore, setTopScore] = useState(0);
    const [niches, setNiches] = useState(0);

    useEffect(() => {
        getReports().then((reports) => {
            setReportCount(reports.length);
            if (reports.length > 0) {
                setTopScore(Math.max(...reports.map((r) => r.report.overall_score || 0)));
                setNiches(new Set(reports.map((r) => r.report.niche)).size);
            }
        }).catch(() => { });
    }, []);

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            {/* Market Dynamics Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">
                            Market Overview
                        </h3>
                        <p className="text-sm text-slate-500">
                            Your competitive intelligence summary
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-transparent hover:border-[var(--brand)]/20 transition-all">
                        <span className="text-sm font-medium dark:text-slate-300">Competitors Analyzed</span>
                        <span className="text-xs bg-[var(--brand)]/10 text-[var(--brand)] px-2 py-1 rounded-full font-bold">
                            {reportCount} report{reportCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-transparent hover:border-[var(--brand)]/20 transition-all">
                        <span className="text-sm font-medium dark:text-slate-300">Top Competitor Score</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${topScore >= 70 ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" : topScore >= 40 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                            {topScore > 0 ? `${topScore}/100` : "No data yet"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-transparent hover:border-[var(--brand)]/20 transition-all">
                        <span className="text-sm font-medium dark:text-slate-300">Industries Tracked</span>
                        <span className="text-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full font-bold">
                            {niches > 0 ? `${niches} niche${niches !== 1 ? "s" : ""}` : "None yet"}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[var(--brand)]/5 to-slate-800/50 p-8 rounded-2xl border border-[var(--brand)]/10 flex flex-col justify-between"
            >
                <div>
                    <h3 className="font-bold text-lg dark:text-white mb-2 flex items-center gap-2">
                        Quick Tips
                        <Zap className="w-5 h-5 text-[var(--brand)]" />
                    </h3>
                    <div className="space-y-3 mt-4">
                        <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                            <Target className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" />
                            <p className="text-slate-400 text-sm">Analyze direct competitors to discover their winning strategies and weaknesses</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                            <BarChart3 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-slate-400 text-sm">Compare multiple competitors in the Benchmarking tab for side-by-side insights</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-slate-400 text-sm">Check Insights regularly — they auto-generate from your analysis history</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
