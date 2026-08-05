"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createApiKeyAction,
    deleteApiKeyAction,
    listApiKeysAction,
    regenerateApiKeyAction,
    updateApiKeyAction,
} from "../../actions/developer/api-key";

import {
    DeveloperApiKeyInsert,
    DeveloperApiKeyUpdate,
} from "../../schemas/developer/api-keys";
import { queryKeys } from "@/shared/lib/query";

export function useApiKey(systemId?: string) {
    const queryClient = useQueryClient();

    const apiKeysQuery = useQuery({
        queryKey: queryKeys.systems.apiKeys(systemId),
        queryFn: () => {
            if (!systemId) {
                throw new Error("System ID is required.");
            }

            return listApiKeysAction(systemId);
        },
        enabled: !!systemId,
    });

    const createMutation = useMutation({
        mutationFn: (data: DeveloperApiKeyInsert) =>
            createApiKeyAction(data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.systems.apiKeys(systemId),
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: DeveloperApiKeyUpdate;
        }) => updateApiKeyAction(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.systems.apiKeys(systemId),
            });
        },
    });

    const regenerateMutation = useMutation({
        mutationFn: (id: string) =>
            regenerateApiKeyAction(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.systems.apiKeys(systemId),
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            deleteApiKeyAction(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.systems.apiKeys(systemId),
            });
        },
    });

    return {
        apiKeys: apiKeysQuery.data ?? [],

        isLoading: apiKeysQuery.isLoading,
        error: apiKeysQuery.error?.message ?? null,

        refresh: apiKeysQuery.refetch,

        createApiKey: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateApiKey: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        regenerateApiKey:
            regenerateMutation.mutateAsync,
        isRegenerating:
            regenerateMutation.isPending,

        deleteApiKey: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
