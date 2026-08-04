import { useQuery } from "@tanstack/react-query";
import { createClient } from "../../supabase/client";
import { fetchUser } from "../../supabase/services/auth/user/fetch-user.service";
import { fetchProfile } from "../../supabase/services/profile";

export function useUser() {
    const supabase = createClient();

    const {
        data: user,
        error: userError,
        isLoading: isUserLoading,
    } = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(supabase),
        staleTime: Infinity,
    });

    const {
        data: profile,
        error: profileError,
        isLoading: isProfileLoading,
    } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: () => fetchProfile(supabase, user!.id),
        enabled: !!user?.id,
        staleTime: Infinity,
    });

    return {
        user,
        profile,
        error: userError ?? profileError,
        isLoading: isUserLoading || isProfileLoading,
    };
}