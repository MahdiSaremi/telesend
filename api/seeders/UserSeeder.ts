import type {EntityManager} from '@mikro-orm/core';
import {Seeder} from '@mikro-orm/seeder';
import bcrypt from "bcrypt";
import {HASH_SALT} from "@/api/functions";
import {User} from "../entities/user.entity"

export class UserSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        em.create(User, {
            name: 'Mahdi',
            username: 'mahdi',
            password: await bcrypt.hash('12345678', HASH_SALT),
        })

        em.create(User, {
            name: 'Amir',
            username: 'amir',
            password: await bcrypt.hash('12345678', HASH_SALT),
        })

        await em.flush()
    }
}
