'use client'

import {useEffect, useRef, useState} from "react";
import io, {Socket} from "socket.io-client";

export type ConnectionStatus = 'connecting' | 'logging' | 'connected'

export function useConnection() {
    const [status, setStatus] = useState<ConnectionStatus>('connecting')
    const realtimeStatus = useRef<ConnectionStatus>('connecting')
    const socket = useRef<Socket | null>(null)

    const messageQueue = useRef<{
        event: string;
        data: any;
        timeout?: number | true;
        resolve: any;
        reject: any;
    }[]>([])

    useEffect(() => {
        const s = io({
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            transports: ["websocket"],
        })
        socket.current = s

        s.on('connect', () => {
            realtimeStatus.current = 'logging'
            setStatus('logging')
        })

        s.on('disconnect', () => {
            realtimeStatus.current = 'connecting'
            setStatus('connecting')
        })

        return () => {
            socket.current = null
            s.disconnect()
        }
    }, [])

    const callNow = ({name, message, then, error, timeout, timedOut, alsoInLogin}: {
        name: string;
        message: any;
        then: (result: [boolean, any, any]) => void;
        error: () => void;
        timeout?: number | true;
        timedOut: () => void;
        alsoInLogin?: boolean;
    }) => {
        if (!socket.current || (realtimeStatus.current != 'connected' && (!alsoInLogin || realtimeStatus.current != 'logging'))) {
            error();
            return;
        }

        let done = false;
        let timeoutId: ReturnType<typeof setTimeout>;

        const cleanup = () => {
            done = true;
            socket.current?.off('disconnect', disconnect);
            if (timeoutId) clearTimeout(timeoutId);
        }

        const disconnect = () => {
            if (done) return;
            cleanup();
            error();
        }

        socket.current?.once('disconnect', disconnect);

        if (timeout) {
            timeoutId = setTimeout(() => {
                if (done) return;
                cleanup();
                timedOut();
            }, timeout === true ? 10000 : timeout);
        }

        socket.current?.emit(name, message, (ok: boolean, data: any) => {
            if (done) return;
            cleanup();
            then([ok, ok ? data : null, ok ? null : data]);
        });
    }

    const call = <T = any, E = string>(name: string, message: any, options?: {
        timeout?: number | true;
        queue?: boolean;
        alsoInLogin?: boolean;
    }): Promise<[true, T, null] | [false, null, E | null]> => {
        return new Promise((resolve, reject) => {
            callNow({
                name,
                message,
                then: resolve,
                error: () => {
                    if (options?.queue) {
                        messageQueue.current.push({
                            event: name,
                            data: message,
                            timeout: options?.timeout,
                            resolve,
                            reject,
                        })
                    } else {
                        resolve([false, null, null])
                    }
                },
                timeout: options?.timeout,
                timedOut: () => {
                    resolve([false, null, null])
                },
                alsoInLogin: options?.alsoInLogin,
            })
        })
    }

    useEffect(() => {
        if (status == 'connected') {
            const all = messageQueue.current
            messageQueue.current = []

            all.map(async job => {
                callNow({
                    name: job.event,
                    message: job.data,
                    then: job.resolve,
                    error: () => {
                        messageQueue.current.push(job)
                    },
                    timeout: job.timeout,
                    timedOut: () => {
                        job.resolve([false, null, null])
                    },
                })
            })
        }
    }, [status]);

    return {
        call,
        status,
        getSocket() {
            return socket.current
        },
        setStatus: (status: ConnectionStatus) => {
            setStatus(status)
            realtimeStatus.current = status
        },
    }
}
