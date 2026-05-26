<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar'

defineProps<{
	offering: unknown
}>()
</script>

<template>
	<div
		class="flex flex-col rounded-3xl border border-muted bg-popover hover:shadow-orange-600/30 hover:shadow-xl hover:border-orange-600/20 transition-all duration-300"
		:class="
			!offering.isActive && 'opacity-50 pointer-events-none hover:shadow-none'
		"
	>
		<div>
			<NuxtImg
				:src="offering.banners[0]?.url || 'https://placehold.net/default.png'"
				alt="Image"
				class="aspect-video h-full w-full rounded-t-3xl object-cover"
			/>
		</div>
		<div class="flex flex-1 flex-col p-4 items-start">
			<NuxtLink :to="`/offerings/${offering.slug}`" class="hover:underline">
				<h3 class="text-lg font-bold">{{ offering.name }}</h3>
			</NuxtLink>
			<p class="flex-1 text-muted-foreground line-clamp-3">
				{{ offering.description }}
			</p>
			<NuxtLink
				:to="`/studios/${offering.studio.slug}`"
				class="mt-4 inline-flex items-center space-x-2 group justify-self-end"
			>
				<Avatar>
					<AvatarImage :src="offering.studio.logo[0]?.url" alt="Avatar" />
					<AvatarFallback>{{ offering.studio.name[0] }}</AvatarFallback>
				</Avatar>
				<span class="text-sm text-muted-foreground group-hover:underline">
					{{ offering.studio.name }}
				</span>
			</NuxtLink>
		</div>
	</div>
</template>
