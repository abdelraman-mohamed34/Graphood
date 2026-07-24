import { withDeveloperContext } from "./with-developer-context";
import { DeveloperContext } from "@/shared/lib/types/developer";

type ResourceHandler = (
    context: DeveloperContext,
    request: Request,
    params?: {
        resource: string;
    }
) => Promise<Response>;

export function withResourceContext(
    handler: ResourceHandler
) {

    return withDeveloperContext(
        async (
            context,
            request
        ) => {
            const url =
                new URL(
                    request.url
                );
            const segments =
                url.pathname.split("/");
            const resource =
                segments[
                segments.length - 1
                ];
            return handler(
                context,
                request,
                {
                    resource,
                }
            );

        }
    );

}