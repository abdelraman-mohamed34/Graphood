import "server-only";

import { z } from "zod";

import { createAdminClient } from "../../admin";

const provisionOrderResultSchema = z.object({
    subscription_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    membership_id: z.string().uuid(),
    is_existing: z.boolean(),
});

async function fallbackProvisionOrder(orderId: string) {
    const admin = createAdminClient();
    let order: { id: string; profile_id: string; system_id: string; subscription_id: string | null; license_type: string; plan: string | null; amount: number; currency: string | null; status: string | null } | null = null;
    try {
        const result = await admin.from("orders").select("id, profile_id, system_id, subscription_id, license_type, plan, amount, currency, status").eq("id", orderId).single();
        if (result.error) throw result.error;
        order = result.data;
    } catch (error) {
        console.error("CRITICAL_PROVISION_ERROR: order lookup failed", error);
        throw error;
    }

    if (!order) throw new Error("Order not found during fallback provisioning.");

    const existingTenant = await admin
        .from("tenants")
        .select("id, subscription_id")
        .eq("owner_id", order.profile_id)
        .eq("system_id", order.system_id)
        .maybeSingle();
    if (existingTenant.error) throw existingTenant.error;

    let subscriptionId = order.subscription_id;
    try {
        if (!subscriptionId) {
            const existing = await admin.from("subscriptions").select("id").eq("order_id", order.id).maybeSingle();
            if (existing.error) throw existing.error;
            subscriptionId = existing.data?.id ?? null;
        }
        if (!subscriptionId) {
            const inserted = await admin.from("subscriptions").insert({
                order_id: order.id,
                profile_id: order.profile_id,
                system_id: order.system_id,
                plan_name: order.license_type === "SUBSCRIPTION" ? order.plan ?? "STARTER" : order.license_type,
                license_type: order.license_type,
                billing_interval: order.license_type === "SUBSCRIPTION" ? "MONTHLY" : "ONE_TIME",
                price: order.amount,
                currency: order.currency ?? "EGP",
                status: "ACTIVE",
                start_date: new Date().toISOString(),
                auto_renew: order.license_type === "SUBSCRIPTION",
            }).select("id").single();
            if (inserted.error) throw inserted.error;
            subscriptionId = inserted.data.id;
        }
    } catch (error) {
        console.error("CRITICAL_PROVISION_ERROR: subscription step failed", error);
        throw error;
    }

    let tenantId: string | null = existingTenant.data?.id ?? null;
    try {
        if (!tenantId) {
            const profile = await admin.from("profiles").select("email").eq("id", order.profile_id).single();
            if (profile.error || !profile.data?.email) throw profile.error ?? new Error("Profile email is missing.");
            const inserted = await admin.from("tenants").insert({
                subscription_id: subscriptionId,
                system_id: order.system_id,
                owner_id: order.profile_id,
                name: "Workspace",
                slug: `workspace-${subscriptionId.replace(/-/g, "")}`,
                email: profile.data.email,
                status: "ACTIVE",
            }).select("id").single();
            if (inserted.error) throw inserted.error;
            tenantId = inserted.data.id;
        } else if (existingTenant.data?.subscription_id !== subscriptionId) {
            if (existingTenant.data?.subscription_id) {
                const canceled = await admin
                    .from("subscriptions")
                    .update({ status: "CANCELED", auto_renew: false })
                    .eq("id", existingTenant.data.subscription_id)
                    .in("status", ["ACTIVE", "TRIAL", "PAST_DUE"]);
                if (canceled.error) throw canceled.error;
            }
            const updated = await admin
                .from("tenants")
                .update({ subscription_id: subscriptionId })
                .eq("id", tenantId);
            if (updated.error) throw updated.error;
        }
    } catch (error) {
        console.error("CRITICAL_PROVISION_ERROR: tenant step failed", error);
        throw error;
    }

    let membershipId: string | null = null;
    try {
        const existing = await admin.from("memberships").select("id").eq("tenant_id", tenantId).eq("profile_id", order.profile_id).maybeSingle();
        if (existing.error) throw existing.error;
        membershipId = existing.data?.id ?? null;
        if (!membershipId) {
            const inserted = await admin.from("memberships").insert({
                profile_id: order.profile_id,
                tenant_id: tenantId,
                current_tenant_id: tenantId,
                role: "OWNER",
                permissions: [],
                status: "ACTIVE",
            }).select("id").single();
            if (inserted.error) throw inserted.error;
            membershipId = inserted.data.id;
        }
    } catch (error) {
        console.error("CRITICAL_PROVISION_ERROR: membership step failed", error);
        throw error;
    }

    try {
        const updated = await admin.from("orders").update({ status: "PAID", subscription_id: subscriptionId }).eq("id", order.id);
        if (updated.error) throw updated.error;
    } catch (error) {
        console.error("CRITICAL_PROVISION_ERROR: order update failed", error);
        throw error;
    }

    return {
        subscription: { id: subscriptionId },
        tenant: { id: tenantId },
        membership: { id: membershipId },
        isExisting: true,
    };
}

