<script lang="ts" setup>
import {
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon
} from '@lucide/vue'
import { format } from 'date-fns'
import { toast } from 'vue-sonner'
import { Button } from '~/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/shared/ui/tabs'
import StudioGallery from '~/widgets/Studio/studio-gallery.vue'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const activeTab = ref('schedule')
const activeDay = ref('all')

const { data: membershipsData } = await useFetch(
  `/api/studios/${slug.value}/memberships`
)
const memberships = computed(() => membershipsData.value?.memberships || [])

const { data: studioData, error: studioError } = await useFetch(
  `/api/studios/${slug.value}`
)
if (studioError.value) {
  await navigateTo('/404')
}
const studio = computed(() => studioData.value?.studio || null)

const { data: scheduleData } = await useFetch(
  `/api/studios/${slug.value}/schedule`
)
const scheduleSlots = computed(() => scheduleData.value?.slots || [])

const formatList = (list: string[] = []) => list.join(', ') || ''

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: studio.value?.currency === 'PHP' ? 'PHP' : 'USD',
    maximumFractionDigits: 0
  }).format(price / 100)

const scheduleDays = computed(() => {
  const uniqueDays = new Set(
    scheduleSlots.value.map(slot =>
      format(new Date(slot.startTime), 'yyyy-MM-dd')
    )
  )

  return Array.from(uniqueDays).sort((a, b) => a.localeCompare(b))
})

watch(
  scheduleDays,
  days => {
    if (days.length && !days.includes(activeDay.value)) {
      activeDay.value = 'all'
    }
  },
  { immediate: true }
)

const visibleSchedule = computed(() => {
  if (activeDay.value === 'all') {
    return scheduleSlots.value
  }

  return scheduleSlots.value.filter(
    slot => format(new Date(slot.startTime), 'yyyy-MM-dd') === activeDay.value
  )
})

const studioLocations = computed(() => studio.value?.locations || [])
const firstLocation = computed(() => studioLocations.value[0])

const isProcessing = ref<boolean>(false)

async function buyMembership(pricingOptionId: string) {
  isProcessing.value = true
  try {
    const response = await $fetch<{ url: string }>(
      '/api/checkout/create-session',
      {
        method: 'POST',
        body: { pricingOptionId }
      }
    )

    if (response.url) {
      window.location.href = response.url
    }
  } catch (error) {
    toast.error(
      (error as { data: { message: string } }).data.message ||
        'An error occurred while processing your request.'
    )
  } finally {
    isProcessing.value = false
  }
}

usePageSeo({
  title: () => studio.value?.name || 'Studio',
  description: () =>
    studio.value?.bio || 'Studio profile, memberships, and practitioners',
  type: 'profile'
})
</script>

