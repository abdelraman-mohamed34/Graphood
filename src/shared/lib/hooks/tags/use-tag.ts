"use client";

import {
    queryOptions,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";

import type { Tag } from "@/shared/lib/schemas/tags.schema";
import { getTags } from "@/shared/lib/supabase/services/tags/get-tags.service";
import { queryCachePolicy, queryKeys } from "@/shared/lib/query";

export const tagsQueryOptions = queryOptions({
    queryKey: queryKeys.tags.all,
    queryFn: getTags,
    ...queryCachePolicy.longLived,
});

export function useTags(): UseQueryResult<Tag[], Error> {
    return useQuery(tagsQueryOptions);
}
