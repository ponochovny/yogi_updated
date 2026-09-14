<script lang="ts" setup>
import { MapPinIcon, LayersIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'
import type { StudioItem } from '../schema'

defineProps<{
  studio: StudioItem & {
    offeringCount?: number
  }
}>()
</script>

<template>
  <div
    class="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
  >
    <!-- Image -->
    <div class="relative">
      <NuxtImg
        :src="studio.gallery?.[0] || placeholderImageUrl"
        alt="Image"
        class="aspect-16/10 h-full w-full object-cover transition-transform duration-500"
      />
      <!-- Logo overlay -->
      <div v-if="studio.logo" class="absolute -bottom-5 left-4 z-10">
        <NuxtImg
          :src="
            studio.logo.replace?.(
              '/upload/',
              '/upload/w_56,h_56,c_thumb,g_custom/'
            ) || placeholderImageUrl
          "
          alt="Logo"
          class="size-12 rounded-xl border-2 border-card object-cover shadow-md bg-card"
        />
      </div>
    </div>

    <!-- Content -->
    <div
      class="flex flex-1 flex-col p-4 gap-2"
      :class="studio.logo ? 'pt-8' : ''"
    >
      <NuxtLink :to="`/studios/${studio.slug}`" class="group/link">
        <h3
          class="text-base font-bold leading-tight group-hover/link:text-primary transition-colors line-clamp-1"
        >
          {{ studio.name }}
        </h3>
      </NuxtLink>

      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ studio.bio }}
      </p>

      <!-- Meta -->
      <div
        class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-auto pt-2"
      >
        <span
          v-if="studio.locations && studio.locations[0]"
          class="inline-flex items-center gap-1 truncate max-w-[60%]"
        >
          <MapPinIcon class="size-3.5 shrink-0" />
          {{ studio.locations[0].city }}, {{ studio.locations[0].country }}
        </span>
        <span
          v-if="studio.offeringCount != null"
          class="inline-flex items-center gap-1"
        >
          <LayersIcon class="size-3.5" />
          {{ studio.offeringCount }}
          {{ studio.offeringCount === 1 ? 'class' : 'classes' }}
        </span>
      </div>
    </div>
  </div>
</template>
