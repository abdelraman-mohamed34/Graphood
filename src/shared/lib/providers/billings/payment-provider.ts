// src/shared/lib/providers/billings/payment-provider.ts

export type PaymentProvider = "KASHIER";


export interface PaymentProviderAdapter {

    verifyPayment(
        payload: unknown,
        headers: Headers
    ): Promise<{
        success: boolean;
        orderId?: string;
        transactionRef?: string;
        providerReference?: string;
    }>;

}
