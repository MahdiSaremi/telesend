'use client'

import {UseFormReturn} from "react-hook-form";
import {ApiCallInit, ApiInit} from "@/modules/apis/types/api-target";

export type FetchInit<T = any, M = any> = ApiInit<T, M> & {
    setLoading?: (x: boolean) => void;
    form?: UseFormReturn<any, any, any>;
    validationErrors?: ((key: string) => string | null) | object;
    validationNames?: Array<string>;
    guest?: boolean;
    ignoreAuth?: boolean;
}

export type FetchCallInit<T = any, M = any> = ApiCallInit<T, M> & {
    setLoading?: (x: boolean) => void;
    form?: UseFormReturn<any, any, any>;
    validationErrors?: ((key: string) => string | null) | object;
    validationNames?: Array<string>;
    guest?: boolean;
    ignoreAuth?: boolean;
}
