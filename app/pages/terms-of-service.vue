<script setup lang="ts">
import {
  FileTextIcon,
  ShieldCheckIcon,
  ScaleIcon,
  SparklesIcon,
  HeartHandshakeIcon,
  SearchIcon,
  PrinterIcon,
  CopyIcon,
  CheckIcon,
  HelpCircleIcon,
  MailIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CreditCardIcon,
  UserCheckIcon,
  Building2Icon,
  HeartIcon,
  ActivityIcon,
  CompassIcon,
  RefreshCwIcon,
  InfoIcon,
  ArrowUpIcon,
  XIcon,
  BookOpenIcon,
  ChevronDownIcon
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '~/shared/ui/button'
import { Badge } from '~/shared/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '~/shared/ui/card'
import { Input } from '~/shared/ui/input'

usePageSeo('termsOfService')

const effectiveDate = 'September 14, 2026'
const version = '2.4.0'

const searchQuery = ref('')
const copied = ref(false)
const activeSection = ref('acceptance')
const readingProgress = ref(0)
const mobileNavOpen = ref(false)

// Table of Contents definitions
const sections = [
  {
    id: 'acceptance',
    number: '01',
    title: 'Acceptance & Eligibility',
    icon: FileTextIcon,
    summary:
      'By using Yogi or booking a class, you enter a binding agreement with Yogi Platform Inc. Users must be at least 18 years old or have parental consent.',
    keywords:
      'agree binding contract capacity age 18 consent electronic acceptance'
  },
  {
    id: 'platform-role',
    number: '02',
    title: 'Platform Role & Marketplace Scope',
    icon: CompassIcon,
    summary:
      'Yogi is a technology platform connecting you with independent wellness studios. Studios and instructors are independent operators.',
    keywords:
      'marketplace intermediary independent studios venue facilitator operator'
  },
  {
    id: 'user-accounts',
    number: '03',
    title: 'User Accounts & Security',
    icon: UserCheckIcon,
    summary:
      'You are responsible for your account credentials and any booking activity. Keep your health and contact details truthful and up to date.',
    keywords:
      'registration login credentials password profile suspension terminate security'
  },
  {
    id: 'bookings-passes',
    number: '04',
    title: 'Bookings, Passes & Attendance',
    icon: CalendarIcon,
    summary:
      'Bookings reserve your studio slot. Packages and passes have fixed validity periods. Arrive 10–15 minutes before class begins.',
    keywords:
      'reservation class schedule drop-in package credit validity expire waitlist check-in attendance'
  },
  {
    id: 'payments-billing',
    number: '05',
    title: 'Pricing, Payments & Billing',
    icon: CreditCardIcon,
    summary:
      'All prices and taxes are shown transparently before checkout. Payments are securely processed via Maya, debit/credit cards, or studio cash.',
    keywords:
      'pricing fee checkout payment maya card processing currency receipt taxes billing'
  },
  {
    id: 'cancellations-refunds',
    number: '06',
    title: 'Cancellations, No-Shows & Refunds',
    icon: RefreshCwIcon,
    summary:
      'Cancel at least 12 hours prior for a full 100% class credit or refund. Classes cancelled by the studio are automatically fully refunded.',
    keywords:
      'cancel cancellation refund no-show credit late cancel cutoff window reschedule'
  },
  {
    id: 'causes-impact',
    number: '07',
    title: 'Causes & Charitable Impact',
    icon: HeartIcon,
    summary:
      'Offerings tagged with Causes donate a dedicated portion of proceeds to vetted non-profit partners with complete transparency.',
    keywords:
      'causes donation charity non-profit social impact transparency community giveback'
  },
  {
    id: 'health-disclaimer',
    number: '08',
    title: 'Health & Physical Safety Disclaimer',
    icon: ActivityIcon,
    summary:
      'Movement arts involve physical exertion. You voluntarily assume risk, must listen to your body, and inform teachers of injuries or pregnancy.',
    keywords:
      'health medical physical injury exertion doctor pregnant disclaimer assumption risk safety'
  },
  {
    id: 'studio-partners',
    number: '09',
    title: 'Studio Partner & Teacher Standards',
    icon: Building2Icon,
    summary:
      'Studios represent they hold active commercial business permits, certified instructors, safe premises, and commercial liability insurance.',
    keywords:
      'studio business owner teacher instructor license insurance venue standards'
  },
  {
    id: 'community-conduct',
    number: '10',
    title: 'Community Code of Conduct',
    icon: HeartHandshakeIcon,
    summary:
      'We enforce zero tolerance for harassment, discrimination, disruptive studio behavior, or unauthorized automated platform scraping.',
    keywords:
      'conduct harassment discrimination respect abuse spam bots scraping safe space'
  },
  {
    id: 'intellectual-property',
    number: '11',
    title: 'Intellectual Property & Content',
    icon: SparklesIcon,
    summary:
      'Yogi owns all platform software, brand, and design. You retain ownership of reviews and photos you post, granting Yogi a license to display them.',
    keywords:
      'copyright trademark license user content photos reviews intellectual property'
  },
  {
    id: 'liability-limitation',
    number: '12',
    title: 'Limitation of Liability',
    icon: ShieldCheckIcon,
    summary:
      'Services are provided "as is". Yogi is not liable for indirect damages or physical incidents occurring on independent studio premises.',
    keywords:
      'liability damages warranty as is indemnity limitation claims aggregate cap'
  },
  {
    id: 'dispute-resolution',
    number: '13',
    title: 'Dispute Resolution & Law',
    icon: ScaleIcon,
    summary:
      'Disputes are handled first through 30-day good faith informal negotiation, followed by binding arbitration or local jurisdiction.',
    keywords:
      'dispute resolution arbitration governing law jurisdiction informal settlement'
  },
  {
    id: 'modifications-contact',
    number: '14',
    title: 'Modifications & Contact',
    icon: MailIcon,
    summary:
      'Terms may be updated with 15 days notice for material changes. Contact our legal and support team at legal@yogiapp.com.',
    keywords: 'updates revisions changes notice contact support email legal'
  }
]

// Filter sections based on search query
const filteredSections = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return sections
  return sections.filter(
    s =>
      s.title.toLowerCase().includes(query) ||
      s.summary.toLowerCase().includes(query) ||
      s.keywords.toLowerCase().includes(query) ||
      s.number.includes(query)
  )
})

