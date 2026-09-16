<script setup lang="ts">
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Globe2Icon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon
} from '@lucide/vue'
import { format } from 'date-fns'
import { toast } from 'vue-sonner'
import BookWithPricingOptions from './_components/BookWithPricingOptions.vue'
import { placeholderImageUrl } from '~/config/constants'

const route = useRoute()
const offeringSlug = String(route.params.slug)

const [{ data: offeringData, error: offeringError }, { data: slotsData }] =
  await Promise.all([
    useFetch(`/api/offerings/${offeringSlug}`),
    useFetch(`/api/offerings/${offeringSlug}/slots`)
  ])

if (offeringError.value) {
  await navigateTo('/404')
}

const offering = computed(() => offeringData.value?.offering || null)
const rawSlots = computed(() => slotsData.value?.slots || [])
const isScheduleOpen = ref(false)

const nearestSlots = computed(() =>
  [...rawSlots.value]
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5)
)

const groupedSlots = computed(() =>
  rawSlots.value.reduce<Record<string, typeof rawSlots.value>>(
    (groups, slot) => {
      const dateKey = format(new Date(slot.startTime), 'EEEE, MMMM d')
      groups[dateKey] ||= []
      groups[dateKey].push(slot)
      return groups
    },
    {}
  )
)

const practiceLevel = computed(() => {
  const labels = offering.value?.types || []
  const normalized = labels.map(label => label.toLowerCase())

  if (normalized.some(label => label.includes('beginner'))) return 'Beginner'
  if (normalized.some(label => label.includes('intermediate')))
    return 'Intermediate'
  if (normalized.some(label => label.includes('advanced'))) return 'Advanced'

  return 'All levels'
})

const practiceMeta = computed(() => ({
  description:
    offering.value?.description ||
    'A guided practice designed to support your mobility, breath, and wellbeing.',
  contraindications: [
    'Avoid this class if you are in acute pain or have a recent injury without medical advice.',
    'Speak with your teacher before class if you are pregnant, recovering from surgery, or managing a medical condition.'
  ],
  includes: [
    'Breathwork and movement cues',
    'Teacher guidance',
    'A calm, supportive atmosphere'
  ]
}))

const formatPrice = (price: number) => {
  const configuredCurrency = offering.value?.studio?.currency
  const currency =
    configuredCurrency === 'PHP' || configuredCurrency === 'USD'
      ? configuredCurrency
      : 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(price / 100)
}

const isOnline = computed(() => !offering.value?.location)
const gallery = computed(() => offering.value?.gallery || [])

usePageSeo({
  title: () => offering.value?.name || 'Offering',
  description: () =>
    offering.value?.description || 'Offering details and available sessions',
  type: 'article'
})
</script>

