<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'
import OfferingsDataTable from '~/widgets/Studio/offerings-data-table.vue'

definePageMeta({
  title: 'Offerings'
})
useHead({
  title: 'Offerings'
})

const route = useRoute()
</script>

<template>
  <div>
    <NuxtLink :to="`/business/${route.params.slug}/offerings/create`" as-child>
      <Button color="primary"> <PlusIcon /> Create Offering </Button>
    </NuxtLink>
    <OfferingsDataTable />
  </div>
</template>
