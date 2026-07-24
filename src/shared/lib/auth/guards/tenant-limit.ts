// @/shared/lib/auth/guards/tenant-limit.ts

import { SupabaseClient } from '@supabase/supabase-js'
import { getPlanLimits, FeatureKey } from '@/shared/config/plans'
import { getSubscriptionByTenantID } from '../../supabase/services/subscriptions'

export type LimitCheckResult = {
    allowed: boolean
    code: 'ALLOWED' | 'LIMIT_REACHED' | 'NO_SUBSCRIPTION' | 'FEATURE_LOCKED'
    current?: number
    max?: number | boolean
}

const USAGE_TABLE_MAPPING: Record<string, string> = {
    maxAdmins: 'memberships',
}

export async function checkTenantLimit(
    supabase: SupabaseClient,
    tenantId: string,
    featureKey: FeatureKey
): Promise<LimitCheckResult> {
    const subscription = await getSubscriptionByTenantID(supabase, tenantId)
    if (!subscription) {
        return { allowed: false, code: 'NO_SUBSCRIPTION' }
    }

    const planLimits = getPlanLimits(subscription.plan_name)
    const limitValue = planLimits[featureKey as keyof typeof planLimits]

    if (typeof limitValue === 'boolean') {
        return {
            allowed: limitValue,
            code: limitValue ? 'ALLOWED' : 'FEATURE_LOCKED',
            max: limitValue,
        }
    }

    const tableName = USAGE_TABLE_MAPPING[featureKey]
    if (!tableName) {
        return { allowed: false, code: 'FEATURE_LOCKED' }
    }

    const { count, error } = await supabase
        .from(tableName)
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

    if (error) {
        return { allowed: false, code: 'FEATURE_LOCKED' }
    }

    const currentUsage = count || 0
    const isAllowed = currentUsage < (limitValue as number)

    return {
        allowed: isAllowed,
        code: isAllowed ? 'ALLOWED' : 'LIMIT_REACHED',
        current: currentUsage,
        max: limitValue as number,
    }
}