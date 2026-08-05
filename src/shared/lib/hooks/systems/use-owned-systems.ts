"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query";
import { createClient } from "@/shared/lib/supabase/client";
import { getCurrentSystems } from "@/shared/lib/supabase/services/systems/get-current-systems.service";

export function useOwnedSystems() {
    return useQuery({
        queryKey: queryKeys.systems.owned(),
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) throw new Error("Authentication required.");
            return getCurrentSystems(user.id, supabase);
        },
    });
}
