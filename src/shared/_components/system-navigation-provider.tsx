"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SystemNavigationContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
}

const SystemNavigationContext = createContext<SystemNavigationContextValue | null>(null);

export function SystemNavigationProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const value = useMemo(
        () => ({ open, setOpen, toggle: () => setOpen((current) => !current) }),
        [open]
    );

    return (
        <SystemNavigationContext.Provider value={value}>
            {children}
        </SystemNavigationContext.Provider>
    );
}

export function useSystemNavigation() {
    return useContext(SystemNavigationContext);
}
