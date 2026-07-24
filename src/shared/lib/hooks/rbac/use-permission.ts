"use client";

import { useMemo } from "react";
import { Membership } from "@/shared/lib/schemas/memberships.schema";
import {
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
} from "../../auth/requires/require-permission";

/**
 * Hook wrapper for permission checks in React
 */
export function usePermission(membership: Membership | null) {
    const permissions = useMemo(() => {
        if (!membership) return [];
        return getUserPermissions(membership);
    }, [membership]);

    return {
        permissions,

        can: (permission: string) =>
            membership ? hasPermission(membership, permission as any) : false,

        canAny: (perms: string[]) =>
            membership ? hasAnyPermission(membership, perms as any) : false,

        canAll: (perms: string[]) =>
            membership ? hasAllPermissions(membership, perms as any) : false,
    };
}