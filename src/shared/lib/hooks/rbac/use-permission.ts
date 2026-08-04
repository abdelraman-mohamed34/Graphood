"use client";

import { useMemo } from "react";
import { Membership } from "@/shared/lib/schemas/memberships.schema";
import {
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
} from "../../auth/requires/require-permission";
import type { Permission } from "../../schemas/public/permissions";

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

        can: (permission: Permission) =>
            membership ? hasPermission(membership, permission) : false,

        canAny: (perms: Permission[]) =>
            membership ? hasAnyPermission(membership, perms) : false,

        canAll: (perms: Permission[]) =>
            membership ? hasAllPermissions(membership, perms) : false,
    };
}
