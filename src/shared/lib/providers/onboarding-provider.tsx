"use client";

import {
    createContext,
    useContext,
} from "react";

interface OnboardingContextType {
    memberships: any[];
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

interface OnboardingProviderProps {
    memberships: any[];
    children: React.ReactNode;
}

export function OnboardingProvider({
    memberships,
    children,
}: OnboardingProviderProps) {
    return (
        <OnboardingContext.Provider
            value={{
                memberships,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);

    if (!context) {
        throw new Error(
            "useOnboarding must be used within OnboardingProvider"
        );
    }

    return context;
}