'use client'

import {FetchCallInit, FetchInit} from "@/modules/apis/types/fetch-init";
import {DependencyList, useEffect, useState} from "react";
import {fetchData} from "@/modules/apis/utils/requests";

export function useFetchData<R = any, T = any, M = any, HasMapper extends boolean = false>(init: (FetchInit<T, M> | FetchCallInit<T, M>) & {
    debounce?: number;
    dataUsing?: HasMapper extends true ? (data: T, meta: M) => R : undefined;
    ignore?: () => boolean;
}, deps?: DependencyList): [(HasMapper extends true ? R : T) | null, boolean] {
    const [data, setData] = useState<(HasMapper extends true ? R : T) | null>(null)
    const [loading, setLoading] = useState(true)

    const update = () => {
        fetchData({
            ...init,
            onSuccess: (data, meta) => {
                setLoading(false)
                setData(init.dataUsing ? init.dataUsing(data, meta) : data as any)

                init.onSuccess?.(data, meta)
            },
        })
    }

    useEffect(() => {
        if (init.ignore?.()) {
            setLoading(false)
            setData(null)
            return
        }

        if (init.debounce) {
            setLoading(true)
            let id = setTimeout(update, init.debounce)
            return () => clearTimeout(id)
        }

        console.log((init as FetchInit).path, deps?.[0])
        setLoading(true)
        update()
    }, deps ?? [])

    return [data, loading]
}
