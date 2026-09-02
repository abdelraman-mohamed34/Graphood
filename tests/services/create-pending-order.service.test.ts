import { createPendingOrder } from "@/shared/lib/supabase/services/order/create-order.service";

describe("createPendingOrder", () => {
    it("normalizes totals and forwards the atomic checkout payload", async () => {
        const rpc = jest.fn().mockResolvedValue({
            data: [{ order_id: "order-1", payment_id: "payment-1", is_existing: false }],
            error: null,
        });
        const supabase = { rpc } as never;

        const result = await createPendingOrder({
            supabase,
            profileId: "profile-1",
            systemId: "system-1",
            licenseType: "SUBSCRIPTION",
            plan: "PRO",
            originalAmount: 100.005,
            discountAmount: 10,
            discountPercentage: 10,
            couponId: "coupon-1",
            amount: 90.005,
            currency: "EGP",
            description: "Pro plan",
        });

        expect(rpc).toHaveBeenCalledWith("checkout_system_atomic", expect.objectContaining({
            p_original_amount: 100.01,
            p_discount_amount: 10,
            p_amount: 90.01,
            p_discount_percentage: 10,
            p_coupon_id: "coupon-1",
        }));
        expect(result).toEqual({
            order: { id: "order-1" },
            payment: { id: "payment-1" },
            isExisting: false,
        });
    });

    it.each([
        ["negative amount", { originalAmount: 10, amount: -1 }],
        ["inconsistent totals", { originalAmount: 100, amount: 80, discountAmount: 10 }],
        ["coupon without percentage", { originalAmount: 100, amount: 90, discountAmount: 10, couponId: "c" }],
    ])("rejects %s before calling Supabase", async (_label, overrides) => {
        const rpc = jest.fn();
        const orderInput = {
            supabase: { rpc } as never,
            profileId: "p",
            systemId: "s",
            licenseType: "RESELLER",
            originalAmount: 100,
            amount: 100,
            ...(overrides as Record<string, unknown>),
        } as Parameters<typeof createPendingOrder>[0];
        await expect(createPendingOrder(orderInput)).rejects.toThrow();
        expect(rpc).not.toHaveBeenCalled();
    });
});
