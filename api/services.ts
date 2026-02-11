import {arrayBufferToBase64, encryptUsingPublicKey, importPublicKey} from "@/shared/helpers";
import {LockMode, SqlEntityManager} from "@mikro-orm/knex";
import {Chat} from "@/api/entities/chat.entity";
import {ChatKey} from "@/api/entities/chat_key.entity";

export const ChatService = {
    async generateNewKeys(em: SqlEntityManager, {chat}: {chat: Chat}) {
        await em.findOneOrFail(Chat, {id: chat.id}, {
            lockMode: LockMode.PESSIMISTIC_WRITE,
        })

        const chatKey = crypto.getRandomValues(new Uint8Array(32));
        const newVersion = ((await em.findOne(ChatKey, {chat}, {
            orderBy: {version: 'desc'},
            fields: ['version'],
        }))?.version ?? 0) + 1

        const members = await chat.members.matching({
            where: {is_joined: true},
            populate: ['user'],
        })

        for (const member of members) {
            const encryptedKey = await encryptUsingPublicKey(
                await importPublicKey(member.user.public_key!),
                chatKey,
            )

            em.create(ChatKey, {
                chat,
                user: member.user,
                encrypted_chat_key: arrayBufferToBase64(encryptedKey),
                version: newVersion,
            })
        }

        await em.flush()
    },
}
