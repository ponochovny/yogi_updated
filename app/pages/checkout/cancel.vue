<script lang="ts" setup>
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CompassIcon,
  CreditCardIcon,
  HelpCircleIcon,
  MapPinIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  UserIcon
} from '@lucide/vue'
import { format } from 'date-fns'
import { placeholderImageUrl } from '~/config/constants'

definePageMeta({
  middleware: 'auth',
  title: 'Checkout Cancelled'
})

useHead({
  title: 'Payment Cancelled · Yogi'
})

const route = useRoute()
const router = useRouter()
const transactionId = computed(
  () => (route.query.transactionId as string) || ''
)
const hasTransactionId = computed(() => Boolean(transactionId.value))

// Fetch cancellation context & release pending reservations
const {
  data: cancelData,
  pending,
  error,
  refresh
} = await useFetch('/api/checkout/cancel', {
  query: { transactionId: transactionId.value },
  immediate: hasTransactionId.value
})

const transaction = computed(() => cancelData.value?.transaction)
const booking = computed(() => cancelData.value?.booking)
const studio = computed(() => cancelData.value?.studio || booking.value?.studio)
const retryUrl = computed(() => cancelData.value?.retryUrl || '/')

// Check if transaction was actually already completed successfully
const isAlreadyPaid = computed(() => {
  return (
    Boolean(cancelData.value?.isAlreadyPaid) ||
    transaction.value?.status === 'SUCCESS'
  )
})

// Automatically redirect to success page if the transaction is already paid
watch(
  isAlreadyPaid,
  paid => {
    if (paid && transactionId.value) {
      navigateTo(`/checkout/success?transactionId=${transactionId.value}`)
    }
  },
  { immediate: true }
)

const formatMoney = (amountInCents?: number, currency: string = 'USD') => {
  if (amountInCents === undefined || amountInCents === null) return '$0.00'
  const value = amountInCents / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(value)
  } catch {
    return `${currency.toUpperCase()} ${value.toFixed(2)}`
  }
}
</script>

