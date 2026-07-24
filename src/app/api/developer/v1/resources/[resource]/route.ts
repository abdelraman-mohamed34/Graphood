import { withResourceContext } from "@/shared/lib/api/developer/resource-context";
import { developerSuccess } from "@/shared/lib/api/developer/response";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";


export const GET = withResourceContext(
    async (
        context,
        request,
        params
    ) => {


        if (!params?.resource) {
            return Response.json(
                {
                    success: false,
                    error: {
                        code:
                            DeveloperApiErrorCodes.INVALID_RESOURCE,

                        message:
                            "Resource name is required",
                    },
                },
                {
                    status: 400,
                }
            );
        }



        if (params.resource !== "test") {

            return Response.json(
                {
                    success: false,
                    error: {
                        code:
                            DeveloperApiErrorCodes.RESOURCE_NOT_FOUND,

                        message:
                            "Resource not found",
                    },
                },
                {
                    status: 404,
                }
            );

        }



        return Response.json(
            developerSuccess({
                message:
                    "Resource layer working",
            })
        );

    }
);