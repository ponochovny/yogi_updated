<script lang="ts" setup>
import { ArrowLeftIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'

defineProps<{
  gallery: { url: string }[] | null
  alt: string
}>()

const activeIdx = ref(0)
</script>

<template>
  <div class="relative">
    <NuxtImg
      v-for="(image, index) in gallery || []"
      :key="`${image.url}-${index}`"
      :src="image.url || placeholderImageUrl"
      :alt="`${alt} gallery ${index + 1}`"
      class="h-80 sm:h-96 w-full object-cover"
      :class="activeIdx === index ? 'block' : 'hidden'"
    />
    <button
      type="button"
      class="absolute top-1/2 left-4 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 p-1 text-black shadow-md hover:bg-white flex items-center justify-center"
      @click="
        activeIdx =
          (activeIdx - 1 + (gallery?.length || 0)) % (gallery?.length || 1)
      "
    >
      <ArrowLeftIcon class="size-5" />
    </button>
    <button
      type="button"
      class="absolute top-1/2 right-4 -translate-y-1/2 rotate-180 h-8 w-8 rounded-full bg-white/80 p-1 text-black shadow-md hover:bg-white flex items-center justify-center"
      @click="activeIdx = (activeIdx + 1) % (gallery?.length || 1)"
    >
      <ArrowLeftIcon class="size-5" />
    </button>
  </div>
</template>
