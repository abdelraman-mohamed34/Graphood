import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { developerJsonError } from "@/shared/lib/api/developer/response";

function notFound() {
    return developerJsonError(
        DeveloperApiErrorCodes.RESOURCE_NOT_FOUND,
        "Developer API endpoint not found",
        404
    );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
