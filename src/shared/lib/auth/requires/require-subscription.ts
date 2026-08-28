// src/shared/lib/auth/requires/require-subscription.ts

import { getPlanLimits } from "@/shared/config/plans";
import {
    LICENSE_MODELS,
    LicenseType,
} from "@/shared/config/licensing";
import { Subscription } from "../../schemas/subscriptions.schema";

const ACTIVE_STATUSES = new Set([
    "ACTIVE",
    "TRIAL",
]);

export function requireSubscription(
    subscription: (Pick<Subscription, "plan_name" | "license_type" | "status"> & { end_date?: string | null }) | null | undefined
) {
    const planName =
        subscription?.plan_name ?? "STARTER";

    const licenseType =
        (subscription?.license_type ??
            "SUBSCRIPTION") as LicenseType;

    const limits = getPlanLimits(planName);

    const license =
        LICENSE_MODELS[licenseType] ??
        LICENSE_MODELS.SUBSCRIPTION;

    const expiredByDate = Boolean(subscription?.end_date && new Date(subscription.end_date).getTime() <= Date.now());
    const isActive = ACTIVE_STATUSES.has(subscription?.status ?? "") && !expiredByDate;

    return {
        planName,
        licenseType,
        isActive,

        limits: {
            maxAdmins: limits.maxAdmins,
            hasReports: limits.hasReports,
            hasWordAssistant:
                limits.hasWordAssistant,
            api: limits.api,
        },

        license: {
            canBeResold: license.canBeResold,
            isExclusive: license.isExclusive,
            label: license.label,
        },
    };
}

export type SubscriptionCapabilities = ReturnType<
    typeof requireSubscription
>;
