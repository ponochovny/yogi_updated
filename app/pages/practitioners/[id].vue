<script setup lang="ts">
import { BuildingIcon, MapPinIcon, UserCheckIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'
import OfferingCard from '~/entities/offering/ui/Card.vue'

const route = useRoute()
const { data, error } = await useFetch(`/api/practitioners/${route.params.id}`)

if (error.value) {
  await navigateTo('/404')
}

const practitioner = computed(() => data.value?.practitioner || null)

usePageSeo({
  title: () => practitioner.value?.name || 'Practitioner',
  description: () =>
    practitioner.value?.bio || 'Practitioner profile and available offerings',
  type: 'profile'
})
</script>

<template>
  <div v-if="practitioner" class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <section
      class="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
    >
      <div class="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div class="shrink-0">
          <NuxtImg
            :src="practitioner.avatar || placeholderImageUrl"
            :alt="practitioner.name"
            class="size-32 rounded-3xl object-cover ring-4 ring-primary/10 sm:size-40"
          />
        </div>

        <div class="min-w-0 space-y-4">
          <div
            class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"
            >
              <UserCheckIcon class="size-4" />
              {{ practitioner.role }}
            </span>
            <NuxtLink
              :to="`/studios/${practitioner.studio.slug}`"
              class="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <BuildingIcon class="size-4" />
              {{ practitioner.studio.name }}
            </NuxtLink>
          </div>

          <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
            {{ practitioner.name }}
          </h1>
          <p class="max-w-3xl text-base leading-7 text-muted-foreground">
            {{
              practitioner.bio || 'A dedicated wellness practitioner and guide.'
            }}
          </p>

          <div
            v-if="practitioner.locations?.length"
            class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            <span
              v-for="location in practitioner.locations"
              :key="location.id"
              class="inline-flex items-center gap-1.5"
            >
              <MapPinIcon class="size-4 text-primary" />
              {{ location.city }}, {{ location.country }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-12">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-medium uppercase tracking-wider text-primary">
            Practice with {{ practitioner.name }}
          </p>
          <h2 class="mt-1 text-2xl font-bold">Available offerings</h2>
        </div>
        <span class="text-sm text-muted-foreground">
          {{ practitioner.offerings?.length || 0 }} offerings
        </span>
      </div>

      <div
        v-if="practitioner.offerings?.length"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <OfferingCard
          v-for="offering in practitioner.offerings"
          :key="offering.id"
          :offering="offering"
        />
      </div>
      <div
        v-else
        class="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground"
      >
        No published offerings are available right now.
      </div>
    </section>
  </div>
</template>
