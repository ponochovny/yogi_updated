<script setup lang="ts">
import { format } from 'date-fns'

const route = useRoute()
const offeringSlug = route.params.slug

const { data: offeringsData } = await useFetch(`/api/offerings/${offeringSlug}`)
const offering = computed(() => offeringsData.value?.offering || null)

const { data: offeringsSlots } = await useFetch(
	`/api/offerings/${offeringSlug}/slots`,
)
const rawSlots = computed(() => offeringsSlots.value || [])

// Group slots by date for UI presentation
const groupedSlots = computed(() => {
	if (!rawSlots.value) return {}

	return rawSlots.value.reduce<Record<string, typeof rawSlots.value>>(
		(acc, slot) => {
			// Format UTC to Local string representation for grouping (e.g., 'June 15, 2026')
			const dateKey = format(new Date(slot.startTime), 'MMMM d, yyyy')

			if (!acc[dateKey]) acc[dateKey] = []
			acc[dateKey].push(slot)
			return acc
		},
		{},
	)
})
</script>

<template>
	<div
		class="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8"
	>
		<div class="md:col-span-2 space-y-6">
			<h1 class="text-4xl font-bold">{{ offering?.name }}</h1>
			<p class="text-gray-600 text-lg">{{ offering?.description }}</p>
		</div>

		<div class="bg-white/10 p-6 rounded-2xl border sticky top-8">
			<h3 class="text-xl font-bold mb-6">Available Dates</h3>

			<div v-if="!rawSlots?.length" class="text-gray-500 text-sm">
				No upcoming slots available right now.
			</div>

			<div v-else class="space-y-6">
				<div v-for="(slots, date) in groupedSlots" :key="date">
					<h4 class="font-medium text-gray-200 mb-3 border-b pb-2">
						{{ date }}
					</h4>

					<div class="space-y-2">
						<div
							v-for="slot in slots"
							:key="slot.id"
							class="w-full flex justify-between items-center p-3 bg-white/10 border border-gray-600 rounded-lg hover:border-gray-400 transition text-left"
						>
							<div>
								<div class="font-semibold">
									{{ format(new Date(slot.startTime), 'HH:mm') }}
								</div>
								<div class="text-xs text-gray-300">
									Coach: {{ slot.practitioner.name }}
								</div>
							</div>
							<Button variant="outline" size="sm"> Book Now </Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
