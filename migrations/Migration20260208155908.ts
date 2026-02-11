import { Migration } from '@mikro-orm/migrations';

export class Migration20260208155908 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`full_name\` varchar(255) not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`bio\` text not null default ('')) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`user\`;`);
  }

}
