import 'dotenv/config'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import {
  globalCategories,
  globalCurrencies,
  globalTypes
} from './schema/global'

neonConfig.webSocketConstructor = ws

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const categoryValues = [
  'Flow Arts',
  'Yoga',
  'Meditation',
  'Breath work',
  'Aerial',
  'Energy Reading & Healing',
  'Dance',
  'Massage',
  'Pilates',
  'Physiotherapy',
  'Coaching',
  'Acupuncture',
  'Psychotherapy',
  'Sound Healing',
  'Transformational Tool'
] as const

const typeValues = [
  'Festival',
  'Retreat',
  'Workshop',
  'Teacher Training',
  'Course',
  'Group Class',
  'Private Session',
  'Treatment',
  'Private Party'
] as const

const currencyValues = ['USD', 'EUR'] as const

async function seedGlobalData() {
  const isDryRun = process.argv.includes('--dry-run')

  if (isDryRun) {
    console.log('Dry run: would seed global categories, types, and currencies.')
    console.log(`Categories: ${categoryValues.length}`)
    console.log(`Types: ${typeValues.length}`)
    console.log(`Currencies: ${currencyValues.length}`)
    return
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, {
    schema: { globalCategories, globalTypes, globalCurrencies }
  })

  try {
    await db
      .insert(globalCategories)
      .values(
        categoryValues.map(name => ({
          name,
          slug: slugify(name)
        }))
      )
      .onConflictDoNothing({ target: globalCategories.slug })

    await db
      .insert(globalTypes)
      .values(
        typeValues.map(name => ({
          name,
          slug: slugify(name)
        }))
      )
      .onConflictDoNothing({ target: globalTypes.slug })

    await db
      .insert(globalCurrencies)
      .values(
        currencyValues.map(name => ({
          name,
          slug: slugify(name)
        }))
      )
      .onConflictDoNothing({ target: globalCurrencies.slug })

    console.log(
      'Seed completed for global categories, global types, and global currencies.'
    )
  } finally {
    await pool.end()
  }
}

seedGlobalData().catch(error => {
  console.error('Seed failed:', error)
  process.exit(1)
})
