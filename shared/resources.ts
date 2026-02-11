import {User} from "@/api/entities/user.entity";
import {Chat} from "@/api/entities/chat.entity";
import {Message} from "@/api/entities/message.entity";
import {ChatKey} from "@/api/entities/chat_key.entity";
import {SqlEntityManager} from "@mikro-orm/knex";

export interface AuthInfo {
    id: number;
    name: string;
    username: string;
    public_key?: string;
    encrypted_private_key?: string;
    iv: number[] | null;
    key_salt: number[] | null;
}

export function AuthInfoMake(resource: User): AuthInfo {
    return {
        id: resource.id,
        name: resource.name,
        username: resource.username,
        public_key: resource.public_key,
        encrypted_private_key: resource.encrypted_private_key,
        iv: resource.iv ? JSON.parse(resource.iv) : null,
        key_salt: resource.key_salt ? JSON.parse(resource.key_salt) : null,
    }
}

export interface UserResource {
    id: number;
    name: string;
    username: string;
}

export function UserResourceMake(resource: User): UserResource {
    return {
        id: resource.id,
        name: resource.name,
        username: resource.username,
    }
}

export interface HomeChatResource {
    chat: ChatResource;
    last_message?: MessageResource;
}

export function HomeChatResourceMakeCollection(
    em: SqlEntityManager,
    resource: Chat[],
    userId: number,
): Promise<HomeChatResource[]> {
    return Promise.all(resource.map(async chat => {
        let lastMessage = (await chat.messages.matching({
            orderBy: {id: 'desc'},
            limit: 1,
        }))[0]

        return {
            chat: await ChatResourceMake(em, chat, userId),
            last_message: lastMessage ? MessageResourceMake(lastMessage) : undefined,
        } satisfies HomeChatResource
    }))
}

export type ChatResource = {
    id: number;
    encrypted_chat_key: string;
    version: number;
} & ({
    type: 'private';
    user: UserResource;
} | {
    type: 'group',
} | {
    type: 'channel',
})

export async function ChatResourceMake(em: SqlEntityManager, resource: Chat, userId: number): Promise<ChatResource> {
    const chat_key = await resource.getUserLastKey(userId)

    if (resource.type == 'private') {
        const user = (await resource.members.matching({
            where: {
                user: {$ne: userId},
                is_joined: true,
            },
            limit: 1,
            populate: ['user'],
        }))[0].user
        return ChatResourcePrivateMake(resource, chat_key, user)
    } else if (resource.type == 'channel') {
        return ChatResourceChannelMake(resource, chat_key)
    } else if (resource.type == 'group') {
        return ChatResourceGroupMake(resource, chat_key)
    } else {
        return null as never
    }
}

export function ChatResourcePrivateMake(resource: Chat, chat_key: ChatKey, user: User): ChatResource {
    return {
        id: resource.id,
        encrypted_chat_key: chat_key.encrypted_chat_key,
        version: chat_key.version,
        type: 'private',
        user: UserResourceMake(user),
    }
}

export function ChatResourceGroupMake(resource: Chat, chat_key: ChatKey): ChatResource {
    return {
        id: resource.id,
        encrypted_chat_key: chat_key.encrypted_chat_key,
        version: chat_key.version,
        type: 'group',
    }
}

export function ChatResourceChannelMake(resource: Chat, chat_key: ChatKey): ChatResource {
    return {
        id: resource.id,
        encrypted_chat_key: chat_key.encrypted_chat_key,
        version: chat_key.version,
        type: 'channel',
    }
}

export interface MessageResource {
    id: number;
    sender: UserResource;
    chat_id: number;
    text: string;
    iv: number[];
    chat_key_version: number;
    created_at?: string;
}

export function MessageResourceMake(resource: Message): MessageResource {
    return {
        id: resource.id,
        sender: UserResourceMake(resource.sender),
        chat_id: resource.chat.id,
        text: resource.text,
        iv: JSON.parse(resource.iv),
        chat_key_version: resource.chat_key_version,
        created_at: resource.createdAt?.toString(),
    }
}

export type UpdateResource = {
    type: 'message';
    message: MessageResource;
}

export function UpdateResourceMake<T extends UpdateResource['type']>(type: T, value: UpdateResource[T]): UpdateResource {
    if (type == 'message') {
        return {
            type,
            message: value,
        }
    }

    return null as never
}
