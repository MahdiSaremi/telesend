import { Migration } from '@mikro-orm/migrations';

export class Migration20260208175825 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`chats\` (\`id\` bigint unsigned not null auto_increment primary key, \`type\` tinyint not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`users\` (\`id\` bigint unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`username\` varchar(255) not null, \`password\` varchar(255) not null, \`public_key\` text null, \`encrypted_private_key\` text null, \`iv\` varchar(64) null, \`key_salt\` varchar(255) null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_username_unique\`(\`username\`);`);

    this.addSql(`create table \`messages\` (\`id\` bigint unsigned not null auto_increment primary key, \`sender_id\` bigint unsigned not null, \`chat_id\` bigint unsigned not null, \`text\` text not null, \`iv\` text not null, \`chat_key_version\` bigint unsigned not null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`messages\` add index \`messages_sender_id_index\`(\`sender_id\`);`);
    this.addSql(`alter table \`messages\` add index \`messages_chat_id_index\`(\`chat_id\`);`);

    this.addSql(`create table \`chat_members\` (\`chat_id\` bigint unsigned not null, \`user_id\` bigint unsigned not null, \`is_joined\` tinyint(1) not null, primary key (\`chat_id\`, \`user_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`chat_members\` add index \`chat_members_chat_id_index\`(\`chat_id\`);`);
    this.addSql(`alter table \`chat_members\` add index \`chat_members_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`chat_keys\` (\`chat_id\` bigint unsigned not null, \`user_id\` bigint unsigned not null, \`version\` bigint unsigned not null, \`encrypted_chat_key\` text not null, primary key (\`chat_id\`, \`user_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`chat_keys\` add index \`chat_keys_chat_id_index\`(\`chat_id\`);`);
    this.addSql(`alter table \`chat_keys\` add index \`chat_keys_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`messages\` add constraint \`messages_sender_id_foreign\` foreign key (\`sender_id\`) references \`users\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`messages\` add constraint \`messages_chat_id_foreign\` foreign key (\`chat_id\`) references \`chats\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`chat_members\` add constraint \`chat_members_chat_id_foreign\` foreign key (\`chat_id\`) references \`chats\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`chat_members\` add constraint \`chat_members_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`chat_keys\` add constraint \`chat_keys_chat_id_foreign\` foreign key (\`chat_id\`) references \`chats\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`chat_keys\` add constraint \`chat_keys_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`drop table if exists \`user\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`messages\` drop foreign key \`messages_chat_id_foreign\`;`);

    this.addSql(`alter table \`chat_members\` drop foreign key \`chat_members_chat_id_foreign\`;`);

    this.addSql(`alter table \`chat_keys\` drop foreign key \`chat_keys_chat_id_foreign\`;`);

    this.addSql(`alter table \`messages\` drop foreign key \`messages_sender_id_foreign\`;`);

    this.addSql(`alter table \`chat_members\` drop foreign key \`chat_members_user_id_foreign\`;`);

    this.addSql(`alter table \`chat_keys\` drop foreign key \`chat_keys_user_id_foreign\`;`);

    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`full_name\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`bio\` text not null default ('')) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`drop table if exists \`chats\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`messages\`;`);

    this.addSql(`drop table if exists \`chat_members\`;`);

    this.addSql(`drop table if exists \`chat_keys\`;`);
  }

}
