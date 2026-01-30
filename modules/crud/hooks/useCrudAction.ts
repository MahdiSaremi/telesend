'use client'

import {useState} from "react";
import {fetchData} from "@/modules/apis/utils/requests";
import {FetchCallInit, FetchInit} from "@/modules/apis/types/fetch-init";

interface UseCrudActionProps {
    submit: () => Promise<void>;
    loading: boolean;
    error: boolean;
}

export function useCrudAction({action}: {
    action: () => FetchInit | FetchCallInit,
}): UseCrudActionProps {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false)

    const _submit = async () => {
        setLoading(true)
        try {
            const {onSuccess, onError, ...options} = action()
            await fetchData({
                onSuccess: (data, meta) => {
                    setError(false)

                    onSuccess?.(data, meta)
                },
                onError: (e) => {
                    setError(true)

                    return onError?.(e)
                },
                ...options,
            })
        } finally {
            setLoading(false)
        }
    }

    return {
        submit: _submit,
        loading,
        error,
    }
}