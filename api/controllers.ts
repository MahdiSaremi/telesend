import {Socket} from "socket.io";
import {chat_keys, chat_members, chats, db, messages, users} from "@/api/db";
import {and, eq, like, ne, or, isNotNull, inArray} from "drizzle-orm/sql/expressions/conditions";
import bcrypt from "bcrypt";
import {HASH_SALT} from "@/api/functions";
import {
    AuthInfoMake,
    ChatResourceMake, HomeChatPrivateResourceMake,
    MessageResourceMake,
    UserResourceMake
} from "@/shared/resources";
import {sql} from "drizzle-orm";
import {count} from "drizzle-orm/sql/functions/aggregate";
import {ChatService} from "@/api/services";
import {desc} from "drizzle-orm/sql/expressions/select";

type OnCallback = (request: any) => Promise<[boolean, any]>;

export function On(socket: Socket, ev: string, callback: OnCallback) {
    const listener = async (request: any, response: (ok: boolean, data: any) => void) => {
        let ok, data

        try {
            [ok, data] = await callback(request)
        } catch (e) {
            response(false, null)
            throw e
        }

        response(ok, data)
    }

    socket.on(ev, listener)

    return {
        off: () => socket.off(ev, listener),
    }
}

export function OnAll(socket: Socket, all: Record<string, OnCallback>) {
    const apis: ReturnType<typeof On>[] = Object.keys(all).map(key => On(socket, key, all[key]))

    return {
        off: () => {
            apis.map(api => api.off())
        }
    }
}

export function NewConnectionController(socket: Socket) {
    var userId: bigint | null | true = null

    OnAll(socket, {
        login: async (request: any) => {
            if (userId !== null) {
                return [false, "تلاش بیش از حد"]
            }

            userId = true

            var user = (await db.select().from(users).where(eq(users.username, request.username)).limit(1))[0]

            if (user && await bcrypt.compare(request.password, user.password)) {
                if (request.publicKey && user.public_key) {
                    return [false, "کلید قبلا تنظیم شده است"]
                }

                if (user.public_key) {
                    userId = user.id
                    HomeController(socket, userId)
                } else if (request.newPassword && request.publicKey && request.encryptedPrivateKey && request.iv && request.salt) {
                    userId = user.id
                    HomeController(socket, userId)

                    await db.update(users).set({
                        password: await bcrypt.hash(request.newPassword, HASH_SALT),
                        public_key: request.publicKey,
                        encrypted_private_key: request.encryptedPrivateKey,
                        iv: JSON.stringify(request.iv),
                        key_salt: JSON.stringify(request.salt),
                    }).where(eq(users.username, request.username)).limit(1)
                    user = {
                        ...user,
                        password: await bcrypt.hash(request.newPassword, HASH_SALT),
                        public_key: request.publicKey,
                        encrypted_private_key: request.encryptedPrivateKey,
                        iv: JSON.stringify(request.iv),
                        key_salt: JSON.stringify(request.salt),
                    }
                } else {
                    userId = null
                }

                return [true, AuthInfoMake(user)]
            } else {
                userId = null
                return [false, "کاربری با این مشخصات یافت نشد. دوباره تلاش کنید."]
            }
        },
    })
}

export function HomeController(socket: Socket, userId: bigint) {
    OnAll(socket, {

        getHome: async (request: any) => {
            const all = await db.select().from(chats)
                .where(inArray(chats.id, db.select({id: chats.id}).from(chats)
                    .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
                    .where(eq(chat_members.user_id, userId))
                ))
                .limit(15)

            return [true, await Promise.all(all.map(async chat => {
                let lastMessage = (await db.select().from(messages)
                    .where(eq(messages.chat_id, chat.id))
                    .orderBy(desc(messages.id))
                    .limit(1))[0]
                let lastKey = lastMessage && (await db.select().from(chat_keys)
                    .where(and(
                        eq(chat_keys.chat_id, chat.id),
                        eq(chat_keys.user_id, userId),
                        eq(chat_keys.version, lastMessage.chat_key_version),
                    ))
                    .limit(1))[0]

                // @ts-ignore
                if (!lastKey) lastMessage = null

                // todo all types

                const user2 = (await db.select().from(users)
                    .innerJoin(chat_members, eq(users.id, chat_members.user_id))
                    .where(and(
                        ne(users.id, userId),
                        eq(chat_members.chat_id, chat.id)
                    ))
                    .limit(1))[0].users

                return HomeChatPrivateResourceMake(chat, user2.name, lastMessage, lastKey, user2)
            }))]
        },

        globalSearch: async (request: any) => {
            const q = "%" + request.query.replaceAll(/[%\s]+/g, '%') + "%"

            const result = await db.select().from(users).where(
                and(isNotNull(users.public_key), ne(users.id, userId), or(like(users.username, q), like(users.name, q)))
            ).limit(15)

            return [true, result.map(UserResourceMake)]
        },

    })

    ChatController(socket, userId)
}

