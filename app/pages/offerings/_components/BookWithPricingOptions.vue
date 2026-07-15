<script setup lang="ts">
import { CreditCardIcon, BanknoteIcon, Loader2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

// TS Interface for response mapping from /api/bookings/options
interface PricingOption {
  id: string
  name: string
  price: number
  description: string | null
  type: 'DROP_IN' | 'PACK' | 'MEMBERSHIP'
}

interface UserPass {
  id: string
  name: string
  remainingCredits: number | null
  validUntil: string
}

const props = defineProps<{
  slotId: string
  slug: string // Studio slug for contextual redirects if needed
}>()

const emit = defineEmits(['success', 'close'])

// Component State
const pending = ref(true)
const isSubmitting = ref(false)
const options = ref<{ dropInTickets: PricingOption[]; userPasses: UserPass[] }>(
  {
    dropInTickets: [],
    userPasses: []
  }
)

// UI Selections
const selectedPassId = ref<string | null>(null)
const selectedTicketId = ref<string | null>(null)
const paymentMethod = ref<'ONLINE' | 'CASH'>('ONLINE') // Cash on-site vs Stripe online

// Load checkout options on mount
onMounted(async () => {
  try {
    const data = await $fetch<{
      success: boolean
      options: { dropInTickets: PricingOption[]; userPasses: UserPass[] }
    }>(`/api/bookings/${props.slotId}/options`)

    if (data.success) {
      options.value = data.options
      // Auto-select first active membership pass if available
      if (data.options.userPasses.length > 0) {
        selectedPassId.value = data?.options?.userPasses[0]?.id || null
      } else if (data.options.dropInTickets.length > 0) {
        selectedTicketId.value = data?.options?.dropInTickets[0]?.id || null
      }
    }
  } catch (error) {
    console.error('Failed to load booking payment options:', error)
  } finally {
    pending.value = false
  }
})

// Switch between using a Pass vs buying a single Drop-in Ticket
const paymentFlowMode = ref<'PASS' | 'TICKET'>('PASS')
const hasPasses = computed(() => options.value.userPasses.length > 0)

// Watch options to set correct initial mode
watch(options, newVal => {
  if (newVal.userPasses.length === 0) {
    paymentFlowMode.value = 'TICKET'
  }
})

// Handle execution of booking or checkout redirect
async function handleConfirmBooking() {
  isSubmitting.value = true
  try {
    // 1. SCENARIO A: Booking using existing Membership/Pack Credit
    if (paymentFlowMode.value === 'PASS' && selectedPassId.value) {
      const response = await $fetch<{ success: boolean; message: string }>(
        `/api/bookings/${props.slotId}`,
        {
          method: 'POST',
          body: {
            slotId: props.slotId,
            userPassId: selectedPassId.value
          }
        }
      )
      if (response.success) {
        emit('success', { mode: 'PASS', message: response.message })
      }
    }
    // 2. SCENARIO B: Booking using Drop-In (Cash or Card)
    else if (paymentFlowMode.value === 'TICKET' && selectedTicketId.value) {
      if (paymentMethod.value === 'CASH') {
        // Cash on site -> Create Booking right away with status CONFIRMED (but Transaction PENDING)
        const response = await $fetch<{ success: boolean; message: string }>(
          `/api/bookings/${props.slotId}`,
          {
            method: 'POST',
            body: {
              pricingOptionId: selectedTicketId.value
            }
          }
        )
        if (response.success) {
          emit('success', { mode: 'CASH', message: response.message })
        }
      } else {
        // Online Payment -> Initialize Stripe session and redirect
        const response = await $fetch<{ success: boolean; url: string }>(
          '/api/checkout/create-session',
          {
            method: 'POST',
            body: {
              pricingOptionId: selectedTicketId.value,
              slotId: props.slotId
            }
          }
        )
        if (response.url) {
          window.location.href = response.url // External Stripe Redirect
        }
      }
    }
  } catch (error) {
    toast.error(
      (error as { data: { message: string } }).data?.message ||
        'Something went wrong while processing your booking.'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Card class="border-0 bg-transparent p-0">
    <CardContent class="px-0">
      <!-- Loading State -->
      <div
        v-if="pending"
        class="flex flex-col items-center justify-center py-12 gap-3 text-foreground/60 shimmer"
      >
        <Loader2Icon class="w-8 h-8 animate-spin text-orange-500" />
        <span class="text-sm">Loading payment methods...</span>
      </div>

      <!-- Booking content options -->
      <div v-else class="space-y-6">
        <div>
          <Tabs
            v-model="paymentFlowMode"
            :default-value="hasPasses ? 'PASS' : 'TICKET'"
            class="mb-4"
          >
            <TabsList>
              <TabsTrigger value="PASS" :disabled="!hasPasses">
                Use Membership / Pack
              </TabsTrigger>
              <TabsTrigger value="TICKET"> Use Drop-in Ticket </TabsTrigger>
            </TabsList>
            <TabsContent value="PASS">
              <!-- FLOW 1: Active user memberships/packs -->
              <div>
                <div
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-2"
                >
                  Choose an available membership:
                </div>
                <div class="space-y-2">
                  <RadioGroup
                    v-model="selectedPassId"
                    class="w-full gap-0 -space-y-px rounded-md shadow-xs"
                  >
                    <div
                      v-for="pass in options.userPasses"
                      :key="pass.id"
                      class="border-input relative flex flex-col gap-4 border p-4 outline-none first:rounded-t-md last:rounded-b-md data-[state=checked]:z-10"
                      :class="{
                        'border-primary/50 bg-primary/10 z-10':
                          selectedPassId === pass.id
                      }"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <RadioGroupItem :id="pass.id" :value="pass.id" />
                          <div class="flex flex-col gap-1">
                            <Label
                              class="inline-flex after:absolute after:inset-0"
                              :for="pass.id"
                            >
                              {{ pass.name }}
                            </Label>
                            <p class="text-xs text-muted-foreground">
                              Available:
                              <strong class="">
                                {{
                                  pass.remainingCredits !== null
                                    ? `${pass.remainingCredits} sessions`
                                    : 'Unlimited'
                                }}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div
                          :id="pass.id"
                          class="text-muted-foreground text-xs leading-[inherit]"
                        >
                          Expires
                          <NuxtTime :datetime="pass.validUntil" relative />
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="TICKET">
              <!-- FLOW 2: Ticket purchase -->
              <div class="space-y-4">
                <!-- Tickets list -->
                <div class="space-y-3">
                  <div
                    class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-2"
                  >
                    Choose a drop-in ticket:
                  </div>
                  <RadioGroup
                    v-model="selectedTicketId"
                    class="w-full gap-0 -space-y-px rounded-md shadow-xs"
                  >
                    <div
                      v-for="ticket in options.dropInTickets"
                      :key="ticket.id"
                      class="border-input relative flex flex-col gap-4 border p-4 outline-none first:rounded-t-md last:rounded-b-md data-[state=checked]:z-10"
                      :class="{
                        'border-primary/50 bg-primary/10 z-10':
                          selectedTicketId === ticket.id
                      }"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <RadioGroupItem :id="ticket.id" :value="ticket.id" />
                          <div class="flex flex-col gap-1">
                            <Label
                              class="inline-flex after:absolute after:inset-0"
                              :for="ticket.id"
                            >
                              {{ ticket.name }}
                            </Label>
                            <p class="text-xs text-muted-foreground">
                              {{
                                ticket.description ||
                                'Single visit to the selected training'
                              }}
                            </p>
                          </div>
                        </div>

                        <div :id="ticket.id" class="text-muted-foreground">
                          ${{ ticket.price / 100 }}
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <!-- Single ticket payment methods -->
                <div class="space-y-3 pt-2">
                  <div
                    class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Payment method for ticket:
                  </div>
                  <RadioGroup
                    v-model="paymentMethod"
                    class="grid grid-cols-2 gap-2"
                    default-value="ONLINE"
                  >
                    <Label
                      class="text-xs text-muted-foreground col-span-1 border-input focus-visible:border-ring focus-visible:ring-ring/50 data-[state=checked]:border-primary/80 relative flex flex-col items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50"
                      :class="{
                        'border-primary/50 bg-primary/10 z-10':
                          paymentMethod === 'ONLINE'
                      }"
                    >
                      <CreditCardIcon class="size-5" />
                      Pay Online
                      <RadioGroupItem
                        value="ONLINE"
                        class="col-span-1 sr-only"
                      />
                    </Label>
                    <Label
                      class="text-xs text-muted-foreground col-span-1 border border-input focus-visible:border-ring focus-visible:ring-ring/50 relative flex flex-col items-center gap-3 rounded-md px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50"
                      :class="{
                        'border-primary/50 bg-primary/10 z-10':
                          paymentMethod === 'CASH'
                      }"
                    >
                      <BanknoteIcon class="size-5" />
                      Pay in Cash
                      <RadioGroupItem value="CASH" class="col-span-1 sr-only" />
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <!-- Action Button -->
          <Button
            :disabled="
              isSubmitting ||
              (paymentFlowMode === 'PASS' && !selectedPassId) ||
              (paymentFlowMode === 'TICKET' && !selectedTicketId)
            "
            class="w-full mb-6"
            @click="handleConfirmBooking"
          >
            <Loader2Icon v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span v-else-if="paymentFlowMode === 'PASS'">
              Book with membership
            </span>
            <span v-else-if="paymentMethod === 'ONLINE'"
              >Proceed to Payment</span
            >
            <span v-else>Book (Cash Payment)</span>
          </Button>

          <!-- Terms Disclaimer -->
          <p class="text-xs text-center text-muted-foreground leading-relaxed">
            By clicking the button, you confirm your agreement with the
            cancellation rules. Cancellation without losing credits is possible
            no later than 1 hour before the start of the session.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
