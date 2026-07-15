<script lang="ts" setup>
import { placeholderImageUrl } from '~/config/constants'
import { type BookingItem, BookingStatus } from '../schema'
import { format } from 'date-fns'

interface Props {
  booking: BookingItem
}

defineProps<Props>()
defineEmits<{
  (e: 'cancel-booking', bookingId: string): void
}>()
</script>

<template>
  <div
    class="p-2 border flex gap-6 rounded-md transition"
    :class="
      booking.status === BookingStatus.CONFIRMED
        ? 'bg-green-500/5 hover:bg-green-500/10'
        : booking.status === BookingStatus.CANCELLED
          ? 'bg-red-500/10 hover:bg-red-500/20'
          : booking.status === BookingStatus.ATTENDED
            ? 'bg-blue-500/10 hover:bg-blue-500/20'
            : ''
    "
  >
    <div class="relative h-22 rounded-md flex shrink-0">
      <NuxtImg
        :src="booking.offering.coverImage || placeholderImageUrl"
        alt="Offering Image"
        class="w-full h-full object-cover rounded-md opacity-20"
        width="150"
        height="100"
        provider="cloudinary"
      />
      <div
        class="absolute inset-0 w-full h-full bg-linear-to-t from-black/50 to-transparent rounded-md flex items-center justify-center text-white text-sm font-semibold"
      >
        <div class="flex flex-col">
          <p class="">
            {{ format(new Date(booking.slot.startTime), 'MMM d, yyyy') }}
          </p>
          <p class="text-2xl">
            {{ format(new Date(booking.slot.startTime), 'h:mm a') }}
          </p>
        </div>
      </div>
    </div>
    <div class="flex-1 items-center flex">
      <div class="flex flex-col gap-1.5">
        <NuxtLink
          :to="`/offerings/${booking.offering.slug}`"
          class="font-semibold"
        >
          <h3 class="text-2xl font-semibold">{{ booking.offering.name }}</h3>
        </NuxtLink>
        <div class="flex gap-1 items-center text-sm text-muted-foreground">
          <span>at</span>
          <NuxtLink
            :to="`/studios/${booking.studio.slug}`"
            class="font-semibold"
          >
            {{ booking.studio.name }}
          </NuxtLink>
          with
          <div class="inline-flex gap-1 items-center">
            <NuxtImg
              :src="booking.practitioner.avatar || placeholderImageUrl"
              alt="Coach Avatar"
              class="w-5 h-5 rounded-full object-cover"
            />
            <span>
              {{ booking.practitioner.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 self-center">
      <div class="flex flex-col">
        <span
          class="text-xl"
          :class="
            booking.status === BookingStatus.CONFIRMED
              ? 'text-green-700/50'
              : booking.status === BookingStatus.CANCELLED
                ? 'text-red-700/50'
                : 'text-blue-700/50'
          "
        >
          {{ booking.status }}
        </span>
        <span class="text-xs text-muted-foreground">
          at
          {{ format(new Date(booking.updatedAt), 'dd MMM yyyy h:mm a') }}
        </span>
      </div>
      <Button
        v-if="booking.status === BookingStatus.CONFIRMED"
        variant="destructive"
        size="sm"
        @click="$emit('cancel-booking', booking.id)"
      >
        Cancel
      </Button>
    </div>
  </div>
</template>
