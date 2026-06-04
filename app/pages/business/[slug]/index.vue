<script lang="ts" setup>
import { PlusIcon, Settings2Icon, StickyNotes, UsersIcon } from '@lucide/vue'

definePageMeta({
	title: 'Business Overview',
	breadcrumbs: [
		{ name: 'Businesses', url: '/business' },
		{ name: 'Business Overview' },
	],
})

const route = useRoute()

const { data: studioData } = await useFetch(`/api/studios/${route.params.slug}`)
const studio = computed(() => studioData.value?.studio)
</script>

<template>
	<div class="space-y-8">
		<div
			class="flex items-center justify-between p-6 bg-white/10 rounded-xl shadow-sm"
		>
			<div class="flex items-center gap-4">
				<NuxtImg
					:src="studio?.logo?.url || 'https://placehold.net/default.png'"
					class="w-16 h-16 rounded-full object-cover"
				/>
				<div>
					<h1 class="text-2xl font-bold">{{ studio?.name }}</h1>
					<p class="text-sm text-gray-300">
						{{ studio?.locations?.length }} филиала · {{ studio?.currency }}
					</p>
				</div>
			</div>

			<NuxtLink :to="`/business/${studio?.slug}/settings`" as-child>
				<Button variant="outline" size="sm">
					<Settings2Icon /> Studio Settings
				</Button>
			</NuxtLink>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div
				class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between min-h-[200px]"
			>
				<div>
					<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
						<StickyNotes class="size-5" /> Offerings
					</h2>
					<p class="text-sm text-gray-300 mb-4">
						Create group classes, personal training sessions, or online courses.
					</p>
				</div>

				<NuxtLink :to="`/business/${studio?.slug}/offerings/create`" as-child>
					<Button class="w-full"><PlusIcon /> Create Offering </Button>
				</NuxtLink>
			</div>

			<div
				class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between min-h-[200px]"
			>
				<div>
					<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
						<UsersIcon class="size-5" /> Practitioners
					</h2>
					<p class="text-sm text-gray-300 mb-4">
						Manage the practitioners who lead classes at your locations.
					</p>
				</div>
				<NuxtLink :to="`/business/${studio?.slug}/team`" as-child>
					<Button variant="outline" class="w-full">Manage Team</Button>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
