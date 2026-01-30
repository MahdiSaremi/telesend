'use client'

import {useEffect, useState} from "react";
import {FormMeta} from "@/modules/form/types/form-meta";
import {fetchData} from "@/modules/apis/utils/requests";
import {FetchCallInit, FetchInit} from "@/modules/apis/types/fetch-init";

interface UseCrudEditProps {
    reload: () => Promise<void>;
    loading: boolean,
    store: () => Promise<void>;
    formMeta: FormMeta,
    error: boolean;
}

export function useCrudForm({load, store, loadTrig = true}: {
    load?: () => FetchInit | FetchCallInit,
    store?: () => FetchInit | FetchCallInit,
    loadTrig?: boolean,
}): UseCrudEditProps {
    const [loading, setLoading] = useState(true);
    const [mediaKeys, setMediaKeys] = useState()
    const [metaOptions, setMetaOptions] = useState()
    const [error, setError] = useState(false)

    const _reload = async () => {
        setLoading(true)
        try {
            if (load) {
                const {onSuccess, onError, ...options} = load()
                await fetchData({
                    onSuccess: (data, meta) => {
                        setMediaKeys(meta.media_keys)
                        setMetaOptions(meta.options)
                        setError(false)

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

    const _store = async () => {
        if (store) {
            await fetchData(store())
        }
    }

    useEffect(() => {
        if (loadTrig) {
            _reload()
        }
    }, [loadTrig]);

    return {
        reload: _reload,
        store: _store,
        loading,
        error,
        formMeta: {
            mediaKeys: mediaKeys,
            options: metaOptions,
            disabled: error,
        },
    }
}