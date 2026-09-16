<script setup lang="ts">
import {
  ArrowDownIcon,
  ArrowRightIcon,
  CalendarCheckIcon,
  CheckIcon,
  CircleHelpIcon,
  CrownIcon,
  HeartPulseIcon,
  SparklesIcon,
  SproutIcon
} from '@lucide/vue'

const { t } = useI18n()

usePageSeo({
  title: t('membershipLanding.title'),
  description: t('membershipLanding.subtitle'),
  noindex: false
})

const benefits = computed(() => [
  {
    icon: CrownIcon,
    title: t('membershipLanding.benefits.unlimitedTitle'),
    description: t('membershipLanding.benefits.unlimitedDescription')
  },
  {
    icon: CalendarCheckIcon,
    title: t('membershipLanding.benefits.priorityTitle'),
    description: t('membershipLanding.benefits.priorityDescription')
  },
  {
    icon: HeartPulseIcon,
    title: t('membershipLanding.benefits.flexibleTitle'),
    description: t('membershipLanding.benefits.flexibleDescription')
  }
])

const steps = computed(() => [
  {
    number: '01',
    icon: SparklesIcon,
    title: t('membershipLanding.step1Title'),
    description: t('membershipLanding.step1Description')
  },
  {
    number: '02',
    icon: CircleHelpIcon,
    title: t('membershipLanding.step2Title'),
    description: t('membershipLanding.step2Description')
  },
  {
    number: '03',
    icon: SproutIcon,
    title: t('membershipLanding.step3Title'),
    description: t('membershipLanding.step3Description')
  }
])
</script>

