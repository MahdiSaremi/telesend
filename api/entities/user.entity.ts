import 'reflect-metadata';
import {Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property, Unique} from '@mikro-orm/core';
import {Chat} from "@/api/entities/chat.entity";
import {ChatMember} from "@/api/entities/chat_member.entity";

@Entity({tableName: 'users'})
export class User {
    @PrimaryKey({type: 'bigint', unsigned: true})
    id!: number;

    @Property({type: 'varchar', length: 255})
    name!: string;

    @Property({type: 'varchar', length: 255})
    @Unique()
    username!: string;

    @Property({type: 'varchar', length: 255})
    password!: string;

    @Property({type: 'text', nullable: true})
    public_key?: string;

    @Property({type: 'text', nullable: true})
    encrypted_private_key?: string;

    @Property({type: 'varchar', length: 64, nullable: true})
    iv?: string;

    @Property({type: 'varchar', length: 255, nullable: true})
    key_salt?: string;

    @Property()
    createdAt?: Date = new Date();

    @Property({onUpdate: () => new Date()})
    updatedAt?: Date = new Date();

    // Relations

    @ManyToMany({
        pivotEntity: () => ChatMember,
        mappedBy: 'users',
    })
    chats = new Collection<Chat>(this)

    @OneToMany(() => ChatMember, m => m.user)
    chat_members = new Collection<ChatMember>(this)
}