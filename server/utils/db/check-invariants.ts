import 'dotenv/config'
import { Pool } from 'pg'

type Violation = {
  name: string
  count: string
  details: string[]
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const queries = [
  {
    name: 'active booking per user and slot',
    sql: `
      select slot_id, user_id, count(*)::text as count
      from bookings
      where status in ('PENDING', 'ACTIVE', 'CONFIRMED')
      group by slot_id, user_id
      having count(*) > 1
      order by count(*) desc
    `,
    format: (row: Record<string, string>) =>
      `slot_id=${row.slot_id}, user_id=${row.user_id}, count=${row.count}`
  },
  {
    name: 'provider transaction ID',
    sql: `
      select provider_transaction_id, count(*)::text as count
      from transactions
      where provider_transaction_id is not null
      group by provider_transaction_id
      having count(*) > 1
      order by count(*) desc
    `,
    format: (row: Record<string, string>) =>
      `provider_transaction_id=${row.provider_transaction_id}, count=${row.count}`
  },
  {
    name: 'practitioner per offering',
    sql: `
      select offering_id, practitioner_id, count(*)::text as count
      from offering_practitioners
      group by offering_id, practitioner_id
      having count(*) > 1
      order by count(*) desc
    `,
    format: (row: Record<string, string>) =>
      `offering_id=${row.offering_id}, practitioner_id=${row.practitioner_id}, count=${row.count}`
  },
  {
    name: 'invalid non-negative values',
    sql: `
      select 'offerings.capacity' as field, count(*)::text as count
      from offerings where capacity < 0 having count(*) > 0
      union all
      select 'offering_slots.capacity_override', count(*)::text
      from offering_slots where capacity_override < 0 having count(*) > 0
      union all
      select 'pricing_options.price', count(*)::text
      from pricing_options where price < 0 having count(*) > 0
      union all
      select 'pricing_options.credits', count(*)::text
      from pricing_options where credits < 0 having count(*) > 0
      union all
      select 'transactions.amount', count(*)::text
      from transactions where amount < 0 having count(*) > 0
      union all
      select 'user_passes.remaining_credits', count(*)::text
      from user_passes where remaining_credits < 0 having count(*) > 0
    `,
    format: (row: Record<string, string>) =>
      `field=${row.field}, count=${row.count}`
  },
  {
    name: 'slot time range',
    sql: `
      select id::text, start_time::text, end_time::text
      from offering_slots
      where start_time >= end_time
      order by start_time
    `,
    format: (row: Record<string, string>) =>
      `id=${row.id}, start_time=${row.start_time}, end_time=${row.end_time}`
  }
]

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  const violations: Violation[] = []
  for (const query of queries) {
    const result = await pool.query(query.sql)
    if (result.rowCount) {
      violations.push({
        name: query.name,
        count: String(result.rowCount),
        details: result.rows.map(query.format)
      })
    }
  }

  if (violations.length) {
    console.error('Database invariant preflight failed:')
    for (const violation of violations) {
      console.error(
        `- ${violation.name}: ${violation.count} violation group(s)`
      )
      for (const detail of violation.details) console.error(`  ${detail}`)
    }
    process.exitCode = 1
  } else {
    console.log('Database invariant preflight passed.')
  }
} finally {
  await pool.end()
}
