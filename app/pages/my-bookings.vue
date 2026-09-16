<script setup lang="ts">
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import { BookingStatus } from '~/entities/booking/schema'

definePageMeta({ title: 'My bookings', breadcrumbs: [{ name: 'My bookings' }] })

const activeTab = ref<'upcoming' | 'history'>('upcoming')
const { data, pending, error, refresh } = await useFetch(
  '/api/account/bookings'
)
const bookings = computed(() => data.value?.bookings ?? [])
const upcoming = computed(() =>
  bookings.value.filter(
    booking =>
      new Date(booking.slot.startTime) >= new Date() &&
      booking.status !== BookingStatus.CANCELLED
  )
)
const history = computed(() =>
  bookings.value.filter(booking => !upcoming.value.includes(booking))
)

const cancelBooking = async (id: string) => {
  if (!confirm('Cancel this booking?')) return
  try {
    await $fetch(`/api/account/bookings/${id}/cancel`, { method: 'PATCH' })
    toast.success('Booking cancelled and credit returned when applicable.')
    await refresh()
  } catch (cause) {
    toast.error('Unable to cancel booking', {
      description: (cause as Error).message
    })
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-muted-foreground">Client portal</p>
        <h1 class="text-3xl font-semibold tracking-tight">My bookings</h1>
      </div>
      <div class="inline-flex rounded-lg border bg-card p-1" role="tablist">
        <button
          class="rounded-md px-4 py-2 text-sm"
          :class="
            activeTab === 'upcoming'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          "
          @click="activeTab = 'upcoming'"
        >
          Upcoming
        </button>
        <button
          class="rounded-md px-4 py-2 text-sm"
          :class="
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          "
          @click="activeTab = 'history'"
        >
          History
        </button>
      </div>
    </div>
    <p v-if="pending" class="text-muted-foreground">Loading bookings...</p>
    <p v-else-if="error" class="text-destructive">Failed to load bookings.</p>
    <div
      v-else-if="(activeTab === 'upcoming' ? upcoming : history).length === 0"
      class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
    >
      No {{ activeTab }} bookings yet.
    </div>
    <div v-else class="grid gap-4">
      <article
        v-for="booking in activeTab === 'upcoming' ? upcoming : history"
        :key="booking.id"
        class="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <NuxtLink
              :to="`/offerings/${booking.offering.slug}`"
              class="text-xl font-semibold hover:underline"
              >{{ booking.offering.name }}</NuxtLink
            >
            <p class="mt-1 text-sm text-muted-foreground">
              {{ booking.studio.name }} ·
              {{ booking.studio.address || 'Address to be confirmed' }}
            </p>
            <p class="mt-3 font-medium">
              {{
                format(
                  new Date(booking.slot.startTime),
                  'EEE, MMM d, yyyy · h:mm a'
                )
              }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-full border px-3 py-1 text-xs font-medium">
              {{ booking.status }}
            </span>
            <Button
              v-if="
                booking.status === BookingStatus.CONFIRMED &&
                new Date(booking.slot.startTime) >= new Date()
              "
              variant="destructive"
              size="sm"
              @click="cancelBooking(booking.id)"
              >Cancel booking</Button
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
