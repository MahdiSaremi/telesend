import {db, users} from "./db";
import bcrypt from "bcrypt";
import {HASH_SALT} from "./functions";

(async () => {
    await db.insert(users).values({
        name: 'Mahdi',
        username: 'mahdi',
        password: await bcrypt.hash('12345678', HASH_SALT),
    }).$returningId()

    await db.insert(users).values({
        name: 'Amir',
        username: 'amir',
        password: await bcrypt.hash('12345678', HASH_SALT),
    }).$returningId()

    console.log('completed.')
})()