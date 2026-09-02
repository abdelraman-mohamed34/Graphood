jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/auth/user/fetch-user.service", () => ({ fetchUser: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/systems", () => ({ getSystemById: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/order/create-order.service", () => ({ createPendingOrder: jest.fn() }));
jest.mock("@/shared/lib/supabase/services/billing", () => ({
    getPendingUserSystemOrder: jest.fn(),
    getUserSystemOrder: jest.fn(),
}));
jest.mock("@/shared/lib/supabase/services/coupons", () => ({ validateCoupon: jest.fn() }));

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { createPendingOrder } from "@/shared/lib/supabase/services/order/create-order.service";
import { getPendingUserSystemOrder, getUserSystemOrder } from "@/shared/lib/supabase/services/billing";
import { createOrderAction } from "@/shared/lib/actions/billing/create-order.action";

const input = { systemId: "11111111-1111-4111-8111-111111111111", licenseType: "SUBSCRIPTION" as const, plan: "PRO" as const };
const system = { id: input.systemId, name: "CRM", status: "ACTIVE", is_public: true, owner_id: "owner", currency: "EGP", starter_price: 10, pro_price: 20, business_price: 30, reseller_price: 100, exclusive_price: 200 };

describe("createOrderAction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
        jest.mocked(fetchUser).mockResolvedValue({ id: "buyer" } as never);
        jest.mocked(getSystemById).mockResolvedValue(system as never);
        jest.mocked(getPendingUserSystemOrder).mockResolvedValue(null);
        jest.mocked(getUserSystemOrder).mockResolvedValue(null);
        jest.mocked(createPendingOrder).mockResolvedValue({ order: { id: "order-1" }, payment: { id: "payment-1" }, isExisting: false });
    });

    it("rejects malformed input before creating a Supabase client", async () => {
        const result = await createOrderAction({ systemId: "bad", licenseType: "RESELLER" });
        expect(result.success).toBe(false);
        expect(createSupabaseServerClient).not.toHaveBeenCalled();
    });

    it("returns an existing pending order without creating another", async () => {
        jest.mocked(getPendingUserSystemOrder).mockResolvedValue({ id: "existing-order" } as never);
        await expect(createOrderAction(input)).resolves.toEqual({ success: true, orderId: "existing-order", isExisting: true });
        expect(createPendingOrder).not.toHaveBeenCalled();
    });

    it("creates a priced subscription order for an authenticated buyer", async () => {
        const result = await createOrderAction(input);
        expect(result).toMatchObject({ success: true, orderId: "order-1", paymentId: "payment-1", amount: 20, currency: "EGP" });
        expect(createPendingOrder).toHaveBeenCalledWith(expect.objectContaining({ amount: 20, originalAmount: 20, plan: "PRO", licenseType: "SUBSCRIPTION" }));
    });

    it.each([
        ["unauthenticated", null, "Unauthorized."],
        ["private", { ...system, is_public: false }, "This system is private."],
        ["self-owned", { ...system, owner_id: "buyer" }, "You cannot purchase your own system."],
    ])("rejects %s purchases", async (_label, systemValue, message) => {
        if (systemValue) jest.mocked(getSystemById).mockResolvedValue(systemValue as never);
        else jest.mocked(fetchUser).mockResolvedValue(null);
        await expect(createOrderAction(input)).resolves.toMatchObject({ success: false, error: message });
    });
});
