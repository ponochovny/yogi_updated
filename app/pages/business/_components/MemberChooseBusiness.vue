<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

const { data: memberStudiosData, pending: memberStudiosPending } =
  useFetch(`/api/member/studios`)
const memberStudios = computed(() => memberStudiosData.value?.studios)
</script>

<template>
  <div>
    <div v-if="memberStudiosPending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>
    <div
      v-else-if="!memberStudios?.length"
      class="size-full rounded-4xl bg-white/10 flex items-center justify-center p-24 flex-col gap-4 text-center"
    >
      <h2 class="text-4xl">Create your studio</h2>
      <p class="text-muted-foreground max-w-xl mx-auto mb-6">
        Create your first studio to start add offerings, practitioners and
        schedules
      </p>
      <Button as-child variant="outline" size="lg">
        <NuxtLink to="/business/create" class="inline-flex gap-1 items-center">
          <PlusIcon />
          Create Studio
        </NuxtLink>
      </Button>
    </div>

    <template v-else>
      <ul class="mb-4">
        <li
          v-for="studio in memberStudios"
          :key="studio.id"
          class="flex gap-4 items-center p-4 rounded-2xl border border-border"
        >
          <NuxtLink :to="`/business/${studio.slug}`">{{
            studio.name
          }}</NuxtLink>
          <Badge class="ml-2">
            {{ studio.role }}
          </Badge>
        </li>
      </ul>
      <Button as-child variant="outline" size="lg" class="w-full mt-6">
        <NuxtLink to="/business/create" class="flex gap-1 items-center">
          <PlusIcon />
          Create Own Studio
        </NuxtLink>
      </Button>
    </template>
  </div>
</template>