<template>
  <div class="overflow-hidden">
    <section
      class="relative border-b border-border/60 bg-[#f3f6ee] dark:bg-muted/20"
    >
      <div
        class="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(74,96,65,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(74,96,65,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24"
      >
        <div class="max-w-2xl">
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-sm"
          >
            <CrownIcon class="size-3.5" />
            {{ $t('membershipLanding.eyebrow') }}
          </div>
          <h1
            class="max-w-xl text-5xl font-black leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {{ $t('membershipLanding.title') }}
          </h1>
          <p
            class="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            {{ $t('membershipLanding.subtitle') }}
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/explore?pricingType=MEMBERSHIP"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {{ $t('membershipLanding.primaryCta') }}
              <ArrowRightIcon class="size-4" />
            </NuxtLink>
            <a
              href="#how-it-works"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-5 py-3.5 font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              {{ $t('membershipLanding.secondaryCta') }}
              <ArrowDownIcon class="size-4" />
            </a>
          </div>
          <p class="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckIcon class="size-4 text-primary" />
            {{ $t('membershipLanding.trustedNote') }}
          </p>
        </div>

        <div class="relative mx-auto w-full max-w-md lg:justify-self-end">
          <div
            class="absolute -inset-5 rounded-[2.5rem] bg-primary/10 blur-2xl"
          />
          <div
            class="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground p-6 text-background shadow-2xl sm:p-8"
          >
            <div class="flex items-start justify-between">
              <div>
                <p
                  class="text-xs font-bold uppercase tracking-[0.2em] text-background/50"
                >
                  YOGI / MEMBERSHIP
                </p>
                <p class="mt-10 text-3xl font-bold tracking-tight">
                  More practice.
                </p>
                <p
                  class="mt-1 text-3xl font-bold tracking-tight text-primary-foreground/70"
                >
                  Less friction.
                </p>
              </div>
              <div
                class="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              >
                <CrownIcon class="size-6" />
              </div>
            </div>
            <div class="mt-14 space-y-3 border-t border-background/15 pt-5">
              <div
                v-for="benefit in benefits"
                :key="benefit.title"
                class="flex items-center gap-3 text-sm text-background/80"
              >
                <CheckIcon class="size-4 shrink-0 text-primary" />
                {{ benefit.title }}
              </div>
            </div>
            <div
              class="mt-8 flex items-end justify-between border-t border-background/15 pt-5"
            >
              <span class="text-xs text-background/50">Find your studio</span>
              <ArrowRightIcon class="size-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {{ $t('membershipLanding.spotlightLabel') }}
          </p>
          <h2
            class="mt-3 max-w-md text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {{ $t('membershipLanding.spotlightTitle') }}
          </h2>
          <p class="mt-5 max-w-md leading-7 text-muted-foreground">
            {{ $t('membershipLanding.spotlightBody') }}
          </p>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <article
            v-for="benefit in benefits"
            :key="benefit.title"
            class="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div
              class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <component :is="benefit.icon" class="size-5" />
            </div>
            <h3 class="mt-5 font-bold">{{ benefit.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ benefit.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="border-y border-border/60 bg-muted/30">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div class="max-w-2xl">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            03 simple moves
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {{ $t('membershipLanding.stepsTitle') }}
          </h2>
          <p class="mt-4 text-muted-foreground">
            {{ $t('membershipLanding.stepsSubtitle') }}
          </p>
        </div>
        <div class="mt-10 grid gap-8 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.number"
            class="relative border-t-2 border-primary/30 pt-5"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-black text-primary">{{
                step.number
              }}</span>
              <component :is="step.icon" class="size-5 text-muted-foreground" />
            </div>
            <h3 class="mt-8 text-xl font-bold">{{ step.title }}</h3>
            <p class="mt-2 leading-7 text-muted-foreground">
              {{ step.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section
      class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24"
    >
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Choose your pace
        </p>
        <h2 class="mt-3 max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
          {{ $t('membershipLanding.fitTitle') }}
        </h2>
        <div class="mt-8 space-y-5">
          <div class="flex gap-3">
            <CheckIcon class="mt-1 size-5 shrink-0 text-primary" />
            <p class="leading-7 text-muted-foreground">
              {{ $t('membershipLanding.fitYes') }}
            </p>
          </div>
          <div class="flex gap-3">
            <CheckIcon class="mt-1 size-5 shrink-0 text-primary" />
            <p class="leading-7 text-muted-foreground">
              {{ $t('membershipLanding.fitMaybe') }}
            </p>
          </div>
          <div class="flex gap-3">
            <CheckIcon class="mt-1 size-5 shrink-0 text-primary" />
            <p class="leading-7 text-muted-foreground">
              {{ $t('membershipLanding.fitNo') }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/explore"
          class="mt-8 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
        >
          {{ $t('membershipLanding.fitAlternative') }}
          <ArrowRightIcon class="size-4" />
        </NuxtLink>
      </div>

      <div>
        <h2 class="text-3xl font-bold tracking-tight">
          {{ $t('membershipLanding.faqTitle') }}
        </h2>
        <div class="mt-6 divide-y divide-border border-y border-border">
          <details class="group py-5">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"
            >
              {{ $t('membershipLanding.faq1Question')
              }}<ArrowDownIcon
                class="size-4 shrink-0 transition group-open:rotate-180"
              />
            </summary>
            <p class="pt-3 leading-7 text-muted-foreground">
              {{ $t('membershipLanding.faq1Answer') }}
            </p>
          </details>
          <details class="group py-5">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"
            >
              {{ $t('membershipLanding.faq2Question')
              }}<ArrowDownIcon
                class="size-4 shrink-0 transition group-open:rotate-180"
              />
            </summary>
            <p class="pt-3 leading-7 text-muted-foreground">
              {{ $t('membershipLanding.faq2Answer') }}
            </p>
          </details>
          <details class="group py-5">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"
            >
              {{ $t('membershipLanding.faq3Question')
              }}<ArrowDownIcon
                class="size-4 shrink-0 transition group-open:rotate-180"
              />
            </summary>
            <p class="pt-3 leading-7 text-muted-foreground">
              {{ $t('membershipLanding.faq3Answer') }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <section
      class="mx-4 mb-16 overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:mx-6 sm:px-12 lg:mx-auto lg:mb-24 lg:max-w-7xl lg:py-16"
    >
      <div
        class="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"
      >
        <div>
          <h2 class="text-3xl font-bold tracking-tight">
            {{ $t('membershipLanding.bottomTitle') }}
          </h2>
          <p class="mt-2 text-primary-foreground/75">
            {{ $t('membershipLanding.bottomSubtitle') }}
          </p>
        </div>
        <NuxtLink
          to="/explore?pricingType=MEMBERSHIP"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background px-5 py-3.5 font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-background/90"
        >
          {{ $t('membershipLanding.bottomCta') }}
          <ArrowRightIcon class="size-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