<template>
  <div v-if="studio" class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div
      class="overflow-hidden rounded-[32px] border border-border bg-card shadow-sm"
    >
      <div class="space-y-0">
        <StudioGallery :gallery="studio.gallery" :alt="studio.name" />

        <div class="space-y-6 p-6 sm:p-8">
          <div
            class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            <span
              v-for="type in studio.types || []"
              :key="type"
              class="text-primary"
            >
              {{ type }}
            </span>
            <span v-if="studio.types?.length && studio.categories?.length"
              >•</span
            >
            <span v-for="category in studio.categories || []" :key="category">
              {{ category }}
            </span>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <NuxtImg
                v-if="studio.logo?.url"
                :src="
                  studio.logo.url.replace(
                    '/upload/',
                    '/upload/w_160,h_160,c_thumb,g_custom/'
                  )
                "
                :alt="studio.name"
                class="h-16 w-16 rounded-full border border-border bg-background object-cover"
              />
              <div>
                <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
                  {{ studio.name }}
                </h1>
                <div
                  class="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <MapPinIcon class="size-4 text-primary" />
                  <span>{{ firstLocation?.address || 'Studio location' }}</span>
                </div>
              </div>
            </div>

            <p class="max-w-3xl text-base leading-7 text-muted-foreground">
              {{ studio.bio }}
            </p>
          </div>

          <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Address
          </p>
          <p class="mt-2 text-sm font-medium text-foreground">
            {{ firstLocation?.address || 'Address to be confirmed' }}
          </p>

          <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Contact
          </p>
          <button
            type="button"
            class="mt-2 flex items-center gap-2 text-sm text-foreground hover:text-primary"
            @click="activeTab = 'schedule'"
          >
            <PhoneIcon class="size-4 text-primary" />
            <span>Book a class</span>
          </button>

          <p class="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Atmosphere
          </p>
          <p class="mt-2 text-sm font-medium text-foreground">
            {{
              studio.mission ||
              'A welcoming practice space for movement and recovery.'
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <Tabs v-model="activeTab" class="w-full" default-value="schedule">
        <TabsList class="w-full justify-start rounded-full p-1">
          <TabsTrigger value="schedule" class="rounded-full px-4">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="pricing" class="rounded-full px-4">
            Pricing & memberships
          </TabsTrigger>
          <TabsTrigger value="teachers" class="rounded-full px-4">
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" class="mt-6">
          <div class="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <div class="mb-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="
                  activeDay === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground'
                "
                @click="activeDay = 'all'"
              >
                All days
              </button>
              <button
                v-for="day in scheduleDays"
                :key="day"
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm transition-colors"
                :class="
                  activeDay === day
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground'
                "
                @click="activeDay = day"
              >
                {{ format(new Date(`${day}T00:00:00`), 'EEE, d MMM') }}
              </button>
            </div>

            <div
              v-if="visibleSchedule.length === 0"
              class="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
            >
              There are no upcoming sessions for the selected date.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="slot in visibleSchedule"
                :key="slot.id"
                class="flex flex-col gap-4 rounded-2xl border border-border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="rounded-xl bg-background p-3 text-center shadow-sm"
                  >
                    <p
                      class="text-xs uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {{ format(new Date(slot.startTime), 'MMM') }}
                    </p>
                    <p class="text-xl font-bold leading-none">
                      {{ format(new Date(slot.startTime), 'd') }}
                    </p>
                  </div>

                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-lg font-semibold text-foreground">
                        {{ slot.offering.name }}
                      </h3>
                      <span
                        class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        :class="
                          slot.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        "
                      >
                        {{ slot.status }}
                      </span>
                    </div>
                    <div
                      class="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                    >
                      <span class="flex items-center gap-1.5">
                        <Clock3Icon class="size-4 text-primary" />
                        {{ format(new Date(slot.startTime), 'EEE, d MMM') }}
                      </span>
                      <span
                        >{{ format(new Date(slot.startTime), 'HH:mm') }} -
                        {{ format(new Date(slot.endTime), 'HH:mm') }}</span
                      >
                    </div>
                    <div
                      class="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                    >
                      <span class="flex items-center gap-1.5">
                        <UsersIcon class="size-4 text-primary" />
                        {{
                          slot.availableSpots === null
                            ? 'Unlimited'
                            : `${slot.availableSpots} free spots`
                        }}
                      </span>
                      <span class="flex items-center gap-1.5">
                        <CalendarDaysIcon class="size-4 text-primary" />
                        {{ slot.practitioner.name }}
                      </span>
                    </div>
                  </div>
                </div>

                <Button size="sm" as-child>
                  <NuxtLink :to="`/offerings/${slot.offering.slug}`"
                    >Reserve</NuxtLink
                  >
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" class="mt-6">
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="rounded-3xl border border-border bg-card p-6">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-2xl font-semibold">Packs</h2>
                <span
                  class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
                >
                  Class credits
                </span>
              </div>
              <div
                v-if="
                  memberships.filter(item => item.type === 'PACK').length === 0
                "
                class="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground"
              >
                No packs are available at the moment.
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="membership in memberships.filter(
                    item => item.type === 'PACK'
                  )"
                  :key="membership.id"
                  class="rounded-2xl border border-border bg-muted/35 p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-semibold text-foreground">
                        {{ membership.name }}
                      </h3>
                      <p class="mt-1 text-sm text-muted-foreground">
                        {{ membership.description }}
                      </p>
                    </div>
                    <span class="text-xl font-bold text-foreground">{{
                      formatPrice(membership.price)
                    }}</span>
                  </div>
                  <div
                    class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"
                  >
                    <span class="rounded-full bg-background px-2 py-1"
                      >{{ membership.credits }} credits</span
                    >
                    <span class="rounded-full bg-background px-2 py-1"
                      >{{ membership.durationDays }} days</span
                    >
                    <span class="rounded-full bg-background px-2 py-1">{{
                      formatList(membership.applicableCategories) ||
                      'All categories'
                    }}</span>
                  </div>
                  <Button
                    class="mt-4 w-full"
                    :disabled="isProcessing"
                    @click="buyMembership(membership.id)"
                  >
                    Buy pack
                  </Button>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-border bg-card p-6">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-2xl font-semibold">Memberships</h2>
                <span
                  class="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600"
                >
                  Unlimited
                </span>
              </div>
              <div
                v-if="
                  memberships.filter(item => item.type === 'MEMBERSHIP')
                    .length === 0
                "
                class="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground"
              >
                No memberships are available yet.
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="membership in memberships.filter(
                    item => item.type === 'MEMBERSHIP'
                  )"
                  :key="membership.id"
                  class="rounded-2xl border border-border bg-muted/35 p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-semibold text-foreground">
                        {{ membership.name }}
                      </h3>
                      <p class="mt-1 text-sm text-muted-foreground">
                        {{ membership.description }}
                      </p>
                    </div>
                    <span class="text-xl font-bold text-foreground">{{
                      formatPrice(membership.price)
                    }}</span>
                  </div>
                  <div
                    class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"
                  >
                    <span class="rounded-full bg-background px-2 py-1"
                      >Unlimited classes</span
                    >
                    <span class="rounded-full bg-background px-2 py-1"
                      >{{ membership.durationDays }} days</span
                    >
                    <span class="rounded-full bg-background px-2 py-1">{{
                      formatList(membership.applicableCategories) ||
                      'All categories'
                    }}</span>
                  </div>
                  <Button
                    class="mt-4 w-full"
                    :disabled="isProcessing"
                    @click="buyMembership(membership.id)"
                  >
                    Buy membership
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teachers" class="mt-6">
          <div
            v-if="!studio.practitioners?.length"
            class="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground"
          >
            No teachers are currently listed for this studio.
          </div>
          <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="practitioner in studio.practitioners"
              :key="practitioner.id"
              class="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <NuxtImg
                v-if="practitioner.avatar"
                :src="
                  practitioner.avatar.replace(
                    '/upload/',
                    '/upload/w_200,h_200,c_thumb,g_custom/'
                  )
                "
                :alt="practitioner.name"
                class="h-52 w-full object-cover"
              />
              <div
                v-else
                class="flex h-52 items-center justify-center bg-muted text-xl font-semibold text-muted-foreground"
              >
                {{ practitioner.name.charAt(0) }}
              </div>

              <div class="space-y-3 p-5">
                <div>
                  <NuxtLink
                    :to="`/practitioners/${practitioner.id}`"
                    class="text-xl font-semibold hover:text-primary"
                  >
                    {{ practitioner.name }}
                  </NuxtLink>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ practitioner.bio || 'Movement coach and host' }}
                  </p>
                </div>
                <div
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <UsersIcon class="size-4 text-primary" />
                  <span>Studio instructor</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
