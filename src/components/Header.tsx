"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

interface HeaderProps {
    title?: string;
    onMenuClick?: () => void;
}

export function Header({ title = "Overview", onMenuClick }: HeaderProps) {
    const { isAuthenticated, user, signIn } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifDrop, setShowNotifDrop] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifDrop(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Auto-focus search input when opened
    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-16 bg-white dark:bg-[#101922] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30"
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 mr-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {title}
                </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
                {/* Search */}
                <div className="relative">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[var(--brand)] transition-colors" />
                        <input
                            ref={searchRef}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-9 pr-8 py-2 text-sm w-36 md:w-56 focus:ring-2 focus:ring-[var(--brand)]/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                            placeholder="Search..."
                            type="text"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {!isAuthenticated && (
                    <button
                        onClick={() => signIn()}
                        className="px-4 py-2 text-sm font-semibold text-[var(--brand)] bg-[var(--brand)]/10 hover:bg-[var(--brand)] hover:text-white rounded-lg transition-all"
                    >
                        Sign In
                    </button>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifDrop(!showNotifDrop)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 relative"
                    >
                        <Bell className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {showNotifDrop && (
                            <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                className="absolute right-0 top-12 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                            >
                                <div className="px-4 py-3 border-b border-slate-700">
                                    <h4 className="text-sm font-semibold text-white">Notifications</h4>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-sm text-slate-400">No new notifications</p>
                                    <p className="text-xs text-slate-500 mt-1">You&apos;re all caught up!</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User avatar */}
                {isAuthenticated && user && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] flex items-center justify-center text-white text-xs font-bold uppercase">
                        {user.username.charAt(0)}
                    </div>
                )}
            </div>
        </motion.header>
    );
}
