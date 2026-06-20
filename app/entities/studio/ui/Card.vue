<script lang="ts" setup>
import { placeholderImageUrl } from '~/config/constants'
import type { StudioItem } from '../schema'

defineProps<{
	studio: StudioItem
}>()
</script>

<template>
	<div
		class="flex flex-col rounded-3xl border border-muted bg-popover hover:shadow-orange-600/30 hover:shadow-xl hover:border-orange-600/20 transition-all duration-300"
	>
		<div class="p-2 pb-0">
			<NuxtImg
				:src="studio.gallery?.[0] || placeholderImageUrl"
				alt="Image"
				class="aspect-video h-full w-full rounded-2xl object-cover"
			/>
		</div>
		<div class="flex flex-1 flex-col p-4 items-start">
			<NuxtLink :to="`/studios/${studio.slug}`" class="hover:underline">
				<h3 class="text-lg font-bold">{{ studio.name }}</h3>
			</NuxtLink>
			<p class="text-muted-foreground line-clamp-4">
				{{ studio.bio }}
			</p>
			<p
				v-if="studio.locations && studio.locations[0]"
				class="mt-2 flex-1 truncate text-xs text-gray-300 max-w-full"
			>
				{{ studio.locations[0].address }}, {{ studio.locations[0].city }},
				{{ studio.locations[0].country }}
			</p>
		</div>
	</div>
</template>
