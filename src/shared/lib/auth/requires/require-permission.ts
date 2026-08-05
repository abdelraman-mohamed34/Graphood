import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { rolePermissions } from "../../schemas/public/role-permissions";
import { Permission } from "../../schemas/public/permissions";

/**
 * Get final permissions for a user inside a tenant
 */
type PermissionMembership = Pick<Membership, "role" | "permissions">;

export function getUserPermissions(membership: PermissionMembership): Permission[] {
    const base = rolePermissions[membership.role] || [];

    return Array.from(
        new Set([
            ...base,
            ...membership.permissions || [], // overrides / extra permissions
        ])
    );
}

/**
 * Check single permission
 */
export function hasPermission(
    membership: PermissionMembership,
    permission: Permission
): boolean {
    return getUserPermissions(membership).includes(permission);
}

/**
 * Check multiple permissions (ANY)
 */
export function hasAnyPermission(
    membership: PermissionMembership,
    perms: Permission[]
): boolean {
    const userPerms = getUserPermissions(membership);
    return perms.some((p) => userPerms.includes(p));
}

/**
 * Check multiple permissions (ALL)
 */
export function hasAllPermissions(
    membership: PermissionMembership,
    perms: Permission[]
): boolean {
    const userPerms = getUserPermissions(membership);
    return perms.every((p) => userPerms.includes(p));
}
