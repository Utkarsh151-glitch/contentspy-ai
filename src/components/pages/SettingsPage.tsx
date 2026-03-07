"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, CreditCard, Bell, Shield, Palette, LogOut, Trash2, Loader2, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getReports, deleteAllReports } from "@/lib/report-store";

interface SettingsPageProps {
    onDataCleared?: () => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40 ${enabled ? "bg-[var(--brand)]" : "bg-slate-600"}`}
        >
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${enabled ? "left-[22px]" : "left-0.5"}`}
            />
        </button>
    );
}

const THEMES = [
    { id: "theme-ocean", name: "Ocean", color: "#137fec", light: "#3d9bff" },
    { id: "theme-emerald", name: "Emerald", color: "#10b981", light: "#34d399" },
    { id: "theme-sunset", name: "Sunset", color: "#f97316", light: "#fb923c" },
    { id: "theme-violet", name: "Violet", color: "#8b5cf6", light: "#a78bfa" },
    { id: "theme-rose", name: "Rose", color: "#f43f5e", light: "#fb7185" },
    { id: "theme-amber", name: "Amber", color: "#f59e0b", light: "#fbbf24" },
];

export function SettingsPage({ onDataCleared }: SettingsPageProps) {
    const { user, isAuthenticated, signOut } = useAuth();
    const [reportCount, setReportCount] = useState(0);
    const [clearing, setClearing] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [competitorAlerts, setCompetitorAlerts] = useState(false);
    const [activeTheme, setActiveTheme] = useState("theme-ocean");

    useEffect(() => {
        if (!isAuthenticated) {
            setReportCount(0);
            return;
        }
        const userId = user?.email || user?.username || "anonymous";
        getReports(userId).then((r) => setReportCount(r.length)).catch(() => { });
        if (typeof window !== "undefined") {
            setEmailNotifs(localStorage.getItem("cs_email_notifs") !== "false");
            setCompetitorAlerts(localStorage.getItem("cs_comp_alerts") === "true");
            const saved = localStorage.getItem("cs_theme") || "theme-ocean";
            setActiveTheme(saved);
        }
    }, [user, isAuthenticated]);

    const applyTheme = (themeId: string) => {
        setActiveTheme(themeId);
        localStorage.setItem("cs_theme", themeId);
        // Remove old theme classes, add new one
        const root = document.documentElement;
        THEMES.forEach((t) => root.classList.remove(t.id));
        root.classList.add(themeId);
    };

    const toggleEmailNotifs = () => {
        const next = !emailNotifs;
        setEmailNotifs(next);
        localStorage.setItem("cs_email_notifs", String(next));
    };

    const toggleCompAlerts = () => {
        const next = !competitorAlerts;
        setCompetitorAlerts(next);
        localStorage.setItem("cs_comp_alerts", String(next));
    };

    const handleClearAll = async () => {
        if (!confirmClear) { setConfirmClear(true); return; }
        setClearing(true);
        try {
            const userId = user?.email || user?.username || "anonymous";
            await deleteAllReports(userId);
            setReportCount(0);
            setConfirmClear(false);
            onDataCleared?.();
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
            <div>
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-slate-400" />
                    Settings
                </h2>
                <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                    <User className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                        <h3 className="font-semibold text-white text-sm">Profile</h3>
                        <p className="text-xs text-slate-500">Your account details</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Display Name</label>
                        <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
                            {isAuthenticated && user ? user.username : "Not signed in"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Email</label>
                        <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">
                            {isAuthenticated && user?.email ? user.email : "Not linked"}
                        </span>
                    </div>
                    {isAuthenticated && (
                        <div className="pt-4 mt-2 border-t border-slate-700/50 flex justify-end">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Theme Picker */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                    <Palette className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                        <h3 className="font-semibold text-white text-sm">Theme</h3>
                        <p className="text-xs text-slate-500">Choose your accent color</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-3">
                        {THEMES.map((theme) => {
                            const isActive = activeTheme === theme.id;
                            return (
                                <motion.button
                                    key={theme.id}
                                    onClick={() => applyTheme(theme.id)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${isActive
                                        ? "border-white/30 bg-slate-700/50 shadow-lg"
                                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg shadow-lg relative"
                                            style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.light})` }}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                >
                                                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-400"}`}>
                                            {theme.name}
                                        </span>
                                    </div>
                                    {/* Preview bar */}
                                    <div className="mt-3 flex gap-1.5">
                                        <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: theme.color }} />
                                        <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: theme.light, opacity: 0.6 }} />
                                        <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: theme.color, opacity: 0.3 }} />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Usage */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                        <h3 className="font-semibold text-white text-sm">Usage</h3>
                        <p className="text-xs text-slate-500">Track your analysis usage</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Reports Generated</label>
                        <span className="text-sm font-bold text-[var(--brand)] bg-[var(--brand)]/10 px-3 py-1.5 rounded-lg">
                            {reportCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Current Plan</label>
                        <span className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg font-semibold">
                            Free - Unlimited
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                        <h3 className="font-semibold text-white text-sm">Notifications</h3>
                        <p className="text-xs text-slate-500">Configure when you receive alerts</p>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <label className="text-sm text-slate-300 font-medium block">Email Notifications</label>
                            <p className="text-xs text-slate-500 mt-0.5">Get report summaries sent to your email</p>
                        </div>
                        <Toggle enabled={emailNotifs} onToggle={toggleEmailNotifs} />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <label className="text-sm text-slate-300 font-medium block">Competitor Alerts</label>
                            <p className="text-xs text-slate-500 mt-0.5">Notify when competitors change strategy</p>
                        </div>
                        <Toggle enabled={competitorAlerts} onToggle={toggleCompAlerts} />
                    </div>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                        <h3 className="font-semibold text-white text-sm">Security</h3>
                        <p className="text-xs text-slate-500">Data and API access details</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Authentication</label>
                        <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">Puter SDK</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <label className="text-sm text-slate-300 font-medium">Data Storage</label>
                        <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700">Puter KV (Encrypted)</span>
                    </div>
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                        <h3 className="font-semibold text-red-400 text-sm">Danger Zone</h3>
                        <p className="text-xs text-slate-500">Irreversible and destructive actions</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-300 font-medium">Delete All Reports</p>
                            <p className="text-xs text-slate-500 mt-0.5">Permanently remove all {reportCount} saved report{reportCount !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                            onClick={handleClearAll}
                            disabled={clearing || reportCount === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/10 disabled:hover:text-red-400 whitespace-nowrap"
                        >
                            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {confirmClear ? "Click again to confirm" : "Delete All"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
