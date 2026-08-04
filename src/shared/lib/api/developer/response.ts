import { NextResponse } from "next/server";
import { DeveloperApiErrorCode } from "./errors";

export interface DeveloperApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface DeveloperApiErrorResponse {
    success: false;
    error: {
        code: DeveloperApiErrorCode;
        message: string;
    };
}

export type DeveloperApiResponse<T> =
    | DeveloperApiSuccessResponse<T>
    | DeveloperApiErrorResponse;

export function developerSuccess<T>(
    data: T
): DeveloperApiSuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

export function developerError(
    code: DeveloperApiErrorCode,
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

export function developerJson<T>(
    data: T,
    init?: ResponseInit
) {
    return NextResponse.json(
        developerSuccess(data),
        init
    );
}

export function developerJsonError(
    code: DeveloperApiErrorCode,
    message: string,
    status = 400
) {
    return NextResponse.json(
        developerError(code, message),
        { status }
    );
}