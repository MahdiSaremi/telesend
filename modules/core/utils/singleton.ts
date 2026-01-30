'use client'

import {useEffect, useState} from "react";

export function singleton<T>({using}: {
    using: (callback: (data: T | null) => void) => Promise<void>;
}) {
    let loadedValue: T | null = null
    let fetched = false
    let fetching = false

    let loadingFunctions: ((state: boolean) => void)[] = []
    let valueFunctions: ((state: T | null) => void)[] = []

    const _load = async () => {
        fetching = true
        fetched = false

        for (let i = 0; i < loadingFunctions.length; i++) {
            loadingFunctions[i](true)
        }

        await using((data) => {
            fetched = true
            loadedValue = data
            for (let i = 0; i < valueFunctions.length; i++) {
                valueFunctions[i](data)
            }
        })

        fetching = false
        for (let i = 0; i < loadingFunctions.length; i++) {
            loadingFunctions[i](false)
        }
    }

    return {
        listen({setValue, setLoading}: {
            setValue: (value: T | null) => void;
            setLoading: (loading: boolean) => void
        }) {
            loadingFunctions.push(setLoading)
            valueFunctions.push(setValue)

            if (fetched) {
                setLoading(false)
            } else if (!fetching) {
                fetching = true
                _load()
            }

            return () => {
                loadingFunctions = loadingFunctions.filter(x => x !== setLoading)
                valueFunctions = valueFunctions.filter(x => x !== setValue)
            }
        },

        use(): [T | null, boolean] {
            'use client'

            const [value, setValue] = useState<T | null>(loadedValue)
            const [loading, setLoading] = useState(true)

            useEffect(() => {
                return this.listen({setValue, setLoading})
            }, [])

            return [value, loading]
        },

        forceLoad() {
            _load()
        },

        forcePreset(value: T | null) {
            fetched = true
            loadedValue = value
        },

        forceSet(value: T | null) {
            fetched = true
            loadedValue = value
            for (let i = 0; i < valueFunctions.length; i++) {
                valueFunctions[i](value)
            }

            fetching = false
            for (let i = 0; i < loadingFunctions.length; i++) {
                loadingFunctions[i](false)
            }
        },
    }
}