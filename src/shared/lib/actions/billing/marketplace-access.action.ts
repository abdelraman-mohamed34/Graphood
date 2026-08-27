"use server";

import { z } from "zod";

import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const inputSchema = z.object({ systemId: z.string().uuid() });

export async function getMarketplaceAccessAction(input: z.infer<typeof inputSchema>) {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return null;

    const session = await createSupabaseServerClient();
    const user = await fetchUser(session);
    if (!user) return null;

    const admin = createAdminClient();
    const { data: tenant, error: tenantError } = await admin
        .from("tenants")
        .select("id, slug, subscription_id")
        .eq("owner_id", user.id)
        .eq("system_id", parsed.data.systemId)
        .maybeSingle();
    if (tenantError || !tenant?.subscription_id) return null;

    const { data: subscription, error: subscriptionError } = await admin
        .from("subscriptions")
        .select("id, plan_name, license_type, status")
        .eq("id", tenant.subscription_id)
        .maybeSingle();
    if (subscriptionError || !subscription) return null;

    return {
        tenantSlug: tenant.slug,
        plan: subscription.plan_name,
        licenseType: subscription.license_type,
        isActive: subscription.status === "ACTIVE" || subscription.status === "TRIAL",
    };
}
