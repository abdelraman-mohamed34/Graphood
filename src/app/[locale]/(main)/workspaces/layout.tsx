// src/app/[locale]/(main)/workspaces
import { redirect } from "next/navigation";

import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getMembershipsByProfileId } from "@/shared/lib/supabase/services/auth/membership/get-memberships-by-profile-id.service";
import { OnboardingProvider } from "@/shared/lib/providers/onboarding-provider";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { requireUser } from "@/shared/lib/auth/requires/require-user";

interface WorkSpacesLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        locale: string
    }>
}

export default async function WorkSpacesLayout({
    params,
    children,
}: WorkSpacesLayoutProps) {

    const { locale } = await params
    const { user, supabase } = await requireUser(locale)

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const memberships = await getMembershipsByProfileId(supabase, user.id);

    return (
        <OnboardingProvider memberships={memberships}>
            {children}
        </OnboardingProvider>
    );
}