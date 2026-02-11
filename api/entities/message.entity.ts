import 'reflect-metadata';
import {Entity, ManyToOne, PrimaryKey, Property, Unique} from '@mikro-orm/core';
import {User} from "@/api/entities/user.entity";
import {Chat} from "@/api/entities/chat.entity";

@Entity({tableName: 'messages'})
export class Message {
    @PrimaryKey({type: 'bigint', unsigned: true})
    id!: number;

    @ManyToOne()
    sender!: User;

    @ManyToOne()
    chat!: Chat;

    @Property({type: 'text'})
    text!: string;

    @Property({type: 'text'})
    iv!: string;

    @Property({type: 'bigint', unsigned: true})
    chat_key_version!: number;

    @Property()
    createdAt?: Date = new Date();

    @Property({onUpdate: () => new Date()})
    updatedAt?: Date = new Date();
}