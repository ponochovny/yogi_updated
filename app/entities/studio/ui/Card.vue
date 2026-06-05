<script lang="ts" setup>
import { placeholderImageUrl } from '~/config/constants'
import type { Studio, StudioMedia } from '../schema'

defineProps<{
	studio: Studio
	studioMedia: StudioMedia
	studioLocation?: { address: string; city: string; country: string }[]
}>()
</script>

<template>
	<div
		class="flex flex-col rounded-3xl border border-muted bg-popover hover:shadow-orange-600/30 hover:shadow-xl hover:border-orange-600/20 transition-all duration-300"
	>
		<div>
			<NuxtImg
				:src="studioMedia.gallery[0] || placeholderImageUrl"
				alt="Image"
				class="aspect-video h-full w-full rounded-t-3xl object-cover"
			/>
		</div>
		<div class="flex flex-1 flex-col p-4 items-start">
			<NuxtLink :to="`/studios/${studio.slug}`" class="hover:underline">
				<h3 class="text-lg font-bold">{{ studio.name }}</h3>
			</NuxtLink>
			<p
				v-if="studioLocation && studioLocation[0]"
				class="flex-1 text-muted-foreground truncate"
			>
				{{ studioLocation[0].address }}, {{ studioLocation[0].city }},
				{{ studioLocation[0].country }}
			</p>
			<p class="flex-1 text-muted-foreground line-clamp-4">
				{{ studio.bio }}
			</p>
		</div>
	</div>
</template>
