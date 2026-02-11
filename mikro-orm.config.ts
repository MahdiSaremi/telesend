import {defineConfig} from "@mikro-orm/mysql";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import {SeedManager} from "@mikro-orm/seeder";

export default defineConfig({
    dbName: 'api_telesend',
    user: 'root',
    password: '0915',
    host: 'localhost',
    port: 3306,
    entities: ['./api/entities/*.entity.ts'],
    debug: true,
    metadataProvider: TsMorphMetadataProvider,
    migrations: {
        path: './migrations', // مسیر پوشه migrations
        // pattern: /^[\w-]+\d+\.ts$/,
    },
    extensions: [SeedManager],
    seeder: {
        path: './api/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
    },
});
