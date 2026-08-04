import { createAdminClient } from "../../admin";

export async function createMembershipFromTenant({
    tenantId,
}: {
    tenantId: string;
}) {
    const supabase = await createAdminClient();

    // 1. Get tenant
    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

    if (tenantError || !tenant) {
        throw new Error("Tenant not found.");
    }

    if (!tenant.subscription_id) {
        throw new Error("Tenant is not linked to a subscription.");
    }

    // 2. Get subscription
    const { data: subscription, error: subscriptionError } =
        await supabase
            .from("subscriptions")
            .select("profile_id")
            .eq("id", tenant.subscription_id)
            .single();

    if (subscriptionError || !subscription?.profile_id) {
        throw new Error("Subscription not found.");
    }

    const profileId = subscription.profile_id;

    // 3. Idempotency
    const { data: existingMembership, error: membershipCheckError } =
        await supabase
            .from("memberships")
            .select("*")
            .eq("tenant_id", tenant.id)
            .eq("profile_id", profileId)
            .maybeSingle();

    if (membershipCheckError) {
        throw membershipCheckError;
    }

    if (existingMembership) {
        return existingMembership;
    }

    // 4. Create OWNER membership
    const { data: membership, error: membershipError } =
        await supabase
            .from("memberships")
            .insert({
                profile_id: profileId,
                tenant_id: tenant.id,
                current_tenant_id: tenant.id,

                role: "OWNER",
                status: "ACTIVE",

            })
            .select()
            .single();

    if (membershipError) {
        throw membershipError;
    }

    return membership;
}
