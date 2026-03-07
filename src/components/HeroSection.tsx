"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Globe } from "lucide-react";

interface HeroSectionProps {
    onAnalyze: (url: string, niche?: string) => void;
    isAnalyzing: boolean;
}

export function HeroSection({ onAnalyze, isAnalyzing }: HeroSectionProps) {
    const [url, setUrl] = useState("");
    const [niche, setNiche] = useState("");
    const [showNiche, setShowNiche] = useState(false);

    const handleSubmit = () => {
        if (!url.trim()) return;
        onAnalyze(url.trim(), niche.trim() || undefined);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-slate-900 p-12 flex flex-col items-center text-center"
        >
            {/* Dot pattern background */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 2px 2px, var(--brand) 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand)]/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-2xl w-full">
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                    Analyze Your Competitors{" "}
                    <br />
                    <span className="text-[var(--brand)]">With Intelligence</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    Enter a competitor&apos;s URL to generate a deep-dive AI analysis on
                    their SEO, content strategies, and growth opportunities in seconds.
                </p>

                {/* URL Input */}
                <div className="flex w-full bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-2xl focus-within:ring-4 focus-within:ring-[var(--brand)]/20 transition-all">
                    <div className="flex items-center px-4 text-slate-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-white py-3 text-sm"
                        placeholder="https://competitor-domain.com"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && handleSubmit()}
                        disabled={isAnalyzing}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isAnalyzing || !url.trim()}
                        className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 rounded-lg transition-all flex items-center gap-2 active:scale-95 duration-200"
                    >
                        <Zap className="w-5 h-5" />
                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </button>
                </div>

                {/* Niche toggle */}
                <div className="mt-4 flex flex-col items-center gap-3">
                    {!showNiche ? (
                        <button
                            onClick={() => setShowNiche(true)}
                            className="text-xs text-slate-400 hover:text-[var(--brand)] transition-colors underline underline-offset-2"
                        >
                            + Specify industry/niche (optional)
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="w-full max-w-md"
                        >
                            <input
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[var(--brand)]/30 focus:outline-none focus:border-[var(--brand)]/50 transition-all"
                                placeholder="e.g. SEO tools, E-commerce, SaaS"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                            />
                        </motion.div>
                    )}

                    <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                        <span>No Credit Card Required</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>First Scan Free</span>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
