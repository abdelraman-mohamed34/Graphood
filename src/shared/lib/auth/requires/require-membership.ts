import { redirect } from "next/navigation";
import { getMembershipBySlug } from "@/shared/lib/supabase/services/memberships/get-membership.service";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

type RequireMembershipProps = {
    tenantSlug: string;
    userId: string;
    redirectTo?: string;
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
};

export async function requireMembership({
    tenantSlug,
    userId,
    supabase,
    redirectTo = "/",
}: RequireMembershipProps) {
    const membership = await getMembershipBySlug({
        supabase,
        tenantSlug,
        userId,
    });

    if (!membership) {
        redirect(redirectTo);
    }

    return membership;
}