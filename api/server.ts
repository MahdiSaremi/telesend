import {Server} from "socket.io";
import {chat_members, chats, db, users} from "@/api/db";
import {and, eq, like, ne, or, isNotNull} from "drizzle-orm/sql/expressions/conditions";
import {createServer} from "node:http";
import next from "next";
import {parse} from "node:url";
import {AuthInfoMake, ChatResourceMake, UserResourceMake} from "@/shared/resources";
import bcrypt from "bcrypt";
import {HASH_SALT} from "@/api/functions";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: {reactStrictMode: false} });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        if (req.url) {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }
    });

    const connectedUsers = new WeakMap()

    const io = new Server(server);

    io.on('connection', socket => {
        console.log('Connected:', socket.id)

        const register = () => {
            const userId = connectedUsers.get(socket)

            socket.on('globalSearch', async (request, response) => {
                const q = "%" + request.query.replaceAll(/[%\s]+/g, '%') + "%"

                const result = await db.select().from(users).where(
                    and(isNotNull(users.public_key), ne(users.id, userId), or(like(users.username, q), like(users.name, q)))
                ).limit(15)

                response(true, result.map(UserResourceMake))

                socket.to('chats.create-with-user.1').emit('update:chats.create-with-user.1', 'test')
            })

            socket.on('openChat', async (request, response) => {
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
                }

                response(true, chat ? ChatResourceMake(chat) : null)
            })

            socket.on('closeChat', async (request, response) => {
                if (request.id) socket.leave(`chats.${request.id}`)
                if (request.user_id) socket.leave(`chats.create-with-user.${request.user_id}`)
                if (request.id) console.log(`LEAVE chats.${request.id}`)
                if (request.user_id) console.log(`LEAVE chats.create-with-user.${request.user_id}`)

                response(true)
            })

            // socket.on('sendMessage', async (request, response) => {
            //     await db.transaction(async tx => {
            //         let chat
            //
            //         if (request.chat_id) {
            //             chat = (await db.select().from(chats).where(eq(chats.id, request.chat_id)).limit(1))[0]
            //         } else if (request.user_id) {
            //             chat = (await db.select().from(chats)
            //                 .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
            //                 .where(and(eq(chat_members.user_id, userId), eq(chat_members.is_joined, true)))
            //                 .limit(1))[0]?.chats
            //         }
            //     })
            //
            //     if (request.user_id) {
            //         chat = (await db.select().from(chats)
            //             .innerJoin(chat_members, eq(chat_members.chat_id, chats.id))
            //             .where(and(eq(chat_members.user_id, userId), eq(chat_members.is_joined, true)))
            //             .limit(1))[0]?.chats
            //
            //         if (!chat) {
            //             socket.join(`chats.create-with-user.${request.user_id}`)
            //             console.log(`JOIN chats.create-with-user.${request.user_id}`)
            //         }
            //     }
            //
            //     if (chat) {
            //         socket.join(`chats.${chat.id}`)
            //         console.log(`JOIN chats.${chat.id}`)
            //     }
            //
            //     response(true, chat ? ChatResourceMake(chat) : null)
            // })
        }

        socket.on('login', async (request, response) => {
            if (connectedUsers.has(socket)) {
                response(false, "تلاش بیش از حد")
                return
            }

            connectedUsers.set(socket, null)

            const value = await db.select().from(users).where(eq(users.username, request.username)).limit(1)

            if (value[0] && await bcrypt.compare(request.password, value[0].password)) {
                if (request.publicKey && value[0].public_key) {
                    response(false, "کلید قبلا تنظیم شده است")
                    return
                }

                if (value[0].public_key) {
                    connectedUsers.set(socket, value[0].id)
                    register()

                    socket.on('sendMessage', async message => {
                        console.log('Sending a message')
                    })
                } else if (request.newPassword && request.publicKey && request.encryptedPrivateKey && request.iv && request.salt) {
                    connectedUsers.set(socket, value[0].id)
                    register()

                    await db.update(users).set({
                        password: await bcrypt.hash(request.newPassword, HASH_SALT),
                        public_key: request.publicKey,
                        encrypted_private_key: request.encryptedPrivateKey,
                        iv: JSON.stringify(request.iv),
                        key_salt: JSON.stringify(request.salt),
                    }).where(eq(users.username, request.username)).limit(1)
                    value[0] = {
                        ...value[0],
                        password: await bcrypt.hash(request.newPassword, HASH_SALT),
                        public_key: request.publicKey,
                        encrypted_private_key: request.encryptedPrivateKey,
                        iv: JSON.stringify(request.iv),
                        key_salt: JSON.stringify(request.salt),
                    }
                } else {
                    connectedUsers.delete(socket)
                }

                response(true, AuthInfoMake(value[0]))
            } else {
                connectedUsers.delete(socket)
                response(false, "کاربری با این مشخصات یافت نشد. دوباره تلاش کنید.")
            }
        })

        // دریافت پیام از کلاینت
        // socket.on('sendMessage', (message) => {
        //     console.log('پیام دریافت شد:', message);
        //     // ارسال پیام به تمام کاربران متصل
        //     io.emit('receiveMessage', message);
        // });

        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id);
        });
    });

    server.listen(3000, '0.0.0.0', () => {
        console.log('> Ready on port 3000');
    });
});