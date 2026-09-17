<script lang="ts" setup>
import {
  CheckCircle2Icon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ReceiptIcon,
  CopyIcon,
  CheckIcon,
  PrinterIcon,
  ExternalLinkIcon,
  CalendarPlusIcon,
  DownloadIcon,
  SparklesIcon,
  TicketIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  CompassIcon,
  InfoIcon
} from '@lucide/vue'
import { format } from 'date-fns'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'

definePageMeta({
  middleware: 'auth'
})

usePageSeo('checkoutSuccess')

const route = useRoute()
const router = useRouter()
const transactionId = computed(
  () => (route.query.transactionId as string) || ''
)

// Handle missing transaction ID
const hasTransactionId = computed(() => Boolean(transactionId.value))

// Fetch transaction and booking/pass status from server
const {
  data: checkoutData,
  pending,
  error,
  refresh
} = await useFetch('/api/checkout/status', {
  query: { transactionId: transactionId.value },
  immediate: hasTransactionId.value
})

// Auto-polling if transaction is still PENDING (webhook delay resilience)
const pollCount = ref(0)
const maxPolls = 6
let pollTimer: ReturnType<typeof setTimeout> | null = null

const isPendingConfirmation = computed(() => {
  return (
    checkoutData.value?.success &&
    checkoutData.value.transaction.status === 'PENDING'
  )
})

const scheduleNextPoll = () => {
  if (!isPendingConfirmation.value || pollCount.value >= maxPolls) return
  pollTimer = setTimeout(async () => {
    pollCount.value++
    await refresh()
    scheduleNextPoll()
  }, 2500)
}

watch(
  isPendingConfirmation,
  isPending => {
    if (pollTimer) clearTimeout(pollTimer)
    if (isPending) scheduleNextPoll()
  },
  { immediate: true }
)

onScopeDispose(() => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
})

// Convenience getters
const orderType = computed(() => checkoutData.value?.type || 'GENERIC')
const transaction = computed(() => checkoutData.value?.transaction)
const customer = computed(() => checkoutData.value?.customer)
const booking = computed(() => checkoutData.value?.booking)
const pass = computed(() => checkoutData.value?.pass)
const studio = computed(() => {
  if (booking.value?.studio) return booking.value.studio
  if (pass.value?.studio) return pass.value.studio
  if (checkoutData.value?.studio) return checkoutData.value.studio
  return null
})

// Copy transaction ID to clipboard
const isCopied = ref(false)
const copyTransactionId = async () => {
  if (!transaction.value?.id) return
  try {
    await navigator.clipboard.writeText(transaction.value.id)
    isCopied.value = true
    toast.success('Transaction ID copied to clipboard!')
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    toast.error('Failed to copy to clipboard')
  }
}

// Print receipt handler
const printReceipt = () => {
  window.print()
}

// Format currency
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

// Calendar links
const googleCalendarUrl = computed(() => {
  if (!booking.value?.slot?.startTime || !booking.value?.slot?.endTime)
    return '#'
  const start = new Date(booking.value.slot.startTime)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '')
  const end = new Date(booking.value.slot.endTime)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '')
  const title = encodeURIComponent(
    `${booking.value.offering?.name || 'Class'} · ${studio.value?.name || 'Yoga Studio'}`
  )
  const loc = encodeURIComponent(
    [studio.value?.name, studio.value?.address, studio.value?.city]
      .filter(Boolean)
      .join(', ')
  )
  const details = encodeURIComponent(
    `Class: ${booking.value.offering?.name || 'Yoga Session'}\n` +
      `Instructor: ${booking.value.practitioner?.name || 'Studio Instructor'}\n` +
      `Studio: ${studio.value?.name || 'Studio'}\n` +
      `Order Ref: #${transaction.value?.id.slice(0, 8).toUpperCase() || ''}\n\n` +
      `Booked via Yogi Platform.`
  )
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`
})

const downloadIcs = () => {
  if (!booking.value?.slot?.startTime || !booking.value?.slot?.endTime) return
  const formatIcsDate = (dateStr: string) =>
    new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, '')

  const start = formatIcsDate(booking.value.slot.startTime)
  const end = formatIcsDate(booking.value.slot.endTime)
  const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')
  const title = `${booking.value.offering?.name || 'Yoga Class'} · ${studio.value?.name || 'Studio'}`
  const loc = [studio.value?.name, studio.value?.address, studio.value?.city]
    .filter(Boolean)
    .join(', ')
  const desc =
    `Booking Ref: #${transaction.value?.id.slice(0, 8).toUpperCase() || ''}\\n` +
    `Instructor: ${booking.value.practitioner?.name || 'Studio Instructor'}\\n` +
    `Studio: ${studio.value?.name || ''}\\n` +
    `Please arrive 10-15 minutes before class.`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yogi App//Class Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.value.id}@yogiapp.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    `${booking.value.offering?.slug || 'class'}-booking.ics`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success('Calendar file (.ics) downloaded!')
}

