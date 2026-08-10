export const permissions = [
    // Tenant permissions
    "tenant.manage",
    "tenant.read",
    "tenant.write",
    "tenant.delete",

    // Members permissions
    "members.read",
    "members.invite",
    "members.remove",
    "members.manage",
    "members.transfer_ownership",

    // Billing permissions
    "billing.read",
    "billing.manage",

    // Dashboards
    "dashboard.read",
    "admin_dashboard.manage",
    "admin_dashboard.read"
] as const;

export type Permission = (typeof permissions)[number];