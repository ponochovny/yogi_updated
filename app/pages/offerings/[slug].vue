<script setup lang="ts">
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  Globe2Icon,
  MapPinIcon,
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

        <section class="grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl border border-border bg-card p-6">
            <h2 class="text-xl font-bold">Your hosts</h2>
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
          </div>

          <div class="rounded-2xl border border-border bg-card p-6">
            <h2 class="text-xl font-bold">Where it happens</h2>
            <NuxtLink
              :to="`/studios/${offering.studio.slug}`"
              class="mt-5 block rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
            >
              <p class="font-semibold">{{ offering.studio.name }}</p>
              <p
                v-if="isOnline"
                class="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Globe2Icon class="size-4 text-primary" /> Join online
              </p>
              <p
                v-else
                class="mt-2 flex items-start gap-2 text-sm text-muted-foreground"
              >
                <MapPinIcon class="mt-0.5 size-4 shrink-0 text-primary" />
                <span
                  >{{ offering.location?.name }},
                  {{ offering.location?.address }}</span
                >
              </p>
            </NuxtLink>
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
              <div class="mt-4 flex gap-3 text-xs text-muted-foreground">
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

      <aside class="lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">Reserve your place</p>
              <h2 class="text-xl font-bold">Upcoming sessions</h2>
            </div>
            <CalendarDaysIcon class="size-6 text-primary" />
          </div>

          <div
            v-if="!Object.keys(groupedSlots).length"
            class="mt-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground"
          >
            No upcoming sessions are available right now.
          </div>

          <div v-else class="mt-6 space-y-6">
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
