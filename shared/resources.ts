import {chat_keys, chats, messages, users} from "@/api/db";

export interface AuthInfo {
    id: string;
    name: string;
    username: string;
    public_key: string | null;
    encrypted_private_key: string | null;
    iv: number[] | null;
    key_salt: number[] | null;
}

export function AuthInfoMake(resource: (typeof users)['_']['inferSelect']): AuthInfo {
    return {
        id: resource.id.toString(),
        name: resource.name,
        username: resource.username,
        public_key: resource.public_key,
        encrypted_private_key: resource.encrypted_private_key,
        iv: resource.iv ? JSON.parse(resource.iv) : null,
        key_salt: resource.key_salt ? JSON.parse(resource.key_salt) : null,
    }
}

export interface UserResource {
    id: string;
    name: string;
    username: string;
}

export function UserResourceMake(resource: (typeof users)['_']['inferSelect']): UserResource {
    return {
        id: resource.id.toString(),
        name: resource.name,
        username: resource.username,
    }
}

export type HomeChatResource = {
    id: string;
    title: string;
    text?: string;
    iv?: number[];
    encrypted_key?: string;
} & ({
    type: 'private';
    user: UserResource;
})

export function HomeChatPrivateResourceMake(
    resource: (typeof chats)['_']['inferSelect'],
    title: string,
    lastMessage: (typeof messages)['_']['inferSelect'] | null,
    lastKey: (typeof chat_keys)['_']['inferSelect'] | null,
    user: (typeof users)['_']['inferSelect'],
): HomeChatResource {
    return {
        id: resource.id.toString(),
        title: title,
        text: lastMessage?.text,
        iv: lastMessage ? JSON.parse(lastMessage.iv) : null,
        encrypted_key: lastKey?.encrypted_chat_key,
        type: 'private',
        user: UserResourceMake(user),
    }
}

export interface ChatResource {
    id: string;
    type: (typeof chats)['_']['inferSelect']['type'];
    encrypted_chat_key: string;
    version: string;
}

export function ChatResourceMake(resource: (typeof chats)['_']['inferSelect'], chat_key: (typeof chat_keys)['_']['inferSelect']): ChatResource {
    return {
        id: resource.id.toString(),
        type: resource.type,
        encrypted_chat_key: chat_key.encrypted_chat_key,
        version: chat_key.version.toString(),
    }
}

export interface MessageResource {
    id: string;
    sender_id: string;
    text: string;
    iv: number[];
    chat_key_version: string;
}

export function MessageResourceMake(resource: (typeof messages)['_']['inferSelect']): MessageResource {
    return {
        id: resource.id.toString(),
        sender_id: resource.sender_id.toString(),
        text: resource.text,
        iv: JSON.parse(resource.iv),
        chat_key_version: resource.chat_key_version.toString(),
    }
}
