import type { PlanType } from "./plans";

export interface PlanPricing {
    monthlyPrice: number;
    tagline: string;
}

export const PLAN_PRICING: Record<PlanType, PlanPricing> = {
    STARTER: {
        monthlyPrice: 0,
        tagline: "",
    },

    PRO: {
        monthlyPrice: 0,
        tagline: "",
    },

    BUSINESS: {
        monthlyPrice: 0,
        tagline: "",
    },
};