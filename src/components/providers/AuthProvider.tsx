"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// The shape of the user when authenticated with Puter
interface PuterUser {
    username: string;
    email?: string;
}

interface AuthContextType {
    user: PuterUser | null;
    isAuthenticated: boolean;
    isReady: boolean;
    signIn: () => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isReady: false,
    signIn: async () => { },
    signOut: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<PuterUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for Puter SDK to load
        const checkPuter = setInterval(async () => {
            if (typeof window !== "undefined" && window.puter) {
                clearInterval(checkPuter);

                try {
                    const signedIn = window.puter.auth.isSignedIn();
                    setIsAuthenticated(signedIn);

                    if (signedIn) {
                        const userData = await window.puter.auth.getUser();
                        setUser(userData);
                    }
                } catch (e) {
                    console.error("Error checking Puter auth state:", e);
                } finally {
                    setIsReady(true);
                }
            }
        }, 100);

        return () => clearInterval(checkPuter);
    }, []);

    const signIn = async () => {
        if (typeof window !== "undefined" && window.puter) {
            try {
                await window.puter.auth.signIn();
                const userData = await window.puter.auth.getUser();
                setUser(userData);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Sign in aborted or failed:", err);
            }
        }
    };

    const signOut = () => {
        if (typeof window !== "undefined" && window.puter) {
            if (typeof (window.puter.auth as any).signOut === "function") {
                (window.puter.auth as any).signOut();
            }
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isReady, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
