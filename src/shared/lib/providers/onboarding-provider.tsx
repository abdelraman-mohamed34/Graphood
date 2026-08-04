"use client";

import {
    createContext,
    useContext,
} from "react";
import type { MembershipWithTenant } from "@/shared/lib/supabase/services/auth/membership/get-memberships-by-profile-id.service";

interface OnboardingContextType {
    memberships: MembershipWithTenant[];
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

interface OnboardingProviderProps {
    memberships: MembershipWithTenant[];
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
