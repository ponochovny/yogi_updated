<script lang="ts" setup>
import { placeholderImageUrl } from '~/config/constants'
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar'
import type { OfferingItem } from '../schema'

defineProps<{
	offering: OfferingItem
}>()
</script>

<template>
	<div
		class="relative flex flex-col rounded-3xl border border-muted bg-popover hover:shadow-orange-600/30 hover:shadow-xl hover:border-orange-600/20 transition-all duration-300"
	>
		<div>
			<NuxtImg
				:src="offering.gallery[0] || placeholderImageUrl"
				alt="Image"
				class="aspect-video h-full w-full rounded-t-3xl object-cover"
			/>
		</div>
		<div class="flex flex-1 flex-col p-4 items-start">
			<NuxtLink :to="`/offerings/${offering.slug}`" class="hover:underline">
				<h3 class="text-lg font-bold">{{ offering.name }}</h3>
			</NuxtLink>
			<span
				class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-gray-700"
			>
				{{ offering.activityType }}
			</span>
			<p class="flex-1 text-muted-foreground line-clamp-3">
				{{ offering.description }}
			</p>
			<div class="pt-2 flex items-center justify-between text-xs text-gray-500">
				<div class="flex items-center gap-1">
					<span>⏱️ {{ offering.duration }} min</span>
					<span v-if="offering.capacity"
						>• 👥 up to {{ offering.capacity }} spots</span
					>
				</div>
				<div class="text-right">
					<span class="font-medium text-gray-300 block">
						{{ offering.location?.name || '🌐 Online' }}
					</span>
					<span
						v-if="offering.location?.city"
						class="text-[10px] text-gray-400"
					>
						{{ offering.location.city }}
					</span>
				</div>
			</div>
			<NuxtLink
				:to="`/studios/${offering.studio.slug}`"
				class="mt-4 inline-flex items-center space-x-2 group justify-self-end"
			>
				<Avatar>
					<AvatarImage
						:src="offering.studio.logo || placeholderImageUrl"
						alt="Avatar"
					/>
					<AvatarFallback>{{ offering.studio.name[0] }}</AvatarFallback>
				</Avatar>
				<span class="text-sm text-muted-foreground group-hover:underline">
					{{ offering.studio.name }}
				</span>
			</NuxtLink>
		</div>
	</div>
</template>
