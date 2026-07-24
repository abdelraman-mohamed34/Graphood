export interface ResourceListResponse<T> {
    success: true;
    data: {
        items: T[];
    };
}

export interface ResourceItemResponse<T> {
    success: true;

    data: {
        item: T;
    };
}

export function resourceList<T>(
    items: T[]
): ResourceListResponse<T> {

    return {
        success: true,
        data: {
            items,
        },
    };
}

export function resourceItem<T>(
    item: T
): ResourceItemResponse<T> {
    return {
        success: true,
        data: {
            item,
        },
    };
}