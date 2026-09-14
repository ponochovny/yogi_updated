import 'dotenv/config'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import { inArray, eq, sql } from 'drizzle-orm'
import crypto from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'

import {
  globalCategories,
  globalCurrencies,
  globalTypes
} from './schema/global'
import { account, user } from './schema/auth-schema'
import {
  studios,
  studioLocations,
  studioPractitioners,
  studioMembers
} from './schema/studio'
import {
  offerings,
  offeringPractitioners,
  offeringSlots,
  pricingOptions
} from './schema/offering'
import { bookings } from './schema/booking'
import { mediaFiles, MediaEntityTypeEnum, MediaTypeEnum } from './schema/_other'
import {
  offeringType,
  pricingType,
  ActivityType,
  offeringSlotStatus
} from '../../app/entities/offering/schema'
import { BookingStatus } from '../../app/entities/booking/schema'
import { userRoles } from '../auth/config'

neonConfig.webSocketConstructor = ws

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function requiredValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Missing required seed value: ${label}`)
  }

  return value
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

// Sample seed users (Owners, Practitioners, Customers)
const seedUsers = [
  // Owners
  {
    id: 'seed-owner-isla',
    name: 'Maya Santos',
    email: 'maya.santos@islaprana.ph',
    bio: 'Surfer, 500-RYT Ashtanga & Vinyasa teacher from Siargao. Dedicated to ocean wellness.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.BUSINESS, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-owner-zanzibar',
    name: 'Amina Juma',
    email: 'amina.juma@zanzibarzest.tz',
    bio: 'Zanzibar native, sound healer and holistic wellness alchemist blending ancestral Swahili rituals with yoga.',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.BUSINESS, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-owner-komorebi',
    name: 'Kenji Dela Cruz',
    email: 'kenji.cruz@komorebi.ph',
    bio: 'Circus arts performer, movement coach and founder of Komorebi Sanctuary in Cebu.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.BUSINESS, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-owner-baobab',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@baobabdharma.ke',
    bio: 'Transformational breathwork guide and Kundalini master along Kenya’s magical southern coast.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.BUSINESS, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-owner-aura',
    name: 'Lani Mercado',
    email: 'lani.mercado@auralagoon.ph',
    bio: 'Palawan islander and sound bath practitioner inspired by the emerald lagoons of El Nido.',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.BUSINESS, userRoles.PRACTITIONER]
  },

  // Additional Practitioners
  {
    id: 'seed-practitioner-kai',
    name: 'Kai Ramirez',
    email: 'kai.ramirez@islaprana.ph',
    bio: 'Freediver and Pranayama breathwork teacher guiding deep aquatic relaxation.',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-practitioner-malik',
    name: 'Malik Bakari',
    email: 'malik.bakari@zanzibarzest.tz',
    bio: 'African percussionist and sacred rhythm yoga guide from Stone Town.',
    image:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-practitioner-sophia',
    name: 'Sophia Reyes',
    email: 'sophia.reyes@komorebi.ph',
    bio: 'Aerial silk artist and spine mobility therapist.',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-practitioner-nia',
    name: 'Nia Kiprono',
    email: 'nia.kiprono@baobabdharma.ke',
    bio: 'Somatic emotional release facilitator and certified breathworker.',
    image:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.PRACTITIONER]
  },
  {
    id: 'seed-practitioner-rafael',
    name: 'Rafael Bautista',
    email: 'rafael.bautista@auralagoon.ph',
    bio: 'Power Vinyasa and Dharma yoga practitioner with 10 years of island teaching experience.',
    image:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER, userRoles.PRACTITIONER]
  },

  // Demo Customers for bookings
  {
    id: 'seed-customer-anna',
    name: 'Anna Petrova',
    email: 'anna.traveler@example.com',
    bio: 'Digital nomad and passionate yoga enthusiast.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER]
  },
  {
    id: 'seed-customer-liam',
    name: 'Liam Walker',
    email: 'liam.walker@example.com',
    bio: 'Surfer traveling Southeast Asia and East Africa.',
    image:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER]
  },
  {
    id: 'seed-customer-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    bio: 'Mindfulness practitioner and sound bath explorer.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    role: [userRoles.USER]
  }
]

// Studio definitions in Philippines & Southeast Africa
interface StudioSeedConfig {
  slug: string
  name: string
  currency: string
  bio: string
  mission: string
  ownerUserId: string
  practitionerUserIds: string[]
  location: {
    name: string
    country: string
    city: string
    address: string
    timezone: string
  }
  logoUrl: string
  galleryUrls: string[]
  categoryNames: string[]
  typeNames: string[]
  memberships?: {
    name: string
    description: string
    type: (typeof pricingType)[keyof typeof pricingType]
    price: number
    credits: number | null
    durationDays: number
  }[]
  offerings: {
    name: string
    slug: string
    description: string
    activityType: (typeof ActivityType)[keyof typeof ActivityType]
    type: (typeof offeringType)[keyof typeof offeringType]
    isPrivate?: boolean
    isOnline?: boolean
    duration: number
    capacity: number | null
    categoryNames: string[]
    typeNames: string[]
    galleryUrls: string[]
    dropInPrice: number // in cents
    packPrice: number // in cents
    membershipPrice: number // in cents
  }[]
}

const legacyStudiosData: StudioSeedConfig[] = [
  // =========================================================================
  // 1. ISLA PRANA SHALA (Siargao, Philippines) — 10 Offerings
  // =========================================================================
  {
    slug: 'isla-prana-shala',
    name: 'Isla Prana Shala',
    currency: 'USD',
    bio: 'Nestled among swaying coconut palms and the soothing Pacific swells, Isla Prana Shala is Siargao Island’s sanctuary for conscious movement, ocean breathwork, and tropical serenity.',
    mission:
      'To harmonize body, breath, and ocean through authentic daily practice and vibrant island community.',
    ownerUserId: 'seed-owner-isla',
    practitionerUserIds: ['seed-owner-isla', 'seed-practitioner-kai'],
    location: {
      name: 'Siargao Beachfront Shala',
      country: 'Philippines',
      city: 'General Luna, Siargao',
      address: 'Tourism Road, Brgy. Catangnan, General Luna, Siargao Island',
      timezone: 'Asia/Manila'
    },
    logoUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80'
    ],
    categoryNames: [
      'Yoga',
      'Breath work',
      'Flow Arts',
      'Meditation',
      'Sound Healing'
    ],
    typeNames: ['Group Class', 'Workshop', 'Retreat', 'Private Session'],
    offerings: [
      {
        name: 'Sunrise Ocean Vinyasa Flow',
        slug: 'isla-sunrise-ocean-vinyasa',
        description:
          'Wake up with the Pacific sun. An invigorating, fluid sequence synchronized with oceanic breath to awaken vitality, open shoulders, and energize your whole day.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 20,
        categoryNames: ['Yoga', 'Flow Arts'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1800,
        packPrice: 7500,
        membershipPrice: 14000
      },
      {
        name: 'Tidal Breathwork & Pranic Energy',
        slug: 'isla-tidal-breathwork-energy',
        description:
          'Harness the rhythmic cadence of the tides. Conscious connected breathwork, somatic release techniques, and ocean visualization to melt deep-seated tension.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 18,
        categoryNames: ['Breath work', 'Energy Reading & Healing'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Sunset Restorative Yin & Singing Bowls',
        slug: 'isla-sunset-restorative-yin',
        description:
          'Long, floor-based passive holds supported by bolsters under the golden hour sky, accompanied by the crystalline frequencies of Tibetan singing bowls.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 16,
        categoryNames: ['Yoga', 'Sound Healing', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      },
      {
        name: 'Surf & Spine Mobility Lab',
        slug: 'isla-surf-spine-mobility',
        description:
          'Designed specifically for surfers and active movers. Focuses on thoracic rotation, hip opening, hamstring flexibility, and scapular stability.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 15,
        categoryNames: ['Yoga', 'Physiotherapy'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1800,
        packPrice: 7500,
        membershipPrice: 14000
      },
      {
        name: 'Full Moon Island Sound Immersion',
        slug: 'isla-full-moon-sound-immersion',
        description:
          'A monthly celebratory sound healing ceremony. Gongs, ocean drums, koshi chimes, and guided astral meditation beneath the Pacific night sky.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 25,
        categoryNames: ['Sound Healing', 'Meditation'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 3000,
        packPrice: 12000,
        membershipPrice: 18000
      },
      {
        name: 'Handstand & Arm Balance Foundations',
        slug: 'isla-handstand-arm-balance',
        description:
          'Demystify inversions with playful, anatomical drills. Learn wrist prep, core engagement, hollow body mechanics, and safe bail-out techniques.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 14,
        categoryNames: ['Flow Arts', 'Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Candlelight Oceanfront Meditation',
        slug: 'isla-candlelight-meditation',
        description:
          'A deeply grounding evening practice of silent sitting, guided mindfulness, and gentle pranayama by flickering coconut wax candles.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 45,
        capacity: 20,
        categoryNames: ['Meditation', 'Breath work'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1500,
        packPrice: 6500,
        membershipPrice: 12000
      },
      {
        name: 'Private 1-on-1 Alignment & Pranayama',
        slug: 'isla-private-alignment-pranayama',
        description:
          'Customized bespoke private session tailored to your body anatomy, goals, injury recovery, or advanced breathwork practice.',
        activityType: ActivityType.APPOINTMENT,
        type: offeringType.PRIVATE,
        isPrivate: true,
        duration: 60,
        capacity: 1,
        categoryNames: ['Yoga', 'Breath work'],
        typeNames: ['Private Session'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 6500,
        packPrice: 28000,
        membershipPrice: 45000
      },
      {
        name: 'Online Siargao Waves Breath & Meditation',
        slug: 'isla-online-waves-breath',
        description:
          'Stream live into our tropical bamboo shala from anywhere in the world. Unwind with authentic breathwork and guided meditation.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        isOnline: true,
        duration: 60,
        capacity: 50,
        categoryNames: ['Breath work', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1200,
        packPrice: 5000,
        membershipPrice: 9000
      },
      {
        name: 'Dynamic Ashtanga Primary Series Intro',
        slug: 'isla-ashtanga-primary-intro',
        description:
          'Explore the classical Surya Namaskara, standing poses, and seated forward bends of the traditional Ashtanga Vinyasa Yoga lineage.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 16,
        categoryNames: ['Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      }
    ]
  },

  // =========================================================================
  // 2. ZANZIBAR ZEST WELLNESS & YOGA (Zanzibar, Tanzania) — 8 Offerings
  // =========================================================================
  {
    slug: 'zanzibar-zest-wellness',
    name: 'Zanzibar Zest Wellness & Yoga',
    currency: 'USD',
    bio: 'Perched on the coral sands of Zanzibar’s northern coast, Zanzibar Zest weaves together ancient Swahili spice aromas, African percussive rhythms, and transformative oceanfront yoga.',
    mission:
      'To spark joy, physical radiance, and mindful harmony in harmony with the wild warmth of the Indian Ocean.',
    ownerUserId: 'seed-owner-zanzibar',
    practitionerUserIds: ['seed-owner-zanzibar', 'seed-practitioner-malik'],
    location: {
      name: 'Nungwi Beach Wellness Shala',
      country: 'Tanzania',
      city: 'Nungwi, Zanzibar',
      address: 'North Coast Beachfront Promenade, Nungwi, Zanzibar',
      timezone: 'Africa/Dar_es_Salaam'
    },
    logoUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1000&auto=format&fit=crop&q=80'
    ],
    categoryNames: [
      'Yoga',
      'Meditation',
      'Sound Healing',
      'Massage',
      'Energy Reading & Healing'
    ],
    typeNames: ['Group Class', 'Retreat', 'Workshop', 'Treatment'],
    offerings: [
      {
        name: 'Spice Island Morning Vinyasa',
        slug: 'zanzibar-spice-morning-vinyasa',
        description:
          'Energizing morning flow scented by natural clove and lemongrass breezes. Focuses on dynamic Sun Salutations and deep somatic breath.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 18,
        categoryNames: ['Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Afro-Roots Rhythm & Primal Movement',
        slug: 'zanzibar-afro-roots-movement',
        description:
          'Unleash instinctual joy through live djembe drumming, somatic dance, spinal waves, and rhythmic breath liberation.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 20,
        categoryNames: ['Dance', 'Flow Arts'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      },
      {
        name: 'Coral Sand Sunset Meditation & Sound Bath',
        slug: 'zanzibar-sunset-sound-bath',
        description:
          'Watch the turquoise tide recede as Tibetan bowls, ocean gongs, and African wind flutes guide your mind into deep theta wave tranquility.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 25,
        categoryNames: ['Sound Healing', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      },
      {
        name: 'Deep Restorative Yoga & Swahili Aromatherapy',
        slug: 'zanzibar-restorative-aromatherapy',
        description:
          'Slow floor-based postures supported by lush cushions and organic local oils (cinnamon, ylang-ylang, and frankincense).',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 15,
        categoryNames: ['Yoga', 'Massage'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2400,
        packPrice: 10500,
        membershipPrice: 17500
      },
      {
        name: 'Sacred Djembe Drum & Sound Journey',
        slug: 'zanzibar-djembe-sound-journey',
        description:
          'A bi-weekly immersive tribal ceremony honoring the elements. Group vocal toning, sacred percussive rhythms, and deep ground healing.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 30,
        categoryNames: ['Sound Healing', 'Energy Reading & Healing'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 3000,
        packPrice: 12500,
        membershipPrice: 20000
      },
      {
        name: 'Private Therapeutic Island Massage',
        slug: 'zanzibar-therapeutic-island-massage',
        description:
          'One-on-one tailored bodywork combining myofascial trigger point release, warm coconut oil, and intuitive energy balancing.',
        activityType: ActivityType.APPOINTMENT,
        type: offeringType.PRIVATE,
        isPrivate: true,
        duration: 60,
        capacity: 1,
        categoryNames: ['Massage', 'Energy Reading & Healing'],
        typeNames: ['Treatment'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 7000,
        packPrice: 30000,
        membershipPrice: 50000
      },
      {
        name: 'Online Zanzibar Sunset Pranic Flow',
        slug: 'zanzibar-online-sunset-prana',
        description:
          'Join us virtually from Nungwi beach. A golden-hour gentle flow and breath practice to calm anxiety and renew your vital energy.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        isOnline: true,
        duration: 60,
        capacity: 50,
        categoryNames: ['Yoga', 'Breath work'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1400,
        packPrice: 6000,
        membershipPrice: 10000
      },
      {
        name: 'Dhow Boat Ocean Breathwork Expedition',
        slug: 'zanzibar-dhow-boat-breathwork',
        description:
          'Sail aboard a traditional handcrafted wooden dhow across calm coral lagoons. Sunset ocean immersion, breath holds, and floating meditation.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 12,
        categoryNames: ['Breath work', 'Meditation'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 4500,
        packPrice: 18000,
        membershipPrice: 28000
      }
    ]
  },

  // =========================================================================
  // 3. KOMOREBI MOVEMENT SANCTUARY (Cebu, Philippines) — 12 Offerings
  // =========================================================================
  {
    slug: 'komorebi-movement-sanctuary',
    name: 'Komorebi Movement Sanctuary',
    currency: 'USD',
    bio: 'Where golden sunlight filters through lush tropical canopy into high-ceilinged bamboo shalas. Komorebi unites aerial silks, dynamic vinyasa, and restorative pilates in Cebu.',
    mission:
      'To unlock playful strength, three-dimensional movement mastery, and peaceful focus in a modern sanctuary.',
    ownerUserId: 'seed-owner-komorebi',
    practitionerUserIds: ['seed-owner-komorebi', 'seed-practitioner-sophia'],
    location: {
      name: 'Mactan Sanctuary Pavilions',
      country: 'Philippines',
      city: 'Mactan, Cebu',
      address: 'Punta Engaño Road, Lapu-Lapu City, Cebu',
      timezone: 'Asia/Manila'
    },
    logoUrl:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1000&auto=format&fit=crop&q=80'
    ],
    categoryNames: ['Aerial', 'Yoga', 'Pilates', 'Dance', 'Flow Arts'],
    typeNames: ['Group Class', 'Workshop', 'Private Session', 'Course'],
    offerings: [
      {
        name: 'Aerial Silk Foundations & Inversions',
        slug: 'komorebi-aerial-silk-foundations',
        description:
          'Learn safe climbs, foot locks, wrist wraps, and effortless suspended inversions using premium aerial fabric.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 12,
        categoryNames: ['Aerial', 'Flow Arts'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      },
      {
        name: 'Aerial Hammock Restorative & Floating Nidra',
        slug: 'komorebi-aerial-floating-nidra',
        description:
          'Cocoon yourself inside a low-hanging aerial silk hammock. Weightless spinal decompression and deeply restorative guided Yoga Nidra.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 10,
        categoryNames: ['Aerial', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2400,
        packPrice: 10500,
        membershipPrice: 17500
      },
      {
        name: 'Rocket Yoga & Core Ignition',
        slug: 'komorebi-rocket-yoga-core',
        description:
          'Fast-paced, uplifting modification of Ashtanga with creative transitions, arm balances, and invigorating breath.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 18,
        categoryNames: ['Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Contemporary Flow & Somatic Dance',
        slug: 'komorebi-contemporary-somatic-dance',
        description:
          'Explore spiral floorwork, gravity play, and emotive improvisational movement to free the spine and joints.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 16,
        categoryNames: ['Dance', 'Flow Arts'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Classical Mat Pilates Precision',
        slug: 'komorebi-mat-pilates-precision',
        description:
          'Sculpt functional core endurance, pelvic stability, and spinal elongation following Joseph Pilates’ classical principles.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 15,
        categoryNames: ['Pilates'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1800,
        packPrice: 7500,
        membershipPrice: 14000
      },
      {
        name: 'Inversion Alchemy & Handstand Mastery',
        slug: 'komorebi-inversion-handstand-mastery',
        description:
          'Advanced mechanics for freestanding pincha mayurasana, handstand shapes, press-ups, and shoulder stabilization.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 12,
        categoryNames: ['Yoga', 'Flow Arts'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2800,
        packPrice: 11500,
        membershipPrice: 18000
      },
      {
        name: 'Candlelight Yin & Sound Resonance',
        slug: 'komorebi-candlelight-yin-sound',
        description:
          'Quiet the nervous system. Slow stretching targeting connective fascial tissues coupled with harmonic crystal singing bowls.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 18,
        categoryNames: ['Yoga', 'Sound Healing'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      },
      {
        name: 'Sunrise Cebu Vinyasa Flow',
        slug: 'komorebi-sunrise-cebu-vinyasa',
        description:
          'Bright, energizing breath-led flow in our sunlit pavilion with view over the tropical gardens and ocean breeze.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 20,
        categoryNames: ['Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1800,
        packPrice: 7500,
        membershipPrice: 14000
      },
      {
        name: 'Private Aerial Conditioning & Alignment',
        slug: 'komorebi-private-aerial-conditioning',
        description:
          'One-on-one personalized aerial training session. Tailored apparatus work, flexibility coaching, and custom sequencing.',
        activityType: ActivityType.APPOINTMENT,
        type: offeringType.PRIVATE,
        isPrivate: true,
        duration: 60,
        capacity: 1,
        categoryNames: ['Aerial', 'Pilates'],
        typeNames: ['Private Session'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 6000,
        packPrice: 26000,
        membershipPrice: 42000
      },
      {
        name: 'Mobility Architecture for Athletes',
        slug: 'komorebi-mobility-architecture',
        description:
          'Controlled articular rotations (CARs), PNF stretching, and active end-range strength for injury prevention and joint health.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 15,
        categoryNames: ['Physiotherapy', 'Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1900,
        packPrice: 8000,
        membershipPrice: 14500
      },
      {
        name: 'Online Core & Flow Masterclass',
        slug: 'komorebi-online-core-flow',
        description:
          'Interactive livestreamed session focusing on core strength, graceful transitions, and full-body flexibility from home.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        isOnline: true,
        duration: 60,
        capacity: 50,
        categoryNames: ['Yoga', 'Pilates'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1200,
        packPrice: 5000,
        membershipPrice: 9000
      },
      {
        name: 'Gentle Spinal Restoration & Hatha',
        slug: 'komorebi-gentle-spinal-restoration',
        description:
          'Therapeutic, low-impact practice focusing on neck, lower back, and shoulder decompression for all ages and bodies.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 16,
        categoryNames: ['Yoga', 'Physiotherapy'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1800,
        packPrice: 7500,
        membershipPrice: 14000
      }
    ]
  },

  // =========================================================================
  // 4. BAOBAB BREATH & DHARMA LAB (Diani Beach, Kenya) — 7 Offerings
  // =========================================================================
  {
    slug: 'baobab-breath-dharma',
    name: 'Baobab Breath & Dharma Lab',
    currency: 'USD',
    bio: 'Shaded by thousand-year-old ancient baobab trees along the Kenyan coastline, Baobab Breath & Dharma Lab is an eco-sanctuary dedicated to Kundalini, somatic breathwork, and deep nervous system restoration.',
    mission:
      'To provide a grounding haven for inner transformation, self-realization, and conscious connection along Africa’s Indian Ocean.',
    ownerUserId: 'seed-owner-baobab',
    practitionerUserIds: ['seed-owner-baobab', 'seed-practitioner-nia'],
    location: {
      name: 'Baobab Grove Sanctuary',
      country: 'Kenya',
      city: 'Diani Beach',
      address: 'Diani Beach Road, South Coast, Kwale County',
      timezone: 'Africa/Nairobi'
    },
    logoUrl:
      'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=500&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80'
    ],
    categoryNames: [
      'Breath work',
      'Energy Reading & Healing',
      'Transformational Tool',
      'Yoga',
      'Meditation'
    ],
    typeNames: ['Group Class', 'Workshop', 'Retreat', 'Private Session'],
    offerings: [
      {
        name: 'Baobab Kundalini Awakening & Kriya',
        slug: 'baobab-kundalini-awakening',
        description:
          'Dynamic kriyas, pranayama, mudras, and powerful mantra chanting under the shade of ancient baobabs to awaken spinal energy.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 16,
        categoryNames: ['Yoga', 'Energy Reading & Healing'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Coastal Transformational Breath Journey',
        slug: 'baobab-coastal-transformational-breath',
        description:
          'Deep circular connected breathwork session. Releases emotional blockages, clears stored trauma, and recharges the cellular body.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 14,
        categoryNames: ['Breath work', 'Transformational Tool'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 3200,
        packPrice: 13500,
        membershipPrice: 22000
      },
      {
        name: 'Sunrise Baobab Meditation & Silent Forest Walk',
        slug: 'baobab-sunrise-meditation-walk',
        description:
          'Greet dawn with 30 minutes of seated mindfulness followed by a silent sensory walking meditation through coastal indigenous trees.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 45,
        capacity: 20,
        categoryNames: ['Meditation', 'Breath work'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1600,
        packPrice: 6800,
        membershipPrice: 12500
      },
      {
        name: 'Sound Frequency Healing: Gongs & Ocean Drums',
        slug: 'baobab-gongs-ocean-drums',
        description:
          'Profound vibrational sound bath with 38-inch symphonic gong, handmade African rainsticks, and crystal singing bowls.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 22,
        categoryNames: ['Sound Healing', 'Energy Reading & Healing'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2400,
        packPrice: 10000,
        membershipPrice: 17000
      },
      {
        name: 'Chakra Balancing & Somatic Vocal Tone',
        slug: 'baobab-chakra-somatic-tone',
        description:
          'Harmonize the seven major energy centers using targeted seed sounds (bija mantras), physical postures, and therapeutic breath.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 16,
        categoryNames: ['Energy Reading & Healing', 'Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Private Shamanic Breath & Energy Reading',
        slug: 'baobab-private-shamanic-breath',
        description:
          'Deep one-on-one intuitive breathwork facilitation, auric field reading, and personalized nervous system restoration.',
        activityType: ActivityType.APPOINTMENT,
        type: offeringType.PRIVATE,
        isPrivate: true,
        duration: 75,
        capacity: 1,
        categoryNames: ['Transformational Tool', 'Energy Reading & Healing'],
        typeNames: ['Private Session'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 8000,
        packPrice: 34000,
        membershipPrice: 55000
      },
      {
        name: 'Online Morning Kundalini Clarity',
        slug: 'baobab-online-morning-kundalini',
        description:
          'Livestreamed morning practice from Diani Beach. Awaken sharp mental clarity, stamina, and heart coherence.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        isOnline: true,
        duration: 45,
        capacity: 50,
        categoryNames: ['Yoga', 'Breath work'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1200,
        packPrice: 5000,
        membershipPrice: 9000
      }
    ]
  },

  // =========================================================================
  // 5. AURA LAGOON YOGA HAVEN (El Nido, Palawan, Philippines) — 11 Offerings
  // =========================================================================
  {
    slug: 'aura-lagoon-yoga',
    name: 'Aura Lagoon Yoga Haven',
    currency: 'USD',
    bio: 'Overlooking the iconic limestone karsts and emerald water of Bacuit Bay, Aura Lagoon is El Nido’s premier open-air shala for sunrise flows, island sound healing, and holistic wellness.',
    mission:
      'To guide seekers toward vibrant physical vitality, deep peace, and reverent harmony with the earth.',
    ownerUserId: 'seed-owner-aura',
    practitionerUserIds: ['seed-owner-aura', 'seed-practitioner-rafael'],
    location: {
      name: 'Bacuit Bay Open-Air Shala',
      country: 'Philippines',
      city: 'El Nido, Palawan',
      address: 'Corong-Corong Oceanway, El Nido, Palawan',
      timezone: 'Asia/Manila'
    },
    logoUrl:
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1000&auto=format&fit=crop&q=80'
    ],
    categoryNames: [
      'Yoga',
      'Sound Healing',
      'Meditation',
      'Physiotherapy',
      'Flow Arts'
    ],
    typeNames: ['Group Class', 'Workshop', 'Retreat', 'Private Session'],
    offerings: [
      {
        name: 'Karst Horizon Sunrise Vinyasa',
        slug: 'aura-karst-horizon-sunrise',
        description:
          'Dynamic flowing sequence greeting the sunrise over towering limestone cliffs. Seamless transitions, heart openers, and energizing breath.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 20,
        categoryNames: ['Yoga', 'Flow Arts'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1900,
        packPrice: 8000,
        membershipPrice: 14500
      },
      {
        name: 'Power Flow & Core Resilience',
        slug: 'aura-power-flow-core',
        description:
          'Sweat with purpose. A vigorous athletic flow building strength in shoulders, glutes, and deep core stabilizers.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 18,
        categoryNames: ['Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1900,
        packPrice: 8000,
        membershipPrice: 14500
      },
      {
        name: 'Bacuit Bay Sunset Sound Sanctuary',
        slug: 'aura-bacuit-bay-sunset-sound',
        description:
          'Experience the evening glow over the bay bathed in pure crystal singing bowl frequencies and gentle ocean drum waves.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 22,
        categoryNames: ['Sound Healing', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2400,
        packPrice: 10000,
        membershipPrice: 17000
      },
      {
        name: 'Deep Fascial Release & Mobility',
        slug: 'aura-deep-fascial-release',
        description:
          'Targeted trigger point therapy using cork massage balls and myofascial stretches to dissolve tension in back, hips, and neck.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 14,
        categoryNames: ['Physiotherapy', 'Yoga'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Island Hatha & Classical Pranayama',
        slug: 'aura-island-hatha-pranayama',
        description:
          'Steadiness and ease. Classical held asanas, meticulous postural alignment, Nadi Shodhana, and Kapalabhati breathwork.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 75,
        capacity: 18,
        categoryNames: ['Yoga', 'Breath work'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1900,
        packPrice: 8000,
        membershipPrice: 14500
      },
      {
        name: 'Restorative Yin by Emerald Waters',
        slug: 'aura-restorative-yin-emerald',
        description:
          'Long supported passive holds allowing gravity to gently soften hips, lower spine, and hamstrings.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 16,
        categoryNames: ['Yoga', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2000,
        packPrice: 8500,
        membershipPrice: 15000
      },
      {
        name: 'Sunset Ecstatic Dance & Drum Circle',
        slug: 'aura-sunset-ecstatic-dance',
        description:
          'A barefoot, judgment-free celebration of music, rhythm, and freeform movement as twilight paints Bacuit Bay pink and gold.',
        activityType: ActivityType.EVENT,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 30,
        categoryNames: ['Dance', 'Flow Arts'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2500,
        packPrice: 10500,
        membershipPrice: 18000
      },
      {
        name: 'Private Sunset Yoga & Sound Therapy',
        slug: 'aura-private-sunset-sound',
        description:
          'Exclusive private shala booking for 1-2 guests with bespoke alignment coaching and customized crystal bowl sound healing.',
        activityType: ActivityType.APPOINTMENT,
        type: offeringType.PRIVATE,
        isPrivate: true,
        duration: 60,
        capacity: 2,
        categoryNames: ['Yoga', 'Sound Healing'],
        typeNames: ['Private Session'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 6500,
        packPrice: 28000,
        membershipPrice: 45000
      },
      {
        name: 'AcroYoga & Partner Balancing Workshop',
        slug: 'aura-acroyoga-partner-balancing',
        description:
          'Build mutual trust, communication, and balance. Learn basic flying and basing poses in a supportive, fun group environment.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 90,
        capacity: 16,
        categoryNames: ['Flow Arts', 'Yoga'],
        typeNames: ['Workshop'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2600,
        packPrice: 11000,
        membershipPrice: 18000
      },
      {
        name: 'Online Palawan Waves Mindfulness Meditation',
        slug: 'aura-online-palawan-mindfulness',
        description:
          'Livestream the calming sounds of Bacuit Bay into your home. A guided 45-minute mindfulness and ocean visualization practice.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        isOnline: true,
        duration: 45,
        capacity: 50,
        categoryNames: ['Meditation', 'Sound Healing'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 1200,
        packPrice: 5000,
        membershipPrice: 9000
      },
      {
        name: 'Moonlit Tibetan Singing Bowls & Yoga Nidra',
        slug: 'aura-moonlit-tibetan-nidra',
        description:
          'Conclude your evening with meditative deep sleep technique (Yoga Nidra) bathed in the sacred acoustics of antique Tibetan singing bowls.',
        activityType: ActivityType.CLASS,
        type: offeringType.GROUP,
        duration: 60,
        capacity: 20,
        categoryNames: ['Sound Healing', 'Meditation'],
        typeNames: ['Group Class'],
        galleryUrls: [
          'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80'
        ],
        dropInPrice: 2200,
        packPrice: 9500,
        membershipPrice: 16000
      }
    ]
  }
]

const offeringImages = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
]

function makeOfferings(
  studioSlug: string,
  names: string[],
  onlineIndexes: number[] = []
): StudioSeedConfig['offerings'] {
  return names.map((name, index) => {
    const isOnline = onlineIndexes.includes(index)
    const isWorkshop = /workshop|journey|immersion|bath/i.test(name)

    return {
      name,
      slug: `${studioSlug}-${slugify(name)}`,
      description: `${name} at ${studioSlug.replaceAll('-', ' ')}. A welcoming practice for movement, breath, and restorative wellbeing.`,
      activityType: isWorkshop ? ActivityType.EVENT : ActivityType.CLASS,
      type: offeringType.GROUP,
      isOnline,
      duration: 45 + (index % 4) * 15,
      capacity: isOnline ? null : 10 + (index % 4) * 5,
      categoryNames: /breath/i.test(name)
        ? ['Breath work', 'Meditation']
        : /sound|nidra|mindfulness|chakra/i.test(name)
          ? ['Meditation', 'Sound Healing']
          : /pilates|mobility|core|somatic/i.test(name)
            ? ['Pilates', 'Physiotherapy']
            : ['Yoga', 'Flow Arts'],
      typeNames: [isWorkshop ? 'Workshop' : 'Group Class'],
      galleryUrls: [offeringImages[index % offeringImages.length]!],
      dropInPrice: 1800 + (index % 4) * 300,
      packPrice: 7500 + (index % 4) * 1000,
      membershipPrice: 14000 + (index % 4) * 1500
    }
  })
}

const studiosData: StudioSeedConfig[] = [
  {
    slug: 'prana-sanctuary',
    name: 'Prana Sanctuary',
    currency: 'EUR',
    bio: 'A warm Kyiv sanctuary for conscious movement, breath, and sound healing, both in the studio and online.',
    mission: 'Make daily practice accessible, grounded, and deeply human.',
    ownerUserId: 'seed-owner-isla',
    practitionerUserIds: ['seed-owner-isla', 'seed-practitioner-kai'],
    location: {
      name: 'Prana Sanctuary Kyiv',
      country: 'Ukraine',
      city: 'Kyiv',
      address: '8 Velyka Vasylkivska Street, Kyiv',
      timezone: 'Europe/Kyiv'
    },
    logoUrl: offeringImages[0] || '',
    galleryUrls: offeringImages,
    categoryNames: ['Yoga', 'Meditation', 'Breath work', 'Sound Healing'],
    typeNames: ['Group Class', 'Workshop'],
    memberships: [
      {
        name: 'Prana Monthly Unlimited',
        description: 'Unlimited access to group classes for 30 days.',
        type: pricingType.MEMBERSHIP,
        price: 14500,
        credits: null,
        durationDays: 30
      },
      {
        name: 'Prana 10-Class Pack',
        description: 'Ten visits to use across eligible group classes.',
        type: pricingType.PACK,
        price: 11000,
        credits: 10,
        durationDays: 90
      }
    ],
    offerings: makeOfferings(
      'prana-sanctuary',
      [
        'Vinyasa Flow',
        'Sound Healing',
        'Breathwork',
        'Yin Yoga',
        'Morning Meditation',
        'Handstand Foundations',
        'Restorative Yoga',
        'Core & Mobility',
        'Online Evening Nidra',
        'Online Pranayama'
      ],
      [8, 9]
    )
  },
  {
    slug: 'soma-soul-space',
    name: 'Soma & Soul Space',
    currency: 'EUR',
    bio: 'Berlin home for quiet strength, nervous-system care, and mindful community.',
    mission: 'Create space for people to return to themselves.',
    ownerUserId: 'seed-owner-zanzibar',
    practitionerUserIds: ['seed-owner-zanzibar', 'seed-practitioner-malik'],
    location: {
      name: 'Soma & Soul Berlin Studio',
      country: 'Germany',
      city: 'Berlin',
      address: '21 Linienstrasse, Berlin',
      timezone: 'Europe/Berlin'
    },
    logoUrl: offeringImages[1] || '',
    galleryUrls: offeringImages,
    categoryNames: ['Yoga', 'Meditation', 'Breath work'],
    typeNames: ['Group Class', 'Workshop'],
    memberships: [
      {
        name: 'Soma Monthly Membership',
        description: 'Unlimited restorative and mindful group classes.',
        type: pricingType.MEMBERSHIP,
        price: 16000,
        credits: null,
        durationDays: 30
      }
    ],
    offerings: makeOfferings(
      'soma-soul-space',
      [
        'Restorative Yoga',
        'Mindfulness',
        'Yoga Nidra',
        'Somatics',
        'Gentle Hatha',
        'Breathwork for Stress',
        'Online Meditation Circle',
        'Sound Bath'
      ],
      [6]
    )
  },
  {
    slug: 'lotus-movement-lab',
    name: 'Lotus Movement Lab',
    currency: 'EUR',
    bio: 'A London movement laboratory blending traditional yoga with intelligent strength and mobility.',
    mission: 'Explore capable, curious, and sustainable movement.',
    ownerUserId: 'seed-owner-komorebi',
    practitionerUserIds: ['seed-owner-komorebi', 'seed-practitioner-sophia'],
    location: {
      name: 'Lotus Movement Lab London',
      country: 'United Kingdom',
      city: 'London',
      address: '14 Clerkenwell Road, London',
      timezone: 'Europe/London'
    },
    logoUrl: offeringImages[2] || '',
    galleryUrls: offeringImages,
    categoryNames: ['Yoga', 'Pilates', 'Physiotherapy', 'Aerial'],
    typeNames: ['Group Class', 'Workshop'],
    offerings: makeOfferings(
      'lotus-movement-lab',
      [
        'Ashtanga',
        'Dynamic Vinyasa',
        'Aerial Yoga',
        'Pilates Mat',
        'Core & Mobility',
        'Strength for Yogis',
        'Back Care Flow',
        'Arm Balance Lab',
        'Slow Flow',
        'Somatic Movement',
        'Weekend Workshop',
        'Online Mobility Reset'
      ],
      [11]
    )
  },
  {
    slug: 'aura-dharma-wellness',
    name: 'Aura Dharma Wellness',
    currency: 'EUR',
    bio: 'Balinese retreat energy for awakening, balancing, and returning to a steady inner rhythm.',
    mission: 'Offer practical rituals for a more awake and compassionate life.',
    ownerUserId: 'seed-owner-baobab',
    practitionerUserIds: ['seed-owner-baobab', 'seed-practitioner-nia'],
    location: {
      name: 'Aura Dharma Ubud',
      country: 'Indonesia',
      city: 'Bali',
      address: 'Jl. Bisma, Ubud, Bali',
      timezone: 'Asia/Makassar'
    },
    logoUrl: offeringImages[0] || '',
    galleryUrls: offeringImages,
    categoryNames: [
      'Yoga',
      'Meditation',
      'Breath work',
      'Energy Reading & Healing'
    ],
    typeNames: ['Group Class', 'Workshop', 'Retreat'],
    memberships: [
      {
        name: 'Aura 5-Class Pass',
        description: 'Five practices to use within 60 days.',
        type: pricingType.PACK,
        price: 9000,
        credits: 5,
        durationDays: 60
      }
    ],
    offerings: makeOfferings(
      'aura-dharma-wellness',
      [
        'Kundalini Awakening',
        'Chakra Balancing',
        'Breathwork Journey',
        'Sound Bath',
        'Dharma Meditation',
        'Balinese Yin',
        'Online Sunrise Sadhana'
      ],
      [6]
    )
  },
  {
    slug: 'zenith-athletic-yoga',
    name: 'Zenith Athletic & Yoga',
    currency: 'EUR',
    bio: 'Barcelona studio for athletic practice, intelligent recovery, and joyful discipline.',
    mission: 'Help every body move with power, precision, and ease.',
    ownerUserId: 'seed-owner-aura',
    practitionerUserIds: ['seed-owner-aura', 'seed-practitioner-rafael'],
    location: {
      name: 'Zenith Barcelona Studio',
      country: 'Spain',
      city: 'Barcelona',
      address: '33 Carrer de Girona, Barcelona',
      timezone: 'Europe/Madrid'
    },
    logoUrl: offeringImages[1] || '',
    galleryUrls: offeringImages,
    categoryNames: ['Yoga', 'Physiotherapy', 'Pilates', 'Flow Arts'],
    typeNames: ['Group Class', 'Workshop'],
    offerings: makeOfferings('zenith-athletic-yoga', [
      'Power Yoga',
      'Hot Flow',
      'Functional Mobility',
      'Dharma Yoga',
      'Athletic Vinyasa',
      'Pilates Reformer',
      'Core Conditioning',
      'Hip Opening Lab',
      'Shoulder Stability',
      'Recovery Yin',
      'Sunday Strength Workshop'
    ])
  }
]

async function seedData() {
  const isDryRun = process.argv.includes('--dry-run')
  const isClean = process.argv.includes('--clean')

  const totalOfferings = studiosData.reduce(
    (acc, s) => acc + s.offerings.length,
    0
  )

  if (isDryRun) {
    console.log('--- DRY RUN: Seed Plan ---')
    console.log(`Global categories: ${categoryValues.length}`)
    console.log(`Global types: ${typeValues.length}`)
    console.log(`Global currencies: ${currencyValues.length}`)
    console.log(`Studios: ${studiosData.length}`)
    console.log(`Total Offerings across all 5 studios: ${totalOfferings}`)
    studiosData.forEach((s, idx) => {
      console.log(
        `  ${idx + 1}. ${s.name} (${s.location.city}, ${s.location.country}): ${s.offerings.length} offerings`
      )
    })
    return
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool)

  try {
    console.log('Starting seed process...')

    // 1. Seed Global Data (Categories, Types, Currencies)
    console.log('1. Seeding global categories, types, currencies...')
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

    // Fetch all global categories and types to map IDs by name
    const allCategories = await db.select().from(globalCategories)
    const allTypes = await db.select().from(globalTypes)

    const categoryMap = new Map(allCategories.map(c => [c.name, c.id]))
    const typeMap = new Map(allTypes.map(t => [t.name, t.id]))

    for (const studioConfig of studiosData) {
      for (const name of studioConfig.categoryNames) {
        if (!categoryMap.has(name)) {
          throw new Error(`Missing global seed reference: ${name}`)
        }
      }
      for (const name of studioConfig.typeNames) {
        if (!typeMap.has(name)) {
          throw new Error(`Missing global seed reference: ${name}`)
        }
      }
      for (const offering of studioConfig.offerings) {
        for (const name of offering.categoryNames) {
          if (!categoryMap.has(name)) {
            throw new Error(`Missing global seed reference: ${name}`)
          }
        }
        for (const name of offering.typeNames) {
          if (!typeMap.has(name)) {
            throw new Error(`Missing global seed reference: ${name}`)
          }
        }
      }
    }

    // 2. Clean previous seed data only when explicitly requested.
    const seedStudioSlugs = [
      ...legacyStudiosData.map(s => s.slug),
      ...studiosData.map(s => s.slug)
    ]

    if (isClean) {
      console.log(
        '2. Cleaning previous seed records for studios:',
        seedStudioSlugs
      )

      // Delete existing seed studios (cascades to locations, offerings, slots, members, practitioners)
      const existingStudios = await db
        .select({ id: studios.id })
        .from(studios)
        .where(inArray(studios.slug, seedStudioSlugs))

      if (existingStudios.length > 0) {
        const existingStudioIds = existingStudios.map(s => s.id)
        console.log(
          `Found ${existingStudioIds.length} existing seed studios. Removing...`
        )

        // Clean media files associated with existing studios & offerings
        await db.execute(sql`
        DELETE FROM media_files
        WHERE entity_id IN (
          SELECT id::text FROM studios WHERE slug IN (${sql.join(
            seedStudioSlugs.map(s => sql`${s}`),
            sql`, `
          )})
          UNION
          SELECT id::text FROM offerings WHERE studio_id IN (
            SELECT id FROM studios WHERE slug IN (${sql.join(
              seedStudioSlugs.map(s => sql`${s}`),
              sql`, `
            )})
          )
        )
      `)

        await db.execute(sql`
        DELETE FROM offering_slots
        WHERE practitioner_id IN (
          SELECT id
          FROM studio_practitioners
          WHERE studio_id IN (${sql.join(
            existingStudioIds.map(id => sql`${id}`),
            sql`, `
          )})
        )
      `)

        await db
          .delete(pricingOptions)
          .where(inArray(pricingOptions.studioId, existingStudioIds))
        await db.delete(studios).where(inArray(studios.id, existingStudioIds))
        console.log('Previous seed studios cleaned up successfully.')
      }
    } else {
      console.log('2. Cleanup skipped. Use --clean to replace seed studios.')
    }

    // 3. Seed Users (Owners, Practitioners, Customers)
    console.log('3. Seeding users...')
    const seedPasswordHash = await hashPassword(
      process.env.SEED_PASSWORD ?? 'yogi-demo-password-change-me'
    )

    for (const u of seedUsers) {
      await db
        .insert(user)
        .values({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: true,
          image: u.image,
          bio: u.bio,
          role: u.role
        })
        .onConflictDoUpdate({
          target: user.email,
          set: {
            name: u.name,
            image: u.image,
            bio: u.bio,
            role: u.role
          }
        })

      // Seed avatar into mediaFiles for user
      await db
        .delete(mediaFiles)
        .where(eq(mediaFiles.providerPublicId, `seed/user_${u.id}`))

      await db.insert(mediaFiles).values({
        id: crypto.randomUUID(),
        url: u.image,
        providerPublicId: `seed/user_${u.id}`,
        entityId: u.id,
        entityType: MediaEntityTypeEnum.USER,
        type: MediaTypeEnum.AVATAR,
        order: 0
      })

      await db
        .insert(account)
        .values({
          id: `seed-account-${u.id}`,
          accountId: u.id,
          providerId: 'credential',
          userId: u.id,
          password: seedPasswordHash,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: account.id,
          set: {
            password: seedPasswordHash,
            updatedAt: new Date()
          }
        })
    }

    // 4. Seed Studios, Locations, Practitioners, Media & Offerings
    console.log('4. Seeding 5 Studios and their offerings...')

    const now = new Date()

    for (const studioConfig of studiosData) {
      console.log(
        `Creating studio: "${studioConfig.name}" (${studioConfig.location.city}, ${studioConfig.location.country})...`
      )

      const studioId = crypto.randomUUID()
      const studioCategoryIds = studioConfig.categoryNames
        .map(name => categoryMap.get(name))
        .filter(Boolean) as string[]
      const studioTypeIds = studioConfig.typeNames
        .map(name => typeMap.get(name))
        .filter(Boolean) as string[]

      // Insert studio
      await db.insert(studios).values({
        id: studioId,
        slug: studioConfig.slug,
        name: studioConfig.name,
        currency: studioConfig.currency,
        bio: studioConfig.bio,
        mission: studioConfig.mission,
        isArchived: false,
        ownerId: studioConfig.ownerUserId,
        categories: studioCategoryIds,
        types: studioTypeIds
      })

      // Insert studio location
      const locationId = crypto.randomUUID()
      await db.insert(studioLocations).values({
        id: locationId,
        studioId,
        name: studioConfig.location.name,
        country: studioConfig.location.country,
        city: studioConfig.location.city,
        address: studioConfig.location.address,
        timezone: studioConfig.location.timezone
      })

      // Link owner as BUSINESS member
      await db.insert(studioMembers).values({
        id: crypto.randomUUID(),
        studioId,
        userId: studioConfig.ownerUserId,
        role: userRoles.BUSINESS
      })

      // Insert studio practitioners & members
      const practitionerIdMap = new Map<string, string>() // userId -> studioPractitioners.id
      for (const pUserId of studioConfig.practitionerUserIds) {
        const studioPractitionerId = crypto.randomUUID()
        await db.insert(studioPractitioners).values({
          id: studioPractitionerId,
          studioId,
          userId: pUserId,
          role: userRoles.PRACTITIONER,
          salaryActive: true,
          isActive: true
        })

        await db.insert(studioMembers).values({
          id: crypto.randomUUID(),
          studioId,
          userId: pUserId,
          role: userRoles.PRACTITIONER
        })

        practitionerIdMap.set(pUserId, studioPractitionerId)
      }

      // Insert studio media (LOGO)
      await db.insert(mediaFiles).values({
        id: crypto.randomUUID(),
        url: studioConfig.logoUrl,
        providerPublicId: `seed/studio_logo_${studioConfig.slug}`,
        entityId: studioId,
        entityType: MediaEntityTypeEnum.STUDIO,
        type: MediaTypeEnum.LOGO,
        order: 0
      })

      // Insert studio media (GALLERY)
      for (let gIdx = 0; gIdx < studioConfig.galleryUrls.length; gIdx++) {
        await db.insert(mediaFiles).values({
          id: crypto.randomUUID(),
          url: requiredValue(
            studioConfig.galleryUrls[gIdx],
            `studio gallery ${studioConfig.slug}[${gIdx}]`
          ),
          providerPublicId: `seed/studio_gallery_${studioConfig.slug}_${gIdx}`,
          entityId: studioId,
          entityType: MediaEntityTypeEnum.STUDIO,
          type: MediaTypeEnum.GALLERY,
          order: gIdx
        })
      }

      const membershipOptions = studioConfig.memberships ?? [
        {
          name: 'Studio Unlimited Monthly Pass',
          description:
            'Unlimited access to all group classes and open shala hours.',
          type: pricingType.MEMBERSHIP,
          price: 18000,
          credits: null,
          durationDays: 30
        }
      ]

      for (const membership of membershipOptions) {
        await db.insert(pricingOptions).values({
          id: crypto.randomUUID(),
          studioId,
          offeringId: null,
          name: membership.name,
          description: membership.description,
          type: membership.type,
          price: membership.price,
          credits: membership.credits,
          durationDays: membership.durationDays,
          isActive: true
        })
      }

      // Seed Offerings for this studio
      console.log(
        `  -> Seeding ${studioConfig.offerings.length} offerings for ${studioConfig.name}...`
      )

      let offeringIdx = 0
      for (const offConfig of studioConfig.offerings) {
        offeringIdx++
        const offeringId = crypto.randomUUID()

        const offCategoryIds = offConfig.categoryNames
          .map(name => categoryMap.get(name))
          .filter(Boolean) as string[]
        const offTypeIds = offConfig.typeNames
          .map(name => typeMap.get(name))
          .filter(Boolean) as string[]

        // Insert Offering
        await db.insert(offerings).values({
          id: offeringId,
          slug: offConfig.slug,
          studioId,
          name: offConfig.name,
          description: offConfig.description,
          gallery: offConfig.galleryUrls,
          categories: offCategoryIds,
          types: offTypeIds,
          activityType: offConfig.activityType,
          isPrivate: offConfig.isPrivate ?? false,
          locationId: offConfig.isOnline ? null : locationId, // null for online classes!
          timezone: studioConfig.location.timezone,
          type: offConfig.type,
          duration: offConfig.duration,
          capacity: offConfig.capacity,
          isPublished: true
        })

        // Insert offering media gallery
        for (let mIdx = 0; mIdx < offConfig.galleryUrls.length; mIdx++) {
          await db.insert(mediaFiles).values({
            id: crypto.randomUUID(),
            url: requiredValue(
              offConfig.galleryUrls[mIdx],
              `offering gallery ${offConfig.slug}[${mIdx}]`
            ),
            providerPublicId: `seed/offering_${offConfig.slug}_${mIdx}`,
            entityId: offeringId,
            entityType: MediaEntityTypeEnum.OFFERING,
            type: MediaTypeEnum.GALLERY,
            order: mIdx
          })
        }

        // Link practitioner
        const practitionerUserId = requiredValue(
          studioConfig.practitionerUserIds[
            offeringIdx % studioConfig.practitionerUserIds.length
          ],
          `practitioner for ${offConfig.slug}`
        )
        const practitionerRecordId = requiredValue(
          practitionerIdMap.get(practitionerUserId),
          `studio practitioner ${practitionerUserId}`
        )

        await db.insert(offeringPractitioners).values({
          id: crypto.randomUUID(),
          offeringId,
          practitionerId: practitionerRecordId
        })

        // Insert Pricing Options for Offering
        // 1. Drop-In
        await db.insert(pricingOptions).values({
          id: crypto.randomUUID(),
          studioId,
          offeringId,
          name: 'Single Drop-in Session',
          description: 'Valid for one single attendance to this class.',
          type: pricingType.DROP_IN,
          price: offConfig.dropInPrice,
          credits: 1,
          durationDays: 14,
          isActive: true
        })

        // 2. 5-Class Pack
        await db.insert(pricingOptions).values({
          id: crypto.randomUUID(),
          studioId,
          offeringId,
          name: '5-Class Experience Pack',
          description: 'Package of 5 sessions. Valid for 60 days.',
          type: pricingType.PACK,
          price: offConfig.packPrice,
          credits: 5,
          durationDays: 60,
          isActive: true
        })

        // Generate upcoming slots for the next 14 days
        // Days: today + 1, +2, +3, +5, +7, +10, +12
        const slotDayOffsets = [1, 2, 3, 5, 7, 10, 12]
        const slotHours = [8, 10, 16, 18] // 8am, 10am, 4pm, 6pm

        for (let sIdx = 0; sIdx < slotDayOffsets.length; sIdx++) {
          const dayOffset = requiredValue(
            slotDayOffsets[sIdx],
            `slot day offset ${sIdx}`
          )
          const hour = requiredValue(
            slotHours[(sIdx + offeringIdx) % slotHours.length],
            `slot hour ${sIdx}`
          )

          const slotStart = new Date(now)
          slotStart.setDate(slotStart.getDate() + dayOffset)
          slotStart.setHours(hour, 0, 0, 0)

          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + offConfig.duration)

          const slotId = crypto.randomUUID()

          await db.insert(offeringSlots).values({
            id: slotId,
            offeringId,
            practitionerId: practitionerRecordId,
            startTime: slotStart,
            endTime: slotEnd,
            status: offeringSlotStatus.ACTIVE
          })

          // For the nearest slot on some offerings, create demo bookings to populate spotsBooked!
          // This ensures that the "Popular Offerings" section (< 50% spots remaining) is triggered and shown nicely!
          if (sIdx === 0 && offConfig.capacity && offConfig.capacity > 0) {
            // Book 60% of capacity so that remaining spots < 50%
            const bookingsToCreate = Math.min(
              Math.ceil(offConfig.capacity * 0.6),
              3
            )
            const demoUserIds = [
              'seed-customer-anna',
              'seed-customer-liam',
              'seed-customer-elena'
            ]

            for (let bIdx = 0; bIdx < bookingsToCreate; bIdx++) {
              await db.insert(bookings).values({
                id: crypto.randomUUID(),
                slotId,
                userId: requiredValue(
                  demoUserIds[bIdx % demoUserIds.length],
                  `demo customer ${bIdx}`
                ),
                status: BookingStatus.CONFIRMED
              })
            }
          }
        }
      }
    }

    console.log('=============================================')
    console.log('Seed completed successfully!')
    console.log(`- 5 Studios created with locations across Europe and Asia`)
    console.log(
      `- ${totalOfferings} Offerings created across all studios (5-15 each)`
    )
    console.log(`- Pricing options, media files, and upcoming slots generated`)
    console.log('=============================================')
  } finally {
    await pool.end()
  }
}

seedData().catch(error => {
  console.error('Seed failed:', error)
  process.exit(1)
})
