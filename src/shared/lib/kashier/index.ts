import crypto from "node:crypto";

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

export async function createKashierCheckoutUrl({ orderId, profileId, systemId, amount, currency = "EGP", locale, customer }: CreateKashierOrderInput) {
    const merchantId = process.env.KASHIER_MERCHANT_ID?.trim() ?? "";
    const secretKey = process.env.KASHIER_SECRET_KEY?.trim() ?? "";
    const apiKey = process.env.KASHIER_API_KEY?.trim() ?? "";
    const mode = process.env.KASHIER_MODE?.trim().toLowerCase();
    if (!merchantId || !secretKey || !apiKey || (mode !== "test" && mode !== "live")) {
        throw new KashierError("Kashier credentials or mode are invalid.");
    }

    const redirectBase = (process.env.KASHIER_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
    if (!redirectBase) throw new KashierError("Kashier redirect URL is missing.");
    let siteUrl: URL;
    try { siteUrl = new URL(redirectBase); } catch { throw new KashierError("Kashier redirect URL is invalid."); }
    if (mode === "live" && siteUrl.protocol !== "https:") throw new KashierError("Kashier live redirects require HTTPS.");
    if (!Number.isFinite(amount) || amount <= 0 || currency !== "EGP") throw new KashierError("Invalid Kashier amount or currency.");

    const formattedAmount = Number(amount).toFixed(2);
    const path = `/?payment=${merchantId}.${orderId}.${formattedAmount}.${currency}`;
    const hash = crypto.createHmac("sha256", secretKey).update(path).digest("hex");
    const merchantRedirect = new URL(`/${locale}/marketplace/checkout/${orderId}`, siteUrl).toString();
    const query = new URLSearchParams({
        merchantId, orderId, amount: formattedAmount, currency, hash, apiKey, mode,
        merchantRedirect, display: locale,
        customerEmail: customer.email,
        customerName: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
        metaData: JSON.stringify({ orderId, profileId, systemId }),
    });
    return { checkoutUrl: `https://checkout.kashier.io/?${query.toString()}` };
}
