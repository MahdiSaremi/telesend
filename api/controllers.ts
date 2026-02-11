import {Socket} from "socket.io";
import bcrypt from "bcrypt";
import {HASH_SALT} from "@/api/functions";
import {
    AuthInfoMake, ChatResourceMake,
    HomeChatResourceMakeCollection,
    MessageResourceMake, UpdateResourceMake,
    UserResourceMake
} from "@/shared/resources";
import {ChatService} from "@/api/services";
import {forkEm} from "@/api/db";
import {User} from "./entities/user.entity";
import {Chat} from "@/api/entities/chat.entity";
import {ChatKey} from "@/api/entities/chat_key.entity";
import {LockMode} from "@mikro-orm/core";
import {SqlEntityManager} from "@mikro-orm/knex";
import {ChatMember} from "@/api/entities/chat_member.entity";
import {Message} from "@/api/entities/message.entity";
import {events} from "@/shared/events";
import {rooms} from "@/api/rooms";

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
    var userId: number | null | true = null

    OnAll(socket, {
        login: async (request: any) => {
            if (userId !== null) {
                return [false, "تلاش بیش از حد"]
            }

            userId = true
            const em = await forkEm()

            const user = await em.findOne(User, {
                username: request.username,
            })

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

                    em.assign(user, {
                        password: await bcrypt.hash(request.newPassword, HASH_SALT),
                        public_key: request.publicKey,
                        encrypted_private_key: request.encryptedPrivateKey,
                        iv: JSON.stringify(request.iv),
                        key_salt: JSON.stringify(request.salt),
                    })

                    await em.flush()
                } else {
                    userId = null
                }

                if (userId) socket.join(rooms.home(userId))

                return [true, AuthInfoMake(user)]
            } else {
                userId = null
                return [false, "کاربری با این مشخصات یافت نشد. دوباره تلاش کنید."]
            }
        },
    })
}

export function HomeController(socket: Socket, userId: number) {
    OnAll(socket, {

        getHome: async (request: any) => {
            const em = await forkEm()
            const user = await em.findOneOrFail(User, {id: userId})
            const chats = (await user.chat_members.matching({
                populate: ['chat'],
                where: {
                    is_joined: true,
                },
                limit: 15,
            })).map(cm => cm.chat)

            return [true, await HomeChatResourceMakeCollection(em, chats, userId)]
        },

        globalSearch: async (request: any) => {
            const em = await forkEm()
            const q = "%" + request.query.replaceAll(/[%\s]+/g, '%') + "%"

            const result = await em.findAll(User, {
                where: {
                    public_key: {$ne: null},
                    id: {$ne: userId},
                    username: {$like: q},
                    name: {$like: q},
                },
                limit: 15,
            })

            return [true, result.map(UserResourceMake)]
        },

    })

    ChatController(socket, userId)
}

export function ChatController(socket: Socket, userId: number) {
    async function getChat(chat_id: any) {
        const em = await forkEm()
        return await em.findOne(Chat, {
            id: chat_id,
            members: {
                is_joined: true,
                user: userId,
            },
        })
    }

    function sharedPrivateChatQuery(em: SqlEntityManager, userIds: number[]) {
        return em.createQueryBuilder(Chat, 'c')
            .join('c.members', 'cm')
            .where({
                'c.type': 'private',
                'cm.user': {$in: userIds},
                'cm.is_joined': true,
            })
            .groupBy('c.id')
            .having('count(distinct cm.user_id) >= ' + userIds.length)
    }

    OnAll(socket, {

        openChat: async (request: any) => {
            const em = await forkEm()
            let chat

            if (request.user_id) {
                chat = await sharedPrivateChatQuery(em, [userId, request.user_id]).getSingleResult()

                if (!chat) {
                    socket.join(rooms.chats.new.withUser(request.user_id))
                }
            }

            if (chat) {
                socket.join(rooms.chats.on(chat.id))

                return [true, await ChatResourceMake(em, chat, userId)]
            }

            return [true, null]
        },

        closeChat: async (request: any) => {
            if (request.id) socket.leave(rooms.chats.on(request.id))
            if (request.user_id) socket.leave(rooms.chats.new.withUser(request.user_id))

            return [true, null]
        },

        createPrivateChat: async (request: any) => {
            const em = await forkEm()
            let chat: Chat | null = null

            await em.transactional(async em => {
                const users = await em.findAll(User, {
                    where: {
                        id: {$in: [userId, request.user_id]},
                    },
                    lockMode: LockMode.PESSIMISTIC_WRITE,
                })
                if (users.length < 2) throw new Error('Failed')

                chat = await sharedPrivateChatQuery(em, [userId, request.user_id]).getSingleResult()

                if (!chat) {
                    chat = em.create(Chat, {
                        type: 'private',
                    })
                    await em.flush()
                    await em.insertMany(ChatMember, [
                        {
                            chat,
                            user: userId,
                            is_joined: true,
                        },
                        {
                            chat,
                            user: request.user_id,
                            is_joined: true,
                        },
                    ])

                    await ChatService.generateNewKeys(em, {chat})
                }
            })

            return [true, await ChatResourceMake(em, chat!, userId)]
        },

        getChatKey: async (request: any) => {
            const em = await forkEm()
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const key = await em.findOne(ChatKey, {
                chat,
                user: userId,
                version: request.version,
            })

            if (key) {
                return [true, key.encrypted_chat_key]
            } else {
                return [false, null]
            }
        },

        getChatMessages: async (request: any) => {
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const messages = await chat.messages.matching({
                limit: 50,
                orderBy: {id: 'desc'},
            })

            return [true, messages.toReversed().map(MessageResourceMake)]
        },

        sendMessage: async (request: any) => {
            const em = await forkEm()
            const chat = await getChat(request.chat_id)
            if (!chat) return [false, null]

            const message = await em.transactional(async em => {
                const chatKey = await chat.getUserLastKey(userId)

                if (!chatKey || request.version != chatKey.version.toString()) throw new Error('Failed')

                const message = em.create(Message, {
                    sender: userId,
                    chat,
                    text: request.text,
                    iv: JSON.stringify(request.iv),
                    chat_key_version: chatKey.version,
                })

                await em.flush()

                return message
            })

            socket.to(rooms.chats.on(chat.id)).emit(events.chats.receiveUpdate(request.chat_id), MessageResourceMake(message))

            const members = await chat.members.matching({
                where: {
                    is_joined: true,
                },
            })
            socket.to(members.map(cm => rooms.home(cm.user.id))).emit(events.receiveUpdate, UpdateResourceMake('message', MessageResourceMake(message)))

            return [true, MessageResourceMake(message)]
        },

    })
}
