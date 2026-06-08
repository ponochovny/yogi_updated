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

const { data: studioData } = await useFetch(
	`/api/business/studios/${route.params.slug}`,
)
const studio = computed(() => studioData.value?.studio)

const { data: offeringsData, pending } = await useFetch(
	`/api/business/studios/${route.params.slug}/offerings`,
)
const offerings = computed(() => offeringsData.value?.offerings)
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

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div
				class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between"
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
				class="p-6 bg-white/10 rounded-xl shadow-sm border border-gray-500 flex flex-col justify-between"
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

			<div v-if="pending" class="text-gray-500 text-sm">Loading list...</div>

			<div
				v-else
				class="bg-white/10 border rounded-xl overflow-hidden shadow-sm col-span-2"
			>
				<table class="w-full text-left border-collapse">
					<thead>
						<tr
							class="bg-white/10 border-b text-xs font-semibold text-gray-300 uppercase"
						>
							<th class="p-4">Name</th>
							<th class="p-4">Type</th>
							<th class="p-4">Duration</th>
							<th class="p-4">Location</th>
							<th class="p-4">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y text-sm">
						<tr
							v-for="offering in offerings"
							:key="offering.id"
							class="hover:bg-white/5"
						>
							<td class="p-4 font-medium text-gray-100">{{ offering.name }}</td>
							<td class="p-4">
								<span class="px-2 py-0.5 bg-white/10 rounded text-xs">{{
									offering.activityType
								}}</span>
							</td>
							<td class="p-4 text-gray-200">{{ offering.duration }} min</td>
							<td class="p-4 text-gray-200">
								<span
									:title="
										offering.location?.name
											? `${offering.location.country}, ${offering.location.city}, ${offering.location.address}`
											: ''
									"
								>
									{{ offering.location?.name || 'Online' }}
								</span>
							</td>
							<td class="p-4">
								<span
									:class="
										offering.isPublished
											? 'text-green-700 bg-green-50'
											: 'text-gray-200 bg-gray-100'
									"
									class="px-2 py-0.5 rounded text-xs font-medium"
								>
									{{ offering.isPublished ? 'Published' : 'Draft' }}
								</span>
							</td>
						</tr>
						<tr v-if="!offerings?.length">
							<td colspan="5" class="p-8 text-center text-gray-400 text-sm">
								You haven't created any offerings yet.
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
