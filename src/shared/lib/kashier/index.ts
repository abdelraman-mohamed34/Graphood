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
}: CreateKashierOrderInput): Promise<{ checkoutUrl: string; sessionId: string }> {
    const merchantId = process.env.KASHIER_MERCHANT_ID?.trim() ?? "";
    const secretKey = process.env.KASHIER_SECRET_KEY?.trim() ?? "";
    const apiKey = process.env.KASHIER_API_KEY?.trim() ?? "";
    const mode = process.env.KASHIER_MODE?.trim().toLowerCase() || "test";
    const webhookUrl = process.env.KASHIER_WEBHOOK_URL?.trim() ?? "";

    if (!merchantId || !secretKey || !apiKey || (mode !== "test" && mode !== "live")) {
        throw new KashierError("Kashier credentials or mode are invalid.");
    }

    const redirectBase = (process.env.KASHIER_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
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
        ? "https://merchant.kashier.io/v3/payment/sessions"
        : "https://test-merchant.kashier.io/v3/payment/sessions";

    const cleanOrigin = siteUrl.origin.replace(/\/+$/, "");

    if (webhookUrl) {
        let webhook: URL;
        try { webhook = new URL(webhookUrl); } catch { throw new KashierError("Kashier webhook URL is invalid."); }
        if (webhook.protocol !== "https:") throw new KashierError("Kashier webhook URL must use HTTPS.");
    }

    const payload = {
        amount: Number(amount).toFixed(2),
        currency: currency,
        order: orderId,
        mid: merchantId,
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
        ...(webhookUrl ? { serverWebhook: webhookUrl } : {}),
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

        const responseText = await response.text();
        let data: Record<string, unknown>;
        try {
            data = JSON.parse(responseText) as Record<string, unknown>;
        } catch {
            throw new KashierError(`Kashier returned a non-JSON response (HTTP ${response.status}): ${responseText.slice(0, 300)}`);
        }

        if (!response.ok) {
            const errorMsg = typeof data.error === "object" && data.error !== null && "message" in data.error
                ? String((data.error as { message?: unknown }).message)
                : typeof data.message === "string" ? data.message : JSON.stringify(data);
            throw new KashierError(errorMsg);
        }

        const checkoutUrl = typeof data.sessionUrl === "string" ? data.sessionUrl : undefined;
        const sessionId = typeof data._id === "string" ? data._id : undefined;
        if (!checkoutUrl || !sessionId) {
            throw new KashierError("Invalid response payload from Kashier API (missing sessionUrl or _id).");
        }

        return { checkoutUrl, sessionId };
    } catch (error) {
        if (error instanceof KashierError) {
            throw error;
        }
        throw new KashierError(error instanceof Error ? error.message : "An unknown error occurred during the payment session creation.");
    }
}
