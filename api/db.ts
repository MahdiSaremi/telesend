import {MikroORM} from '@mikro-orm/core';
import config from '../mikro-orm.config';
import {SqlEntityManager} from "@mikro-orm/knex";

let orm: MikroORM | null = null;

export async function getOrm(): Promise<MikroORM> {
    if (!orm) {
        orm = await MikroORM.init(config)
    }

    return orm
}

export async function forkEm() {
    return (await getOrm()).em.fork() as SqlEntityManager
}