const activeFilteredIds = computed(
  () => new Set(filteredSections.value.map(s => s.id))
)

// Quick summary highlights
const keyHighlights = [
  {
    icon: CompassIcon,
    title: 'Direct Studio Booking',
    description:
      'Book directly with independent, vetted studios and certified teachers through our seamless platform.'
  },
  {
    icon: RefreshCwIcon,
    title: 'Fair Cancellations',
    description:
      'Cancel before the studio window (typically 12h) for full credit. Studio-cancelled classes are always 100% refunded.'
  },
  {
    icon: HeartIcon,
    title: 'Social Causes Included',
    description:
      'Offerings tagged with Causes donate a transparent percentage to verified community and ecological non-profits.'
  },
  {
    icon: ActivityIcon,
    title: 'Mindful Safety First',
    description:
      'Yoga is physical movement. Always practice mindfully, consult medical professionals, and inform your instructor.'
  }
]

const currentActiveSectionTitle = computed(() => {
  const found = sections.find(s => s.id === activeSection.value)
  return found ? `${found.number}. ${found.title}` : 'Table of Contents'
})

function scrollToSection(id: string) {
  mobileNavOpen.value = false
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = id
  }
}

async function copyPageLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    toast.success('Terms link copied to clipboard!')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    toast.error('Unable to copy link automatically')
  }
}

function handlePrint() {
  window.print()
}

function clearSearch() {
  searchQuery.value = ''
}

function quickSearch(tag: string) {
  searchQuery.value = tag
}

function updateScrollProgress() {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight
  if (totalHeight > 0) {
    readingProgress.value = Math.min(
      100,
      Math.max(0, (window.scrollY / totalHeight) * 100)
    )
  }

  // Active section tracking with offset
  const scrollPosition = window.scrollY + 160
  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionEl = document.getElementById(sections[i]?.id || '')
    if (sectionEl && sectionEl.offsetTop <= scrollPosition) {
      activeSection.value = sections[i]?.id || ''
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  updateScrollProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})
</script>

