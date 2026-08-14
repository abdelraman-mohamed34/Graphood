"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface SystemNavigationContextValue {
    available: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
    setAvailable: (available: boolean) => void;
}

const SystemNavigationContext = createContext<SystemNavigationContextValue | null>(null);

export function SystemNavigationProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [available, setAvailableState] = useState(false);
    const setAvailable = useCallback((nextAvailable: boolean) => {
        setAvailableState(nextAvailable);
        if (!nextAvailable) setOpen(false);
    }, []);
    const value = useMemo(
        () => ({ available, open, setOpen, toggle: () => setOpen((current) => !current), setAvailable }),
        [available, open, setAvailable]
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
