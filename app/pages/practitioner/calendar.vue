<script lang="ts" setup>
import { format } from 'date-fns'

useHead({ title: 'My calendar' })
definePageMeta({ title: 'My calendar' })

const {
  data: slots,
  pending,
  error
} = await useFetch('/api/practitioner/slots')
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">My calendar</h1>
        <p class="text-sm text-muted-foreground">
          Upcoming classes across all studios you teach at.
        </p>
      </div>
    </div>

    <div
      v-if="pending"
      class="rounded-lg border p-6 text-sm text-muted-foreground"
    >
      Loading upcoming classes…
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
    >
      Error loading calendar: {{ error.message }}
    </div>

    <div
      v-else-if="!slots?.length"
      class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
    >
      No upcoming classes found.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="slot in slots"
        :key="slot.id"
        class="rounded-xl border p-4"
        :style="{
          borderLeft: `4px solid ${slot.studio?.slug ? ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981'][Math.abs(slot.studio.slug.length) % 4] : '#4f46e5'}`
        }"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              {{ slot.studio.name }}
            </p>
            <h2 class="text-lg font-semibold">{{ slot.offering.name }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ format(new Date(slot.startTime), 'MMM d, yyyy') }}
              {{ format(new Date(slot.startTime), 'HH:mm') }} -
              {{ format(new Date(slot.endTime), 'HH:mm') }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <Badge variant="outline">
              {{ slot.bookedCount }} / {{ slot.capacity || 'Unlimited' }} booked
            </Badge>
            <NuxtLink
              :to="`/practitioner/slots/${slot.id}`"
              class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Manage attendees
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
