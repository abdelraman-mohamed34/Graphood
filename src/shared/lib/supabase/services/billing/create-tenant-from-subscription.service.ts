import { createAdminClient } from "../../admin";

export async function createTenantFromSubscription({
    subscriptionId,
}: {
    subscriptionId: string;
}) {
    const supabase = await createAdminClient();

    const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .single();

    if (subscriptionError || !subscription) {
        throw new Error("Subscription not found.");
    }

    if (!subscription.profile_id) {
        throw new Error("Subscription is not linked to a profile.");
    }

    const {
        data: existingTenant,
        error: existingTenantError,
    } = await supabase
        .from("tenants")
        .select("*")
        .eq("subscription_id", subscription.id)
        .maybeSingle();

    if (existingTenantError) {
        throw existingTenantError;
    }

    if (existingTenant) {
        return existingTenant;
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", subscription.profile_id)
        .single();

    if (profileError || !profile?.email) {
        throw new Error("Profile not found.");
    }

    const random = crypto.randomUUID().split("-")[0];

    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
            subscription_id: subscription.id,
            system_id: subscription.system_id,
            owner_id: subscription.profile_id,
            name: "Workspace",
            slug: `workspace-${random}`,
            email: profile.email,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (tenantError) {
        throw tenantError;
    }

    return tenant;
}
