<script setup lang="ts">
import { ref, computed } from 'vue'
import { CreditCardIcon, BanknoteIcon, Loader2Icon } from '@lucide/vue'

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
        '/api/bookings/create',
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
          '/api/bookings/create',
          {
            method: 'POST',
            body: {
              slotId: props.slotId,
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
    alert(
      (error as { data: { message: string } }).data?.message ||
        'Что-то пошло не так при обработке записи.'
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="bg-white/10 rounded-2xl shadow-xl border border-border max-w-md w-full overflow-hidden"
  >
    <!-- Header -->
    <div
      class="px-6 py-5 border-b border-border flex items-center justify-between"
    >
      <h3 class="font-bold text-lg">Оформление записи</h3>
      <button
        class="text-muted-foreground hover:text-slate-600 transition-colors"
        @click="emit('close')"
      >
        <span class="text-xl">&times;</span>
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="flex flex-col items-center justify-center py-12 gap-3 text-gray-800 shimmer"
    >
      <Loader2Icon class="w-8 h-8 animate-spin text-orange-500" />
      <span class="text-sm">Загрузка способов оплаты...</span>
    </div>

    <!-- Booking content options -->
    <div v-else class="p-6 space-y-6">
      <!-- TABS: Switch between active passes and new drop-in tickets (if both exist) -->
      <div
        v-if="hasPasses"
        class="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl"
      >
        <button
          :class="
            paymentFlowMode === 'PASS'
              ? 'bg-white  shadow-sm'
              : 'text-slate-500'
          "
          class="py-2 text-xs font-semibold rounded-lg transition-all"
          @click="paymentFlowMode = 'PASS'"
        >
          Использовать абонемент
        </button>
        <button
          :class="
            paymentFlowMode === 'TICKET'
              ? 'bg-white  shadow-sm'
              : 'text-slate-500'
          "
          class="py-2 text-xs font-semibold rounded-lg transition-all"
          @click="paymentFlowMode = 'TICKET'"
        >
          Разовая оплата
        </button>
      </div>

      <!-- FLOW 1: Active user memberships/packs -->
      <div v-if="paymentFlowMode === 'PASS'" class="space-y-3">
        <div
          class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Выберите доступный абонемент:
        </div>
        <div class="space-y-2">
          <label
            v-for="pass in options.userPasses"
            :key="pass.id"
            :class="
              selectedPassId === pass.id
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-border bg-white hover:border-slate-300'
            "
            class="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all"
          >
            <div class="flex items-center gap-3">
              <input
                v-model="selectedPassId"
                type="radio"
                :value="pass.id"
                class="text-orange-500 focus:ring-orange-500"
              />
              <div>
                <div class="font-bold text-sm">
                  {{ pass.name }}
                </div>
                <div class="text-xs text-slate-500">
                  Доступно:
                  <strong class="text-slate-700">
                    {{
                      pass.remainingCredits !== null
                        ? `${pass.remainingCredits} занятий`
                        : 'Безлимит'
                    }}
                  </strong>
                </div>
              </div>
            </div>
            <div class="text-xs text-muted-foreground font-medium">
              до {{ new Date(pass.validUntil).toLocaleDateString() }}
            </div>
          </label>
        </div>
      </div>

      <!-- FLOW 2: Ticket purchase -->
      <div v-if="paymentFlowMode === 'TICKET'" class="space-y-4">
        <!-- Tickets list -->
        <div class="space-y-3">
          <div class="text-xs text-muted-foreground uppercase tracking-wider">
            Выберите разовый билет:
          </div>
          <label
            v-for="ticket in options.dropInTickets"
            :key="ticket.id"
            :class="
              selectedTicketId === ticket.id
                ? 'border-white/30 bg-white/20'
                : 'border-border bg-white/10 hover:border-slate-300'
            "
            class="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all"
          >
            <div class="flex items-center gap-3">
              <input
                v-model="selectedTicketId"
                type="radio"
                :value="ticket.id"
                class="text-orange-500 focus:ring-orange-500"
              />
              <div>
                <div class="font-bold text-sm">
                  {{ ticket.name }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{
                    ticket.description ||
                    'Разовое посещение выбранной тренировки'
                  }}
                </div>
              </div>
            </div>
            <div class="text-base font-extrabold text-muted-foreground">
              ${{ (ticket.price / 100).toFixed(2) }}
            </div>
          </label>
        </div>

        <!-- Single ticket payment methods -->
        <div class="space-y-3 pt-2">
          <div
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Способ оплаты билета:
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              :class="
                paymentMethod === 'ONLINE'
                  ? 'border-orange-500 bg-orange-50/30 text-orange-600 ring-2 ring-orange-500/20'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              "
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
              @click="paymentMethod = 'ONLINE'"
            >
              <CreditCardIcon class="size-5" />
              <span class="text-xs font-bold">Оплатить онлайн</span>
            </button>
            <button
              type="button"
              :class="
                paymentMethod === 'CASH'
                  ? 'border-orange-500 bg-orange-50/30 text-orange-600 ring-2 ring-orange-500/20'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              "
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all"
              @click="paymentMethod = 'CASH'"
            >
              <BanknoteIcon class="w-5 h-5" />
              <span class="text-xs font-bold">Наличными на месте</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        :disabled="
          isSubmitting ||
          (paymentFlowMode === 'PASS' && !selectedPassId) ||
          (paymentFlowMode === 'TICKET' && !selectedTicketId)
        "
        class="w-full py-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
        :class="
          isSubmitting
            ? 'bg-slate-300 cursor-not-allowed shadow-none'
            : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/10'
        "
        @click="handleConfirmBooking"
      >
        <Loader2Icon v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        <span v-else-if="paymentFlowMode === 'PASS'"
          >Записаться по абонементу</span
        >
        <span v-else-if="paymentMethod === 'ONLINE'">Перейти к оплате</span>
        <span v-else>Записаться (наличный расчет)</span>
      </button>

      <!-- Terms Disclaimer -->
      <p class="text-[10px] text-center text-muted-foreground leading-relaxed">
        Нажимая кнопку, вы подтверждаете согласие с правилами отмены. <br />
        Отмена записи без сгорания средств возможна не позднее чем за 1 час до
        начала занятия.
      </p>
    </div>
  </div>
</template>
