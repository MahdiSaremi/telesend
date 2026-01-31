'use client'

import {DependencyList, useContext, useEffect} from "react";
import {AppContext} from "@/app/hooks/types";
import {useCore} from "@/app/hooks/useCore";

type ReplacedCall = (name: string, message: any, options: {success?: Function; fail?: Function}) => void

export function useOpenCall({open, close}: {
    open: (call: ReplacedCall) => void;
    close: (call: ReplacedCall) => void;
}, deps?: DependencyList) {
    const core = useCore()

    core.useConnected(() => {
        let isOpened = false
        let isClosing = false

        const callOpen = () => {
            open((name, message, {success, fail}) => {
                core.connection.call(name, message).then(([ok, data, err]) => {
                    if (ok) {
                        isOpened = true
                        success?.(data)

                        if (isClosing) {
                            callClose()
                        }
                    } else {
                        fail?.(err)
                    }
                })
            })
        }

        const callClose = () => {
            close((name, message, {success, fail}) => {
                core.connection.call(name, message).then(([ok, data, err]) => {
                    if (ok) {
                        success?.(data)
                    } else {
                        fail?.(err)
                    }
                })
            })
        }

        callOpen()

        return () => {
            isClosing = true

            if (isOpened) {
                callClose()
            }
        }
    }, deps);
}
