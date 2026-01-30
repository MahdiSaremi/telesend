'use client'

import {useContext, useEffect} from "react";
import {AppContext} from "@/app/hooks/types";

export function useOnSocket(ev: string, listener: (...args: any) => void) {
    const app = useContext(AppContext)

    useEffect(() => {
        if (!app?.socket) return

        app.socket.on(ev, listener)

        return () => {
            app.socket?.off(ev, listener)
        }
    }, [app?.socket, ev]);
}
