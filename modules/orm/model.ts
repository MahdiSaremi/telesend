import {Table} from "drizzle-orm/table";

type ModelObjectNoCustom<T extends Table<any>, I extends {}> = T['$inferInsert'] & {
    update: (db: any, data: Partial<T['$inferInsert']>) => Promise<boolean>;
} & I

export function createModel<T extends Table<any>, M extends {primaryKey?: string}, I extends {}>(
    table: T,
    model: M,
    instance: I & ThisType<ModelObjectNoCustom<T, I>>,
) {
    type ModelObject = ModelObjectNoCustom<T, I>

    return {
        primaryKey: "id",
        ...model,

        make<D extends T['$inferInsert']>(value: D): ModelObject {
            const base = {
                ...value,

                async update(db: any, data: Partial<T['$inferInsert']>): Promise<boolean> {
                    if ((await db.update(table).set(data)).length >= 1) {
                        Object.assign(this, data)
                        return true
                    }

                    return false
                },
            } satisfies ModelObjectNoCustom<T, {}>

            return Object.assign(base, instance) satisfies ModelObject
        },

        async first(query: any): Promise<ModelObject | null> {
            const result = (await query)[0]

            return result ? this.make(result) as any : null
        },

        async all(query: any): Promise<ModelObject[]> {
            const result = await query

            return result.map(this.make)
        },

        async create(db: any, data: T['$inferInsert']): Promise<ModelObject | null> {
            const ids: number[] = await db.insert(table).values(data).$returningId()

            if (ids.length >= 1) {
                return this.make({
                    [this.primaryKey]: ids[0],
                    ...data,
                })
            } else {
                return null
            }
        },

        async createMany(db: any, data: T['$inferInsert'][]): Promise<ModelObject[] | null> {
            const ids: number[] = await db.insert().values(data).$returningId()

            if (ids.length >= 1) {
                return ids.map((id, i) => this.make({
                    [this.primaryKey]: id,
                    ...data[i],
                }))
            } else {
                return null
            }
        },

        async find(db: any, id: any) {
            return this.first(db.select().from(table).where(this.primaryKey, id))
        },

        async findBy<Column extends keyof T['$inferInsert']>(db: any, column: Column, value: T['$inferSelect'][Column]) {
            return this.first(db.select().from(table).where(column, value))
        },
    }
}
