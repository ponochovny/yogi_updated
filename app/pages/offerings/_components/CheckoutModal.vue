<script setup lang="ts">
import BookWithPricingOptions from './BookWithPricingOptions.vue'

defineProps<{
  slotId: string
  slug: string
}>()

const emit = defineEmits<{
  success: [payload: { mode: string; message: string }]
}>()
</script>

<template>
  <BookWithPricingOptions
    :slot-id="slotId"
    :slug="slug"
    @success="emit('success', $event)"
  />
</template>
