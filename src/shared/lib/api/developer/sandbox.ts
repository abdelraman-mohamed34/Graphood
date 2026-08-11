import type { DeveloperContext } from "@/shared/lib/types/developer";

export const SANDBOX_MODE_HEADER = "X-Graphood-Mode";

export const MOCK_DEVELOPER_CONTEXT: DeveloperContext = {
    mode: "sandbox",
    systemId: "00000000-0000-4000-8000-000000000001",
    tenantId: "00000000-0000-4000-8000-000000000002",
    tenantSlug: "sandbox",
    subscription: {
        plan: "Sandbox",
        status: "ACTIVE",
        licenseType: "SANDBOX",
        billingInterval: "MONTHLY",
    },
    capabilities: {
        api: true,
        reports: true,
        wordAssistant: true,
    },
};

export const MOCK_SYSTEM = {
    id: MOCK_DEVELOPER_CONTEXT.systemId,
    name: "Graphood Sandbox",
    slug: "graphood-sandbox",
    description: "Mock system for Graphood API integrations.",
    tags: [] as string[],
    icon_url: null,
    is_public: false,
};

export const MOCK_TENANT = {
    id: MOCK_DEVELOPER_CONTEXT.tenantId,
    name: "Mock Tenant",
    slug: MOCK_DEVELOPER_CONTEXT.tenantSlug,
    status: "ACTIVE",
    email: "sandbox@graphood.test",
    phone: null,
    country: null,
    city: null,
    timezone: "UTC",
    branding: {
        logoUrl: null,
        primaryColor: "#000000",
    },
};

export interface DeveloperMembershipResponse {
    id: string;
    role: "OWNER" | "ADMIN" | "STAFF" | "MEMBER";
    permissions: string[];
    status: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
    } | null;
    joinedAt: string | null;
    createdAt: string | null;
}

const sandboxTimestamp = new Date().toISOString();

export const MOCK_MEMBERSHIPS: DeveloperMembershipResponse[] = [
    {
        id: "mem_sandbox_1",
        role: "ADMIN",
        permissions: ["tenant.manage", "members.invite", "reports.view"],
        status: "ACTIVE",
        user: {
            id: "user_mock_123",
            firstName: "John",
            lastName: "Doe",
            email: "sandbox.member@example.com",
            avatarUrl: null,
        },
        joinedAt: sandboxTimestamp,
        createdAt: sandboxTimestamp,
    },
    {
        id: "mem_sandbox_2",
        role: "MEMBER",
        permissions: [],
        status: "ACTIVE",
        user: {
            id: "user_mock_456",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            avatarUrl: null,
        },
        joinedAt: sandboxTimestamp,
        createdAt: sandboxTimestamp,
    },
];

export function isSandboxRequest(apiKey: string, tenantHeader: string | null) {
    const normalizedTenant = tenantHeader?.trim().toLowerCase();

    return apiKey.startsWith("sk_test_") ||
        normalizedTenant === "sandbox" ||
        normalizedTenant === "mock-tenant";
}
