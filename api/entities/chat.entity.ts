import 'reflect-metadata';
import {Collection, Entity, Enum, ManyToMany, OneToMany, Primary, PrimaryKey, Property, Unique} from '@mikro-orm/core';
import {ChatMember} from "@/api/entities/chat_member.entity";
import {User} from "@/api/entities/user.entity";
import {Message} from "@/api/entities/message.entity";
import {ChatKey} from "@/api/entities/chat_key.entity";

@Entity({tableName: 'chats'})
export class Chat {
    @PrimaryKey({type: 'bigint', unsigned: true})
    id!: number;

    @Enum({items: ['private', 'group', 'channel']})
    type!: 'private' | 'group' | 'channel';

    @Property()
    createdAt?: Date = new Date();

    @Property({onUpdate: () => new Date()})
    updatedAt?: Date = new Date();

    // Relations

    @ManyToMany({
        pivotEntity: () => ChatMember,
        inversedBy: 'chats',
    })
    users = new Collection<User>(this)

    @OneToMany(() => ChatMember, m => m.chat)
    members = new Collection<ChatMember>(this)

    @OneToMany(() => Message, m => m.chat)
    messages = new Collection<Message>(this)

    @OneToMany(() => ChatKey, m => m.chat)
    keys = new Collection<ChatKey>(this)

    // Functions

    async getUserLastKey(user: User | Primary<User>) {
        return (await this.keys.matching({
            where: {user},
            orderBy: {version: 'desc'},
            limit: 1,
        }))[0]
    }
}