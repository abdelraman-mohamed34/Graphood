jest.mock("@/shared/lib/supabase/admin", () => ({ createAdminClient: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service", () => ({ getTenantBySlug: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/tenants/update-tenant.service", () => ({ updateTenantService: jest.fn() }));
jest.mock("@/shared/lib/auth/requires/require-user", () => ({ requireUser: jest.fn() }));
jest.mock("@/shared/lib/auth/requires/require-membership", () => ({ requireMembership: jest.fn() }));
jest.mock("@/shared/lib/auth/requires/require-permission", () => ({ hasPermission: jest.fn() }));

import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";
import { updateTenantService } from "@/shared/lib/supabase/services/tenants/update-tenant.service";
import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { updateTenantAction } from "@/shared/lib/actions/tenants/update-tenant.action";

const data = { name: "Acme Workspace", slug: "acme", email: "owner@example.com", phone: null, country: null, city: null, address: null, timezone: "Africa/Cairo", logo_url: null, primary_color: "#112233" };
const tenant = { id: "tenant-1" };
const membership = { tenant_id: "tenant-1", role: "ADMIN", permissions: [] };

describe("updateTenantAction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(requireUser).mockResolvedValue({ user: { id: "user-1" }, supabase: {} } as never);
        jest.mocked(getTenantBySlug).mockResolvedValue(tenant as never);
        jest.mocked(requireMembership).mockResolvedValue(membership as never);
        jest.mocked(hasPermission).mockReturnValue(true);
        jest.mocked(createAdminClient).mockReturnValue({} as never);
        jest.mocked(updateTenantService).mockResolvedValue({ ...tenant, ...data } as never);
    });

    it("rejects invalid settings before auth and database calls", async () => {
        const result = await updateTenantAction({ tenantSlug: "Acme", locale: "en", data: { ...data, email: "bad" } });
        expect(result.success).toBe(false);
        expect(requireUser).not.toHaveBeenCalled();
    });

    it("denies members without tenant.manage", async () => {
        jest.mocked(hasPermission).mockReturnValue(false);
        await expect(updateTenantAction({ tenantSlug: "Acme", locale: "en", data })).resolves.toEqual({ success: false, message: "Unauthorized." });
        expect(updateTenantService).not.toHaveBeenCalled();
    });

    it("enforces tenant scope and writes through the admin service client", async () => {
        const result = await updateTenantAction({ tenantSlug: "Acme", locale: "en", data });
        expect(result).toMatchObject({ success: true, tenant: { id: "tenant-1" } });
        expect(updateTenantService).toHaveBeenCalledWith({ supabase: {}, tenantId: "tenant-1", data });
    });
});
