"use client";

import { useMemo } from "react";

import {
    getPlanLimits,
    type PlanType,
} from "@/shared/config/plans";

import {
    isUnlimitedLicense,
    type LicenseType,
} from "@/shared/config/licensing";

import { useTenant } from "./use-tenant";
import { useMemberships } from "../memberships";
import { useInvitations } from "../invitations";
import { useSubscription } from "../subscriptions";

export function useTenantUsage() {
    const {
        tenantId,
        isLoading: tenantLoading,
        error: tenantError,
    } = useTenant();

    const {
        memberships,
        isLoading: membershipsLoading,
        error: membershipsError,
    } = useMemberships();

    const {
        pendingInvitations,
        isLoading: invitationsLoading,
        error: invitationsError,
    } = useInvitations();

    const {
        subscription,
        isLoading: subscriptionLoading,
        error: subscriptionError,
    } = useSubscription(
        tenantId ?? undefined
    );

    const usage = useMemo(() => {
        const plan = (
            subscription?.plan ?? "STARTER"
        ) as PlanType;

        const licenseType = (
            subscription?.license_type ??
            "SUBSCRIPTION"
        ) as LicenseType;

        const limits = getPlanLimits(plan);

        const unlimited = isUnlimitedLicense(licenseType);

        const adminsCurrent = memberships.filter(
            (membership) =>
                membership.role === "OWNER" ||
                membership.role === "ADMIN"
        ).length;

        const adminsLimit = unlimited
            ? null
            : limits.maxAdmins;

        return {
            plan,

            licenseType,

            admins: {
                current: adminsCurrent,

                limit: adminsLimit,

                remaining:
                    adminsLimit === null
                        ? null
                        : Math.max(
                            adminsLimit -
                            adminsCurrent,
                            0
                        ),

                percent:
                    adminsLimit === null
                        ? null
                        : Math.round(
                            (adminsCurrent / adminsLimit) * 100
                        ),

                unlimited,
            },

            members: {
                limit: unlimited
                    ? null
                    : limits.maxMembers,

                unlimited,
            },

            storage: {
                limit: unlimited
                    ? null
                    : limits.maxStorage,

                unlimited,
            },

            invitations: {
                current:
                    pendingInvitations?.length ??
                    0,
            },

            features: {
                api: limits.api,
                reports: limits.hasReports,
                wordAssistant:
                    limits.hasWordAssistant,
            },
        };
    }, [
        memberships,
        pendingInvitations,
        subscription,
    ]);

    const isLoading = useMemo(
        () =>
            tenantLoading ||
            membershipsLoading ||
            invitationsLoading ||
            subscriptionLoading,
        [
            tenantLoading,
            membershipsLoading,
            invitationsLoading,
            subscriptionLoading,
        ]
    );

    const error = useMemo(
        () =>
            tenantError ??
            membershipsError ??
            invitationsError ??
            subscriptionError,
        [
            tenantError,
            membershipsError,
            invitationsError,
            subscriptionError,
        ]
    );

    return {
        ...usage,
        isLoading,
        error,
    };
}