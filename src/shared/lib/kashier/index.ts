import { headers } from "next/headers";

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
    let webhookUrl = process.env.KASHIER_WEBHOOK_URL?.trim() ?? "";

    if (!merchantId || !secretKey || !apiKey || (mode !== "test" && mode !== "live")) {
        throw new KashierError("Kashier credentials or mode are invalid.");
    }

    const configuredRedirectBase = (process.env.KASHIER_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
    let redirectBase = configuredRedirectBase;

    // In development, provider redirects must return to the host that invoked
    // the action. A production URL in .env.local otherwise creates a valid
    // session that sends the browser to the wrong application instance.
    if (process.env.NODE_ENV !== "production") {
        const requestHeaders = await headers();
        const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
        const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
        if (host) {
            const requestOrigin = `${protocol}://${host}`;
            redirectBase = requestOrigin;
            webhookUrl = `${requestOrigin}/api/webhooks/kashier`;
        }
    }

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

    const baseUrl = process.env.KASHIER_API_URL?.trim() || (mode === "live"
        ? "https://api.kashier.io/v3/payment/sessions"
        : "https://test-api.kashier.io/v3/payment/sessions");

    const cleanOrigin = siteUrl.origin.replace(/\/+$/, "");

    if (webhookUrl) {
        let webhook: URL;
        try { webhook = new URL(webhookUrl); } catch { throw new KashierError("Kashier webhook URL is invalid."); }
        const isLocalDevelopmentWebhook = process.env.NODE_ENV !== "production"
            && ["localhost", "127.0.0.1"].includes(webhook.hostname);
        if (webhook.protocol !== "https:" && !isLocalDevelopmentWebhook) {
            throw new KashierError("Kashier webhook URL must use HTTPS.");
        }
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
        ...(webhookUrl ? { serverWebhook: webhookUrl } : {}),
    };

    try {
        let response: Response;
        try {
            response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": process.env.KASHIER_SECRET_KEY ?? secretKey,
                    "api-key": apiKey,
                },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error("Kashier Fetch Error:", error);
            throw error;
        }

        const responseText = await response.text();
        const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
        let data: Record<string, unknown>;
        try {
            data = JSON.parse(responseText) as Record<string, unknown>;
        } catch {
            console.error("Kashier non-JSON response:", { requestUrl: baseUrl, status: response.status, statusText: response.statusText, contentType, body: responseText.slice(0, 500) });
            throw new KashierError(`Kashier returned a non-JSON response (HTTP ${response.status}): ${responseText.slice(0, 300)}`);
        }

        if (!response.ok) {
            console.error("Kashier API error response:", { requestUrl: baseUrl, status: response.status, statusText: response.statusText, contentType, body: responseText.slice(0, 500) });
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
