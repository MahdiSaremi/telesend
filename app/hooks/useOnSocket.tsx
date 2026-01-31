'use client'

import {useEffect} from "react";
import {useCore} from "@/app/hooks/useCore";

export function useOnSocket(ev: string, listener: (...args: any) => void) {
    const core = useCore()

    useEffect(() => {
        core.connection.getSocket()?.on(ev, listener)

        return () => {
            core.connection.getSocket()?.off(ev, listener)
        }
    }, [ev]);
}
