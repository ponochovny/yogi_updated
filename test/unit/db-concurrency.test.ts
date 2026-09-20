import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databaseUrl = process.env.DATABASE_URL
const describeDatabase = databaseUrl ? describe : describe.skip

const tableName = `invariant_probe_${randomUUID().replaceAll('-', '')}`
let pool: Pool

describeDatabase('database invariant concurrency', () => {
  beforeAll(async () => {
    pool = new Pool({ connectionString: databaseUrl })
    await pool.query(`
      create table ${tableName} (
        id uuid primary key,
        slot_id uuid not null,
        user_id text not null,
        status text not null
      )
    `)
    await pool.query(`
      create unique index ${tableName}_active_unique
      on ${tableName} (slot_id, user_id)
      where status in ('PENDING', 'ACTIVE', 'CONFIRMED')
    `)
  })

  afterAll(async () => {
    await pool.query(`drop table if exists ${tableName}`)
    await pool.end()
  })

  it('allows only one active booking when inserts race', async () => {
    const slotId = randomUUID()
    const userId = randomUUID()
    const insert = `insert into ${tableName} (id, slot_id, user_id, status) values ($1, $2, $3, 'PENDING')`

    const results = await Promise.allSettled([
      pool.query(insert, [randomUUID(), slotId, userId]),
      pool.query(insert, [randomUUID(), slotId, userId])
    ])

    expect(
      results.filter(result => result.status === 'fulfilled')
    ).toHaveLength(1)
    expect(
      results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )[0]?.reason.code
    ).toBe('23505')
  })

  it('allows a new booking after the previous one is cancelled', async () => {
    const slotId = randomUUID()
    const userId = randomUUID()

    await pool.query(
      `insert into ${tableName} (id, slot_id, user_id, status) values ($1, $2, $3, 'CANCELLED')`,
      [randomUUID(), slotId, userId]
    )
    await expect(
      pool.query(
        `insert into ${tableName} (id, slot_id, user_id, status) values ($1, $2, $3, 'CONFIRMED')`,
        [randomUUID(), slotId, userId]
      )
    ).resolves.toBeDefined()
  })
})
