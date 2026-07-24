"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPublicSystemsClient } from "../../supabase/services/systems";
import { createSystemAction, deleteSystemAction, updateSystemAction } from "../../actions/developer/systems";
import { SystemInsert, SystemUpdate } from "../../schemas/systems.schema";
import { createClient } from "../../supabase/client";
import { getCurrentSystems } from "../../supabase/services/systems/get-current-systems.service";
import { getSystemAction } from "../../actions/developer/systems";

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
        refetchOnWindowFocus: false,
    });

    const currentSystemsQuery = useQuery({
        queryKey: SYSTEM_QUERY_KEYS.user,
        queryFn: async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) throw new Error("required user");

            return getCurrentSystems(user.id, supabase);
        },
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    const singleSystemQuery = useQuery({
        queryKey: SYSTEM_QUERY_KEYS.single(systemId),
        queryFn: async () => {
            if (!systemId) return null;
            return getSystemAction(systemId, supabase);
        },
        enabled: !!systemId,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: SystemInsert) => createSystemAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.public });
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.user });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: SystemUpdate }) => updateSystemAction(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.public });
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.user });
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.single(variables.id) });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSystemAction(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.public });
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.user });
            queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.single(id) });
        },
    });

    return {
        // Data
        systems: publicQuery.data || [],
        currentSystems: currentSystemsQuery.data || [],
        system: singleSystemQuery.data || null,

        // Loading & Error states
        isLoading: publicQuery.isLoading || currentSystemsQuery.isLoading,
        isSingleLoading: singleSystemQuery.isLoading,
        error: publicQuery.error?.message || currentSystemsQuery.error?.message || singleSystemQuery.error?.message || null,

        // Refresh functions
        refreshPublic: publicQuery.refetch,
        refreshCurrent: currentSystemsQuery.refetch,
        refreshSingle: singleSystemQuery.refetch,

        // Actions
        createSystem: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateSystem: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteSystem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}