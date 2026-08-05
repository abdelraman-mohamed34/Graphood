import { QueryClient } from "@tanstack/react-query";

export const queryCachePolicy = {
    standard: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    },
    longLived: {
        staleTime: 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    },
} as const;

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                ...queryCachePolicy.standard,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: 0,
            },
        },
    });
}
