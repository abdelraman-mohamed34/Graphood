import { resolveDeveloperContextAction } from "@/shared/lib/actions/developer/context/resolve-developer-context.action";
import {
    DeveloperApiErrorCodes,
    getDeveloperApiStatusCode,
    isDeveloperApiErrorCode,
} from "@/shared/lib/api/developer/errors";
import { requireApiAccess } from "@/shared/lib/api/developer/guards/require-api-access";
import { developerJsonError } from "@/shared/lib/api/developer/response";
import type { DeveloperContext } from "@/shared/lib/types/developer";

type DeveloperHandler = (
    context: DeveloperContext,
    request: Request
) => Response | Promise<Response>;

async function getTenantSlug(
    request: Request
): Promise<string | undefined> {
    if (request.method === "GET") {
        return (
            new URL(request.url)
                .searchParams
                .get("tenantSlug") ?? undefined
        );
    }

    try {
        const body = await request.clone().json();
        return body?.tenantSlug;
    } catch {
        return undefined;
    }
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

            if (!tenantSlug) {
                return developerJsonError(
                    DeveloperApiErrorCodes.TENANT_SLUG_REQUIRED,
                    "Tenant slug is required",
                    400
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

            const code =
                error instanceof Error &&
                    isDeveloperApiErrorCode(error.message)
                    ? error.message
                    : DeveloperApiErrorCodes.UNKNOWN_ERROR;

            return developerJsonError(
                code,
                "Developer API request failed",
                getDeveloperApiStatusCode(code)
            );
        }
    };
}