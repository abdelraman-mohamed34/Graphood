import { membershipRoles } from "../memberships.schema";
import { permissions } from "./permissions";

export const systemRoles = ["SUPER_ADMIN", "SUPPORT_AGENT"] as const;
export type SystemRole = (typeof systemRoles)[number];

export type AppRole = typeof membershipRoles[number] | SystemRole;

export const rolePermissions: Record<
    AppRole,
    typeof permissions[number][]
> = {

    SUPER_ADMIN: [...permissions],

    SUPPORT_AGENT: [
        "tenants.read",
        "systems.read",
        "dashboard.read"
    ],

    OWNER: [
        "tenant.manage",
        "tenant.read",

        "members.remove",
        "members.invite",
        "members.read",

        "billing.manage",
        "billing.read",

        "dashboard.read"
    ],

    ADMIN: [
        "tenant.manage",
        "tenant.read",

        "members.invite",
        "members.read",

        "billing.manage",
        "billing.read",

        "dashboard.read"
    ],

    STAFF: [
        "tenant.read",
        "members.read",
        "billing.read",

        "dashboard.read"
    ],

    MEMBER: [
        "tenant.read",
    ],
};