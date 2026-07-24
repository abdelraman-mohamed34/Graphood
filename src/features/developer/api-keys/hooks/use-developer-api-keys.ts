"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createApiKeyAction,
    deleteApiKeyAction,
    listApiKeysAction,
    regenerateApiKeyAction,
    updateApiKeyAction,
} from "@/shared/lib/actions/developer/api-key";

import {
    DeveloperApiKeyInsert,
    DeveloperApiKeyUpdate,
} from "@/shared/lib/schemas/developer/api-keys";

interface UseDeveloperApiKeysOptions {
    systemId: string;
}

export function useDeveloperApiKeys({
    systemId,
}: UseDeveloperApiKeysOptions) {
    const queryClient = useQueryClient();

    const queryKey = [
        "developer",
        "api-keys",
        systemId,
    ];

    const {
        data: apiKeys = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () =>
            listApiKeysAction(systemId),
        enabled: !!systemId,
    });

    const createMutation = useMutation({
        mutationFn: (data: DeveloperApiKeyInsert) => createApiKeyAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data, }: { id: string; data: DeveloperApiKeyUpdate; }) => updateApiKeyAction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteApiKeyAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey,
            });
        },
    });

    const regenerateMutation =
        useMutation({
            mutationFn: (id: string) => regenerateApiKeyAction(id),
            onSuccess: () => {
                queryClient.invalidateQueries(
                    {
                        queryKey,
                    }
                );
            },
        });

    return {
        apiKeys,
        isLoading,
        error,
        refresh: refetch,

        createApiKey: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateApiKey: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteApiKey: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        regenerateApiKey: regenerateMutation.mutateAsync,
        isRegenerating: regenerateMutation.isPending,
    };
}