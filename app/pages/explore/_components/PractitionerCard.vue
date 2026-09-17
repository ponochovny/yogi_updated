<script lang="ts" setup>
import { MapPinIcon, BuildingIcon, UserCheckIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar'
import type { ExplorePractitionerItem } from '../../../entities/explore/schema'

defineProps<{
  practitioner: ExplorePractitionerItem
}>()
</script>

<template>
  <div
    class="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
  >
    <!-- Top banner / header with decorative gradient -->
    <div
      class="h-20 bg-linear-to-r from-primary/15 via-accent/10 to-primary/5 relative"
    >
      <!-- Role Badge -->
      <div class="absolute top-3 right-3">
        <span
          class="inline-flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground border border-border/50"
        >
          <UserCheckIcon class="size-3 text-primary" />
          {{ practitioner.role }}
        </span>
      </div>
    </div>

    <!-- Avatar overlapping banner -->
    <div class="px-5 -mt-10 flex items-end justify-between">
      <Avatar
        class="size-18 rounded-2xl border-4 border-card shadow-md bg-card ring-2 ring-primary/10"
      >
        <AvatarImage
          :src="
            practitioner.avatar?.replace(
              '/upload/',
              '/upload/w_120,h_120,c_thumb,g_face/'
            ) ||
            practitioner.image ||
            placeholderImageUrl
          "
          :alt="practitioner.name"
          class="object-cover"
        />
        <AvatarFallback
          class="rounded-2xl text-lg font-bold bg-primary/10 text-primary"
        >
          {{ practitioner.name?.slice(0, 2).toUpperCase() || 'PR' }}
        </AvatarFallback>
      </Avatar>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-5 gap-2.5">
      <div>
        <NuxtLink
          :to="`/practitioners/${practitioner.id}`"
          class="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
        >
          {{ practitioner.name }}
        </NuxtLink>
        <!-- Studio connection -->
        <NuxtLink
          :to="`/studios/${practitioner.studio.slug}`"
          class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5"
        >
          <BuildingIcon class="size-3.5 shrink-0" />
          <span class="truncate font-medium">{{
            practitioner.studio.name
          }}</span>
        </NuxtLink>
      </div>

      <!-- Bio -->
      <p
        v-if="practitioner.bio"
        class="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
      >
        {{ practitioner.bio }}
      </p>
      <p v-else class="text-sm text-muted-foreground/60 italic">
        {{
          $t(
            'explore.noBioProvided',
            'Certified yoga instructor and wellness guide.'
          )
        }}
      </p>

      <!-- Locations footer -->
      <div
        v-if="practitioner.studioLocations?.length"
        class="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50"
      >
        <MapPinIcon class="size-3.5 shrink-0 text-primary" />
        <span class="truncate">
          {{ practitioner.studioLocations[0]?.city }},
          {{ practitioner.studioLocations[0]?.country }}
        </span>
      </div>
    </div>
  </div>
</template>
