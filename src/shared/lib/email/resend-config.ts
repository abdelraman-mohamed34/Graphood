import "server-only";

export function getResendApiKey(context: string) {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) {
        console.warn(context + ": RESEND_API_KEY is missing; email delivery is disabled.");
        return null;
    }
    return key;
}

export function getResendDeliveryConfig(productionRecipient: string) {
    const isProduction = process.env.NODE_ENV === "production";
    const developmentRecipient = process.env.RESEND_DEV_RECEIVER_EMAIL?.trim();

    if (!isProduction && !developmentRecipient) {
        console.warn("Resend development delivery is using the requested recipient. Set RESEND_DEV_RECEIVER_EMAIL to a verified inbox when testing with Resend's development sender.");
    }

    return {
        to: !isProduction && developmentRecipient ? developmentRecipient : productionRecipient,
        from: isProduction
            ? process.env.RESEND_FROM_EMAIL?.trim() || "Graphood <onboarding@resend.dev>"
            : "Graphood <onboarding@resend.dev>",
    };
}
