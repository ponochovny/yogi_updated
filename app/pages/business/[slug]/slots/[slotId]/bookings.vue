<script lang="ts" setup>
import { format } from "date-fns";
import { toast } from "vue-sonner";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const slotId = computed(() => route.params.slotId as string);

const { data: bookings, refresh } = await useFetch(
  `/api/business/studios/${slug.value}/slots/${slotId.value}/bookings`,
);
const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    await $fetch(
      `/api/business/studios/${slug.value}/bookings/${bookingId}/status`,
      {
        method: "PATCH",
        body: { status },
      },
    );

    toast.success("Booking status updated!");

    await refresh();
  } catch (error) {
    toast.error("Failed to update booking status", {
      description: (error as Error).message || "Unknown error.",
    });
  }
};
</script>

<template>
  <div>
    <div v-if="bookings?.length" class="space-y-4">
      <h2 class="text-2xl font-semibold">Bookings</h2>
      <ul class="space-y-2">
        <li
          v-for="booking in bookings"
          :key="booking.id"
          class="rounded-lg border p-4 hover:bg-white/5 flex items-center justify-between"
          :class="{
            'bg-rose-600/5 hover:bg-rose-600/10!':
              booking.status === 'CANCELLED',
            'bg-blue-400/10 hover:bg-blue-400/20!':
              booking.status === 'ATTENDED',
          }"
        >
          <div class="flex flex-col gap-1">
            <div class="flex gap-2 items-center">
              <p class="text-sm font-medium">
                {{ booking.user.name }}
              </p>
              <Badge
                class="text-sm"
                :class="{
                  'bg-gray-500':
                    booking.status !== 'ATTENDED' &&
                    booking.status !== 'CANCELLED',
                  'bg-rose-500/20 text-rose-700':
                    booking.status === 'CANCELLED',
                  'bg-blue-400': booking.status === 'ATTENDED',
                }"
              >
                {{
                  booking.status === "CANCELLED"
                    ? "Cancelled"
                    : booking.status !== "ATTENDED" &&
                        booking.status !== "NO_SHOW"
                      ? "No status"
                      : booking.status === "ATTENDED"
                        ? "Attended"
                        : "No Show"
                }}
              </Badge>
            </div>
            <p class="text-xs text-gray-500">
              Booked at:
              {{ format(new Date(booking.createdAt), "MMM dd, yyyy HH:mm") }}
            </p>
          </div>
          <div v-if="booking.status !== 'CANCELLED'" class="space-x-2">
            <Button
              class="bg-blue-400 hover:bg-blue-500!"
              variant="ghost"
              @click="updateBookingStatus(booking.id, 'ATTENDED')"
            >
              Attended
            </Button>
            <Button
              class="bg-red-500"
              variant="destructive"
              @click="updateBookingStatus(booking.id, 'NO_SHOW')"
            >
              No Show
            </Button>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="text-gray-500">No bookings found for this slot.</div>
  </div>
</template>
