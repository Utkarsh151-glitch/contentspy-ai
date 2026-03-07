"use client";

import { motion } from "framer-motion";
import { CompetitorReport } from "@/lib/types";
import { generateReportPDF } from "@/lib/pdf-generator";
import {
    Trophy,
    TrendingUp,
    FileText,
    Search,
    AlertTriangle,
    Rocket,
    ExternalLink,
    Globe,
    Target,
    Shield,
    Zap,
    ArrowRight,
    Star,
    CheckCircle2,
    XCircle,
    Lightbulb,
    Map,
    Crosshair,
    BarChart3,
    Clock,
    Download,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ReportViewProps {
    report: CompetitorReport;
}

// Score ring component
function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold" style={{ color }}>{score}</span>
                </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
    );
}

// Impact badge
function ImpactBadge({ level }: { level: string }) {
    const config = {
        high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
        medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
        low: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
        easy: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
        hard: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
        growing: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
        stable: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
        declining: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    }[level] || { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
            {level}
        </span>
    );
}

// Animated list item
function AnimatedItem({ children, index }: { children: React.ReactNode; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}

export function ReportView({ report }: ReportViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* ═══════ REPORT HEADER ═══════ */}
            <Card className="border-[var(--brand)]/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, var(--brand) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] flex items-center justify-center shadow-lg shadow-[var(--brand)]/20">
                                <Globe className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-white">{report.competitor}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-[var(--brand)]/10 text-[var(--brand)] border-[var(--brand)]/20">{report.niche}</Badge>
                                    <ImpactBadge level={report.market_trend} />
                                </div>
                                {report.company_summary && (
                                    <p className="text-slate-400 text-sm mt-2 max-w-xl">{report.company_summary}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <ScoreRing score={report.overall_score || 0} label="Overall" />
                            <ScoreRing score={report.seo_score || 0} label="SEO" />
                            <button
                                onClick={() => generateReportPDF(report)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand)] hover:bg-[#0d6fd4] text-white text-sm font-semibold transition-all shadow-lg shadow-[var(--brand)]/20 hover:shadow-[var(--brand)]/40"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Quick stats bar */}
                    {report.market_size && (
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 flex-wrap">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-slate-300">Market Size: <strong className="text-white">{report.market_size}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-300">Trend: <strong className="text-white capitalize">{report.market_trend}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-slate-300">Keywords: <strong className="text-white">{report.top_keywords?.length || 0}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-slate-300">Weaknesses: <strong className="text-white">{report.competitor_weaknesses?.length || 0}</strong></span>
                            </div>
                        </div>
                    )}
                </CardHeader>
            </Card>

            {/* ═══════ TABS ═══════ */}
            <Tabs defaultValue="battleplan" className="w-full">
                <TabsList className="w-full justify-start bg-slate-800/50 border border-slate-700 p-1.5 rounded-xl h-auto flex-wrap gap-1">
                    <TabsTrigger value="battleplan" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white rounded-lg text-xs">
                        <Crosshair className="w-3.5 h-3.5 mr-1.5" /> Battle Plan
                    </TabsTrigger>
                    <TabsTrigger value="intel" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white rounded-lg text-xs">
                        <Shield className="w-3.5 h-3.5 mr-1.5" /> Intel
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white rounded-lg text-xs">
                        <Search className="w-3.5 h-3.5 mr-1.5" /> SEO & Keywords
                    </TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white rounded-lg text-xs">
                        <FileText className="w-3.5 h-3.5 mr-1.5" /> Content
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" className="data-[state=active]:bg-[var(--brand)] data-[state=active]:text-white rounded-lg text-xs">
                        <Rocket className="w-3.5 h-3.5 mr-1.5" /> Opportunities
                    </TabsTrigger>
                </TabsList>

                {/* ═══════ BATTLE PLAN TAB ═══════ */}
                <TabsContent value="battleplan">
                    <div className="space-y-6">
                        {/* Market Entry Plan */}
                        {report.market_entry_plan && report.market_entry_plan.length > 0 && (
                            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Map className="w-5 h-5 text-[var(--brand)]" />
                                        Market Entry Roadmap
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        {/* Vertical line */}
                                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--brand)] via-[var(--brand)]/50 to-transparent" />

                                        <div className="space-y-6">
                                            {report.market_entry_plan.map((step, i) => (
                                                <AnimatedItem key={i} index={i}>
                                                    <div className="flex gap-4 items-start relative">
                                                        <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center shrink-0 z-10">
                                                            <span className="text-sm font-bold text-[var(--brand)]">{i + 1}</span>
                                                        </div>
                                                        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-[var(--brand)]/30 transition-all">
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <h4 className="font-bold text-white text-sm">{step.step}</h4>
                                                                <div className="flex items-center gap-1.5 text-[var(--brand)]">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span className="text-xs font-semibold">{step.timeline}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{step.description}</p>
                                                        </div>
                                                    </div>
                                                </AnimatedItem>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Positioning */}
                        {report.positioning_suggestion && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="bg-gradient-to-r from-[var(--brand)]/10 via-[var(--brand)]/5 to-transparent border-[var(--brand)]/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/20 flex items-center justify-center shrink-0">
                                                <Lightbulb className="w-6 h-6 text-[var(--brand)]" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm mb-1">Recommended Positioning</h4>
                                                <p className="text-[var(--brand)] text-lg font-semibold italic leading-relaxed">
                                                    &ldquo;{report.positioning_suggestion}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Unique Differentiation Angles */}
                        {report.unique_angles && report.unique_angles.length > 0 && (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Star className="w-5 h-5 text-amber-400" />
                                        Differentiation Angles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {report.unique_angles.map((angle, i) => (
                                            <AnimatedItem key={i} index={i}>
                                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-amber-400/20 transition-all group">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 group-hover:bg-amber-400/20 transition-colors">
                                                        <Zap className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed">{angle}</p>
                                                </div>
                                            </AnimatedItem>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ═══════ INTEL TAB ═══════ */}
                <TabsContent value="intel">
                    <div className="space-y-6">
                        {/* Success Factors */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    Why They&apos;re Winning
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {report.success_factors?.map((f, i) => (
                                    <AnimatedItem key={i} index={i}>
                                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-amber-400/20 transition-all">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                                    {typeof f === "string" ? f : f.factor}
                                                </h4>
                                                {typeof f !== "string" && <ImpactBadge level={f.impact} />}
                                            </div>
                                            {typeof f !== "string" && f.detail && (
                                                <p className="text-slate-400 text-xs ml-6 leading-relaxed">{f.detail}</p>
                                            )}
                                        </div>
                                    </AnimatedItem>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Competitor Weaknesses */}
                        {report.competitor_weaknesses && report.competitor_weaknesses.length > 0 && (
                            <Card className="bg-slate-800/50 border-red-500/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <XCircle className="w-5 h-5 text-red-400" />
                                        Competitor Weaknesses
                                        <span className="text-xs text-slate-500 ml-2">(Your Advantage)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {report.competitor_weaknesses.map((w, i) => (
                                        <AnimatedItem key={i} index={i}>
                                            <div className="p-4 rounded-xl bg-slate-900/50 border border-red-500/10 hover:border-red-500/30 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-white text-sm">{w.weakness}</h4>
                                                        <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                                                            <ArrowRight className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                                                            <p className="text-green-300 text-xs leading-relaxed">{w.how_to_exploit}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimatedItem>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ═══════ SEO & KEYWORDS TAB ═══════ */}
                <TabsContent value="seo">
                    <div className="space-y-6">
                        {/* SEO Strategy */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    SEO Strategy Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{report.seo_strategy}</p>
                                {report.content_strategy && (
                                    <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                                        <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-[var(--brand)]" />
                                            Content Strategy
                                        </h5>
                                        <p className="text-slate-400 text-sm leading-relaxed">{report.content_strategy}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Keywords Grid */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Search className="w-5 h-5 text-[var(--brand)]" />
                                    Keyword Map
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {report.top_keywords?.map((kw, i) => {
                                        const keyword = typeof kw === "string" ? kw : kw.keyword;
                                        const isOpportunity = typeof kw !== "string" && kw.opportunity;
                                        const difficulty = typeof kw !== "string" ? kw.difficulty : "medium";

                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.03 * i }}
                                                className={`p-3 rounded-lg border transition-all text-sm flex items-center justify-between gap-2 ${isOpportunity
                                                    ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                                                    : "bg-slate-900/50 border-slate-700 hover:border-[var(--brand)]/30"
                                                    }`}
                                            >
                                                <span className="font-medium text-slate-200 truncate">{keyword}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isOpportunity && (
                                                        <span className="text-green-400 text-[10px] font-bold">🎯</span>
                                                    )}
                                                    <ImpactBadge level={difficulty} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ═══════ CONTENT TAB ═══════ */}
                <TabsContent value="content">
                    <div className="space-y-6">
                        {/* Top Content */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Top Performing Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {report.top_content?.map((c, i) => (
                                    <AnimatedItem key={i} index={i}>
                                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-[var(--brand)]/30 transition-all group">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-white text-sm group-hover:text-[var(--brand)] transition-colors">
                                                            {typeof c === "string" ? c : c.title}
                                                        </h4>
                                                        {typeof c !== "string" && c.type && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-600 text-slate-400">
                                                                {c.type}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {typeof c !== "string" && <p className="text-slate-400 text-xs leading-relaxed">{c.description}</p>}
                                                </div>
                                                {typeof c !== "string" && c.url && (
                                                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[var(--brand)] transition-colors shrink-0">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </AnimatedItem>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Content Gaps */}
                        {report.content_gaps && report.content_gaps.length > 0 && (
                            <Card className="bg-slate-800/50 border-orange-500/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                                        Content Gaps
                                        <span className="text-xs text-slate-500 ml-2">(Your Content Opportunities)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {report.content_gaps.map((g, i) => {
                                        const gap = typeof g === "string" ? g : g.gap;
                                        const priority = typeof g !== "string" ? g.priority : "medium";
                                        const action = typeof g !== "string" ? g.action : "";

                                        return (
                                            <AnimatedItem key={i} index={i}>
                                                <div className="p-4 rounded-xl bg-slate-900/50 border border-orange-500/10 hover:border-orange-500/20 transition-all">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h4 className="font-semibold text-white text-sm">{gap}</h4>
                                                        <ImpactBadge level={priority} />
                                                    </div>
                                                    {action && (
                                                        <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-[var(--brand)]/5 border border-[var(--brand)]/10">
                                                            <ArrowRight className="w-3 h-3 text-[var(--brand)] mt-0.5 shrink-0" />
                                                            <p className="text-[var(--brand)]/80 text-xs">{action}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </AnimatedItem>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* ═══════ OPPORTUNITIES TAB ═══════ */}
                <TabsContent value="opportunities">
                    <div className="space-y-6">
                        {report.opportunities?.map((opp, i) => {
                            const opportunity = typeof opp === "string" ? opp : opp.opportunity;
                            const difficulty = typeof opp !== "string" ? opp.difficulty : "medium";
                            const impact = typeof opp !== "string" ? opp.potential_impact : "medium";
                            const steps = typeof opp !== "string" ? opp.action_steps : [];

                            return (
                                <AnimatedItem key={i} index={i}>
                                    <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/20 transition-all overflow-hidden">
                                        <div className="flex">
                                            {/* Color bar */}
                                            <div className={`w-1.5 shrink-0 ${impact === "high" ? "bg-gradient-to-b from-green-400 to-emerald-600" :
                                                impact === "medium" ? "bg-gradient-to-b from-amber-400 to-orange-500" :
                                                    "bg-gradient-to-b from-slate-400 to-slate-600"
                                                }`} />
                                            <div className="flex-1 p-5">
                                                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                                                    <h4 className="font-bold text-white flex items-center gap-2">
                                                        <Rocket className="w-4 h-4 text-green-400" />
                                                        {opportunity}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Difficulty</span>
                                                        <ImpactBadge level={difficulty} />
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-2">Impact</span>
                                                        <ImpactBadge level={impact} />
                                                    </div>
                                                </div>

                                                {steps && steps.length > 0 && (
                                                    <div className="space-y-2 mt-3">
                                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action Steps:</h5>
                                                        {steps.map((step, j) => (
                                                            <div key={j} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/50">
                                                                <div className="w-5 h-5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-[var(--brand)]">{j + 1}</span>
                                                                </div>
                                                                <p className="text-slate-300 text-xs leading-relaxed">{step}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </AnimatedItem>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
