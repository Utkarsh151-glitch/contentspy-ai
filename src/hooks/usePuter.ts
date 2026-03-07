"use client";

import { useState, useEffect, useCallback } from "react";

declare global {
    interface Window {
        puter: {
            auth: {
                signIn: () => Promise<void>;
                signOut: () => void;
                isSignedIn: () => boolean;
                getUser: () => Promise<{ username: string; email?: string }>;
            };
            ai: {
                chat: (
                    prompt: string,
                    options?: {
                        model?: string;
                        tools?: { type: string }[];
                        tool_choice?: string;
                        stream?: boolean;
                    }
                ) => Promise<AsyncIterable<unknown> | unknown>;
            };
            kv: {
                set: (key: string, value: string) => Promise<void>;
                get: (key: string) => Promise<string | null>;
                del: (key: string) => Promise<void>;
            };
        };
    }
}

interface PuterUser {
    username: string;
    email?: string;
}

interface UsePuterReturn {
    isReady: boolean;
    isAuthenticated: boolean;
    user: PuterUser | null;
    signIn: () => Promise<void>;
    error: string | null;
}

export function usePuter(): UsePuterReturn {
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<PuterUser | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkPuter = () => {
            if (window.puter) {
                setIsReady(true);
                try {
                    const signedIn = window.puter.auth.isSignedIn();
                    setIsAuthenticated(signedIn);
                    if (signedIn) {
                        window.puter.auth.getUser().then(setUser).catch(console.error);
                    }
                } catch {
                    // Puter loaded but auth not ready yet
                }
            }
        };

        // Check immediately
        checkPuter();

        // Poll until puter is available (SDK loads async)
        const interval = setInterval(() => {
            if (window.puter) {
                checkPuter();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const signIn = useCallback(async () => {
        if (typeof window === "undefined" || !window.puter) {
            setError("Puter SDK not loaded yet");
            return;
        }
        try {
            await window.puter.auth.signIn();
            setIsAuthenticated(true);
            const userData = await window.puter.auth.getUser();
            setUser(userData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign in failed");
        }
    }, []);

    return { isReady, isAuthenticated, user, signIn, error };
}
