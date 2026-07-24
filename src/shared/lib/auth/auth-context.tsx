"use client";

import { createContext, useContext, ReactNode } from "react";
import { Profile } from "@/shared/lib/schemas/profiles.schema";

type AuthContextType = {
    user: Profile | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
    user,
    isLoading = false,
}: {
    children: ReactNode;
    user: Profile | null;
    isLoading?: boolean;
}) {
    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}