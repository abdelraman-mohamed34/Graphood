export type DeveloperApiErrorResponse = {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
};

export const DeveloperApiErrorCodes = {
    API_KEY_MISSING: "API_KEY_MISSING",

    API_KEY_INVALID: "API_KEY_INVALID",

    SYSTEM_NOT_FOUND: "SYSTEM_NOT_FOUND",

    TENANT_NOT_FOUND: "TENANT_NOT_FOUND",

    SYSTEM_TENANT_MISMATCH: "SYSTEM_TENANT_MISMATCH",

    SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",

    CAPABILITY_NOT_ALLOWED: "CAPABILITY_NOT_ALLOWED",
} as const;