export async function provisionOrder({
    orderId,
    webhookEventId,
}: {
    orderId: string;
    webhookEventId?: string | null;
}) {
    try {
        const admin = createAdminClient();
        const { data, error } = await admin.rpc("provision_paid_order_atomic", {
            p_order_id: orderId,
            p_webhook_event_id: webhookEventId ?? null,
        });

        if (error) throw error;

        const parsed = provisionOrderResultSchema.safeParse(data?.[0]);
        if (!parsed.success) {
            throw new Error(`Invalid provisioning response from database: ${parsed.error.message}`);
        }

        return {
            subscription: { id: parsed.data.subscription_id },
            tenant: { id: parsed.data.tenant_id },
            membership: { id: parsed.data.membership_id },
            isExisting: parsed.data.is_existing,
        };
    } catch (error) {
        const details = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;
        console.error("CRITICAL_PROVISION_ERROR:", JSON.stringify(details, null, 2));

        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("duplicate") || message.includes("unique") || message.includes("already exists")) {
            try {
                const admin = createAdminClient();
                const { data: order } = await admin
                    .from("orders")
                    .select("subscription_id")
                    .eq("id", orderId)
                    .maybeSingle();
                const subscriptionId = order?.subscription_id;
                if (subscriptionId) {
                    const { data: tenant } = await admin
                        .from("tenants")
                        .select("id")
                        .eq("subscription_id", subscriptionId)
                        .maybeSingle();
                    if (tenant?.id) {
                        const { data: membership } = await admin
                            .from("memberships")
                            .select("id")
                            .eq("tenant_id", tenant.id)
                            .maybeSingle();
                        if (membership?.id) {
                            return {
                                subscription: { id: subscriptionId },
                                tenant: { id: tenant.id },
                                membership: { id: membership.id },
                                isExisting: true,
                            };
                        }
                    }
                }
            } catch (lookupError) {
                console.error("CRITICAL_PROVISION_ERROR: duplicate recovery lookup failed", lookupError);
            }
        }

        try {
            return await fallbackProvisionOrder(orderId);
        } catch (fallbackError) {
            console.error("CRITICAL_PROVISION_ERROR: fallback provisioning failed", JSON.stringify(fallbackError, null, 2));
        }

        if (webhookEventId) {
            try {
                const { error: recordError } = await createAdminClient().rpc("mark_payment_webhook_event_failed", {
                    p_event_id: webhookEventId,
                    p_error: error instanceof Error ? error.message : JSON.stringify(error),
                });
                if (recordError) {
                    console.error("CRITICAL_PROVISION_ERROR: failed to record webhook failure", recordError);
                }
            } catch (recordError) {
                console.error("CRITICAL_PROVISION_ERROR: webhook failure recording threw", recordError);
            }
        }

        throw error;
    }
}