<template>
  <div
    class="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
  >
    <!-- Ambient Background Glow -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-20"
    >
      <div
        class="relative left-[calc(50%-15rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[25deg] bg-linear-to-tr from-amber-500/15 via-rose-500/15 to-primary/10 opacity-70 sm:left-[calc(50%-18rem)] sm:w-[50rem]"
      />
    </div>

    <!-- Missing Transaction ID State -->
    <div
      v-if="!hasTransactionId"
      class="max-w-md mx-auto my-16 p-8 border rounded-2xl bg-card shadow-sm text-center"
    >
      <div
        class="size-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4"
      >
        <AlertCircleIcon class="size-8" />
      </div>
      <h2 class="text-2xl font-bold mb-2">No Active Checkout</h2>
      <p class="text-muted-foreground mb-6 text-sm">
        No transaction reference was provided. You can continue exploring yoga
        classes and studios.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button @click="router.push('/')">
          <CompassIcon class="size-4 mr-2" />
          Explore Classes
        </Button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-else-if="pending"
      class="space-y-8 animate-pulse max-w-2xl mx-auto py-8"
    >
      <div class="text-center space-y-3">
        <div class="size-16 rounded-full bg-muted mx-auto" />
        <div class="h-8 w-56 bg-muted mx-auto rounded-lg" />
        <div class="h-4 w-80 bg-muted mx-auto rounded" />
      </div>
      <div class="h-64 rounded-2xl bg-muted" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !cancelData?.success"
      class="max-w-md mx-auto my-16 p-8 border rounded-2xl bg-card shadow-sm text-center"
    >
      <div
        class="size-16 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto mb-4"
      >
        <AlertCircleIcon class="size-8" />
      </div>
      <h2 class="text-2xl font-bold mb-2">Checkout Info Unavailable</h2>
      <p class="text-muted-foreground mb-6 text-sm">
        {{
          error?.message ||
          'Could not load details for this cancellation. Rest assured that no payment was completed.'
        }}
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="default" @click="refresh()">
          <RefreshCwIcon class="size-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" @click="router.push('/')">
          Return to Home
        </Button>
      </div>
    </div>

    <!-- Already Paid State (if user manually accesses cancel with a successful transactionId) -->
    <div
      v-else-if="isAlreadyPaid"
      class="max-w-md mx-auto my-16 p-8 border border-emerald-500/30 rounded-2xl bg-card shadow-sm text-center space-y-4"
    >
      <div
        class="size-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto"
      >
        <CheckCircle2Icon class="size-8" />
      </div>
      <div>
        <h2 class="text-2xl font-bold text-foreground">
          Transaction Completed
        </h2>
        <p class="text-sm text-muted-foreground mt-2">
          This transaction has already been successfully paid and confirmed.
          Redirecting you to your order summary...
        </p>
      </div>
      <Button
        class="w-full justify-center mt-2"
        @click="router.push(`/checkout/success?transactionId=${transactionId}`)"
      >
        <span>View Order Details</span>
        <ArrowRightIcon class="size-4 ml-2" />
      </Button>
    </div>

    <!-- Main Cancel Content -->
    <div v-else class="space-y-8">
      <!-- Header Section -->
      <section class="text-center space-y-3">
        <div class="relative inline-flex items-center justify-center">
          <div
            class="size-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner"
          >
            <ShoppingBagIcon class="size-8 stroke-[2]" />
          </div>
        </div>

        <div>
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2"
          >
            <span>Payment Incomplete</span>
          </div>

          <h1
            class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            Checkout Was Cancelled
          </h1>

          <p class="mt-2 text-base text-muted-foreground max-w-lg mx-auto">
            No worries! You have
            <strong class="text-foreground font-semibold"
              >not been charged</strong
            >. Your pending reservation seat has been released.
          </p>
        </div>
      </section>

      <!-- Main Container Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <!-- LEFT COLUMN: Item Summary & Explanations -->
        <div class="md:col-span-7 space-y-5">
          <!-- Attempted Booking Card -->
          <div
            v-if="booking"
            class="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Item in Cart
              </span>
              <span
                class="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
              >
                Not Charged
              </span>
            </div>

            <!-- Offering Info -->
            <div class="flex gap-4 items-start">
              <div
                class="relative size-20 sm:size-24 shrink-0 rounded-xl overflow-hidden bg-muted"
              >
                <NuxtImg
                  :src="booking.offering?.coverImage || placeholderImageUrl"
                  :alt="booking.offering?.name || 'Class Cover'"
                  class="w-full h-full object-cover grayscale-[30%]"
                  provider="cloudinary"
                  width="120"
                  height="120"
                />
              </div>

              <div class="space-y-1 flex-1">
                <h3 class="font-bold text-lg text-foreground leading-snug">
                  {{ booking.offering?.name || 'Class Booking' }}
                </h3>
                <p
                  v-if="booking.studio?.name"
                  class="text-xs text-muted-foreground flex items-center gap-1"
                >
                  <span>at</span>
                  <span class="font-medium text-foreground">{{
                    booking.studio.name
                  }}</span>
                </p>
                <div
                  class="pt-1 text-sm font-semibold text-muted-foreground line-through"
                >
                  {{ formatMoney(transaction?.amount, transaction?.currency) }}
                </div>
              </div>
            </div>

            <Separator />

            <!-- Time & Instructor details -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground"
            >
              <div
                v-if="booking.slot?.startTime"
                class="flex items-center gap-2"
              >
                <CalendarIcon class="size-4 text-primary shrink-0" />
                <span>{{
                  format(new Date(booking.slot.startTime), 'EEE, MMM d, yyyy')
                }}</span>
              </div>

              <div
                v-if="booking.slot?.startTime"
                class="flex items-center gap-2"
              >
                <ClockIcon class="size-4 text-primary shrink-0" />
                <span>
                  {{ format(new Date(booking.slot.startTime), 'h:mm a') }}
                  <template v-if="booking.slot?.endTime">
                    - {{ format(new Date(booking.slot.endTime), 'h:mm a') }}
                  </template>
                </span>
              </div>

              <div
                v-if="booking.practitioner?.name"
                class="flex items-center gap-2"
              >
                <UserIcon class="size-4 text-primary shrink-0" />
                <NuxtLink
                  :to="`/practitioners/${booking.practitioner.id}`"
                  class="hover:text-primary transition-colors"
                >
                  {{ booking.practitioner.name }}
                </NuxtLink>
              </div>

              <div
                v-if="booking.studio?.address"
                class="flex items-center gap-2"
              >
                <MapPinIcon class="size-4 text-primary shrink-0" />
                <span class="truncate">{{ booking.studio.address }}</span>
              </div>
            </div>
          </div>

          <!-- Fallback Transaction Card (if booking info not attached) -->
          <div
            v-else-if="transaction"
            class="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Transaction Status
              </span>
              <span
                class="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
              >
                Cancelled
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              Transaction reference
              <span class="font-mono font-medium text-foreground"
                >#{{ transaction.id.slice(0, 8).toUpperCase() }}</span
              >
              was cancelled before completion.
            </p>
          </div>

          <!-- Helpful Reassurance / FAQs -->
          <div
            class="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
          >
            <h4
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
            >
              <HelpCircleIcon class="size-4 text-primary" />
              <span>Common Questions</span>
            </h4>

            <div class="space-y-3 text-xs text-muted-foreground">
              <div>
                <p class="font-semibold text-foreground mb-0.5">
                  Was my card or account charged?
                </p>
                <p>
                  No. The payment authorization was never completed, so no funds
                  were withdrawn.
                </p>
              </div>

              <div>
                <p class="font-semibold text-foreground mb-0.5">
                  Can I still book this spot?
                </p>
                <p>
                  Yes! The reservation hold on your seat has been released,
                  making it available for you to book again immediately.
                </p>
              </div>

              <div>
                <p class="font-semibold text-foreground mb-0.5">
                  Experienced a payment card issue?
                </p>
                <p>
                  You may try again with another card, or check if the studio
                  offers cash payment on-site.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Action Buttons & Next Steps -->
        <div class="md:col-span-5 space-y-4">
          <div
            class="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4"
          >
            <h3 class="font-bold text-base text-foreground">
              What would you like to do?
            </h3>

            <!-- Primary Retry Action -->
            <Button
              class="w-full justify-between h-12 text-sm font-semibold"
              @click="router.push(retryUrl)"
            >
              <span>Try Booking Again</span>
              <ArrowRightIcon class="size-4" />
            </Button>

            <!-- Studio Schedule Action -->
            <Button
              v-if="studio?.slug"
              variant="outline"
              class="w-full justify-between h-11 text-sm font-medium"
              @click="router.push(`/studios/${studio.slug}`)"
            >
              <span>View Studio Schedule</span>
              <CalendarIcon class="size-4" />
            </Button>

            <!-- Browse Classes Action -->
            <Button
              variant="secondary"
              class="w-full justify-between h-11 text-sm font-medium"
              @click="router.push('/')"
            >
              <span>Explore All Classes</span>
              <CompassIcon class="size-4" />
            </Button>

            <Separator class="my-2" />

            <Button
              variant="ghost"
              class="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
              @click="router.push('/profile/bookings')"
            >
              Go to My Bookings
            </Button>
          </div>

          <!-- Need Help Banner -->
          <div
            class="p-4 rounded-xl bg-accent/30 border border-border text-xs text-muted-foreground space-y-1"
          >
            <p class="font-semibold text-foreground flex items-center gap-1.5">
              <CreditCardIcon class="size-3.5 text-primary" />
              <span>Having trouble with payment?</span>
            </p>
            <p>
              Please verify your billing details or reach out to your bank. If
              the issue persists, contact the studio support.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
