<script lang="ts" setup>
import { format } from 'date-fns'
import { toast } from 'vue-sonner'

const route = useRoute()
const slotId = computed(() => String(route.params.id))

const { data, refresh } = await useFetch(
  `/api/practitioner/slots/${slotId.value}/bookings`
)
const bookings = computed(() => data.value?.bookings ?? [])

const updateStatus = async (
  bookingId: string,
  status: 'ATTENDED' | 'NO_SHOW'
) => {
  try {
    await $fetch(`/api/practitioner/slots/${slotId.value}/bookings`, {
      method: 'PATCH',
      body: { bookingId, status }
    })
    toast.success(`Marked as ${status === 'ATTENDED' ? 'attended' : 'no show'}`)
    await refresh()
  } catch (error) {
    toast.error('Failed to update attendance', {
      description: (error as Error).message || 'Unknown error.'
    })
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
    <div>
      <h1 class="text-2xl font-semibold">Class attendees</h1>
      <p class="text-sm text-muted-foreground">
        Quick check-in from your phone.
      </p>
    </div>

    <div
      v-if="!bookings.length"
      class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
    >
      No attendees for this class yet.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-3">
          <NuxtImg
            v-if="booking.user.image"
            :src="booking.user.image"
            alt="User avatar"
            class="size-10 rounded-full object-cover"
          />
          <div
            v-else
            class="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium"
          >
            {{ booking.user.name?.charAt(0) || '?' }}
          </div>
          <div>
            <p class="font-medium">{{ booking.user.name }}</p>
            <p class="text-xs text-muted-foreground">
              Booked
              {{ format(new Date(booking.createdAt), 'MMM d, yyyy HH:mm') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Badge
            :variant="booking.status === 'ATTENDED' ? 'default' : 'secondary'"
          >
            {{ booking.status }}
          </Badge>
          <Button
            size="sm"
            :disabled="booking.status === 'ATTENDED'"
            @click="updateStatus(booking.id, 'ATTENDED')"
          >
            ATTENDED
          </Button>
          <Button
            size="sm"
            variant="destructive"
            :disabled="booking.status === 'NO_SHOW'"
            @click="updateStatus(booking.id, 'NO_SHOW')"
          >
            NO_SHOW
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
