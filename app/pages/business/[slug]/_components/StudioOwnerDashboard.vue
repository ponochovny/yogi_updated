<script lang="ts" setup>
import { PlusIcon, StickyNotesIcon, UsersIcon } from '@lucide/vue'
import StudioHeader from './StudioHeader.vue'

const route = useRoute()

const { data: studioData } = await useFetch(
  `/api/business/studios/${route.params.slug}`
)
const studio = computed(() => studioData.value?.studio || null)

useHead({
  title: () => studio.value?.name || 'Loading Studio...'
})
</script>

<template>
  <div class="space-y-8">
    <StudioHeader :studio="studio" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <StickyNotesIcon class="size-5" /> Offerings
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            Create group classes, personal training sessions, or online courses.
          </p>
        </div>

        <NuxtLink :to="`/business/${studio?.slug}/offerings/create`" as-child>
          <Button class="w-full"><PlusIcon /> Create Offering </Button>
        </NuxtLink>
      </div>

      <div
        class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
            <UsersIcon class="size-5" /> Practitioners
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            Manage the practitioners who lead classes at your locations.
          </p>
        </div>
        <NuxtLink :to="`/business/${studio?.slug}/members`" as-child>
          <Button variant="outline" class="w-full">Manage Team</Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
