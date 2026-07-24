// @/shared/hooks/use-tenant-limit.ts

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/shared/lib/supabase/client'
import { checkTenantLimit } from '@/shared/lib/auth/guards/tenant-limit'
import { FeatureKey } from '@/shared/config/plans'

export function useTenantLimit(tenantId: string, featureKey: FeatureKey) {
    const supabase = createClient()

    return useQuery({
        queryKey: ['tenant-limit', tenantId, featureKey],
        queryFn: () => checkTenantLimit(supabase, tenantId, featureKey),
        enabled: !!tenantId && !!featureKey,
        staleTime: 1000 * 60 * 5,
    })
}