export interface DeveloperApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface DeveloperApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
}


export function developerSuccess<T>(
    data: T
): DeveloperApiSuccessResponse<T> {
    return {
        success: true,
        data,
    };
}


export function developerError(
    code: string,
    message: string
): DeveloperApiErrorResponse {
    return {
        success: false,
        error: {
            code,
            message,
        },
    };
}