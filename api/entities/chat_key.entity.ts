import 'reflect-metadata';
import {Entity, ManyToOne, PrimaryKey, Property, Unique} from '@mikro-orm/core';
import {Chat} from "@/api/entities/chat.entity";
import {User} from "@/api/entities/user.entity";

@Entity({tableName: 'chat_keys'})
export class ChatKey {
    @ManyToOne({primary: true})
    chat!: Chat;

    @ManyToOne({primary: true})
    user!: User;

    @Property({type: 'bigint', unsigned: true})
    version!: number;

    @Property({type: 'text'})
    encrypted_chat_key!: string;
}