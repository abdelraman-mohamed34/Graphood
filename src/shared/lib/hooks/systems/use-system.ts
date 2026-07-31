import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import {
    deleteSystemAction,
    updateSystemAction,
    createSystemAction,
    getPublicSystemAction,
} from "../../actions/developer/systems";

import {
    CreateSystemInput,
    System,
    SystemUpdate,
} from "../../schemas/systems.schema";

import { createClient } from "../../supabase/client";

import {
    getPublicSystemsClient,
} from "../../supabase/services/systems";

import {
    getCurrentSystems,
} from "../../supabase/services/systems/get-current-systems.service";

export const SYSTEM_QUERY_KEYS = {
    public: ["public-systems"] as const,
    user: ["develop", "current-systems"] as const,
    single: (id?: string) => ["develop", "system", id] as const,
};

export function useSystem(systemId?: string) {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const publicQuery = useQuery({
        queryKey: SYSTEM_QUERY_KEYS.public,
        queryFn: () => getPublicSystemsClient(supabase),
        staleTime: 1000 * 60 * 10,
    });

    const currentSystemsQuery = useQuery({
        queryKey: SYSTEM_QUERY_KEYS.user,
        queryFn: async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                throw new Error("Authentication required.");
            }

            return getCurrentSystems(user.id, supabase);
        },
        staleTime: 1000 * 60 * 10,
    });

    const singleSystemQuery = useQuery({
        queryKey: SYSTEM_QUERY_KEYS.single(systemId),
        queryFn: async () => {
            if (!systemId) return null;

            return getPublicSystemAction(systemId, supabase);
        },
        enabled: !!systemId,
    });

    const createMutation = useMutation<
        System,
        Error,
        CreateSystemInput
    >({
        mutationFn: createSystemAction,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.public,
            });

            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.user,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: SystemUpdate;
        }) => updateSystemAction(id, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.public,
            });

            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.user,
            });

            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.single(
                    variables.id
                ),
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            deleteSystemAction(id),

        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.public,
            });

            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.user,
            });

            queryClient.invalidateQueries({
                queryKey: SYSTEM_QUERY_KEYS.single(id),
            });
        },
    });

    return {
        systems: publicQuery.data ?? [],
        currentSystems: currentSystemsQuery.data ?? [],
        system: singleSystemQuery.data ?? null,

        isLoading:
            publicQuery.isLoading ||
            currentSystemsQuery.isLoading,

        isSingleLoading:
            singleSystemQuery.isLoading,

        error:
            publicQuery.error?.message ??
            currentSystemsQuery.error?.message ??
            singleSystemQuery.error?.message ??
            null,

        createSystem: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateSystem: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteSystem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}