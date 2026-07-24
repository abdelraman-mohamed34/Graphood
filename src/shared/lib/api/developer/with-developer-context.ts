import { resolveDeveloperContextAction } from "@/shared/lib/actions/developer/context/resolve-developer-context.action";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { requireApiAccess } from "@/shared/lib/api/developer/guards/require-api-access";
import { developerError } from "@/shared/lib/api/developer/response";
import { DeveloperContext } from "@/shared/lib/types/developer";

type DeveloperHandler = (
    context: DeveloperContext,
    request: Request
) => Promise<Response>;

export function withDeveloperContext(
    handler: DeveloperHandler
) {
    return async function (
        request: Request
    ): Promise<Response> {
        try {
            const authorization =
                request.headers.get("Authorization");

            if (!authorization) {
                return Response.json(
                    developerError(
                        DeveloperApiErrorCodes.INVALID_API_KEY,
                        "Authorization header is required"
                    ),
                    {
                        status: 401,
                    }
                );
            }

            if (!authorization.startsWith("Bearer ")) {
                return Response.json(
                    developerError(
                        DeveloperApiErrorCodes.INVALID_API_KEY,
                        "Invalid authorization scheme"
                    ),
                    {
                        status: 401,
                    }
                );
            }

            const apiKey = authorization
                .slice(7)
                .trim();

            let tenantSlug: string | undefined;

            if (request.method === "GET") {
                const url = new URL(request.url);

                tenantSlug =
                    url.searchParams.get("tenantSlug") ??
                    undefined;
            } else {
                const body = await request.json();

                tenantSlug = body.tenantSlug;
            }

            if (!tenantSlug) {
                return Response.json(
                    developerError(
                        DeveloperApiErrorCodes.TENANT_SLUG_REQUIRED,
                        "Tenant slug is required"
                    ),
                    {
                        status: 400,
                    }
                );
            }

            const context =
                await resolveDeveloperContextAction({
                    apiKey,
                    tenantSlug,
                });

            requireApiAccess(context);

            return await handler(
                context,
                request
            );
        } catch (error) {
            console.error(
                "Developer API Error:",
                error
            );

            const code =
                error instanceof Error
                    ? error.message
                    : DeveloperApiErrorCodes.UNKNOWN_ERROR;

            return Response.json(
                developerError(
                    code,
                    "Developer API request failed"
                ),
                {
                    status: 400,
                }
            );
        }
    };
}