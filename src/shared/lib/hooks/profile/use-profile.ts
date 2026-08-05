// src/shared/lib/hooks/profile/use-profile.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/shared/lib/supabase/client";

import {
    removeAvatarAction,
    uploadAvatarAction,
    updateProfileAction,
    type UpdateProfileInput,
} from "../../actions/profile";

import {
    fetchProfile,
    getAvatarUrl,
} from "../../supabase/services/profile";
import { queryKeys } from "@/shared/lib/query";

export function useProfile(locale: string) {
    const supabase = createClient();
    const queryClient = useQueryClient();

    const invalidateProfile = async () => {
        await queryClient.invalidateQueries({
            queryKey: queryKeys.profiles.currentWithAvatar(),
        });
    };

    const profileQuery = useQuery({
        queryKey: queryKeys.profiles.currentWithAvatar(),
        queryFn: async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                throw new Error("Authentication required.");
            }

            const profile = await fetchProfile(
                supabase,
                user.id
            );

            if (!profile) {
                throw new Error("Profile not found.");
            }

            const avatarUrl = profile.avatar_url
                ? await getAvatarUrl({
                    supabase,
                    path: profile.avatar_url,
                })
                : null;

            return {
                ...profile,
                avatarUrl,
            };
        },
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            uploadAvatarAction(locale, file),

        onSuccess: async (result) => {
            if (!result.success) return;

            await invalidateProfile();
        },
    });

    const removeMutation = useMutation({
        mutationFn: () =>
            removeAvatarAction(locale),

        onSuccess: async (result) => {
            if (!result.success) return;

            await invalidateProfile();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (input: UpdateProfileInput) =>
            updateProfileAction(locale, input),

        onSuccess: async (result) => {
            if (!result.success) return;

            await invalidateProfile();
        },
    });

    return {
        profile: profileQuery.data ?? null,

        isLoading: profileQuery.isLoading,

        error: profileQuery.error?.message || null,

        refetch: profileQuery.refetch,

        uploadAvatar: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,

        removeAvatar: removeMutation.mutateAsync,
        isRemoving: removeMutation.isPending,

        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