<template>
  <div class="relative min-h-screen pb-20 max-w-6xl mx-auto">
    <!-- Reading Progress Bar (Fixed Top) -->
    <div
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 h-1 bg-muted/30 z-40 print:hidden pointer-events-none"
    >
      <div
        class="h-full bg-linear-to-r from-primary via-amber-500 to-rose-500 transition-all duration-150"
        :style="{ width: `${readingProgress}%` }"
      />
    </div>

    <!-- Ambient Subtle Background Glow -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-3xl print:hidden"
    >
      <div
        class="relative left-1/2 aspect-1155/678 w-[40rem] -translate-x-1/2 rotate-12 bg-linear-to-tr from-primary/15 via-amber-500/10 to-rose-500/10 opacity-70 sm:w-[54rem]"
      />
    </div>

    <!-- Hero Header -->
    <header class="mb-10 pb-8 border-b border-border/70 space-y-6">
      <div class="flex flex-wrap items-center gap-2.5">
        <Badge
          variant="outline"
          class="px-2.5 py-0.5 text-xs font-semibold bg-card/70 backdrop-blur-sm border-primary/30 text-primary gap-1.5"
        >
          <ScaleIcon class="size-3.5" />
          Legal Agreement
        </Badge>
        <Badge
          variant="secondary"
          class="text-xs font-normal text-muted-foreground"
        >
          Version {{ version }}
        </Badge>
        <Badge
          variant="secondary"
          class="text-xs font-normal text-muted-foreground"
        >
          Effective: {{ effectiveDate }}
        </Badge>
      </div>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-3 max-w-2xl">
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground"
          >
            Terms of Service
          </h1>
          <p class="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Transparent rules and community commitments governing bookings,
            studio passes, memberships, and charitable causes on
            <span class="font-semibold text-foreground">Yogi</span>.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 shrink-0 print:hidden">
          <Button
            variant="outline"
            size="sm"
            class="h-9 px-3.5 bg-card/70 backdrop-blur-sm hover:bg-card"
            @click="copyPageLink"
          >
            <component
              :is="copied ? CheckIcon : CopyIcon"
              class="size-4 mr-1.5 text-primary"
            />
            <span>{{ copied ? 'Copied' : 'Share Link' }}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            class="h-9 px-3.5 bg-card/70 backdrop-blur-sm hover:bg-card"
            @click="handlePrint"
          >
            <PrinterIcon class="size-4 mr-1.5 text-muted-foreground" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="relative max-w-xl">
        <div class="relative">
          <SearchIcon
            class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Search terms (e.g. refunds, cancellations, medical disclaimer, maya)..."
            class="pl-10 pr-10 h-10 bg-card/80 backdrop-blur-sm border-border text-sm rounded-xl"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
            @click="clearSearch"
          >
            <XIcon class="size-4" />
          </button>
        </div>

        <!-- Search Suggestions or Match Count -->
        <div
          class="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1"
        >
          <span v-if="searchQuery">
            Found {{ filteredSections.length }} matching
            {{ filteredSections.length === 1 ? 'section' : 'sections' }}
          </span>
          <div v-else class="flex flex-wrap items-center gap-1.5">
            <span class="text-muted-foreground/80">Quick topics:</span>
            <button
              type="button"
              class="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              @click="quickSearch('refund')"
            >
              Refunds
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              @click="quickSearch('cancellation')"
            >
              Cancellations
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              @click="quickSearch('health')"
            >
              Health & Safety
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors"
              @click="quickSearch('causes')"
            >
              Causes
            </button>
          </div>
          <button
            v-if="searchQuery"
            type="button"
            class="text-primary hover:underline"
            @click="clearSearch"
          >
            Reset filter
          </button>
        </div>
      </div>
    </header>

    <!-- At a Glance: Key Commitments Cards -->
    <section class="mb-12" aria-label="Key highlights">
      <div class="flex items-center gap-2 mb-4">
        <SparklesIcon class="size-4 text-amber-500" />
        <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
          At a Glance · Core Commitments
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          v-for="(hl, idx) in keyHighlights"
          :key="idx"
          class="border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
        >
          <CardHeader class="pb-2 pt-4 px-4 space-y-2">
            <div
              class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
            >
              <component :is="hl.icon" class="size-4.5" />
            </div>
            <CardTitle class="text-sm font-semibold leading-snug">
              {{ hl.title }}
            </CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4 pt-0">
            <p class="text-xs leading-relaxed text-muted-foreground">
              {{ hl.description }}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Mobile Sticky Quick Jump Bar (< lg screens) -->
    <div class="lg:hidden sticky top-16 z-30 mb-8 print:hidden">
      <div
        class="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-sm p-2.5"
      >
        <button
          type="button"
          class="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <div class="flex items-center gap-2 truncate">
            <BookOpenIcon class="size-4 text-primary shrink-0" />
            <span class="truncate"
              >Jump to: {{ currentActiveSectionTitle }}</span
            >
          </div>
          <ChevronDownIcon
            :class="[
              'size-4 text-muted-foreground transition-transform',
              mobileNavOpen ? 'rotate-180' : ''
            ]"
          />
        </button>

        <div
          v-if="mobileNavOpen"
          class="mt-2 pt-2 border-t border-border max-h-60 overflow-y-auto space-y-1"
        >
          <button
            v-for="s in filteredSections"
            :key="s.id"
            type="button"
            :class="[
              'w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-md text-xs transition-colors',
              activeSection === s.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            ]"
            @click="scrollToSection(s.id)"
          >
            <span class="font-mono text-[10px] opacity-80">{{ s.number }}</span>
            <span class="truncate">{{ s.title }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Balanced 2-Column Layout -->
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
      <!-- Left Sticky Sidebar (Desktop TOC) -->
      <aside
        class="hidden lg:block w-72 shrink-0 sticky top-24 print:hidden space-y-4"
      >
        <div
          class="rounded-xl border border-border/80 bg-card/70 backdrop-blur-sm p-3 shadow-xs space-y-1.5"
        >
          <div
            class="flex items-center justify-between px-2 py-1.5 border-b border-border/50 mb-1"
          >
            <div class="flex items-center gap-2">
              <BookOpenIcon class="size-4 text-primary" />
              <span
                class="text-xs font-semibold uppercase tracking-wider text-foreground"
              >
                Table of Contents
              </span>
            </div>
            <Badge variant="outline" class="text-[10px] h-4 px-1.5">
              14 Sections
            </Badge>
          </div>

          <nav
            class="space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1"
          >
            <button
              v-for="s in sections"
              :key="s.id"
              type="button"
              :class="[
                'w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-lg text-xs transition-all group',
                activeSection === s.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                !activeFilteredIds.has(s.id) && searchQuery ? 'opacity-35' : ''
              ]"
              @click="scrollToSection(s.id)"
            >
              <div class="flex items-center gap-2 truncate">
                <span
                  :class="[
                    'font-mono text-[10px] px-1 py-0.5 rounded',
                    activeSection === s.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  ]"
                >
                  {{ s.number }}
                </span>
                <span class="truncate">{{ s.title }}</span>
              </div>
              <div
                v-if="activeSection === s.id"
                class="size-1.5 rounded-full bg-primary-foreground shrink-0"
              />
            </button>
          </nav>
        </div>

        <!-- Sidebar Help Box -->
        <div
          class="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs"
        >
          <div class="flex items-center gap-1.5 text-foreground font-semibold">
            <HelpCircleIcon class="size-4 text-primary" />
            <span>Need clarification?</span>
          </div>
          <p class="text-muted-foreground leading-relaxed text-[11px]">
            Have questions about memberships or studio policies? Contact our
            legal team directly.
          </p>
          <a
            href="mailto:legal@yogiapp.com"
            class="inline-flex items-center gap-1 text-primary font-medium hover:underline text-xs"
          >
            <MailIcon class="size-3" />
            legal@yogiapp.com
          </a>
        </div>
      </aside>

      <!-- Right Main Document Content -->
      <main class="flex-1 min-w-0 space-y-8">
        <!-- Empty State if Search matches nothing -->
        <div
          v-if="filteredSections.length === 0"
          class="p-10 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3"
        >
          <SearchIcon class="size-8 mx-auto text-muted-foreground" />
          <h3 class="text-base font-semibold text-foreground">
            No matching clauses found
          </h3>
          <p class="text-sm text-muted-foreground max-w-sm mx-auto">
            We couldn't find any terms matching "<span
              class="font-medium text-foreground"
              >{{ searchQuery }}</span
            >". Try clearing your search or using a broader term.
          </p>
          <Button variant="outline" size="sm" @click="clearSearch">
            Clear Search Filter
          </Button>
        </div>

        <!-- 01. Acceptance of Terms -->
        <article
          v-show="activeFilteredIds.has('acceptance')"
          id="acceptance"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >01</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Acceptance of Terms & Eligibility
              </h2>
            </div>
            <FileTextIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <!-- TL;DR Callout -->
          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              By using Yogi or booking any class, you accept these terms. You
              must be at least 18 years old (or 14–17 with parental consent) to
              maintain an account.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              These Terms of Service ("<strong>Terms</strong>") constitute a
              legally binding agreement made between you, whether personally or
              on behalf of an entity ("<strong>User</strong>",
              "<strong>you</strong>", or "<strong>Practitioner</strong>"), and
              <strong>Yogi Platform Inc.</strong> ("<strong>Yogi</strong>",
              "<strong>we</strong>", "<strong>us</strong>", or
              "<strong>our</strong>"), governing your access to and use of the
              Yogi website, mobile applications, and integrated services
              (collectively, the "<strong>Platform</strong>").
            </p>
            <p>
              By browsing, accessing, registering an account, purchasing passes,
              or reserving studio sessions through the Platform, you acknowledge
              that you have read, understood, and agreed to be bound by all of
              these Terms. If you do not agree with all of these Terms, you must
              discontinue use immediately.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Age Requirements & Legal Capacity
            </h4>
            <p>
              The Platform is intended solely for individuals who are at least
              eighteen (18) years of age. Individuals aged 14 to 17 may only use
              the Platform under the direct supervision and express consent of a
              parent or legal guardian who agrees to be bound by these Terms on
              their behalf. Children under the age of 14 are not permitted to
              create accounts or hold reservations independently.
            </p>
          </div>
        </article>

        <!-- 02. Platform Role & Marketplace Scope -->
        <article
          v-show="activeFilteredIds.has('platform-role')"
          id="platform-role"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >02</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Platform Role & Independent Studios
              </h2>
            </div>
            <CompassIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              Yogi is a technology marketplace that connects you with wellness
              studios. Studios and instructors are independent businesses
              responsible for delivering classes safely.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Yogi operates as an online marketplace and discovery venue
              connecting yoga practitioners, wellness seekers, and independent
              wellness studios, retreat organizers, and certified teachers
              ("<strong>Studio Partners</strong>").
            </p>
            <div
              class="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2"
            >
              <h4
                class="text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Key Clarifications on Roles:
              </h4>
              <ul class="list-disc pl-5 space-y-1 text-xs">
                <li>
                  <strong class="text-foreground"
                    >Technology Intermediary:</strong
                  >
                  Yogi provides the booking software, schedule aggregator, and
                  payment routing infrastructure.
                </li>
                <li>
                  <strong class="text-foreground"
                    >Independent Contractors:</strong
                  >
                  Studio Partners and their instructors are independent third
                  parties and are neither employees, agents, nor joint venturers
                  of Yogi.
                </li>
                <li>
                  <strong class="text-foreground">Physical Venues:</strong> Yogi
                  does not own, lease, manage, or operate physical studio
                  premises, yoga mats, or workout equipment unless explicitly
                  stated.
                </li>
              </ul>
            </div>
            <p>
              While Yogi actively screens Studio Partners for quality and
              verified credentials, each Studio Partner remains solely
              responsible for the conduct, safety, instruction quality, and
              physical environment of their classes.
            </p>
          </div>
        </article>

        <!-- 03. User Accounts & Security -->
        <article
          v-show="activeFilteredIds.has('user-accounts')"
          id="user-accounts"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >03</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                User Accounts & Profile Security
              </h2>
            </div>
            <UserCheckIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              Keep your account password secure. You are liable for all bookings
              made with your credentials. Always provide accurate contact and
              emergency information.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              To reserve classes, buy multi-class passes, or support causes, you
              must register an account on the Platform. When registering, you
              agree to:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                Provide accurate, truthful, current, and complete personal and
                billing information.
              </li>
              <li>
                Maintain and promptly update your profile information in case of
                changes.
              </li>
              <li>
                Safeguard your authentication credentials and never share your
                password with third parties.
              </li>
              <li>
                Promptly notify Yogi at
                <a
                  href="mailto:support@yogiapp.com"
                  class="text-primary hover:underline"
                  >support@yogiapp.com</a
                >
                if you suspect unauthorized access or security breaches.
              </li>
            </ul>
            <p>
              Yogi reserves the right to suspend or terminate accounts that
              provide false information, violate community standards, or engage
              in suspicious or fraudulent booking behavior.
            </p>
          </div>
        </article>

        <!-- 04. Bookings, Passes & Attendance -->
        <article
          v-show="activeFilteredIds.has('bookings-passes')"
          id="bookings-passes"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >04</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Studio Bookings, Passes & Attendance
              </h2>
            </div>
            <CalendarIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              When you book a class or buy a pass, your slot is reserved. Passes
              have specific validity dates and are non-transferable unless
              specified by the studio.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              The Platform enables you to reserve single class drop-ins,
              multi-class packages ("<strong>Class Packs</strong>"), recurring
              memberships, and specialized workshops.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Booking Confirmation & Waitlists
            </h4>
            <p>
              A booking is officially confirmed once you complete checkout and
              receive a digital confirmation with a booking reference ID. If a
              session is full, you may join a digital waitlist. If a spot opens
              up, waitlist attendees are automatically enrolled or notified in
              order of registration.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Pass Expiration & Transferability
            </h4>
            <p>
              Class Packs and promotional passes feature strict validity periods
              (e.g., 30 days, 90 days, or 1 year from the date of purchase)
              clearly indicated on the offering page. Expired passes cannot be
              reinstated or redeemed for cash. Passes are personal to your
              account and non-transferable to other users unless authorized in
              writing by the issuing Studio Partner.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Arrival & Studio Check-In
            </h4>
            <p>
              Practitioners must arrive at least 10 to 15 minutes before the
              scheduled start time to check in at the studio reception. For
              safety and meditation quietude, studios reserve the right to lock
              studio doors once class commences and deny late entry without
              refund.
            </p>
          </div>
        </article>

        <!-- 05. Pricing, Payments & Processing -->
        <article
          v-show="activeFilteredIds.has('payments-billing')"
          id="payments-billing"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >05</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Pricing, Payments & Billing
              </h2>
            </div>
            <CreditCardIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              We process payments securely via Maya digital wallet, debit/credit
              cards, or studio cash. All fees and taxes are displayed
              transparently before payment confirmation.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              All prices displayed on the Platform are established either by the
              Studio Partner or Yogi and are shown in local currency (e.g.,
              Philippine Peso - PHP, or other specified currency) inclusive of
              applicable taxes unless specified otherwise.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Accepted Payment Gateways
            </h4>
            <p>
              Yogi utilizes certified, PCI-DSS Level 1 compliant payment service
              providers, including <strong>Maya digital wallet</strong>, credit
              cards, debit cards, and local e-wallets. Cash-on-arrival payments
              are supported exclusively when explicitly authorized by the host
              studio.
            </p>
            <h4
              class="text-xs font-bold uppercase tracking-wider text-foreground pt-1"
            >
              Recurring Memberships & Auto-Renewals
            </h4>
            <p>
              If you subscribe to an ongoing monthly studio membership, you
              authorize Yogi to automatically bill your designated payment
              method on each monthly renewal cycle until you cancel your
              membership in your Profile Settings at least 24 hours prior to the
              next billing date.
            </p>
          </div>
        </article>

        <!-- 06. Cancellations, No-Shows & Refunds -->
        <article
          v-show="activeFilteredIds.has('cancellations-refunds')"
          id="cancellations-refunds"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >06</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Cancellations, No-Shows & Refund Policy
              </h2>
            </div>
            <RefreshCwIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              Timely cancellations (at least 12 hours prior) get 100% credit
              back. Late cancellations or no-shows forfeit the class. If a
              studio cancels, you are refunded completely.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <div class="overflow-x-auto rounded-xl border border-border">
              <table class="w-full text-xs text-left border-collapse">
                <thead
                  class="bg-muted/50 font-semibold text-foreground border-b border-border"
                >
                  <tr>
                    <th class="p-3">Situation</th>
                    <th class="p-3">Cancellation Window</th>
                    <th class="p-3">Resolution</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr>
                    <td class="p-3 font-medium text-foreground">
                      Early Cancellation
                    </td>
                    <td class="p-3">≥ 12 hours before class start</td>
                    <td
                      class="p-3 text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                      100% Class Credit or Refund
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 font-medium text-foreground">
                      Late Cancellation
                    </td>
                    <td class="p-3">&lt; 12 hours before class start</td>
                    <td class="p-3 text-amber-600 dark:text-amber-400">
                      Class credit deducted / Non-refundable
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 font-medium text-foreground">No-Show</td>
                    <td class="p-3">Did not attend without notice</td>
                    <td class="p-3 text-rose-600 dark:text-rose-400">
                      Credit forfeited
                    </td>
                  </tr>
                  <tr>
                    <td class="p-3 font-medium text-foreground">
                      Studio Cancellation
                    </td>
                    <td class="p-3">Cancelled by studio / instructor</td>
                    <td class="p-3 text-primary font-medium">
                      Automatic 100% Refund + Notification
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              In the unlikely event that a Studio Partner cancels a session due
              to illness, facility emergency, or severe weather, you will be
              notified immediately via notification and email, and full credits
              or refunds will be returned to your original payment method within
              3 to 7 business days.
            </p>
          </div>
        </article>

        <!-- 07. Causes & Charitable Contributions -->
        <article
          v-show="activeFilteredIds.has('causes-impact')"
          id="causes-impact"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >07</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Causes & Social Impact Contributions
              </h2>
            </div>
            <HeartIcon class="size-4.5 text-rose-500 shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              Yogi empowers wellness studios to pledge portions of class revenue
              directly to vetted community and environmental causes with
              transparent reporting.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              A foundational pillar of Yogi is uniting mindful movement with
              social contribution ("<strong>Causes</strong>"). Offerings
              designated with a cause badge dedicate a specified percentage of
              gross booking value or add-on contributions to verified non-profit
              organizations, disaster relief projects, or environmental
              initiatives.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                class="p-3 rounded-xl border border-border bg-card/80 space-y-1"
              >
                <span
                  class="font-semibold text-xs text-foreground flex items-center gap-1.5"
                >
                  <ShieldCheckIcon class="size-3.5 text-primary" />
                  Vetted Cause Partners
                </span>
                <p class="text-muted-foreground text-xs leading-relaxed">
                  Every beneficiary organization undergoes due-diligence
                  verification regarding legal registration and non-profit
                  standing.
                </p>
              </div>
              <div
                class="p-3 rounded-xl border border-border bg-card/80 space-y-1"
              >
                <span
                  class="font-semibold text-xs text-foreground flex items-center gap-1.5"
                >
                  <FileTextIcon class="size-3.5 text-primary" />
                  Tax Deductibility Note
                </span>
                <p class="text-muted-foreground text-xs leading-relaxed">
                  Unless expressly indicated with an official donation tax
                  receipt from the non-profit, standard class bookings are not
                  tax-deductible donations.
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- 08. Health & Physical Safety Disclaimer -->
        <article
          v-show="activeFilteredIds.has('health-disclaimer')"
          id="health-disclaimer"
          class="scroll-mt-28 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-amber-500/20"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400"
                >08</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Health & Physical Activity Disclaimer
              </h2>
            </div>
            <AlertTriangleIcon class="size-4.5 text-amber-500 shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-amber-500 bg-amber-500/10 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span
              class="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5"
            >
              <AlertTriangleIcon class="size-3.5" />
              Crucial Safety Notice
            </span>
            <p
              class="text-amber-900/80 dark:text-amber-200/80 leading-relaxed text-xs"
            >
              Yoga, pilates, and movement classes involve strenuous physical
              exertion. You practice voluntarily at your own risk. Consult your
              doctor before beginning any vigorous fitness routine.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Yoga, breathwork, heated sessions (e.g. Hot Yoga), sound healing,
              and movement arts involve inherent physical and psychological
              exertion. Before participating in any studio class or online
              offering, you acknowledge and agree that:
            </p>
            <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong class="text-foreground">Not Medical Advice:</strong>
                Neither Yogi nor Studio Partners provide medical diagnosis,
                medical treatment, or physical therapy. Nothing on the Platform
                should be construed as medical counsel.
              </li>
              <li>
                <strong class="text-foreground"
                  >Consultation with Physicians:</strong
                >
                You are solely responsible for consulting a qualified healthcare
                professional before beginning any physical exercise program,
                especially if you have pre-existing cardiovascular conditions,
                spine or joint injuries, high blood pressure, or are pregnant.
              </li>
              <li>
                <strong class="text-foreground"
                  >Voluntary Assumption of Risk:</strong
                >
                You knowingly and freely assume all risks, both known and
                unknown, of physical injury, illness, muscle damage, or personal
                property loss arising out of your participation.
              </li>
              <li>
                <strong class="text-foreground">Duty to Disclose:</strong> You
                must inform your instructor prior to class of any physical
                limitations, acute pain, surgical history, or pregnancy so
                modifications can be offered.
              </li>
            </ul>
          </div>
        </article>

        <!-- 09. Studio Partners & Instructor Obligations -->
        <article
          v-show="activeFilteredIds.has('studio-partners')"
          id="studio-partners"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >09</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Studio Partner & Instructor Standards
              </h2>
            </div>
            <Building2Icon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div
            class="rounded-xl border-l-3 border-primary bg-primary/5 p-3.5 text-xs sm:text-sm text-foreground space-y-1"
          >
            <span class="font-semibold text-primary flex items-center gap-1.5">
              <InfoIcon class="size-3.5" />
              Plain English Summary
            </span>
            <p class="text-muted-foreground leading-relaxed text-xs">
              Studios on Yogi must uphold high standards of hygiene, verified
              instructor certifications, valid business permits, and adequate
              commercial liability coverage.
            </p>
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              When a studio joins Yogi as an authorized partner, they covenant
              and warrant that:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                They maintain all local commercial business permits, sanitary
                clearances, and fire safety compliance certificates.
              </li>
              <li>
                All instructors teaching scheduled sessions hold certified
                credentials from recognized yoga alliances or fitness governing
                bodies.
              </li>
              <li>
                The studio maintains adequate commercial general liability
                insurance covering participants on premises.
              </li>
              <li>
                Class capacities, instructor names, and class descriptions
                listed on Yogi are accurate and up-to-date.
              </li>
            </ul>
          </div>
        </article>

        <!-- 10. Community Guidelines & Code of Conduct -->
        <article
          v-show="activeFilteredIds.has('community-conduct')"
          id="community-conduct"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >10</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Community Guidelines & Code of Conduct
              </h2>
            </div>
            <HeartHandshakeIcon
              class="size-4.5 text-muted-foreground shrink-0"
            />
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              The Yogi community thrives on kindness, mutual respect, peaceful
              presence, and mindfulness. Every user agrees to refrain from:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                Any form of harassment, hate speech, discrimination, verbal
                abuse, or unwanted physical contact toward instructors, staff,
                or fellow practitioners.
              </li>
              <li>
                Taking unauthorized photographs or video recordings inside
                studio practice rooms without explicit consent of instructors
                and participants.
              </li>
              <li>
                Using automated scripts, bots, spiders, or scrapers to copy
                content or bulk-reserve slots.
              </li>
              <li>
                Attempting to bypass payment structures or conducting
                off-platform fee evasion.
              </li>
            </ul>
            <p>
              Violation of community standards constitutes grounds for immediate
              account suspension and revocation of all future booking rights
              without refund.
            </p>
          </div>
        </article>

        <!-- 11. Intellectual Property & Content Rights -->
        <article
          v-show="activeFilteredIds.has('intellectual-property')"
          id="intellectual-property"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >11</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Intellectual Property & User Content
              </h2>
            </div>
            <SparklesIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              All software, algorithms, user interfaces, branding, logos,
              designs, audio-visual materials, and text comprising the Yogi
              Platform are the exclusive property of Yogi Platform Inc. and
              protected by copyright, trademark, and unfair competition laws.
            </p>
            <p>
              When you post studio reviews, ratings, photographs, or community
              discussions ("<strong>User Content</strong>"), you retain your
              ownership rights, but grant Yogi a worldwide, royalty-free,
              perpetual, non-exclusive license to use, display, reproduce, and
              distribute such content in connection with operating and promoting
              the Platform.
            </p>
          </div>
        </article>

        <!-- 12. Limitation of Liability & Disclaimers -->
        <article
          v-show="activeFilteredIds.has('liability-limitation')"
          id="liability-limitation"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >12</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Limitation of Liability & Disclaimers
              </h2>
            </div>
            <ShieldCheckIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p
              class="uppercase text-xs font-semibold tracking-wide text-foreground/80"
            >
              Disclaimer of Warranties
            </p>
            <p>
              To the maximum extent permitted by applicable law, the Platform is
              provided on an <strong>"as is"</strong> and
              <strong>"as available"</strong> basis without warranties of any
              kind, either express or implied, including warranties of
              merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p>
              In no event shall Yogi, its directors, employees, affiliates, or
              agents be liable for any indirect, incidental, special,
              consequential, or punitive damages (including personal injury
              occurring at an independent partner studio) arising out of or in
              connection with your access to or use of the Platform.
            </p>
            <p>
              Yogi’s total aggregate liability for any claim relating to these
              Terms shall be capped at the total amount paid by you to Yogi in
              the twelve (12) months preceding the claim, or one hundred US
              dollars ($100 USD), whichever is greater.
            </p>
          </div>
        </article>

        <!-- 13. Dispute Resolution & Governing Law -->
        <article
          v-show="activeFilteredIds.has('dispute-resolution')"
          id="dispute-resolution"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >13</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Dispute Resolution & Governing Law
              </h2>
            </div>
            <ScaleIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              We believe in mindful resolution. In the event of any disagreement
              or dispute arising out of or related to these Terms, the parties
              agree to first attempt informal resolution in good faith for a
              period of at least thirty (30) days by contacting
              <a
                href="mailto:legal@yogiapp.com"
                class="text-primary hover:underline"
                >legal@yogiapp.com</a
              >.
            </p>
            <p>
              If the dispute cannot be settled through negotiation, it shall be
              resolved by binding arbitration under the rules of arbitration in
              the jurisdiction of Yogi Platform Inc.'s principal corporate
              domicile, except that either party may seek injunctive relief in a
              court of competent jurisdiction to protect intellectual property
              rights.
            </p>
          </div>
        </article>

        <!-- 14. Modifications & Contact Information -->
        <article
          v-show="activeFilteredIds.has('modifications-contact')"
          id="modifications-contact"
          class="scroll-mt-28 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-7 shadow-xs space-y-4"
        >
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-border/60"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                >14</span
              >
              <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Modifications & Official Contact Channels
              </h2>
            </div>
            <MailIcon class="size-4.5 text-muted-foreground shrink-0" />
          </div>

          <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              We reserve the right to revise or modify these Terms at any time
              to reflect updates in legal requirements, safety protocols, or
              platform features. If a revision is material, we will provide at
              least fifteen (15) days' notice via platform notification or email
              prior to the new terms taking effect.
            </p>

            <div
              class="mt-4 p-5 rounded-xl border border-primary/20 bg-card/80 space-y-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                >
                  <MailIcon class="size-4.5" />
                </div>
                <div>
                  <h4
                    class="text-xs font-bold text-foreground uppercase tracking-wider"
                  >
                    Legal & Compliance Desk
                  </h4>
                  <p class="text-xs text-muted-foreground">
                    Direct correspondence to Yogi compliance officers
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span class="text-muted-foreground block text-[11px]"
                    >General & Legal Support</span
                  >
                  <a
                    href="mailto:legal@yogiapp.com"
                    class="font-medium text-primary hover:underline"
                  >
                    legal@yogiapp.com
                  </a>
                </div>
                <div>
                  <span class="text-muted-foreground block text-[11px]"
                    >Studio & Partner Inquiries</span
                  >
                  <a
                    href="mailto:studios@yogiapp.com"
                    class="font-medium text-primary hover:underline"
                  >
                    studios@yogiapp.com
                  </a>
                </div>
                <div>
                  <span class="text-muted-foreground block text-[11px]"
                    >Corporate Headquarters</span
                  >
                  <span class="font-medium text-foreground">
                    Yogi Platform Inc., Metro Manila, Philippines
                  </span>
                </div>
                <div>
                  <span class="text-muted-foreground block text-[11px]"
                    >Response Standard</span
                  >
                  <span class="font-medium text-foreground">
                    Within 24 to 48 business hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Bottom Actions -->
        <div
          class="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden"
        >
          <p class="text-xs text-muted-foreground text-center sm:text-left">
            Thank you for being part of the mindful Yogi community.
          </p>
          <div class="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              class="gap-1.5"
              @click="scrollToSection('acceptance')"
            >
              <ArrowUpIcon class="size-4" />
              <span>Back to Top</span>
            </Button>
            <NuxtLinkLocale to="/" as-child>
              <Button size="sm" class="gap-1.5">
                <CompassIcon class="size-4" />
                <span>Explore Studios</span>
              </Button>
            </NuxtLinkLocale>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@media print {
  :global(body) {
    background: #ffffff !important;
    color: #000000 !important;
  }
}
</style>
