"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, FileText, Database, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { signIn } = useAuth();

    const handleSignIn = async () => {
        await signIn();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#060b13]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
                        >
                            {/* Decorative top pulse */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand)] via-purple-500 to-[var(--brand)] animate-pulse" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--brand)]/20 to-purple-500/20 rounded-full flex items-center justify-center border border-[var(--brand)]/30 shadow-lg shadow-[var(--brand)]/20">
                                    <Lock className="w-8 h-8 text-[var(--brand)]" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                        Secure Your Account
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Connecting to the AI engine requires a free account to securely save your detailed intelligence reports.
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 text-left border border-slate-700/50">
                                    {[
                                        { icon: FileText, text: "Save and download past reports natively" },
                                        { icon: Database, text: "Track competitor metrics over time" },
                                        { icon: ShieldCheck, text: "Access premium AI without API keys" },
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[var(--brand)]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <benefit.icon className="w-3.5 h-3.5 text-[var(--brand)]" />
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium">{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleSignIn}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all hover:scale-[1.02] shadow-xl"
                                    >
                                        Continue with Puter
                                    </button>
                                    <p className="text-xs text-slate-500 mt-4">
                                        By continuing, you agree to our Terms of Service & Privacy Policy. No credit card required.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
