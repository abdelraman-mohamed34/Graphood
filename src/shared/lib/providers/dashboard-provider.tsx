"use client";

import {
    createContext,
    useContext,
} from "react";
import type { Membership } from "@/shared/lib/schemas/memberships.schema";
import type { Tenant } from "@/shared/lib/schemas/tenants.schema";

interface DashboardContextType {
    tenant: Tenant;
    membership: Membership;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    tenant: Tenant;
    membership: Membership;
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
