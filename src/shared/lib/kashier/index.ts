import crypto from "crypto";

export class KashierError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KashierError";
    }
}

interface CreateKashierOrderInput {
    orderId: string;
    amount: number;
    currency?: string;
    customer: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
    };
}

export async function createKashierCheckoutUrl({
    orderId,
    amount,
    currency = "EGP",
    customer,
}: CreateKashierOrderInput) {
    const merchantId = (process.env.KASHIER_MERCHANT_ID || "").trim();
    const secretKey = (process.env.KASHIER_SECRET_KEY || "").trim();
    const apiKey = (process.env.KASHIER_API_KEY || "").trim();
    const mode = (process.env.KASHIER_MODE || "test").trim().toLowerCase();

    if (!merchantId || !secretKey || !apiKey) {
        throw new KashierError("Kashier credentials missing from environment variables.");
    }

    const baseUrl = "https://checkout.kashier.io";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const merchantRedirect = encodeURIComponent(`${siteUrl}/marketplace/checkout/${orderId}`);

    const formattedAmount = Math.round(amount);

    const path = `/?payment=${merchantId}.${orderId}.${formattedAmount}.${currency}`;
    const hash = crypto
        .createHmac("sha256", secretKey)
        .update(path)
        .digest("hex");

    const checkoutUrl = `${baseUrl}/?merchantId=${merchantId}&orderId=${orderId}&amount=${formattedAmount}&currency=${currency}&hash=${hash}&apiKey=${apiKey}&mode=${mode}&merchantRedirect=${merchantRedirect}&display=en`;

    return { checkoutUrl };
}