import 'reflect-metadata';
import {Entity, Filter, ManyToOne, PrimaryKey, Property, Unique} from '@mikro-orm/core';
import {Chat} from "@/api/entities/chat.entity";
import {User} from "@/api/entities/user.entity";

@Entity({tableName: 'chat_members'})
export class ChatMember {
    @ManyToOne({primary: true})
    chat!: Chat;

    @ManyToOne({primary: true})
    user!: User;

    @Property()
    is_joined!: boolean;
}