export function ChatController(socket: Socket, userId: bigint) {
    async function getChat(chat_id: any) {
        return (await db.select().from(chats)
            .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
            .where(and(
                eq(chats.id, chat_id),
                eq(chat_members.user_id, userId),
                eq(chat_members.is_joined, true),
            ))
            .limit(1))[0]?.chats
    }

    OnAll(socket, {

        openChat: async (request: any) => {
            let chat

            if (request.user_id) {
                chat = (await db.select().from(chats)
                    .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
                    .where(and(eq(chat_members.user_id, userId), eq(chat_members.is_joined, true)))
                    .limit(1))[0]?.chats

                if (!chat) {
                    socket.join(`chats.create-with-user.${request.user_id}`)
                    console.log(`JOIN chats.create-with-user.${request.user_id}`)
                }
            }

            if (chat) {
                socket.join(`chats.${chat.id}`)
                console.log(`JOIN chats.${chat.id}`)

                var chatKey = (await db.select()
                    .from(chat_keys)
                    .where(and(
                        eq(chat_keys.chat_id, chat!.id),
                        eq(chat_keys.user_id, userId),
                    ))
                    .orderBy(desc(chat_keys.version))
                    .limit(1))[0]
            }

            return [true, chat ? ChatResourceMake(chat, chatKey!) : null]
        },

        closeChat: async (request: any) => {
            if (request.id) socket.leave(`chats.${request.id}`)
            if (request.user_id) socket.leave(`chats.create-with-user.${request.user_id}`)
            if (request.id) console.log(`LEAVE chats.${request.id}`)
            if (request.user_id) console.log(`LEAVE chats.create-with-user.${request.user_id}`)

            return [true, null]
        },

        createPrivateChat: async (request: any) => {
            let chat = null

            await db.transaction(async tx => {
                const userList = await tx.select().from(users).where(inArray(users.id, [userId, request.user_id])).for('update')
                if (userList.length < 2) throw new Error('Failed')

                let chatId = (await tx.select({chat_id: chats.id})
                     .from(chats)
                    .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
                    .where(and(
                        eq(chat_members.is_joined, true),
                        inArray(chat_members.user_id, [userId, request.user_id]),
                    ))
                    .groupBy(chats.id)
                    .having(eq(count(), 2))
                    .limit(1))[0]?.chat_id

                if (!chatId) {
                    chatId = (await tx.insert(chats).values({
                        type: 'private',
                    }).$returningId())[0]?.id

                    await tx.insert(chat_members).values([
                        {
                            chat_id: chatId,
                            user_id: userId,
                            is_joined: true,
                        },
                        {
                            chat_id: chatId,
                            user_id: request.user_id,
                            is_joined: true,
                        },
                    ])

                    await ChatService.generateNewKeys(tx, {chatId})
                }

                chat = (await tx.select().from(chats).where(eq(chats.id, chatId)))[0]
            })

            const chatKey = (await db.select()
                .from(chat_keys)
                .where(and(
                    eq(chat_keys.chat_id, chat!.id),
                    eq(chat_keys.user_id, userId),
                ))
                .orderBy(desc(chat_keys.version))
                .limit(1))[0]

            return [true, ChatResourceMake(chat!, chatKey)]
        },

        getChatKey: async (request: any) => {
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const key = (await db.select().from(chat_keys)
                .where(and(
                    eq(chat_keys.chat_id, chat.id),
                    eq(chat_keys.version, request.version),
                ))
                .limit(1))[0]

            if (key) {
                return [true, key.encrypted_chat_key]
            } else {
                return [false, null]
            }
        },

        getChatMessages: async (request: any) => {
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const all = await db.select().from(messages)
                .where(and(
                    eq(messages.chat_id, chat.id),
                ))
                .orderBy(desc(messages.id))
                .limit(50)

            return [true, all.map(MessageResourceMake).toReversed()]
        },

        sendMessage: async (request: any) => {
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const message = await db.transaction(async tx => {
                const chatKey = (await tx.select()
                    .from(chat_keys)
                    .where(and(
                        eq(chat_keys.chat_id, chat.id),
                        eq(chat_keys.user_id, userId),
                    ))
                    .orderBy(desc(chat_keys.version))
                    .limit(1))[0]

                if (!chatKey || request.version != chatKey.version.toString()) throw new Error('Failed')

                const msgId = (await tx.insert(messages).values({
                    sender_id: userId,
                    chat_id: chat.id,
                    text: request.text,
                    iv: JSON.stringify(request.iv),
                    chat_key_version: chatKey.version,
                }).$returningId())[0].id

                return (await tx.select().from(messages).where(eq(messages.id, msgId)))[0]
            })

            socket.to(`chats.${chat.id}`).emit(`update:chats.${request.chat_id}`, MessageResourceMake(message))

            return [true, MessageResourceMake(message)]
        },

    })
}
