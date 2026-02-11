'use client'

import {ChatResource, MessageResource} from "@/shared/resources";
import {createHybrid, HybridType} from "@/hooks/useHybrid";
import {DecryptedMessage} from "@/app/page";

export type ChatHybridType = ChatResource & {
    messages: HybridType<number, MessageResource & DecryptedMessage>;
    keys: HybridType<number, Uint8Array>;
    last_message?: MessageResource & DecryptedMessage;
    last_message_at?: Date;
}

export function createChatHybridObject(chat: ChatResource): ChatHybridType {
    return {
        ...chat,
        messages: createHybrid<number, MessageResource & DecryptedMessage>({
            async find(core, id, config) {
                return null
            },
        }),
        keys: createHybrid<number, Uint8Array>({
            async find(core, id, config) {
                const [ok, data, err] = await core.connection.call<string>('getChatKey', {
                    chat_id: chat.id,
                    version: id,
                }, {
                    queue: true,
                })

                return ok ? await core.encryption.decryptChatKey(data) : null
            },
        }),
    }
}

export const ChatsHybrid = createHybrid<number, ChatHybridType>({
    async find(core, id, config) {
        const [ok, res, err] = await core.connection.call<ChatResource>('getChat', {id}, {
            queue: true,
        })

        if (!ok) {
            return null
        }

        return createChatHybridObject(res)
    },
    deep: ['messages'],
})
