'use client'

import {useRef} from "react";
import {useCore} from "@/hooks/useCore";

export function useChatKeys(chatId?: string) {
    const core = useCore()
    const keys = useRef<Record<string, Uint8Array | false>>({})
    const promises = useRef<Record<string, Promise<void>>>({})

    return {
        async addEncrypted(version: string, encrypted_key: string) {
            keys.current[version] = await core.encryption.decryptChatKey(encrypted_key)
        },
        add(version: string, key: Uint8Array) {
            keys.current[version] = key
        },
        async get(version: string) {
            // @ts-ignore
            if (promises.current[version]) {
                await promises.current[version]
            }

            if (typeof keys.current[version] != 'undefined') {
                return keys.current[version]
            }

            const promise = (async () => {
                const [ok, data, err] = await core.connection.call<string>('getChatKey', {chat_id: chatId, version}, {
                    queue: true,
                })

                if (ok) {
                    keys.current[version] = await core.encryption.decryptChatKey(data)
                } else {
                    keys.current[version] = false
                }
            })()

            promises.current[version] = promise
            await promise
            delete promises.current[version]

            return keys.current[version]
        },
    }
}
