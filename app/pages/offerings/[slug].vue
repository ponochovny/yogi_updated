<script setup lang="ts">
import { format } from 'date-fns'
import type { BookingOptions, OfferingSlot } from '~/entities/booking/schema'
import { toast } from 'vue-sonner'

const route = useRoute()
const offeringSlug = route.params.slug

const offeringReq = useFetch(`/api/offerings/${offeringSlug}`)
const slotsReq = useFetch(`/api/offerings/${offeringSlug}/slots`)

const [{ data: offeringsData }, { data: offeringsSlots }] = await Promise.all([
  offeringReq,
  slotsReq
])

const offering = computed(() => offeringsData.value?.offering || null)
const rawSlots = computed(() => offeringsSlots.value?.slots || [])

useHead({
  title: offering.value?.name || 'Offering',
  meta: [
    {
      name: 'description',
      content:
        offering.value?.description || 'Offering details and available slots'
    }
  ]
})

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
    {}
  )
})

const selectedSlot = ref<OfferingSlot | null>(null)
const dropInTickets = ref<BookingOptions['dropInTickets']>([])
const userPasses = ref<BookingOptions['userPasses']>([])

/** Fetch available pricing options for a given slot */
const checkAvailablePricingOptions = async (slot: OfferingSlot) => {
  selectedSlot.value = slot
  dropInTickets.value = []
  userPasses.value = []
  try {
    const pricingOptions = await $fetch(`/api/bookings/${slot.id}/options`)
    if (selectedSlot.value?.id !== slot.id) return // stale response guard
    dropInTickets.value = pricingOptions.options.dropInTickets
    userPasses.value = pricingOptions.options.userPasses
  } catch (err) {
    if (selectedSlot.value?.id !== slot.id) return // stale response guard
    const message =
      (err as { data?: { message?: string } })?.data?.message ?? 'Unknown error'
    toast.error(`Error fetching pricing options: ${message}`)
  }
}

/** Book a selected slot */
const bookSlot = async (
  slot: OfferingSlot,
  pricingOptionId: string | null,
  userPassId: string | null
) => {
  try {
    // await $fetch(`/api/slots/${slot.id}/book`, {
    //   method: 'POST',
    //   body: {
    //     ...slot
    //   }
    // })
    await $fetch(`/api/bookings/${slot.id}`, {
      method: 'POST',
      body: {
        pricingOptionId,
        userPassId
      }
    })

    toast.success('Slot booked successfully!', {
      description:
        'Your session has been booked. Check your dashboard for details.',
      duration: 5000,
      action: {
        label: 'View Bookings',
        onClick: () => navigateTo('/profile/bookings')
      }
    })
  } catch (err) {
    toast.error(`Error booking slot: ${(err as Error).message}`)
  }
}
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
                <div class="text-xs text-muted-foreground">
                  Coach: {{ slot.practitioner.name }}
                </div>
              </div>

              <Dialog>
                <DialogTrigger as-child>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="checkAvailablePricingOptions(slot)"
                  >
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Book the {{ offering?.name }}
                      <br />
                      on
                      {{
                        format(new Date(slot.startTime), 'MMMM d, yyyy HH:mm')
                      }}
                    </DialogTitle>
                    <DialogDescription>
                      Choose from the available booking options below:
                    </DialogDescription>
                  </DialogHeader>

                  <div v-if="!dropInTickets.length && !userPasses.length">
                    No available booking options for this slot.
                  </div>

                  <div v-else>
                    <div v-if="dropInTickets.length">
                      <h5 class="font-semibold mb-2">Drop-in Tickets</h5>
                      <ul class="space-y-1 mb-4">
                        <li
                          v-for="ticket in dropInTickets"
                          :key="ticket.id"
                          class="flex justify-between items-center p-2 bg-white/5 rounded-lg"
                          @click="bookSlot(slot, ticket.id, null)"
                        >
                          <span>Drop-in: {{ ticket.name }}</span> —
                          <span>${{ ticket.price.toFixed(2) }}</span>
                        </li>
                      </ul>
                    </div>

                    <div v-if="userPasses.length">
                      <h5 class="font-semibold mb-2">User Passes</h5>
                      <p class="text-sm text-muted-foreground mb-2">
                        Use your existing passes to book this slot.
                      </p>
                      <ul class="space-y-1">
                        <li
                          v-for="pass in userPasses"
                          :key="pass.id"
                          class="flex justify-between items-center p-2 bg-white/5 rounded-lg"
                          @click="bookSlot(slot, null, pass.id)"
                        >
                          <span>{{ pass.name }}</span> —
                          <span>{{ pass.remainingCredits }} credits left</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
