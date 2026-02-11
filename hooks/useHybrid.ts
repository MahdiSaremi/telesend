'use client'

import {useCore} from "@/hooks/useCore";
import {useRef, useSyncExternalStore} from "react";

export type HybridType<K extends keyof any, T, C extends {} = {}> = ReturnType<typeof createHybrid<K, T, C>>

export function createHybrid<K extends keyof any, T, C extends {} = {}>({find, deep = []}: {
    find: (core: ReturnType<typeof useCore>, id: K, config: C) => Promise<T | null>;
    deep?: (keyof T)[];
}) {
    const loaded = new Map<K, T | null>()
    const loading = new Map<K, Promise<T | null>>()
    const listeners = new Set<(ev: {key: string}) => void>()

    return {
        toMap(): Map<K, T> {
            return new Map<K, T>(loaded.entries().filter(([key, value]) => !loading.has(key) && value !== null) as any)
        },
        loaded(id: K) {
            return !loading.get(id) && loaded.get(id) !== undefined
        },
        getLoaded(id: K): T | null | undefined {
            return !loading.get(id) ? loaded.get(id) : undefined
        },
        async skipLoading(id: K) {
            for (let i = 0; i < 50 && loading.get(id) !== undefined; i++) {
                await loading.get(id)
            }
        },
        async forceLoad(core: ReturnType<typeof useCore>, id: K, config?: C): Promise<T | null> {
            for (let i = 0; i < 50 && loading.get(id) !== undefined; i++) {
                await loading.get(id)
            }

            const promise = (async () => {
                const value = await find(core, id, config ?? {} as C)
                loaded.set(id, value)
                loading.delete(id)
                for (const d of deep) {
                    (value?.[d] as HybridType<any, any>)?.subscribe(ev => this.changed({...ev, key: ev.key == '&' ? d.toString() : `${d.toString()}.${ev.key}`}))
                }
                this.changed({key: '&'})
                return value
            })()

            loading.set(id, promise)
            return await promise
        },
        async get(core: ReturnType<typeof useCore>, id: K, config?: C): Promise<T | null> {
            for (let i = 0; i < 50 && loading.get(id) !== undefined; i++) {
                await loading.get(id)
            }

            if (this.loaded(id)) {
                return this.getLoaded(id) as T | null
            }

            return await this.forceLoad(core, id, config)
        },
        async set(id: K, value: T | null) {
            for (let i = 0; i < 50 && loading.get(id) !== undefined; i++) {
                await loading.get(id)
            }

            loaded.set(id, value)
            for (const d of deep) {
                (value?.[d] as HybridType<any, any>)?.subscribe(ev => this.changed({...ev, key: ev.key == '&' ? d.toString() : `${d.toString()}.${ev.key}`}))
            }
            this.changed({key: '&'})
        },
        subscribe(callback: (ev: {key: string}) => void) {
            listeners.add(callback)
            return {
                unsubscribe: () => this.unsubscribe(callback),
            }
        },
        unsubscribe(callback: (ev: {key: string}) => void) {
            listeners.delete(callback)
        },
        changed(ev?: {key: string}): void {
            ev ??= {key: '&'}
            for (const listener of listeners) {
                listener(ev)
            }
        },
    }
}

export type GetHybridType<H extends HybridType<any, any, any>> = H extends HybridType<any, infer T> ? T : never

export function useHybrid<K extends keyof any, T, C extends {} = {}>(hybrid: HybridType<K, T, C>, config?: C) {
    const core = useCore()

    return {
        ...hybrid,
        forceLoad(id: K): Promise<T | null> {
            return hybrid.forceLoad(core, id, config)
        },
        get(id: K): Promise<T | null> {
            return hybrid.get(core, id, config)
        },
        watch() {
            const ref = useRef<number>(0)
            useSyncExternalStore(
                (changed) => {
                    return hybrid.subscribe(() => {
                        ref.current = Math.random()
                        changed()
                    }).unsubscribe
                },
                () => {
                    return ref.current
                },
            )

            return this
        },
    }
}
