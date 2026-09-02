jest.mock("@/shared/lib/supabase/admin", () => ({ createAdminClient: jest.fn() }));

import { createAdminClient } from "@/shared/lib/supabase/admin";
import { processKashierPayment } from "@/shared/lib/supabase/services/billing/process-kashier-payment.service";

describe("processKashierPayment", () => {
    it("calls the idempotent payment RPC with provider values", async () => {
        const rpc = jest.fn().mockResolvedValue({ data: { status: "PAID" }, error: null });
        jest.mocked(createAdminClient).mockReturnValue({ rpc } as never);

        await expect(processKashierPayment({
            orderId: "order-1",
            transactionRef: "txn-1",
            amount: 25,
            currency: "EGP",
            status: "SUCCESS",
        })).resolves.toEqual({ status: "PAID" });
        expect(rpc).toHaveBeenCalledWith("process_kashier_payment_atomic", {
            p_order_id: "order-1",
            p_transaction_ref: "txn-1",
            p_amount: 25,
            p_currency: "EGP",
            p_status: "SUCCESS",
        });
    });

    it("propagates RPC failures", async () => {
        const error = new Error("database unavailable");
        jest.mocked(createAdminClient).mockReturnValue({
            rpc: jest.fn().mockResolvedValue({ data: null, error }),
        } as never);
        await expect(processKashierPayment({
            orderId: "order-1", transactionRef: "txn-1", amount: 25, currency: "EGP", status: "FAILED",
        })).rejects.toThrow("database unavailable");
    });
});
