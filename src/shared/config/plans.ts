// @/shared/config/plans.ts


export const PLAN_LIMITS = {
    STARTER: {
        maxAdmins: 1,
        maxMembers: 100,
        maxStorage: 5, // GB

        hasReports: false,
        hasWordAssistant: false,
        api: false,
    },

    PRO: {
        maxAdmins: 5,
        maxMembers: 500,
        maxStorage: 50, // GB

        hasReports: true,
        hasWordAssistant: true,
        api: true,
    },

    BUSINESS: {
        maxAdmins: 10,
        maxMembers: 5000,
        maxStorage: 500, // GB

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
    | "maxMembers"
    | "maxStorage";

export function getPlanLimits(planName: string | null | undefined) {
    const normalizedPlan = (planName?.toUpperCase() || "STARTER") as PlanType;

    return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.STARTER;
}