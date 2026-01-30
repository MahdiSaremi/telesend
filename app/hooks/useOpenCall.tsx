'use client'

import {DependencyList, useContext, useEffect} from "react";
import {AppContext} from "@/app/hooks/types";

type ReplacedCall = (name: string, message: any, options: {success?: Function; fail?: Function}) => void

export function useOpenCall({open, close}: {
    open: (call: ReplacedCall) => void;
    close: (call: ReplacedCall) => void;
}, deps?: DependencyList) {
    const app = useContext(AppContext)

    useEffect(() => {
        if (!app?.socket) return

        let isOpened = false
        let isClosing = false

        let random = Math.random()

        const callOpen = () => {
            console.log(`OPEN ${random}`)
            app.socket?.off('connect', callOpen)

            open((name, message, {success, fail}) => {
                app.call(name, message, {
                    success: (data: any) => {
                        isOpened = true
                        success?.(data)

                        if (isClosing) {
                            callClose()
                        }
                    },
                    fail: (err: any) => {
                        fail?.(err)
                    },
                })
            })
        }

        const callClose = () => {
            console.log(`CLOSE ${random}`)
            close((name, message, {success, fail}) => {
                app.call(name, message, {
                    success,
                    fail,
                })
            })
        }

        if (app.socket.connected) {
            callOpen()
        } else {
            app.socket.on('connect', callOpen)
        }

        return () => {
            isClosing = true

            if (isOpened) {
                callClose()
            }
        }
    }, [app?.socket, ...deps ?? []]);
}
