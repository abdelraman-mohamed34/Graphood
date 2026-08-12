import { resolveDeveloperContextAction } from "@/shared/lib/actions/developer/context/resolve-developer-context.action";
import {
    DeveloperApiErrorCodes,
    getDeveloperApiStatusCode,
    isDeveloperApiErrorCode,
} from "@/shared/lib/api/developer/errors";
import type { DeveloperApiErrorCode } from "@/shared/lib/api/developer/errors";
import { requireApiAccess } from "@/shared/lib/api/developer/guards/require-api-access";
import { developerJsonError } from "@/shared/lib/api/developer/response";
import type { DeveloperContext } from "@/shared/lib/types/developer";
import {
    isSandboxRequest,
    MOCK_DEVELOPER_CONTEXT,
    SANDBOX_MODE_HEADER,
} from "@/shared/lib/api/developer/sandbox";

type DeveloperHandler = (
    context: DeveloperContext,
    request: Request
) => Response | Promise<Response>;

const ERROR_MESSAGES: Record<DeveloperApiErrorCode, string> = {
    [DeveloperApiErrorCodes.INVALID_API_KEY]: "The API key is missing or invalid",
    [DeveloperApiErrorCodes.API_KEY_DISABLED]: "The API key is disabled",
    [DeveloperApiErrorCodes.API_KEY_EXPIRED]: "The API key has expired",
    [DeveloperApiErrorCodes.TENANT_NOT_FOUND]: "Tenant not found",
    [DeveloperApiErrorCodes.TENANT_NOT_ALLOWED]: "The API key cannot access this tenant",
    [DeveloperApiErrorCodes.TENANT_SLUG_REQUIRED]: "Tenant slug is required",
    [DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE]: "The subscription is inactive",
    [DeveloperApiErrorCodes.SYSTEM_NOT_FOUND]: "System not found",
    [DeveloperApiErrorCodes.API_ACCESS_DENIED]: "API access is not available for this plan",
    [DeveloperApiErrorCodes.RESOURCE_NOT_FOUND]: "Resource not found",
    [DeveloperApiErrorCodes.INVALID_RESOURCE]: "The resource is invalid",
    [DeveloperApiErrorCodes.RESOURCE_ACCESS_DENIED]: "Access to this resource is denied",
    [DeveloperApiErrorCodes.UNKNOWN_ERROR]: "Developer API request failed",
};

async function getTenantSlug(
    request: Request
): Promise<string | undefined> {
    const queryTenantSlug = new URL(request.url)
        .searchParams
        .get("tenantSlug");

    let bodyTenantSlug: unknown;

    try {
        const body = await request.clone().json();
        bodyTenantSlug = body?.tenantSlug;
    } catch {
        bodyTenantSlug = undefined;
    }

    const candidates = [
        queryTenantSlug,
        bodyTenantSlug,
        request.headers.get("X-Tenant-Slug"),
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }

    return undefined;
}

export function withDeveloperContext(
    handler: DeveloperHandler
) {
    return async function (
        request: Request
    ): Promise<Response> {
        try {
            const authorization = request.headers.get("Authorization");

            if (!authorization) {
                return developerJsonError(
                    DeveloperApiErrorCodes.INVALID_API_KEY,
                    "Authorization header is required",
                    401
                );
            }

            if (!authorization.startsWith("Bearer ")) {
                return developerJsonError(
                    DeveloperApiErrorCodes.INVALID_API_KEY,
                    "Invalid authorization scheme",
                    401
                );
            }

            const apiKey = authorization.slice(7).trim();
            const tenantSlug = await getTenantSlug(request);
            const sandbox = isSandboxRequest(apiKey, tenantSlug);

            if (sandbox) {
                const response = await handler(MOCK_DEVELOPER_CONTEXT, request);
                response.headers.set(SANDBOX_MODE_HEADER, "sandbox");
                return response;
            }

            if (!tenantSlug) {
                return developerJsonError(
                    DeveloperApiErrorCodes.TENANT_SLUG_REQUIRED,
                    "Tenant slug is required",
                    401
                );
            }

            const context = await resolveDeveloperContextAction({
                apiKey,
                tenantSlug,
            });

            requireApiAccess(context);

            return handler(
                context,
                request
            );
        } catch (error) {

            const code: DeveloperApiErrorCode =
                error instanceof Error &&
                    isDeveloperApiErrorCode(error.message)
                    ? error.message
                    : DeveloperApiErrorCodes.UNKNOWN_ERROR;

            return developerJsonError(
                code,
                ERROR_MESSAGES[code],
                getDeveloperApiStatusCode(code)
            );
        }
    };
}