// Google Maps URL
const googleMapsUrl = computed(() => {
  const query = [studio.value?.name, studio.value?.address, studio.value?.city]
    .filter(Boolean)
    .join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
})
</script>

<template>
  <div
    class="relative min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none"
  >
    <!-- Ambient Background Lighting -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-20"
    >
      <div
        class="relative left-[calc(50%-18rem)] aspect-1155/678 w-[40rem] -translate-x-1/2 rotate-30 bg-linear-to-tr from-emerald-500/20 to-primary/30 opacity-60 sm:left-[calc(50%-22rem)] sm:w-[60rem]"
      />
    </div>

    <!-- Missing Transaction ID Alert -->
    <div
      v-if="!hasTransactionId"
      class="max-w-md mx-auto my-16 p-8 border rounded-2xl bg-card shadow-sm text-center"
    >
      <div
        class="size-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4"
      >
        <AlertCircleIcon class="size-8" />
      </div>
      <h2 class="text-2xl font-bold mb-2">No Transaction Found</h2>
      <p class="text-muted-foreground mb-6 text-sm">
        It looks like you reached this page directly without a valid transaction
        reference.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button @click="router.push('/profile/bookings')">
          Go to My Bookings
        </Button>
        <Button variant="outline" @click="router.push('/')">
          Return to Home
        </Button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-else-if="pending"
      class="space-y-8 animate-pulse max-w-4xl mx-auto py-8"
    >
      <div class="text-center space-y-3">
        <div class="size-20 rounded-full bg-muted mx-auto" />
        <div class="h-8 w-64 bg-muted mx-auto rounded-lg" />
        <div class="h-4 w-96 bg-muted mx-auto rounded" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 h-80 rounded-2xl bg-muted" />
        <div class="h-80 rounded-2xl bg-muted" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !checkoutData?.success"
      class="max-w-lg mx-auto my-16 p-8 border rounded-2xl bg-card shadow-sm text-center"
    >
      <div
        class="size-16 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto mb-4"
      >
        <AlertCircleIcon class="size-8" />
      </div>
      <h2 class="text-2xl font-bold mb-2">Unable to Load Transaction</h2>
      <p class="text-muted-foreground mb-6 text-sm">
        {{
          error?.message ||
          'We could not find the details for this transaction. If you believe this is an error, please reach out to support.'
        }}
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="default" @click="refresh()">
          <RefreshCwIcon class="size-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" @click="router.push('/profile/bookings')">
          View My Bookings
        </Button>
      </div>
    </div>

    <!-- Main Success Content -->
    <div v-else class="space-y-10">
      <!-- Top Celebration Header -->
      <section class="text-center space-y-4 print:space-y-2">
        <!-- Glowing Success Icon -->
        <div class="relative inline-flex items-center justify-center">
          <div
            class="absolute size-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse"
          />
          <div
            class="relative size-20 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle2Icon class="size-11 stroke-[2.2]" />
          </div>
        </div>

        <div>
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2"
          >
            <SparklesIcon class="size-3.5" />
            <span v-if="orderType === 'BOOKING'">Booking Confirmed</span>
            <span v-else-if="orderType === 'PASS'">Pass Activated</span>
            <span v-else>Payment Complete</span>
          </div>

          <h1
            class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
          >
            <template v-if="orderType === 'BOOKING'">
              You're Booked & Ready to Flow!
            </template>
            <template v-else-if="orderType === 'PASS'">
              Your Pass is Ready to Use!
            </template>
            <template v-else> Thank You for Your Payment! </template>
          </h1>

          <p class="mt-2 text-base text-muted-foreground max-w-xl mx-auto">
            <template v-if="customer?.name">
              Thank you,
              <span class="font-medium text-foreground">{{
                customer.name
              }}</span
              >!
            </template>
            A confirmation receipt has been sent to
            <span
              class="font-medium text-foreground underline decoration-muted-foreground/40"
              >{{ customer?.email }}</span
            >.
          </p>
        </div>

        <!-- Pending Webhook Info Banner (if still processing in background) -->
        <div
          v-if="isPendingConfirmation"
          class="max-w-xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3 text-left"
        >
          <div class="flex items-center gap-2">
            <RefreshCwIcon class="size-4 animate-spin shrink-0" />
            <span
              >Finalizing confirmation with payment provider. Refreshing
              automatically...</span
            >
          </div>
          <Button
            size="sm"
            variant="ghost"
            class="h-7 text-xs px-2"
            @click="refresh()"
          >
            Refresh
          </Button>
        </div>
      </section>

      <!-- Content Grid: Details (Left) + Receipt & Actions (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT COLUMN: Booking / Pass Information -->
        <div class="lg:col-span-7 space-y-6">
          <!-- 1. Drop-In Booking Card -->
          <div
            v-if="orderType === 'BOOKING' && booking"
            class="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6"
          >
            <!-- Offering Header with Media -->
            <div class="flex flex-col sm:flex-row gap-5 items-start">
              <div
                class="relative w-full sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden bg-muted"
              >
                <NuxtImg
                  :src="booking.offering?.coverImage || placeholderImageUrl"
                  :alt="booking.offering?.name || 'Class Cover'"
                  class="w-full h-full object-cover"
                  provider="cloudinary"
                  width="200"
                  height="150"
                />
                <div
                  v-if="booking.offering?.duration"
                  class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1"
                >
                  <ClockIcon class="size-3" />
                  {{ booking.offering.duration }}m
                </div>
              </div>

              <div class="flex-1 space-y-1.5">
                <NuxtLink
                  :to="`/offerings/${booking.offering?.slug}`"
                  class="text-xl font-bold hover:text-primary transition-colors inline-block"
                >
                  {{ booking.offering?.name }}
                </NuxtLink>
                <p
                  v-if="booking.offering?.description"
                  class="text-xs text-muted-foreground line-clamp-2"
                >
                  {{ booking.offering.description }}
                </p>
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                  >
                    Confirmed Seat
                  </span>
                  <span v-if="booking.id" class="text-xs text-muted-foreground">
                    Booking #{{ booking.id.slice(0, 8).toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Key Details Row: Time, Instructor, Studio -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Date & Time -->
              <div
                class="p-4 rounded-xl bg-accent/30 border border-border/60 flex items-start gap-3"
              >
                <div
                  class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                >
                  <CalendarIcon class="size-5" />
                </div>
                <div>
                  <p
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Date & Time
                  </p>
                  <p class="font-semibold text-sm mt-0.5">
                    {{
                      booking.slot?.startTime
                        ? format(
                            new Date(booking.slot.startTime),
                            'EEEE, MMM d, yyyy'
                          )
                        : 'Date TBA'
                    }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{
                      booking.slot?.startTime
                        ? format(new Date(booking.slot.startTime), 'h:mm a')
                        : ''
                    }}
                    <span v-if="booking.slot?.endTime">
                      - {{ format(new Date(booking.slot.endTime), 'h:mm a') }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Instructor -->
              <div
                class="p-4 rounded-xl bg-accent/30 border border-border/60 flex items-start gap-3"
              >
                <div
                  class="size-10 rounded-full overflow-hidden bg-muted shrink-0 border"
                >
                  <NuxtImg
                    v-if="booking.practitioner?.avatar"
                    :src="booking.practitioner.avatar"
                    :alt="booking.practitioner.name || 'Instructor'"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-muted-foreground"
                  >
                    <UserIcon class="size-5" />
                  </div>
                </div>
                <div>
                  <p
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Instructor
                  </p>
                  <NuxtLink
                    v-if="booking.practitioner?.id"
                    :to="`/practitioners/${booking.practitioner.id}`"
                    class="font-semibold text-sm mt-0.5 hover:text-primary transition-colors"
                  >
                    {{ booking.practitioner.name }}
                  </NuxtLink>
                  <p v-else class="font-semibold text-sm mt-0.5">
                    {{ booking.practitioner?.name || 'Studio Guide' }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Certified Teacher
                  </p>
                </div>
              </div>
            </div>

            <!-- Studio Location -->
            <div
              class="p-4 rounded-xl bg-accent/30 border border-border/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div class="flex items-start gap-3">
                <div
                  class="size-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0"
                >
                  <MapPinIcon class="size-5" />
                </div>
                <div>
                  <NuxtLink
                    v-if="booking.studio?.slug"
                    :to="`/studios/${booking.studio.slug}`"
                    class="font-semibold text-sm hover:underline"
                  >
                    {{ booking.studio?.name }}
                  </NuxtLink>
                  <span v-else class="font-semibold text-sm">
                    {{ booking.studio?.name || 'Studio' }}
                  </span>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{
                      [booking.studio?.address, booking.studio?.city]
                        .filter(Boolean)
                        .join(', ') || 'Address provided by studio'
                    }}
                  </p>
                </div>
              </div>

              <a
                :href="googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
              >
                <span>Open in Maps</span>
                <ExternalLinkIcon class="size-3.5" />
              </a>
            </div>

            <!-- Add to Calendar Buttons -->
            <div class="pt-2 print:hidden">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3"
              >
                Add to your schedule
              </p>
              <div class="flex flex-wrap gap-2.5">
                <a
                  :href="googleCalendarUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium transition"
                >
                  <CalendarPlusIcon class="size-4 text-emerald-600" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium transition cursor-pointer"
                  @click="downloadIcs"
                >
                  <DownloadIcon class="size-4 text-primary" />
                  <span>Download .ics file (Apple / Outlook)</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Pass / Membership Card -->
          <div
            v-else-if="orderType === 'PASS' && pass"
            class="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6"
          >
            <div class="flex items-start gap-4">
              <div
                class="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"
              >
                <TicketIcon class="size-8" />
              </div>
              <div class="space-y-1 flex-1">
                <div
                  class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                >
                  {{
                    pass.pricingOption?.type === 'MEMBERSHIP'
                      ? 'Active Membership'
                      : 'Active Class Pack'
                  }}
                </div>
                <h2 class="text-2xl font-bold text-foreground">
                  {{ pass.pricingOption?.name }}
                </h2>
                <p
                  v-if="pass.pricingOption?.description"
                  class="text-xs text-muted-foreground"
                >
                  {{ pass.pricingOption.description }}
                </p>
              </div>
            </div>

            <Separator />

            <!-- Pass Attributes Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-accent/30 border border-border/60">
                <p
                  class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Remaining Credits
                </p>
                <p class="text-xl font-bold mt-1 text-primary">
                  {{
                    pass.remainingCredits !== null
                      ? `${pass.remainingCredits} Classes`
                      : 'Unlimited Sessions'
                  }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Available in your user wallet
                </p>
              </div>

              <div class="p-4 rounded-xl bg-accent/30 border border-border/60">
                <p
                  class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Validity Period
                </p>
                <p class="text-sm font-semibold mt-1">
                  Until
                  {{
                    pass.validUntil
                      ? format(new Date(pass.validUntil), 'MMM d, yyyy')
                      : 'N/A'
                  }}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Activated on
                  {{
                    pass.validFrom
                      ? format(new Date(pass.validFrom), 'MMM d, yyyy')
                      : 'today'
                  }}
                </p>
              </div>
            </div>

            <!-- Studio Linked to Pass -->
            <div
              v-if="studio"
              class="p-4 rounded-xl bg-accent/30 border border-border/60 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="size-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0"
                >
                  <MapPinIcon class="size-4" />
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Valid at Studio</p>
                  <p class="text-sm font-semibold">{{ studio.name }}</p>
                </div>
              </div>

              <NuxtLink
                v-if="studio.slug"
                :to="`/studios/${studio.slug}`"
                class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span>Studio Schedule</span>
                <ArrowRightIcon class="size-3.5" />
              </NuxtLink>
            </div>
          </div>

          <!-- Helpful Prep Guide Card ("Before You Arrive") -->
          <div
            class="bg-card border border-border rounded-2xl p-6 shadow-sm print:hidden"
          >
            <h3
              class="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2"
            >
              <InfoIcon class="size-4 text-primary" />
              <span>Good to Know Before Your Visit</span>
            </h3>

            <ul class="space-y-3 text-xs text-muted-foreground">
              <li class="flex items-start gap-2.5">
                <span
                  class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0"
                />
                <span
                  ><strong class="text-foreground">Early Arrival:</strong>
                  Please arrive 10 to 15 minutes before the session to check in
                  and prepare calmly.</span
                >
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0"
                />
                <span
                  ><strong class="text-foreground">What to Wear:</strong>
                  Breathable, comfortable clothing that allows full freedom of
                  movement.</span
                >
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0"
                />
                <span
                  ><strong class="text-foreground">Equipment:</strong> Mats,
                  blocks, and straps are available on site, though you are
                  welcome to bring your personal mat.</span
                >
              </li>
              <li class="flex items-start gap-2.5">
                <span
                  class="size-1.5 rounded-full bg-primary mt-1.5 shrink-0"
                />
                <span
                  ><strong class="text-foreground">Check-in:</strong> Just state
                  your name or display this confirmation upon walking in.</span
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- RIGHT COLUMN: Order Receipt & Customer Actions -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Official Receipt Card -->
          <div
            id="printable-receipt"
            class="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 relative overflow-hidden"
          >
            <!-- Receipt Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-foreground">
                <ReceiptIcon class="size-5 text-primary" />
                <h3 class="font-bold text-lg">Payment Receipt</h3>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="
                  transaction?.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                "
              >
                {{ transaction?.status === 'SUCCESS' ? 'Paid' : 'Pending' }}
              </span>
            </div>

            <!-- Transaction Reference Code with Copy -->
            <div
              class="p-3 rounded-xl bg-accent/40 border border-dashed border-border flex items-center justify-between gap-2"
            >
              <div>
                <p
                  class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
                >
                  Transaction Reference
                </p>
                <p class="font-mono text-sm font-semibold text-foreground">
                  #{{ transaction?.id.slice(0, 12).toUpperCase() }}
                </p>
              </div>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium transition cursor-pointer print:hidden"
                :title="isCopied ? 'Copied' : 'Copy Transaction ID'"
                @click="copyTransactionId"
              >
                <CheckIcon v-if="isCopied" class="size-3.5 text-emerald-600" />
                <CopyIcon v-else class="size-3.5 text-muted-foreground" />
                <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>

            <!-- Receipt Breakdown Table -->
            <div class="space-y-3 text-xs">
              <div class="flex justify-between text-muted-foreground">
                <span>Date & Time</span>
                <span class="text-foreground font-medium">
                  {{
                    transaction?.createdAt
                      ? format(
                          new Date(transaction.createdAt),
                          'dd MMM yyyy, HH:mm'
                        )
                      : 'Just now'
                  }}
                </span>
              </div>

              <div class="flex justify-between text-muted-foreground">
                <span>Payment Method</span>
                <span class="text-foreground font-medium">
                  Credit Card (Stripe)
                </span>
              </div>

              <div class="flex justify-between text-muted-foreground">
                <span>Billed To</span>
                <span
                  class="text-foreground font-medium text-right truncate max-w-[180px]"
                >
                  {{ customer?.name || customer?.email }}
                </span>
              </div>

              <Separator class="my-2" />

              <!-- Item row -->
              <div class="flex justify-between items-start">
                <div class="max-w-[200px]">
                  <p class="font-semibold text-foreground text-sm">
                    <template v-if="orderType === 'BOOKING'">
                      {{ booking?.offering?.name || 'Class Booking' }}
                    </template>
                    <template v-else-if="orderType === 'PASS'">
                      {{ pass?.pricingOption?.name || 'Pass Purchase' }}
                    </template>
                    <template v-else> Studio Service </template>
                  </p>
                  <p class="text-muted-foreground text-[11px]">Qty: 1</p>
                </div>
                <p class="font-semibold text-foreground text-sm">
                  {{ formatMoney(transaction?.amount, transaction?.currency) }}
                </p>
              </div>

              <Separator class="my-2" />

              <!-- Total Row -->
              <div class="flex justify-between items-center text-base pt-1">
                <span class="font-bold text-foreground">Total Paid</span>
                <span
                  class="font-extrabold text-foreground text-lg text-emerald-600 dark:text-emerald-400"
                >
                  {{ formatMoney(transaction?.amount, transaction?.currency) }}
                </span>
              </div>
            </div>

            <!-- Print Receipt Action -->
            <div class="pt-2 print:hidden">
              <button
                type="button"
                class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-border bg-background hover:bg-accent text-xs font-medium transition cursor-pointer"
                @click="printReceipt"
              >
                <PrinterIcon class="size-4 text-muted-foreground" />
                <span>Print or Save PDF Receipt</span>
              </button>
            </div>
          </div>

          <!-- Quick Actions & Navigation Box -->
          <div
            class="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3 print:hidden"
          >
            <h4
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
            >
              Next Steps
            </h4>

            <Button
              class="w-full justify-between h-11 text-sm font-semibold"
              @click="router.push('/profile/bookings')"
            >
              <span>View in My Bookings</span>
              <ArrowRightIcon class="size-4" />
            </Button>

            <Button
              v-if="studio?.slug"
              variant="outline"
              class="w-full justify-between h-11 text-sm font-medium"
              @click="router.push(`/studios/${studio.slug}`)"
            >
              <span>Back to Studio Page</span>
              <CompassIcon class="size-4" />
            </Button>

            <Button
              variant="ghost"
              class="w-full h-10 text-xs text-muted-foreground hover:text-foreground"
              @click="router.push('/')"
            >
              Return to Homepage
            </Button>
          </div>

          <!-- Support & Help Card -->
          <div
            class="p-4 rounded-xl bg-accent/20 border border-border text-xs text-muted-foreground space-y-1.5 print:hidden"
          >
            <p class="font-semibold text-foreground">
              Need help or wish to reschedule?
            </p>
            <p>
              You can manage or cancel your booking up to 12 hours before class
              in your
              <NuxtLink
                to="/profile/bookings"
                class="text-primary hover:underline font-medium"
                >My Bookings</NuxtLink
              >
              dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: #fff !important;
    color: #000 !important;
  }
  nav,
  header,
  footer,
  .print\:hidden {
    display: none !important;
  }
  #printable-receipt {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 600px !important;
    margin: 0 auto !important;
  }
}
</style>
