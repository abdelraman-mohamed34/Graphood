export const permissions = [
    "tenants.manage",
    "tenants.read",

    "tenant.manage",
    "tenant.read",
    "tenant.write",
    "tenant.delete",

    "members.read",
    "members.invite",
    "members.remove",
    "members.manage",

    "billing.read",
    "billing.manage",

    "systems.read",
    "systems.manage",

    "dashboard.read"
] as const;

export type Permission = (typeof permissions)[number];