<script setup lang="ts">
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  Building2Icon,
  CalculatorIcon,
  ChartColumnBigIcon,
  CheckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerResetIcon,
  TrendingUpIcon
} from '@lucide/vue'

const { t } = useI18n()

usePageSeo({
  title: t('businessLanding.metaTitle'),
  description: t('businessLanding.metaDescription'),
  noindex: false
})

const averageTicket = ref(1200)
const weeklyClasses = ref(24)
const occupancy = ref(72)

const estimatedRevenue = computed(() => {
  const ticket = Math.max(0, Number(averageTicket.value) || 0)
  const classes = Math.max(0, Number(weeklyClasses.value) || 0)
  const revenue = ticket * classes * 4.33 * (occupancy.value / 100)
  return Math.round(revenue)
})

const estimatedBookings = computed(() => {
  return Math.round(weeklyClasses.value * 4.33 * (occupancy.value / 100))
})

const advantages = computed(() => [
  {
    icon: TimerResetIcon,
    title: t('businessLanding.benefits.cancellation.title'),
    description: t('businessLanding.benefits.cancellation.description')
  },
  {
    icon: CreditCardIcon,
    title: t('businessLanding.benefits.pos.title'),
    description: t('businessLanding.benefits.pos.description')
  },
  {
    icon: ShieldCheckIcon,
    title: t('businessLanding.benefits.packageProtection.title'),
    description: t('businessLanding.benefits.packageProtection.description')
  },
  {
    icon: ChartColumnBigIcon,
    title: t('businessLanding.benefits.analytics.title'),
    description: t('businessLanding.benefits.analytics.description')
  }
])

