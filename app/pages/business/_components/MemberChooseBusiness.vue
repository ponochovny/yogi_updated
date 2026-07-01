<script lang="ts" setup>
const { data: memberStudiosData } = useFetch(`/api/member/studios`)
const memberStudios = computed(() => memberStudiosData.value?.studios)
</script>

<template>
  <div>
    <div
      v-if="!memberStudios?.length"
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

    <ul v-else class="mb-4">
      <li v-for="studio in memberStudios" :key="studio.id">
        <NuxtLink :to="`/business/${studio.slug}`">{{ studio.name }}</NuxtLink>
        <Badge class="ml-2">
          {{ studio.role }}
        </Badge>
      </li>
    </ul>
  </div>
</template>
