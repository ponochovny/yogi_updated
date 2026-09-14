<template>
  <div class="flex flex-col items-start gap-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold">{{ $t('welcome') }}</h1>
    </div>
    <div class="flex gap-1 flex-wrap">
      <NuxtLinkLocale :to="PagesConfig.CAUSES + '/1'" as-child>
        <Button>Go to single cause page</Button>
      </NuxtLinkLocale>
    </div>

    <div class="flex flex-col gap-4 px-4 py-8 w-full">
      <h2 class="text-2xl font-semibold">All Offerings list</h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4"
      >
        <div v-if="offeringsPending">
          <p class="shimmer text-foreground/60">Loading offerings...</p>
        </div>
        <template v-else>
          <OfferingCard
            v-for="offering in offerings"
            :key="offering.id"
            :offering="offering"
          />
          <div
            v-if="!offerings.length"
            class="col-span-4 text-center text-muted-foreground"
          >
            No active offerings available.
          </div>
        </template>
      </div>
    </div>

    <div class="flex flex-col gap-4 px-4 py-8 w-full">
      <h2 class="text-2xl font-semibold">All Studios list</h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4"
      >
        <div v-if="studiosPending">
          <p class="shimmer text-foreground/60">Loading studios...</p>
        </div>
        <template v-else>
          <StudioCard
            v-for="studio in studios"
            :key="studio.id"
            :studio="studio"
          />
          <div
            v-if="!studios.length"
            class="col-span-4 text-center text-muted-foreground"
          >
            No studios
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OfferingCard from '~/entities/offering/ui/Card.vue'
import StudioCard from '~/entities/studio/ui/Card.vue'
import { PagesConfig } from '~/config/pages.config'

usePageSeo('home')

const { data: studiosData, pending: studiosPending } = useFetch(`/api/studios`)
const studios = computed(() => studiosData.value?.studios || [])

const { data: offeringsData, pending: offeringsPending } =
  useFetch(`/api/offerings`)
const offerings = computed(() => offeringsData.value?.offerings || [])
</script>
