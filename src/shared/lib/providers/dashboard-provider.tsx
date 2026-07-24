"use client";

import {
    createContext,
    useContext,
} from "react";

interface DashboardContextType {
    tenant: any;
    membership: any;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    tenant: any;
    membership: any;
    children: React.ReactNode;
}

export function DashboardProvider({
    tenant,
    membership,
    children,
}: DashboardProviderProps) {
    return (
        <DashboardContext.Provider
            value={{
                tenant,
                membership,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboard must be used within DashboardProvider"
        );
    }

    return context;
}