"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Calendar, Globe, Eye, Trash2, TrendingUp, Loader2, FolderOpen } from "lucide-react";
import { getReports, deleteReport, SavedReport } from "@/lib/report-store";
import { generateReportPDF } from "@/lib/pdf-generator";

interface ReportsPageProps {
    onViewReport: (saved: SavedReport) => void;
}

export function ReportsPage({ onViewReport }: ReportsPageProps) {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getReports();
            setReports(data);
        } catch {
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await deleteReport(id);
            setReports((prev) => prev.filter((r) => r.id !== id));
        } finally {
            setDeleting(null);
        }
    };

    const avgScore = reports.length
        ? Math.round(reports.reduce((sum, r) => sum + (r.report.overall_score || 0), 0) / reports.length)
        : 0;
    const niches = new Set(reports.map((r) => r.report.niche)).size;

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-white">Reports</h2>
                    <p className="text-slate-400 text-sm mt-1">All your past competitor analyses in one place</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FileText className="w-4 h-4" />
                    {reports.length} report{reports.length !== 1 ? "s" : ""} generated
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 text-[var(--brand)] animate-spin" />
                    <span className="ml-3 text-slate-400 text-sm">Loading reports...</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && reports.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No reports yet</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        Run your first competitor analysis from the Dashboard to see your reports here.
                    </p>
                </motion.div>
            )}

            {/* Reports Table */}
            {!loading && reports.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-6 py-3 bg-slate-800 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Competitor</span>
                        <span>Industry</span>
                        <span>Score</span>
                        <span>Date</span>
                        <span>Actions</span>
                    </div>
                    <AnimatePresence>
                        {reports.map((saved, i) => (
                            <motion.div
                                key={saved.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: 0.03 * i }}
                                className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-6 py-4 border-b border-slate-700/50 hover:bg-slate-800/30 transition-all items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-[var(--brand)]" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="font-semibold text-white text-sm block truncate max-w-[200px]">{saved.report.competitor}</span>
                                        <span className="text-[10px] text-slate-500 truncate block max-w-[200px]">{saved.url}</span>
                                    </div>
                                </div>
                                <span className="text-slate-300 text-sm">{saved.report.niche}</span>
                                <div>
                                    <span className={`text-sm font-bold ${(saved.report.overall_score || 0) >= 70 ? "text-green-400" : (saved.report.overall_score || 0) >= 40 ? "text-amber-400" : "text-red-400"}`}>
                                        {saved.report.overall_score || 0}/100
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(saved.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => onViewReport(saved)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white" title="View Report">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => generateReportPDF(saved.report)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-[var(--brand)]" title="Download PDF">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(saved.id)}
                                        disabled={deleting === saved.id}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400 disabled:opacity-50"
                                        title="Delete Report"
                                    >
                                        {deleting === saved.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Stats */}
            {!loading && reports.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Reports", value: String(reports.length), icon: FileText, color: "text-[var(--brand)]" },
                        { label: "Avg Score", value: String(avgScore), icon: TrendingUp, color: "text-emerald-400" },
                        { label: "Industries Analyzed", value: String(niches), icon: Globe, color: "text-amber-400" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center gap-4"
                        >
                            <div className={`w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