<template>
  <div v-if="offering" class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <main class="min-w-0 space-y-10">
        <section
          class="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div class="bg-muted/40">
            <NuxtImg
              :src="gallery[0] || placeholderImageUrl"
              :alt="offering.name"
              class="aspect-16/10 h-100 w-full object-cover sm:aspect-auto object-[0_20%]"
            />
          </div>

          <div class="space-y-5 p-6 sm:p-8">
            <div
              class="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider"
            >
              <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">{{
                offering.activityType
              }}</span>
              <template v-if="offering.types && offering.types.length">
                <span
                  v-for="type in offering.types"
                  :key="type"
                  class="rounded-full bg-muted px-3 py-1 text-muted-foreground"
                >
                  {{ type }}
                </span>
              </template>
              <span
                v-if="isOnline"
                class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-blue-600"
              >
                <Globe2Icon class="size-3.5" /> Online
              </span>
            </div>

            <div>
              <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
                {{ offering.name }}
              </h1>
              <p
                class="mt-4 max-w-3xl text-base leading-7 text-muted-foreground"
              >
                {{
                  offering.description ||
                  'A guided practice designed to support your wellbeing.'
                }}
              </p>
            </div>

            <div
              class="grid gap-3 border-y border-border py-5 text-sm sm:grid-cols-3"
            >
              <div class="flex items-center gap-2 text-muted-foreground">
                <Clock3Icon class="size-4 text-primary" />
                <span
                  ><strong class="text-foreground">{{
                    offering.duration
                  }}</strong>
                  min</span
                >
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <UsersIcon class="size-4 text-primary" />
                <span
                  ><strong class="text-foreground">{{
                    offering.capacity || 'Unlimited'
                  }}</strong>
                  spots</span
                >
              </div>
              <div class="flex items-center gap-2 text-muted-foreground">
                <MapPinIcon class="size-4 text-primary" />
                <span>{{ isOnline ? 'Online' : offering.location?.city }}</span>
              </div>
            </div>

            <div
              v-if="offering.categories?.length || offering.types?.length"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="label in [
                  ...(offering.categories || []),
                  ...(offering.types || [])
                ]"
                :key="label"
                class="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >{{ label }}</span
              >
            </div>
          </div>
        </section>

        <section
          class="grid gap-6 sm:grid-cols-2 border border-border bg-card rounded-2xl p-6"
        >
          <div>
            <div class="mb-4 flex items-center gap-2 text-primary">
              <SparklesIcon class="size-5" />
              <h2 class="text-xl font-bold text-foreground">
                About this practice
              </h2>
            </div>

            <p class="text-base leading-7 text-muted-foreground">
              {{ practiceMeta.description }}
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl bg-muted/40 p-4">
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Level
                </p>
                <p
                  class="mt-2 flex items-center gap-2 font-medium text-foreground"
                >
                  <ShieldCheckIcon class="size-4 text-primary" />
                  {{ practiceLevel }}
                </p>
              </div>

              <div class="rounded-xl bg-muted/40 p-4">
                <p
                  class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Duration
                </p>
                <p class="mt-2 font-medium text-foreground">
                  {{ offering.duration }} minutes
                </p>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-border bg-muted/30 p-4">
              <p class="text-sm font-semibold text-foreground">
                Contraindications
              </p>
              <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
                <li
                  v-for="item in practiceMeta.contraindications"
                  :key="item"
                  class="flex items-start gap-2"
                >
                  <AlertTriangleIcon
                    class="mt-0.5 size-4 shrink-0 text-amber-500"
                  />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div class="mb-4 flex items-center gap-2 text-primary">
              <UsersIcon class="size-5" />
              <h2 class="text-xl font-bold text-foreground">Your hosts</h2>
            </div>
            <div class="mt-5 space-y-4">
              <NuxtLink
                v-for="practitioner in offering.practitioners"
                :key="practitioner.id"
                :to="`/practitioners/${practitioner.id}`"
                class="-mx-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <NuxtImg
                  :src="practitioner.avatar || placeholderImageUrl"
                  :alt="practitioner.name"
                  class="size-12 rounded-full object-cover"
                />
                <span class="font-semibold">{{ practitioner.name }}</span>
              </NuxtLink>
            </div>

            <div class="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
              <p class="text-sm font-semibold text-foreground">
                What you'll get
              </p>
              <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
                <li
                  v-for="item in practiceMeta.includes"
                  :key="item"
                  class="flex items-center gap-2"
                >
                  <CheckCircle2Icon class="size-4 text-primary" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section v-if="offering.pricingOptions?.length" class="space-y-5">
          <div>
            <p
              class="text-sm font-medium uppercase tracking-wider text-primary"
            >
              Choose what works for you
            </p>
            <h2 class="mt-1 text-2xl font-bold">Ways to book</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="price in offering.pricingOptions"
              :key="price.id"
              class="rounded-2xl border border-border bg-card p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold">{{ price.name }}</h3>
                  <p
                    v-if="price.description"
                    class="mt-1 text-sm text-muted-foreground"
                  >
                    {{ price.description }}
                  </p>
                </div>
                <strong class="shrink-0 text-lg">{{
                  formatPrice(price.price)
                }}</strong>
              </div>
              <div
                class="mt-4 flex gap-3 text-xs text-muted-foreground items-center"
              >
                <span class="rounded-full bg-muted px-2.5 py-1">{{
                  price.type.replace('_', ' ')
                }}</span>
                <span v-if="price.credits">{{ price.credits }} credits</span>
                <span v-if="price.durationDays"
                  >{{ price.durationDays }} days</span
                >
              </div>
            </div>
          </div>
        </section>
      </main>

      <aside>
        <section class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">Reserve your place</p>
              <h2 class="text-xl font-bold">Next available sessions</h2>
            </div>
            <CalendarDaysIcon class="size-6 text-primary" />
          </div>

          <div
            v-if="!nearestSlots.length"
            class="mt-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground"
          >
            No upcoming sessions are available right now.
          </div>

          <div v-else class="mt-6 space-y-3">
            <div
              v-for="slot in nearestSlots"
              :key="slot.id"
              class="rounded-2xl border border-border bg-muted/35 p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    {{ format(new Date(slot.startTime), 'EEE, d MMM') }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ format(new Date(slot.startTime), 'h:mm a') }} -
                    {{ format(new Date(slot.endTime), 'h:mm a') }}
                  </p>
                </div>
                <span
                  class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  :class="
                    slot.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  "
                >
                  {{ slot.status }}
                </span>
              </div>

              <div class="mt-3 flex items-center justify-between gap-3 text-sm">
                <NuxtLink
                  :to="`/practitioners/${slot.practitioner.id}`"
                  class="text-muted-foreground hover:text-primary"
                >
                  {{ slot.practitioner.name }}
                </NuxtLink>
                <span
                  v-if="slot.availableSpots !== null && slot.availableSpots > 0"
                  class="text-xs text-muted-foreground"
                >
                  {{ slot.availableSpots }} free
                  {{ slot.availableSpots === 1 ? 'spot' : 'spots' }}
                </span>
                <span
                  v-else-if="slot.availableSpots === 0"
                  class="text-xs font-medium text-destructive"
                >
                  Fully booked
                </span>
              </div>

              <Dialog class="mt-3 block">
                <DialogTrigger as-child>
                  <Button
                    class="mt-3 w-full"
                    size="sm"
                    :disabled="slot.availableSpots === 0"
                  >
                    {{ slot.availableSpots === 0 ? 'Fully booked' : 'Book' }}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book {{ offering.name }}</DialogTitle>
                    <DialogDescription
                      >{{
                        format(new Date(slot.startTime), 'EEEE, MMMM d, h:mm a')
                      }}
                      with {{ slot.practitioner.name }}.</DialogDescription
                    >
                  </DialogHeader>
                  <BookWithPricingOptions
                    :slug="offeringSlug"
                    :slot-id="slot.id"
                    @success="
                      payload =>
                        toast.success('Booking successful!', {
                          description: payload.message
                        })
                    "
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div
            v-if="Object.keys(groupedSlots).length"
            class="mt-6 border-t border-border pt-4"
          >
            <button
              type="button"
              class="mb-3 flex w-full items-center justify-between gap-3 text-left"
              @click="isScheduleOpen = !isScheduleOpen"
            >
              <p
                class="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Full schedule
              </p>
              <span class="text-sm text-primary">
                {{ isScheduleOpen ? 'Hide' : 'Show all' }}
              </span>
            </button>

            <div v-if="isScheduleOpen" class="space-y-4">
              <div v-for="(slots, date) in groupedSlots" :key="date">
                <h3 class="mb-2 text-sm font-semibold">{{ date }}</h3>
                <div class="space-y-2">
                  <div
                    v-for="slot in slots"
                    :key="slot.id"
                    class="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div class="min-w-0">
                      <p class="font-semibold">
                        {{ format(new Date(slot.startTime), 'h:mm a') }}
                      </p>
                      <NuxtLink
                        :to="`/practitioners/${slot.practitioner.id}`"
                        class="truncate text-xs text-muted-foreground hover:text-primary"
                        >{{ slot.practitioner.name }}</NuxtLink
                      >
                    </div>
                    <Dialog>
                      <DialogTrigger as-child>
                        <Button size="sm">Book</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book {{ offering.name }}</DialogTitle>
                          <DialogDescription
                            >{{
                              format(
                                new Date(slot.startTime),
                                'EEEE, MMMM d, h:mm a'
                              )
                            }}
                            with
                            {{ slot.practitioner.name }}.</DialogDescription
                          >
                        </DialogHeader>
                        <BookWithPricingOptions
                          :slug="offeringSlug"
                          :slot-id="slot.id"
                          @success="
                            payload =>
                              toast.success('Booking successful!', {
                                description: payload.message
                              })
                          "
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="mt-6 border-t border-border pt-4 text-xs text-muted-foreground"
          >
            <p class="flex items-start gap-2">
              <CheckCircle2Icon class="mt-0.5 size-4 shrink-0 text-primary" />
              Secure booking and instant confirmation.
            </p>
            <p class="mt-2">Times shown in {{ offering.timezone }}.</p>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
