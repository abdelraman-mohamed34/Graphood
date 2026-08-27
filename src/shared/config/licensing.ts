// @/shared/config/licensing.ts

export const licenseTypes = [
    "SUBSCRIPTION",
    "RESELLER",
    "EXCLUSIVE",
] as const;

export type LicenseType = (typeof licenseTypes)[number];

export const LICENSE_MODELS = {
    SUBSCRIPTION: {
        canBeResold: false,
        isExclusive: false,
        label: "Subscription",
        shortDescription: "Recurring monthly subscription",
        description:
            "Pay a recurring subscription fee and choose the plan that best fits your business. Includes continuous updates and support while your subscription is active.",
    },

    RESELLER: {
        canBeResold: true,
        isExclusive: false,
        label: "Reseller Asset",
        shortDescription: "One-time purchase with resale rights",
        description:
            "Purchase the system once and gain the right to resell it to your own customers. No recurring subscription is required.",
    },

    EXCLUSIVE: {
        canBeResold: false,
        isExclusive: true,
        label: "Exclusive Buyout",
        shortDescription: "Exclusive ownership",
        description:
            "Acquire exclusive ownership of the system. After purchase, it will no longer be available for sale to other customers.",
    },
} as const;

export function isUnlimitedLicense(
    licenseType: string | null | undefined
) {
    return (
        licenseType === "RESELLER" ||
        licenseType === "EXCLUSIVE" ||
        licenseType === "LIFETIME" ||
        licenseType === "ONE_TIME"
    );
}
