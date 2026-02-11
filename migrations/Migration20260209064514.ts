import { Migration } from '@mikro-orm/migrations';

export class Migration20260209064514 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`chats\` modify \`type\` enum('private', 'group', 'channel') not null, modify \`created_at\` datetime null, modify \`updated_at\` datetime null;`);

    this.addSql(`alter table \`users\` modify \`created_at\` datetime null, modify \`updated_at\` datetime null;`);

    this.addSql(`alter table \`messages\` modify \`created_at\` datetime null, modify \`updated_at\` datetime null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`chats\` modify \`type\` tinyint not null, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`users\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`messages\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
  }

}
