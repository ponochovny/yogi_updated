<script setup lang="ts">
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CompassIcon,
  HomeIcon,
  SearchIcon
} from '@lucide/vue'

const props = defineProps<{
  error: { statusCode: number; statusMessage?: string }
}>()
const isNotFound = computed(() => props.error?.statusCode === 404)

useHead({
  title: isNotFound.value ? 'Page not found' : 'Something went wrong'
})

const quickLinks = [
  {
    title: 'Explore classes',
    description: 'Find yoga, pilates, and wellness sessions near you.',
    href: '/explore',
    label: 'Browse experiences'
  },
  {
    title: 'Popular studios',
    description: 'Discover trusted spaces and top-rated instructors.',
    href: '/explore?type=studios',
    label: 'View studios'
  },
  {
    title: 'Back home',
    description: 'Return to the main page and start fresh.',
    href: '/',
    label: 'Go home'
  }
]
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <section
      class="relative overflow-hidden rounded-4xl border border-border/60 bg-linear-to-br from-primary/10 via-background to-accent/5 px-6 py-12 shadow-xl shadow-primary/5 sm:px-8 lg:px-12 lg:py-16"
    >
      <div
        class="absolute -right-10 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        class="absolute -bottom-10 left-8 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
      />

      <div class="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-8">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
          >
            <CompassIcon class="h-4 w-4" />
            Looks like you're off the mat
          </div>

          <div class="space-y-5">
            <p
              class="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground"
            >
              Error 404
            </p>
            <h1
              class="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Page<br class="hidden sm:block" />
              not found
            </h1>
            <p class="max-w-xl text-lg text-muted-foreground">
              The page you were looking for may have moved, been removed, or
              never existed. Let’s get you back to something useful.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
              @click="clearError({ redirect: '/' })"
            >
              <HomeIcon class="h-4 w-4" />
              Go home
            </button>
            <NuxtLink
              to="/explore"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            >
              Explore classes
              <ArrowRightIcon class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>

        <div class="relative">
          <div
            class="rounded-[30px] border border-border/70 bg-background/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl"
          >
            <div class="mb-6 flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">
                  Suggested next steps
                </p>
                <p class="mt-2 text-4xl font-black text-foreground">404</p>
              </div>
              <div class="rounded-2xl bg-primary/10 p-3 text-primary">
                <SearchIcon class="h-7 w-7" />
              </div>
            </div>

            <div class="space-y-3">
              <NuxtLink
                v-for="link in quickLinks"
                :key="link.title"
                :to="link.href"
                class="group block rounded-2xl border border-border bg-muted/20 p-4 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h2 class="text-base font-semibold text-foreground">
                      {{ link.title }}
                    </h2>
                    <p class="mt-1 text-sm text-muted-foreground">
                      {{ link.description }}
                    </p>
                  </div>
                  <ArrowUpRightIcon
                    class="h-4 w-4 text-muted-foreground transition group-hover:text-primary"
                  />
                </div>
                <div
                  class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  {{ link.label }}
                  <ArrowRightIcon class="h-4 w-4" />
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
