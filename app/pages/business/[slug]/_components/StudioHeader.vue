<script lang="ts" setup>
import { Settings2Icon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'
import type { OwnerStudioItem } from '~/entities/studio/schema'

defineProps<{
	studio: OwnerStudioItem | null
}>()
</script>

<template>
	<div
		class="flex items-center justify-between p-6 bg-white/10 rounded-xl shadow-sm"
	>
		<div class="flex items-center gap-4">
			<NuxtImg
				:src="
					studio?.logo?.url?.replace(
						'/upload/',
						'/upload/w_100,h_100,c_fill/',
					) || placeholderImageUrl
				"
				class="w-16 h-16 rounded-full object-cover"
			/>
			<div>
				<h1 class="text-2xl font-bold">{{ studio?.name }}</h1>
				<p class="text-sm text-gray-300">
					{{ studio?.locations?.length }} locations · {{ studio?.currency }}
				</p>
			</div>
		</div>

		<NuxtLink :to="`/business/${studio?.slug}/settings`" as-child>
			<Button variant="outline" size="sm">
				<Settings2Icon /> Studio Settings
			</Button>
		</NuxtLink>
	</div>
</template>
