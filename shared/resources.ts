import {chats, users} from "@/api/db";

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

export interface ChatResource {
    id: string;
    type: (typeof chats)['_']['inferSelect']['type'];
}

export function ChatResourceMake(resource: (typeof chats)['_']['inferSelect']): ChatResource {
    return {
        id: resource.id.toString(),
        type: resource.type,
    }
}
