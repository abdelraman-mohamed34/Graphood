"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/shared/lib/supabase/client";
import { requireSubscription } from "@/shared/lib/auth/requires/require-subscription";
import { getSubscriptionByTenantID } from "@/shared/lib/supabase/services/subscriptions/get-subscription-by-tenant-id.service";

const SUBSCRIPTION_STALE_TIME = 1000 * 60 * 5;

export function useSubscription(tenantId?: string) {
    const supabase = createClient();

    const query = useQuery({
        queryKey: ["subscriptions", tenantId],
        enabled: Boolean(tenantId),
        staleTime: SUBSCRIPTION_STALE_TIME,
        queryFn: async () => {
            if (!tenantId) {
                return null;
            }

            return getSubscriptionByTenantID(
                supabase,
                tenantId
            );
        },
    });

    return {
        ...query,
        subscription: query.data,
        capabilities: requireSubscription(query.data),
    };
}