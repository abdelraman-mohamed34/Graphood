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
import { queryCachePolicy, queryKeys } from "@/shared/lib/query";

export const systemsQueryOptions = queryOptions({
    queryKey: queryKeys.systems.marketplace(),
    queryFn: () => getMarketplaceSystems(),
    ...queryCachePolicy.standard,
});

export function useSystems(): UseQueryResult<MarketplaceSystem[], Error> {
    return useQuery(systemsQueryOptions);
}
