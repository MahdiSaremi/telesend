import {drizzle} from 'drizzle-orm/mysql2';
import {
    int,
    bigint,
    varchar,
    text,
    mysqlTable,
    timestamp,
    date,
    datetime,
    foreignKey,
    index, boolean, mysqlEnum, unique, primaryKey
} from 'drizzle-orm/mysql-core';
import mysql from 'mysql2/promise';

export const users = mysqlTable('users', {
    id: bigint('id', {unsigned: true, mode: "bigint"}).autoincrement().primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    username: varchar('username', {length: 255}).notNull(),
    password: varchar('password', {length: 255}).notNull(),
    public_key: text('public_key'),
    encrypted_private_key: text('encrypted_private_key'),
    iv: varchar('iv', { length: 64 }),
    key_salt: varchar('key_salt', {length: 255}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
}, table => ({
    username_idx: unique('username_idx').on(table.username),
}));

export const chats = mysqlTable('chats', {
    id: bigint('id', {unsigned: true, mode: "bigint"}).autoincrement().primaryKey(),
    type: mysqlEnum('type', ['private', 'group', 'channel']).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

export const chat_members = mysqlTable('chat_members', {
    chat_id: bigint('chat_id', {unsigned: true, mode: 'bigint'}).references(() => chats.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    user_id: bigint('user_id', {unsigned: true, mode: 'bigint'}).references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    is_joined: boolean('is_joined'),
}, table => ({
    primary_idx: primaryKey({columns: [table.chat_id, table.user_id]}),
}));

export const chat_keys = mysqlTable('chat_keys', {
    chat_id: bigint('chat_id', {unsigned: true, mode: 'bigint'}).references(() => chats.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    user_id: bigint('user_id', {unsigned: true, mode: 'bigint'}).references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    version: bigint('version', { unsigned: true }).notNull(),
    encrypted_chat_key: text('encrypted_chat_key').notNull(),
}, table => ({
    primary_idx: primaryKey({columns: [table.chat_id, table.user_id, table.version]}),
}));

export const messages = mysqlTable('messages', {
    id: bigint('id', {unsigned: true, mode: "bigint"}).autoincrement().primaryKey(),
    sender_id: bigint('sender_id', {unsigned: true, mode: "bigint"}).references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    chat_id: bigint('chat_id', {unsigned: true, mode: "bigint"}).references(() => chats.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    text: text('text').notNull(),
    iv: text('iv').notNull(),
    chat_key_version: bigint('chat_key_version', { unsigned: true }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0915',
    database: 'api_telesend',
});

export const db = drizzle(connection);