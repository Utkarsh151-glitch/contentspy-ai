"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    ArrowLeftRight,
    Lightbulb,
    Settings,
    Compass,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export type PageId = "dashboard" | "reports" | "benchmarking" | "insights" | "settings";

interface SidebarProps {
    activePage: PageId;
    onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard; section?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "benchmarking", label: "Benchmarking", icon: ArrowLeftRight },
    { id: "insights", label: "Insights", icon: Lightbulb },
    { id: "settings", label: "Settings", icon: Settings, section: "ACCOUNT" },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
    const { isAuthenticated, user, signIn } = useAuth();
    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[260px] h-screen bg-[#0d1520] border-r border-slate-800 flex flex-col shrink-0"
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] flex items-center justify-center shadow-lg shadow-[var(--brand)]/20">
                    <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-extrabold text-white tracking-tight">ContentSpy</h1>
                    <p className="text-[10px] text-[var(--brand)] font-semibold uppercase tracking-widest">AI Intelligence</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-2 space-y-1">
                {navItems.map((item, i) => {
                    const isActive = activePage === item.id;
                    return (
                        <div key={item.id}>
                            {item.section && (
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mt-6 mb-2">
                                    {item.section}
                                </p>
                            )}
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i }}
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }`}
                            >
                                <item.icon className="w-[18px] h-[18px]" />
                                {item.label}
                            </motion.button>
                        </div>
                    );
                })}
            </nav>

            {/* User */}
            <div className="p-4 m-3 rounded-xl bg-slate-800/30 border border-slate-800">
                {isAuthenticated && user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] flex items-center justify-center text-white text-sm font-bold uppercase">
                            {user.username.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email || "Free Plan"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 relative z-20">
                        <p className="text-[10px] text-slate-400 font-medium px-1">Sign in to save reports</p>
                        <button
                            onClick={() => signIn()}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--brand)]/10 hover:bg-[var(--brand)] text-[var(--brand)] hover:text-white rounded-lg text-xs font-bold transition-all relative z-50 pointer-events-auto cursor-pointer"
                        >
                            Sign In / Register
                        </button>
                    </div>
                )}
            </div>
        </motion.aside>
    );
}
