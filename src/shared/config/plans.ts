// @/shared/config/plans.ts

export const PLAN_LIMITS = {
    STARTER: {
        maxAdmins: 1,
        hasReports: false,
        hasWordAssistant: false,
        api: false,
    },

    PRO: {
        maxAdmins: 5,
        hasReports: true,
        hasWordAssistant: true,
        api: true,
    },

    BUSINESS: {
        maxAdmins: 10,
        hasReports: true,
        hasWordAssistant: true,
        api: true,
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export type FeatureKey =
    | "hasReports"
    | "hasWordAssistant"
    | "api"
    | "maxAdmins"

export function getPlanLimits(planName: string | null | undefined) {
    const normalizedPlan = (planName?.toUpperCase() || "STARTER") as PlanType;

    return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.STARTER;
}