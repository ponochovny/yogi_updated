<script lang="ts" setup>
import { MapPinIcon, ClockIcon, UsersIcon, GlobeIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar'
import type { OfferingItem } from '../schema'
import type { ExploreOfferingItem } from '../../explore/schema'

const props = defineProps<{
  offering:
    | (OfferingItem & {
        minPrice?: number
        currency?: string
        spotsTotal?: number | null
        spotsBooked?: number
        spotsRemaining?: number | null
        nearestSlotTime?: string | null
      })
    | ExploreOfferingItem
}>()

// check if locations field exists in object
const isOnline = computed(() => !props.offering.location?.name)

const spotsPercent = computed(() => {
  if (!props.offering.spotsTotal || props.offering.spotsRemaining == null)
    return null
  return Math.round(
    ((props.offering.spotsTotal - (props.offering.spotsRemaining ?? 0)) /
      props.offering.spotsTotal) *
      100
  )
})

const spotsBarColor = computed(() => {
  if (!spotsPercent.value) return 'bg-primary'
  if (spotsPercent.value > 80) return 'bg-red-500'
  if (spotsPercent.value > 50) return 'bg-amber-500'
  return 'bg-primary'
})

const formattedPrice = computed(() => {
  if (!props.offering.minPrice) return null
  const amount = props.offering.minPrice / 100
  const currency = props.offering.currency || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
})
</script>

<template>
  <div
    class="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
  >
    <!-- Image -->
    <div class="relative">
      <NuxtImg
        :src="offering.gallery?.[0] || placeholderImageUrl"
        alt="Image"
        class="aspect-16/10 h-full w-full object-cover transition-transform duration-500"
      />
      <!-- Overlay badges -->
      <div class="absolute top-3 left-3 flex gap-1.5">
        <span
          class="bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-foreground"
        >
          {{ offering.activityType }}
        </span>
        <span
          v-if="isOnline"
          class="bg-blue-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
        >
          <GlobeIcon class="size-3" />
          Online
        </span>
      </div>
      <!-- Price badge -->
      <div
        v-if="formattedPrice"
        class="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-primary-foreground"
      >
        from {{ formattedPrice }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4 gap-2">
      <NuxtLink :to="`/offerings/${offering.slug}`" class="group/link">
        <h3
          class="text-base font-bold leading-tight group-hover/link:text-primary transition-colors line-clamp-1"
        >
          {{ offering.name }}
        </h3>
      </NuxtLink>

      <p class="text-sm text-muted-foreground line-clamp-2">
        {{ offering.description }}
      </p>

      <!-- Meta info -->
      <div
        class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1"
      >
        <span class="inline-flex items-center gap-1">
          <ClockIcon class="size-3.5" />
          {{ offering.duration }} min
        </span>
        <span v-if="offering.capacity" class="inline-flex items-center gap-1">
          <UsersIcon class="size-3.5" />
          {{ offering.capacity }} spots
        </span>
        <span
          v-if="!isOnline && offering.location?.city"
          class="inline-flex items-center gap-1"
        >
          <MapPinIcon class="size-3.5" />
          {{ offering.location.city }}
        </span>
      </div>

      <!-- Spots Progress Bar -->
      <div
        v-if="offering.spotsTotal && offering.spotsRemaining != null"
        class="mt-2 space-y-1"
      >
        <div class="flex justify-between text-xs">
          <span
            class="font-medium"
            :class="
              (offering.spotsRemaining ?? 0) <= 3
                ? 'text-red-500'
                : 'text-muted-foreground'
            "
          >
            {{ offering.spotsRemaining }} spots left
          </span>
          <span class="text-muted-foreground">
            of {{ offering.spotsTotal }}
          </span>
        </div>
        <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="spotsBarColor"
            :style="{ width: `${spotsPercent}%` }"
          />
        </div>
      </div>

      <!-- Studio link -->
      <NuxtLink
        :to="`/studios/${offering.studio.slug}`"
        class="mt-auto pt-3 inline-flex items-center gap-2 group/studio border-t border-border/50"
      >
        <Avatar class="size-7">
          <AvatarImage
            :src="
              offering.studio.logo?.replace(
                '/upload/',
                '/upload/w_64,h_64,c_thumb,g_custom/'
              ) || placeholderImageUrl
            "
            alt="Avatar"
          />
          <AvatarFallback class="text-xs">{{
            offering.studio.name[0]
          }}</AvatarFallback>
        </Avatar>
        <span
          class="text-xs text-muted-foreground group-hover/studio:text-primary transition-colors truncate"
        >
          {{ offering.studio.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
