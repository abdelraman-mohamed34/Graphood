import { getKashierCheckoutEnv } from "@/shared/lib/env/server";

export class KashierError extends Error {
    constructor(message: string) { super(message); this.name = "KashierError"; }
}

interface CreateKashierOrderInput {
    orderId: string;
    profileId: string;
    systemId: string;
    amount: number;
    currency?: string;
    locale: "ar" | "en";
    customer: { firstName?: string | null; lastName?: string | null; email: string };
}

export async function createKashierCheckoutUrl({
    orderId,
    profileId,
    systemId,
    amount,
    currency = "EGP",
    locale,
    customer,
}: CreateKashierOrderInput): Promise<{ checkoutUrl: string; sessionId?: string }> {
    const env = getKashierCheckoutEnv();
    const merchantId = env.KASHIER_MERCHANT_ID;
    const secretKey = env.KASHIER_SECRET_KEY;
    const apiKey = env.KASHIER_API_KEY;
    const mode = env.KASHIER_MODE;

    const redirectBase = env.KASHIER_REDIRECT_URL || env.NEXT_PUBLIC_APP_URL || "";
    if (!redirectBase) throw new KashierError("Kashier redirect URL is missing.");

    let siteUrl: URL;
    try {
        siteUrl = new URL(redirectBase);
    } catch {
        throw new KashierError("Kashier redirect URL is invalid.");
    }

    if (mode === "live" && siteUrl.protocol !== "https:") {
        throw new KashierError("Kashier live redirects require HTTPS.");
    }

    if (!Number.isFinite(amount) || amount <= 0 || currency !== "EGP") {
        throw new KashierError("Invalid Kashier amount or currency.");
    }

    const baseUrl = mode === "live"
        ? "https://api.kashier.io/v3/payment/sessions"
        : "https://test-api.kashier.io/v3/payment/sessions";

    let cleanOrigin = siteUrl.origin.replace(/\/+$/, "");

    if (cleanOrigin.includes("localhost") || cleanOrigin.includes("127.0.0.1")) {
        cleanOrigin = "https://sour-streets-matter.loca.lt";
    }

    const payload = {
        amount: Number(amount).toFixed(2),
        currency: currency,
        order: orderId,
        merchantId: merchantId,
        merchantRedirect: `${cleanOrigin}/${locale}/marketplace/checkout/${orderId}`,
        display: locale,
        type: "one-time",
        allowedMethods: "card,wallet",
        customer: {
            email: customer.email,
            reference: profileId,
        },
        metaData: {
            orderId,
            profileId,
            systemId,
        },
    };

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": secretKey,
                "api-key": apiKey,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data?.error?.message || data?.message || JSON.stringify(data) || "Kashier payment session creation failed";
            throw new KashierError(errorMsg);
        }

        const checkoutUrl = data.sessionUrl;
        if (!checkoutUrl) {
            throw new KashierError("Invalid response payload from Kashier API (no sessionUrl found).");
        }

        return { checkoutUrl, sessionId: data._id };
    } catch (error) {
        if (error instanceof KashierError) {
            throw error;
        }
        throw new KashierError(error instanceof Error ? error.message : "An unknown error occurred during the payment session creation.");
    }
}
