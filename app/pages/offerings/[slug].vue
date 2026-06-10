<script lang="ts" setup>
const route = useRoute()
console.log(route.params.slug)

const { data: offeringsData, pending } = await useFetch(
	`/api/offerings/${route.params.slug}`,
)
const offering = computed(() => offeringsData.value?.offering || null)

const { data: offeringsSlots } = await useFetch(
	`/api/offerings/${route.params.slug}/slots`,
)
const offeringSlots = computed(() => offeringsSlots.value || [])
</script>

<template>
	<div>
		<div v-if="pending">Loading...</div>
		<div v-else-if="!offering">Offering not found.</div>
		<div v-else>
			<h1 class="text-3xl font-bold">{{ offering.name }}</h1>
			<p class="text-gray-500 mb-4">Description: {{ offering.description }}</p>
			<p class="text-gray-500 mb-4">Timezone: {{ offering.timezone }}</p>
			<div class="flex gap-2 p-6 flex-wrap">
				<div
					v-for="slot in offeringSlots"
					:key="slot.id"
					class="border p-4 mb-4 hover:bg-white/10 rounded-lg w-full sm:w-auto"
				>
					<p>Start Time: {{ new Date(slot.startTime).toLocaleString() }}</p>
					<p>End Time: {{ new Date(slot.endTime).toLocaleString() }}</p>
					<p>Status: {{ slot.status }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
