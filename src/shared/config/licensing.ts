// @/shared/config/licensing.ts

export const licenseTypes = [
    "SUBSCRIPTION",
    "RESELLER",
    "EXCLUSIVE"
] as const;

export type LicenseType = (typeof licenseTypes)[number];

export const LICENSE_MODELS = {
    SUBSCRIPTION: {
        canBeResold: false,
        isExclusive: false,
        label: "Subscription",
    },
    RESELLER: {
        canBeResold: true,
        isExclusive: false,
        label: "Reseller Asset",
    },
    EXCLUSIVE: {
        canBeResold: false,
        isExclusive: true,
        label: "Exclusive Buyout",
    }
} as const;