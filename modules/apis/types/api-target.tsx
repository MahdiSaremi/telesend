import {ApiError} from "@/modules/apis/utils/errors";

export type ApiInit<T = any, M = any> = RequestInit & {
    path?: string;
    data?: object;
    onSuccess?: (data: T, meta: M) => void;
    onError?: (e: any | ApiError) => boolean | void;
    token?: string;
}

export type ApiCallInit<T = any, M = any> = Omit<RequestInit, "method"> & {
    api: ApiTarget<T, M>;
    data?: object;
    onSuccess?: (data: T, meta: M) => void;
    onError?: (e: any | ApiError) => boolean | void;
    token?: string;
}

export type ApiTarget<T, M = any> = {
    path: string;
    method: string;
    data?: object;
}
