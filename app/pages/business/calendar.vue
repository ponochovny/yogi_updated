<script lang="ts" setup>
import { format } from 'date-fns'

const { data: allMySlots } = await useFetch('/api/practitioner/slots')
</script>

<template>
	<div class="space-y-8">
		<h2 class="text-2xl font-semibold">Practitioner Dashboard</h2>
		<div v-if="allMySlots?.length" class="space-y-4">
			<h3 class="text-xl font-medium">My Slots</h3>
			<ul class="space-y-2">
				<li
					v-for="slot in allMySlots"
					:key="slot.id"
					class="rounded-lg border p-4 hover:bg-white/5"
				>
					<NuxtLink
						:to="`/business/${slot.studio.slug}/slots/${slot.id}/bookings`"
						class="block"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium">
									{{ slot.offering.name }} - {{ slot.studio.name }}
								</p>
								<ClientOnly>
									<p class="text-xs text-gray-500">
										{{ format(new Date(slot.startTime), 'MMM dd, yyyy HH:mm') }}
										-
										{{ format(new Date(slot.endTime), 'HH:mm') }}
									</p>
								</ClientOnly>
							</div>
							<div class="text-sm text-gray-700">
								{{ slot.bookedCount }} / {{ slot.capacity }} booked
							</div>
						</div>
					</NuxtLink>
				</li>
			</ul>
		</div>
	</div>
</template>
