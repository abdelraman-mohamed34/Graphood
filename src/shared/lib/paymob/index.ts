import "server-only";

import { z } from "zod";

const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

const paymobEnvironmentSchema = z.object({
    PAYMOB_API_KEY: z.string().trim().min(1),
    PAYMOB_IFRAME_ID: z.string().trim().regex(/^\d+$/),
    PAYMOB_WALLET_INTEGRATION_ID: z.coerce.number().int().positive(),
    PAYMOB_INSTAPAY_INTEGRATION_ID: z.coerce.number().int().positive(),
}).superRefine((environment, context) => {
    if (environment.PAYMOB_WALLET_INTEGRATION_ID === environment.PAYMOB_INSTAPAY_INTEGRATION_ID) {
        context.addIssue({
            code: "custom",
            path: ["PAYMOB_INSTAPAY_INTEGRATION_ID"],
            message: "Wallet and InstaPay integration IDs must be distinct.",
        });
    }
});

const customerBillingSchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.email(),
    phoneNumber: z.string().trim().min(1),
    city: z.string().trim().min(1).default("NA"),
    country: z.string().trim().min(1).default("EG"),
    street: z.string().trim().min(1).default("NA"),
    building: z.string().trim().min(1).default("NA"),
    floor: z.string().trim().min(1).default("NA"),
    apartment: z.string().trim().min(1).default("NA"),
    state: z.string().trim().min(1).default("NA"),
    postalCode: z.string().trim().min(1).default("NA"),
});

const createPaymentIntentSchema = z.object({
    orderId: z.string().uuid(),
    amount: z.number().finite().positive(),
    currency: z.literal("EGP").default("EGP"),
    paymentMethod: z.enum(["wallet", "instapay"]), // 🎯 تحديد نوع طريقة الدفع
    customer: customerBillingSchema,
});

const authTokenResponseSchema = z.object({ token: z.string().min(1) });
const orderResponseSchema = z.object({ id: z.number().int().positive() });
const paymentKeyResponseSchema = z.object({ token: z.string().min(1) });

export type CreatePaymobPaymentIntentInput = z.input<
    typeof createPaymentIntentSchema
>;

export type PaymobPaymentIntent = {
    iframeUrl: string;
    paymobOrderId: number;
    integrationId: number;
};

export class PaymobError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "PaymobError";
    }
}

async function postToPaymob<T>(
    path: string,
    body: unknown,
    responseSchema: z.ZodType<T>,
): Promise<T> {
    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
        response = await fetch(`${PAYMOB_BASE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            cache: "no-store",
            signal: controller.signal,
        });
    } catch (error) {
        throw new PaymobError(
            error instanceof DOMException && error.name === "AbortError"
                ? "Paymob request timed out."
                : "Could not connect to Paymob.",
            { cause: error },
        );
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        throw new PaymobError(`Paymob request failed with status ${response.status}.`);
    }

    let payload: unknown;
    try {
        payload = await response.json();
    } catch (error) {
        throw new PaymobError("Paymob returned an invalid response.", { cause: error });
    }

    const parsed = responseSchema.safeParse(payload);
    if (!parsed.success) {
        throw new PaymobError("Paymob returned an unexpected response.", {
            cause: parsed.error,
        });
    }

    return parsed.data;
}

/**
 * Creates a classic Paymob Accept payment session and returns its hosted iframe URL.
 * `amount` is expressed in EGP; conversion to Paymob's integer amount_cents happens here.
 */
export async function createPaymobPaymentIntent(
    input: CreatePaymobPaymentIntentInput,
    options: { paymobOrderId?: number } = {},
): Promise<PaymobPaymentIntent> {
    const parsedInput = createPaymentIntentSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new PaymobError("Invalid Paymob payment intent input.", {
            cause: parsedInput.error,
        });
    }

    const parsedEnvironment = paymobEnvironmentSchema.safeParse(process.env);
    if (!parsedEnvironment.success) {
        throw new PaymobError("Paymob is not configured correctly.", {
            cause: parsedEnvironment.error,
        });
    }

    const { orderId, amount, currency, paymentMethod, customer } = parsedInput.data;
    const {
        PAYMOB_API_KEY,
        PAYMOB_IFRAME_ID,
        PAYMOB_WALLET_INTEGRATION_ID,
        PAYMOB_INSTAPAY_INTEGRATION_ID,
    } = parsedEnvironment.data;

    // 🎯 تحديد الـ Integration ID بناءً على طريقة الدفع المختارة
    const integrationId =
        paymentMethod === "instapay"
            ? PAYMOB_INSTAPAY_INTEGRATION_ID
            : PAYMOB_WALLET_INTEGRATION_ID;

    const amountCents = Math.round(amount * 100);

    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
        throw new PaymobError("Invalid payment amount.");
    }

    const { token: authToken } = await postToPaymob(
        "/auth/tokens",
        { api_key: PAYMOB_API_KEY },
        authTokenResponseSchema,
    );

    let paymobOrderId = options.paymobOrderId;
    if (paymobOrderId === undefined) {
        const orderResponse = await postToPaymob(
            "/ecommerce/orders",
            {
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: amountCents,
                currency,
                merchant_order_id: orderId,
                items: [],
            },
            orderResponseSchema,
        );
        paymobOrderId = orderResponse.id;
    }

    const { token: paymentToken } = await postToPaymob(
        "/acceptance/payment_keys",
        {
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: paymobOrderId,
            currency,
            integration_id: integrationId, // 👈 استخدام الـ integrationId الديناميكي
            lock_order_when_paid: true,
            billing_data: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.email,
                phone_number: customer.phoneNumber,
                city: customer.city,
                country: customer.country,
                street: customer.street,
                building: customer.building,
                floor: customer.floor,
                apartment: customer.apartment,
                state: customer.state,
                postal_code: customer.postalCode,
                shipping_method: "NA",
            },
        },
        paymentKeyResponseSchema,
    );

    return {
        iframeUrl: `${PAYMOB_BASE_URL}/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${encodeURIComponent(paymentToken)}`,
        paymobOrderId,
        integrationId,
    };
}
