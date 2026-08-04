"use client";

import {
    queryOptions,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    getMarketplaceSystems,
    type MarketplaceSystem,
} from "@/shared/lib/supabase/services/systems/get-marketplace-systems.service";

export const systemsQueryKey = ["marketplace-systems"] as const;

export const systemsQueryOptions = queryOptions({
    queryKey: systemsQueryKey,
    queryFn: () => getMarketplaceSystems(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
});

export function useSystems(): UseQueryResult<MarketplaceSystem[], Error> {
    return useQuery(systemsQueryOptions);
}
