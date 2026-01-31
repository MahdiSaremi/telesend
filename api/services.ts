import {chat_keys, chat_members, chats, db, users} from '@/api/db';
import {and, eq} from "drizzle-orm/sql/expressions/conditions";
import {arrayBufferToBase64, encryptUsingPublicKey, importPublicKey} from "@/shared/helpers";
import {desc} from "drizzle-orm/sql/expressions/select";

type Tx = Parameters<Parameters<typeof db['transaction']>[0]>[0]

export const ChatService = {
    async generateNewKeys(tx: Tx, {chatId}: {chatId: bigint}) {
        await tx.select().from(chats).where(eq(chats.id, chatId)).for('update');

        const chatKey = crypto.getRandomValues(new Uint8Array(32));
        const newVersion = BigInt((await tx.select()
            .from(chat_keys)
            .where(eq(chat_keys.chat_id, chatId))
            .orderBy(desc(chat_keys.version))
            .limit(1))[0]?.version ?? 0) + BigInt(1);

        const all = await tx.select()
            .from(chat_members)
            .innerJoin(users, eq(users.id, chat_members.user_id))
            .where(and(
                eq(chat_members.chat_id, chatId),
                eq(chat_members.is_joined, true),
            ))

        for (const _ in all) {
            const data = all[_]

            const encryptedKey = await encryptUsingPublicKey(
                await importPublicKey(data.users.public_key!),
                chatKey,
            )

            await tx.insert(chat_keys).values({
                chat_id: chatId,
                user_id: data.users.id,
                encrypted_chat_key: arrayBufferToBase64(encryptedKey),
                version: newVersion,
            })
        }
    },
}
