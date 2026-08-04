"use client";

import {
    queryOptions,
    useQuery,
    type UseQueryResult,
} from "@tanstack/react-query";

import type { Tag } from "@/shared/lib/schemas/tags.schema";
import { getTags } from "@/shared/lib/supabase/services/tags/get-tags.service";

export const tagsQueryKey = ["tags"] as const;

export const tagsQueryOptions = queryOptions({
    queryKey: tagsQueryKey,
    queryFn: getTags,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
});

export function useTag(): UseQueryResult<Tag[], Error> {
    return useQuery(tagsQueryOptions);
}