const plans = computed(() => [
  {
    name: t('businessLanding.plans.starter.name'),
    price: '₱0',
    description: t('businessLanding.plans.starter.description'),
    features: [
      t('businessLanding.plans.starter.feature1'),
      t('businessLanding.plans.starter.feature2'),
      t('businessLanding.plans.starter.feature3'),
      t('businessLanding.plans.starter.feature4')
    ],
    featured: false
  },
  {
    name: t('businessLanding.plans.growth.name'),
    price: '₱2,990',
    description: t('businessLanding.plans.growth.description'),
    features: [
      t('businessLanding.plans.growth.feature1'),
      t('businessLanding.plans.growth.feature2'),
      t('businessLanding.plans.growth.feature3'),
      t('businessLanding.plans.growth.feature4')
    ],
    featured: true
  },
  {
    name: t('businessLanding.plans.scale.name'),
    price: '₱6,990',
    description: t('businessLanding.plans.scale.description'),
    features: [
      t('businessLanding.plans.scale.feature1'),
      t('businessLanding.plans.scale.feature2'),
      t('businessLanding.plans.scale.feature3'),
      t('businessLanding.plans.scale.feature4')
    ],
    featured: false
  }
])
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
    <section
      class="relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/5 px-6 py-12 shadow-xl shadow-primary/5 sm:px-10 lg:px-16 lg:py-20"
    >
      <div
        class="absolute -right-10 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        class="absolute -bottom-10 left-8 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
      />

      <div class="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-6">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
          >
            <Building2Icon class="h-4 w-4" />
            {{ $t('businessLanding.badge') }}
          </div>

          <div class="space-y-4">
            <h1
              class="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {{ $t('businessLanding.title') }}
            </h1>
            <p class="max-w-xl text-lg text-muted-foreground">
              {{ $t('businessLanding.subtitle') }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/business/create"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              {{ $t('businessLanding.primaryCta') }}
              <ArrowRightIcon class="h-4 w-4" />
            </NuxtLink>
            <NuxtLink
              to="/explore"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              {{ $t('businessLanding.secondaryCta') }}
            </NuxtLink>
          </div>

          <div class="flex flex-wrap gap-6 pt-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <BadgeCheckIcon class="h-4 w-4 text-primary" />
              {{ $t('businessLanding.highlights.cancel') }}
            </div>
            <div class="flex items-center gap-2">
              <BadgeCheckIcon class="h-4 w-4 text-primary" />
              {{ $t('businessLanding.highlights.pos') }}
            </div>
            <div class="flex items-center gap-2">
              <BadgeCheckIcon class="h-4 w-4 text-primary" />
              {{ $t('businessLanding.highlights.analytics') }}
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="rounded-[28px] border border-border/70 bg-background/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl"
          >
            <div class="mb-5 flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">
                  {{ $t('businessLanding.card.revenueLabel') }}
                </p>
                <p class="mt-2 text-3xl font-black text-foreground">
                  ₱{{ estimatedRevenue.toLocaleString('en-US') }}
                </p>
              </div>
              <div class="rounded-2xl bg-primary/10 p-3 text-primary">
                <TrendingUpIcon class="h-7 w-7" />
              </div>
            </div>

            <div
              class="space-y-4 rounded-2xl border border-border bg-muted/30 p-4"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{
                  $t('businessLanding.card.averageTicket')
                }}</span>
                <span class="font-semibold text-foreground"
                  >₱{{ averageTicket.toLocaleString('en-US') }}</span
                >
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{
                  $t('businessLanding.card.classesPerWeek')
                }}</span>
                <span class="font-semibold text-foreground">{{
                  weeklyClasses
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">{{
                  $t('businessLanding.card.occupancy')
                }}</span>
                <span class="font-semibold text-foreground"
                  >{{ occupancy }}%</span
                >
              </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-accent/5 p-3">
                <p class="text-xs text-muted-foreground">
                  {{ $t('businessLanding.card.bookings') }}
                </p>
                <p class="mt-1 text-xl font-bold text-foreground">
                  {{ estimatedBookings }}
                </p>
              </div>
              <div class="rounded-2xl bg-primary/5 p-3">
                <p class="text-xs text-muted-foreground">
                  {{ $t('businessLanding.card.profitability') }}
                </p>
                <p class="mt-1 text-xl font-bold text-foreground">+28%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-18">
      <div class="mb-10 text-center">
        <p
          class="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
        >
          {{ $t('businessLanding.benefits.titleLabel') }}
        </p>
        <h2
          class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {{ $t('businessLanding.benefits.heading') }}
        </h2>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="item in advantages"
          :key="item.title"
          class="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
        >
          <div
            class="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary"
          >
            <component :is="item.icon" class="h-6 w-6" />
          </div>
          <h3 class="mb-2 text-xl font-bold text-foreground">
            {{ item.title }}
          </h3>
          <p class="text-sm leading-6 text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
      </div>
    </section>

    <section class="py-18">
      <div class="mb-8 text-center">
        <p
          class="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
        >
          {{ $t('businessLanding.calculator.label') }}
        </p>
        <h2
          class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {{ $t('businessLanding.calculator.heading') }}
        </h2>
      </div>

      <div
        class="grid gap-8 rounded-[32px] border border-border bg-card p-6 shadow-sm lg:grid-cols-[0.92fr_1.08fr] lg:p-8"
      >
        <div class="space-y-6">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-foreground">{{
              $t('businessLanding.calculator.averageTicketLabel')
            }}</span>
            <div
              class="rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <input
                v-model.number="averageTicket"
                type="number"
                min="200"
                step="50"
                class="w-full bg-transparent text-base outline-none"
              />
            </div>
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-foreground">{{
              $t('businessLanding.calculator.weeklyClassesLabel')
            }}</span>
            <div
              class="rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <input
                v-model.number="weeklyClasses"
                type="number"
                min="1"
                max="200"
                class="w-full bg-transparent text-base outline-none"
              />
            </div>
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-medium text-foreground">{{
              $t('businessLanding.calculator.occupancyLabel')
            }}</span>
            <div
              class="rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <input
                v-model.number="occupancy"
                type="range"
                min="20"
                max="100"
                class="w-full accent-primary"
              />
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>20%</span>
              <span class="font-medium text-foreground">{{ occupancy }}%</span>
              <span>100%</span>
            </div>
          </label>
        </div>

        <div
          class="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/8 to-accent/5 p-6"
        >
          <div class="flex items-center gap-3">
            <div class="rounded-2xl bg-primary/10 p-3 text-primary">
              <CalculatorIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                {{ $t('businessLanding.calculator.forecastLabel') }}
              </p>
              <h3 class="text-2xl font-bold text-foreground">
                {{ $t('businessLanding.calculator.forecastHeading') }}
              </h3>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-border bg-background p-5">
            <p class="text-sm text-muted-foreground">
              {{ $t('businessLanding.calculator.expectedRevenue') }}
            </p>
            <p class="mt-2 text-4xl font-black tracking-tight text-foreground">
              ₱{{ estimatedRevenue.toLocaleString('en-US') }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-sm text-primary">
              <SparklesIcon class="h-4 w-4" />
              {{ $t('businessLanding.calculator.growthNote') }}
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-border bg-background p-4">
              <p class="text-xs text-muted-foreground">
                {{ $t('businessLanding.calculator.bookingsPerMonth') }}
              </p>
              <p class="mt-2 text-2xl font-bold text-foreground">
                {{ estimatedBookings }}
              </p>
            </div>
            <div class="rounded-2xl border border-border bg-background p-4">
              <p class="text-xs text-muted-foreground">
                {{ $t('businessLanding.calculator.avgRevenuePerClass') }}
              </p>
              <p class="mt-2 text-2xl font-bold text-foreground">
                ₱{{
                  Math.round(averageTicket * (occupancy / 100)).toLocaleString(
                    'en-US'
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-18">
      <div class="mb-8 text-center">
        <p
          class="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
        >
          {{ $t('businessLanding.pricing.label') }}
        </p>
        <h2
          class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {{ $t('businessLanding.pricing.heading') }}
        </h2>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div
          v-for="plan in plans"
          :key="plan.name"
          :class="[
            'rounded-[28px] border p-6 transition shadow-sm',
            plan.featured
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-border bg-card'
          ]"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xl font-bold text-foreground">{{ plan.name }}</p>
              <p class="mt-2 text-sm text-muted-foreground">
                {{ plan.description }}
              </p>
            </div>
            <div
              v-if="plan.featured"
              class="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
            >
              {{ $t('businessLanding.pricing.popular') }}
            </div>
          </div>

          <div class="mt-6 flex items-end gap-2">
            <span class="text-4xl font-black text-foreground">{{
              plan.price
            }}</span>
            <span class="pb-1 text-sm text-muted-foreground">{{
              $t('businessLanding.pricing.monthly')
            }}</span>
          </div>

          <ul class="mt-6 space-y-3">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <CheckIcon class="mt-0.5 h-4 w-4 text-primary" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <NuxtLink
            to="/business/create"
            class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
          >
            {{ $t('businessLanding.pricing.cta') }}
            <ArrowRightIcon class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-18">
      <div
        class="rounded-[32px] bg-foreground px-6 py-12 text-background sm:px-8 lg:px-10"
      >
        <div class="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p
              class="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80"
            >
              {{ $t('businessLanding.ctaBanner.label') }}
            </p>
            <h2 class="mt-3 text-3xl font-bold sm:text-4xl">
              {{ $t('businessLanding.ctaBanner.title') }}
            </h2>
          </div>

          <NuxtLink
            to="/business/create"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            {{ $t('businessLanding.ctaBanner.cta') }}
            <ArrowRightIcon class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
