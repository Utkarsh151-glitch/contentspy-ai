"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Target, TrendingUp, AlertTriangle, Zap, BarChart3, Loader2, FolderOpen } from "lucide-react";
import { getReports } from "@/lib/report-store";

interface InsightItem {
    title: string;
    description: string;
    icon: typeof Target;
    color: string;
    bgColor: string;
    borderColor: string;
    tag: string;
    tagColor: string;
}

export function InsightsPage() {
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [stats, setStats] = useState({ reports: 0, opportunities: 0, gaps: 0, avgScore: 0 });
    const [loading, setLoading] = useState(true);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        try {
            const reports = await getReports();
            if (reports.length === 0) { setInsights([]); setLoading(false); return; }

            const allGaps = reports.flatMap((r) => r.report.content_gaps || []);
            const allOpps = reports.flatMap((r) => r.report.opportunities || []);
            const allWeaknesses = reports.flatMap((r) => r.report.competitor_weaknesses || []);
            const allKeywords = reports.flatMap((r) => r.report.top_keywords || []);
            const avgScore = Math.round(reports.reduce((s, r) => s + (r.report.overall_score || 0), 0) / reports.length);

            setStats({ reports: reports.length, opportunities: allOpps.length, gaps: allGaps.length, avgScore });

            const generated: InsightItem[] = [];

            // Top content gaps
            if (allGaps.length > 0) {
                const highGaps = allGaps.filter((g) => typeof g !== "string" && g.priority === "high");
                const gapList = (highGaps.length > 0 ? highGaps : allGaps).slice(0, 3);
                generated.push({
                    title: "Content Gap Opportunities",
                    description: `Found ${allGaps.length} content gaps across ${reports.length} competitors. Top priorities: ${gapList.map((g) => typeof g === "string" ? g : g.gap).join(", ")}.`,
                    icon: Target,
                    color: "text-[var(--brand)]",
                    bgColor: "bg-[var(--brand)]/5",
                    borderColor: "border-[var(--brand)]/10",
                    tag: "HIGH IMPACT",
                    tagColor: "bg-red-500/10 text-red-400",
                });
            }

            // Keywords with opportunities
            const kwOpps = allKeywords.filter((kw) => typeof kw !== "string" && kw.opportunity);
            if (kwOpps.length > 0) {
                generated.push({
                    title: "Keyword Opportunities",
                    description: `${kwOpps.length} keyword${kwOpps.length > 1 ? "s" : ""} with ranking opportunity detected: ${kwOpps.slice(0, 4).map((k) => typeof k === "string" ? k : k.keyword).join(", ")}.`,
                    icon: TrendingUp,
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-500/5",
                    borderColor: "border-emerald-500/10",
                    tag: "TRENDING",
                    tagColor: "bg-emerald-500/10 text-emerald-400",
                });
            }

            // Competitor weaknesses
            if (allWeaknesses.length > 0) {
                generated.push({
                    title: "Competitor Weaknesses Detected",
                    description: `${allWeaknesses.length} exploitable weakness${allWeaknesses.length > 1 ? "es" : ""} found. Top: "${allWeaknesses[0].weakness}" — ${allWeaknesses[0].how_to_exploit}`,
                    icon: AlertTriangle,
                    color: "text-amber-400",
                    bgColor: "bg-amber-500/5",
                    borderColor: "border-amber-500/10",
                    tag: "OPPORTUNITY",
                    tagColor: "bg-amber-500/10 text-amber-400",
                });
            }

            // Growth opportunities
            if (allOpps.length > 0) {
                const topOpp = allOpps[0];
                const oppName = typeof topOpp === "string" ? topOpp : topOpp.opportunity;
                generated.push({
                    title: "Growth Opportunities",
                    description: `${allOpps.length} growth opportunities identified. Top: "${oppName}". ${typeof topOpp !== "string" && topOpp.action_steps?.length ? `First step: ${topOpp.action_steps[0]}` : ""}`,
                    icon: Zap,
                    color: "text-purple-400",
                    bgColor: "bg-purple-500/5",
                    borderColor: "border-purple-500/10",
                    tag: "QUICK WIN",
                    tagColor: "bg-purple-500/10 text-purple-400",
                });
            }

            setInsights(generated);
        } catch {
            setInsights([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInsights(); }, [fetchInsights]);

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-400" />
                    Insights
                </h2>
                <p className="text-slate-400 text-sm mt-1">AI-powered market intelligence from your analyses</p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[var(--brand)] animate-spin" />
                    <span className="ml-3 text-slate-400 text-sm">Generating insights...</span>
                </div>
            )}

            {!loading && insights.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No insights yet</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        Run competitor analyses from the Dashboard. Insights are automatically generated from your saved reports.
                    </p>
                </motion.div>
            )}

            {!loading && insights.length > 0 && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Reports Analyzed", value: String(stats.reports), change: `${stats.reports}`, positive: true },
                            { label: "Opportunities Found", value: String(stats.opportunities), change: `+${stats.opportunities}`, positive: true },
                            { label: "Content Gaps", value: String(stats.gaps), change: `${stats.gaps}`, positive: stats.gaps > 0 },
                            { label: "Avg Score", value: `${stats.avgScore}%`, change: stats.avgScore >= 60 ? "Good" : "Needs work", positive: stats.avgScore >= 60 },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                            >
                                <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                                    <span className={`text-xs font-semibold ${stat.positive ? "text-green-400" : "text-amber-400"}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Insight Cards */}
                    <div className="space-y-4">
                        {insights.map((insight, i) => (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 * i }}
                                className={`${insight.bgColor} border ${insight.borderColor} rounded-xl p-5 hover:scale-[1.01] transition-all`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${insight.bgColor} flex items-center justify-center shrink-0`}>
                                        <insight.icon className={`w-5 h-5 ${insight.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h4 className="font-bold text-white text-sm">{insight.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${insight.tagColor}`}>
                                                {insight.tag}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
                                    </div>
                                    <BarChart3 className="w-5 h-5 text-slate-600 shrink-0" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
