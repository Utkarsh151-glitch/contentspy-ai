"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    BarChart3,
    FileSearch,
    Sparkles,
    Info,
    CheckCircle2,
    AlertCircle,
    Terminal,
} from "lucide-react";
import { ThinkingMessage } from "@/lib/types";

const iconMap = {
    search: Search,
    analyze: BarChart3,
    extract: FileSearch,
    generate: Sparkles,
    info: Info,
    complete: CheckCircle2,
    error: AlertCircle,
};

const colorMap = {
    search: "text-blue-400",
    analyze: "text-purple-400",
    extract: "text-amber-400",
    generate: "text-emerald-400",
    info: "text-slate-400",
    complete: "text-green-400",
    error: "text-red-400",
};

interface ThinkingConsoleProps {
    messages: ThinkingMessage[];
    isActive: boolean;
}

export function ThinkingConsole({ messages, isActive }: ThinkingConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0 && !isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden"
        >
            {/* Console header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <Terminal className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-sm font-semibold text-slate-300">
                    AI Thinking Console
                </span>
                {isActive && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]" />
                        </span>
                        <span className="text-xs text-[var(--brand)] font-medium">Processing</span>
                    </div>
                )}
            </div>

            {/* Console body */}
            <div
                ref={scrollRef}
                className="p-4 space-y-2 max-h-64 overflow-y-auto font-mono text-sm"
            >
                <AnimatePresence>
                    {messages.map((msg) => {
                        const Icon = iconMap[msg.type] || Info;
                        const color = colorMap[msg.type] || "text-slate-400";

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-start gap-3"
                            >
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                                <div className="flex-1">
                                    <span className="text-slate-300">{msg.text}</span>
                                    <span className="text-slate-600 text-xs ml-2">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-slate-500"
                    >
                        <span className="inline-flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-[var(--brand)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
