export const DeveloperApiErrorCodes = {
    INVALID_API_KEY: "INVALID_API_KEY",
    API_KEY_DISABLED: "API_KEY_DISABLED",
    API_KEY_EXPIRED: "API_KEY_EXPIRED",

    TENANT_NOT_FOUND: "TENANT_NOT_FOUND",
    TENANT_NOT_ALLOWED: "TENANT_NOT_ALLOWED",
    TENANT_SLUG_REQUIRED: "TENANT_SLUG_REQUIRED",

    SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",

    SYSTEM_NOT_FOUND: "SYSTEM_NOT_FOUND",
    API_ACCESS_DENIED: "API_ACCESS_DENIED",

    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    INVALID_RESOURCE: "INVALID_RESOURCE",
    RESOURCE_ACCESS_DENIED: "RESOURCE_ACCESS_DENIED",

    UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type DeveloperApiErrorCode =
    typeof DeveloperApiErrorCodes[keyof typeof DeveloperApiErrorCodes];

export function isDeveloperApiErrorCode(
    value: string
): value is DeveloperApiErrorCode {
    return Object.values(
        DeveloperApiErrorCodes
    ).includes(value as DeveloperApiErrorCode);
}

export function getDeveloperApiStatusCode(
    code: DeveloperApiErrorCode
): number {
    switch (code) {
        case DeveloperApiErrorCodes.INVALID_API_KEY:
        case DeveloperApiErrorCodes.API_KEY_DISABLED:
        case DeveloperApiErrorCodes.API_KEY_EXPIRED:
            return 401;

        case DeveloperApiErrorCodes.SYSTEM_NOT_FOUND:
        case DeveloperApiErrorCodes.TENANT_NOT_FOUND:
        case DeveloperApiErrorCodes.RESOURCE_NOT_FOUND:
            return 404;

        case DeveloperApiErrorCodes.API_ACCESS_DENIED:
        case DeveloperApiErrorCodes.TENANT_NOT_ALLOWED:
        case DeveloperApiErrorCodes.RESOURCE_ACCESS_DENIED:
        case DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE:
            return 403;

        case DeveloperApiErrorCodes.TENANT_SLUG_REQUIRED:
        case DeveloperApiErrorCodes.INVALID_RESOURCE:
            return 400;

        default:
            return 500;
    }
}