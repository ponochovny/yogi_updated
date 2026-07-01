<script lang="ts" setup>
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import BookingCard from '~/entities/booking/ui/Card.vue'

definePageMeta({
  title: 'My Bookings',
  breadcrumbs: [{ name: 'My Bookings' }]
})

const { data: bookingsData, refresh } = useFetch('/api/account/bookings')
const bookings = computed(() => bookingsData.value?.bookings || [])

useHead({
  title: 'My Bookings'
})

const groupedBookingsByOffering = computed(() => {
  const groups: Record<string, typeof bookings.value> = {}
  bookings.value.forEach(booking => {
    const offeringKey = booking.offering.slug
    if (!groups[offeringKey]) groups[offeringKey] = []
    groups[offeringKey].push(booking)
  })
  return groups
})

const cancelBooking = async (bookingId: string) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return

  try {
    await $fetch(`/api/account/bookings/${bookingId}/cancel`, {
      method: 'PATCH'
    })
    toast.success('Booking cancelled successfully')
    refresh() // Refresh the bookings data
  } catch (error) {
    console.error('Error cancelling booking:', error)
    toast.error('Failed to cancel booking.', {
      description: (error as Error).message || 'Unknown error.'
    })
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">My Bookings</h1>
    <div v-if="bookings.length === 0" class="text-gray-500">
      You have no bookings yet.
    </div>
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="(group, offeringSlug) in groupedBookingsByOffering"
        :key="offeringSlug"
      >
        <div class="rounded-2xl border p-2 flex gap-2 items-center">
          <NuxtImg
            :src="group[0]?.offering.coverImage || placeholderImageUrl"
            :alt="group[0]?.offering.name || 'Offering Cover Image'"
            class="aspect-video h-20 object-cover rounded-md"
          />
          <NuxtLink :to="`/offerings/${offeringSlug}`">
            <h2 class="text-xl font-semibold">{{ group[0]?.offering.name }}</h2>
          </NuxtLink>
        </div>
        <div class="flex flex-col gap-4 mt-2 pl-4">
          <BookingCard
            v-for="booking in group"
            :key="booking.id"
            :booking="booking"
            @cancel-booking="cancelBooking"
          />
        </div>
      </div>
    </div>
  </div>
</template>
