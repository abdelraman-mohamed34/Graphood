import type { FeatureKey } from "@/shared/config/plans";

export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        user: () => ["auth", "user"] as const,
    },
    profiles: {
        all: ["profiles"] as const,
        detail: (profileId?: string) => ["profiles", "detail", profileId] as const,
        currentWithAvatar: () => ["profiles", "current-with-avatar"] as const,
    },
    platformStaff: {
        role: () => ["platform-staff", "role"] as const,
        list: () => ["platform-staff", "list"] as const,
    },
    systems: {
        all: ["systems"] as const,
        marketplace: () => ["systems", "marketplace"] as const,
        public: () => ["systems", "public"] as const,
        owned: () => ["systems", "owned"] as const,
        detail: (systemId?: string) => ["systems", "detail", systemId] as const,
        apiKeys: (systemId?: string) => ["systems", "detail", systemId, "api-keys"] as const,
        coupons: (systemId?: string) => ["systems", "detail", systemId, "coupons"] as const,
    },
    tenants: {
        all: ["tenants"] as const,
        detail: (tenantSlug?: string) => ["tenants", "detail", tenantSlug] as const,
        membership: (tenantSlug?: string, profileId?: string) =>
            ["tenants", "detail", tenantSlug, "membership", profileId] as const,
        memberships: (tenantSlug?: string) =>
            ["tenants", "detail", tenantSlug, "memberships"] as const,
        invitations: (tenantSlug?: string) =>
            ["tenants", "detail", tenantSlug, "invitations", "pending"] as const,
        subscription: (tenantId?: string) =>
            ["tenants", "by-id", tenantId, "subscription"] as const,
        limit: (tenantId: string, featureKey: FeatureKey) =>
            ["tenants", "by-id", tenantId, "limits", featureKey] as const,
    },
    orders: {
        all: ["orders"] as const,
        detail: (orderId?: string) => ["orders", "detail", orderId] as const,
        paymentStatus: (orderId?: string) => ["orders", "payment-status", orderId] as const,
        pendingForSystem: (systemId?: string) => ["orders", "pending", "system", systemId] as const,
    },
    tags: {
        all: ["tags"] as const,
    },
} as const;

export const mutationKeys = {
    tenants: {
        update: (tenantSlug: string) => ["tenants", tenantSlug, "update"] as const,
        removeMember: (tenantSlug: string) => ["tenants", tenantSlug, "memberships", "remove"] as const,
    },
} as const;
