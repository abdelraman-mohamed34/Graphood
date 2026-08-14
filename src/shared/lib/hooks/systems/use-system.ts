import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import {
    deleteSystemAction,
    updateSystemAction,
    createSystemAction,
    getPublicSystemAction,
} from "../../actions/developer/systems";

import {
    CreateSystemInput,
    SystemUpdate,
} from "../../schemas/systems.schema";

import { createClient } from "../../supabase/client";

import { queryKeys } from "@/shared/lib/query";
import { queryCachePolicy } from "@/shared/lib/query/query-client";

export function useSystem(systemId?: string) {
    const queryClient = useQueryClient();
    const supabase = createClient();

    const singleSystemQuery = useQuery({
        queryKey: queryKeys.systems.detail(systemId),
        queryFn: async () => {
            if (!systemId) return null;

            return getPublicSystemAction(systemId, supabase);
        },
        enabled: !!systemId,
        ...queryCachePolicy.standard,
    });

    const createMutation = useMutation<
        Awaited<ReturnType<typeof createSystemAction>>,
        Error,
        CreateSystemInput
    >({
        mutationFn: createSystemAction,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.systems.all(),
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

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.systems.all(),
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            deleteSystemAction(id),

        onSuccess: async (_, id) => {
            queryClient.removeQueries({ queryKey: queryKeys.systems.detail(id) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all() });
        },
    });

    return {
        system: singleSystemQuery.data ?? null,

        isLoading: singleSystemQuery.isLoading,

        isSingleLoading:
            singleSystemQuery.isLoading,

        error: singleSystemQuery.error?.message ?? null,

        createSystem: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateSystem: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteSystem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
