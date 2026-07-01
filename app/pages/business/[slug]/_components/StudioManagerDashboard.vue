<script lang="ts" setup>
import { format } from 'date-fns'

const route = useRoute()
const slug = route.params.slug

const { data: mySlots } = await useFetch('/api/manager/slots', {
  query: { studioSlug: slug }
})
</script>

<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-semibold">Manager Dashboard</h2>
    <div v-if="mySlots?.length" class="space-y-4">
      <h3 class="text-xl font-medium">Studio Slots</h3>
      <ul class="space-y-2">
        <li
          v-for="slot in mySlots"
          :key="slot.id"
          class="rounded-lg border p-4 hover:bg-white/5"
        >
          <NuxtLink
            :to="`/business/${slug}/slots/${slot.id}/bookings`"
            class="block"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">
                  {{ slot.offering.name }} - {{ slot.studio.name }} by
                  {{ slot.practitioner.name }}
                </p>
                <ClientOnly>
                  <p class="text-xs text-gray-500">
                    {{ format(new Date(slot.startTime), 'MMM dd, yyyy HH:mm') }}
                    -
                    {{ format(new Date(slot.endTime), 'HH:mm') }}
                  </p>
                </ClientOnly>
              </div>
              <div>
                <Badge class="text-sm">
                  {{ slot.status }}
                </Badge>
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
