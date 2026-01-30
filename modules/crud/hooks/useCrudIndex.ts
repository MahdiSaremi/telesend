'use client'

import {DependencyList, useEffect, useRef, useState} from "react";
import {fetchData} from "@/modules/apis/utils/requests";
import {useDebounce} from "@/modules/core/hooks/useDebounce";
import {FetchCallInit, FetchInit} from "@/modules/apis/types/fetch-init";

export interface UseCrudIndexProps {
    reload: () => Promise<void>;
    loading: boolean;
    page: number;
    setPage: (page: number) => void;
    lastPage: number;
    total: number;
    search?: string | null;
    setSearch: (search?: string | null) => void;
    error: boolean;
}

export function useCrudIndex({load, deps}: {
    load: () => FetchInit | FetchCallInit;
    deps?: DependencyList;
}): UseCrudIndexProps {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [search, setSearch] = useState<string | null | undefined>()
    const [error, setError] = useState(false)
    const delayedSearch = useDebounce(search, 400)

    const reload = async () => {
        setLoading(true)
        try {
            if (load) {
                const {data, onSuccess, onError, ...options} = load()
                await fetchData({
                    data: {
                        page,
                        search,
                        ...data ?? {},
                    },
                    onSuccess: (data, meta) => {
                        setError(false)
                        setTotal(meta.total)
                        setLastPage(meta.last_page)
                        onSuccess?.(data, meta)
                    },
                    onError: (e) => {
                        setError(true)

                        return onError?.(e)
                    },
                    ...options,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        page == 1 ? reload() : setPage(1)
    }, [delayedSearch, ...deps ?? []]);

    useEffect(() => {
        reload()
    }, [page]);

    return {
        reload,
        loading,
        page,
        setPage,
        lastPage,
        total,
        search,
        setSearch,
        error,
    }
}
