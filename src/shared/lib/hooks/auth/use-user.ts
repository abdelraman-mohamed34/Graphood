import { useQuery } from "@tanstack/react-query";
import { createClient } from "../../supabase/client";
import { fetchUser } from "../../supabase/services/auth/user/fetch-user.service";
import { fetchProfile } from "../../supabase/services/profile";
import { queryKeys } from "@/shared/lib/query";

export function useUser() {
    const supabase = createClient();

    const {
        data: user,
        error: userError,
        isLoading: isUserLoading,
    } = useQuery({
        queryKey: queryKeys.auth.user(),
        queryFn: () => fetchUser(supabase),
    });

    const {
        data: profile,
        error: profileError,
        isLoading: isProfileLoading,
    } = useQuery({
        queryKey: queryKeys.profiles.detail(user?.id),
        queryFn: () => fetchProfile(supabase, user!.id),
        enabled: !!user?.id,
    });

    return {
        user,
        profile,
        error: userError ?? profileError,
        isLoading: isUserLoading || isProfileLoading,
    };
}
