<script lang="ts" setup>
import {
  format,
  isSameDay,
  isWithinInterval,
  addDays,
  startOfWeek
} from 'date-fns'
import { toast } from 'vue-sonner'

type Slot = {
  id: string
  offeringId: string
  offeringName: string
  practitionerId: string
  practitionerName: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
}
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const selectedDate = ref(new Date())
const view = ref<'day' | 'week' | 'month'>('week')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const showBooking = ref(false)
const bookingSlot = ref<Slot | null>(null)
const search = ref('')
const clients = ref<
  { id: string; name: string; email: string; phone?: string }[]
>([])
const { data: slots, refresh } = await useFetch<Slot[]>(
  `/api/business/studios/${slug.value}/slots`
)
const { data: offeringsData } = await useFetch(
  `/api/business/studios/${slug.value}/offerings`
)
const { data: teamData } = await useFetch(
  `/api/business/studios/${slug.value}/members`
)
const form = reactive({
  offeringId: '',
  practitionerId: '',
  startTime: '',
  endTime: '',
  capacityOverride: ''
})
const visibleSlots = computed(() =>
  (slots.value || [])
    .filter(slot => {
      const date = new Date(slot.startTime)
      if (view.value === 'day') return isSameDay(date, selectedDate.value)
      if (view.value === 'month')
        return (
          date.getMonth() === selectedDate.value.getMonth() &&
          date.getFullYear() === selectedDate.value.getFullYear()
        )
      const weekStart = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
      return isWithinInterval(date, {
        start: weekStart,
        end: endOfWeek(selectedDate.value, { weekStartsOn: 1 })
      })
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
)

const openCreate = () => {
  editingId.value = null
  Object.assign(form, {
    offeringId: offeringsData.value?.offerings?.[0]?.id || '',
    practitionerId: teamData.value?.team?.[0]?.linkId || '',
    startTime: '',
    endTime: '',
    capacityOverride: ''
  })
  showForm.value = true
}
const openEdit = (slot: Slot) => {
  editingId.value = slot.id
  Object.assign(form, {
    offeringId: slot.offeringId,
    practitionerId: slot.practitionerId,
    startTime: toLocal(slot.startTime),
    endTime: toLocal(slot.endTime),
    capacityOverride: slot.capacity ? String(slot.capacity) : ''
  })
  showForm.value = true
}
const toLocal = (value: string) => {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
const saveSlot = async () => {
  try {
    const payload = {
      ...form,
      capacityOverride: form.capacityOverride
        ? Number(form.capacityOverride)
        : null
    }
    await $fetch(
      `/api/business/studios/${slug.value}/slots${editingId.value ? `/${editingId.value}` : ''}`,
      { method: editingId.value ? 'PATCH' : 'POST', body: payload }
    )
    showForm.value = false
    await refresh()
    toast.success('Schedule saved')
  } catch (error) {
    toast.error((error as Error).message || 'Unable to save slot')
  }
}
const findClients = async () => {
  if (search.value.length > 1)
    clients.value = await $fetch(
      `/api/business/studios/${slug.value}/clients`,
      { query: { search: search.value } }
    )
}
const bookClient = async (clientId: string) => {
  if (!bookingSlot.value) return
  try {
    await $fetch(`/api/business/studios/${slug.value}/bookings`, {
      method: 'POST',
      body: { slotId: bookingSlot.value.id, userId: clientId }
    })
    showBooking.value = false
    await refresh()
    toast.success('Client added to class')
  } catch (error) {
    toast.error((error as Error).message || 'Unable to add client')
  }
}
const moveDate = (amount: number) => {
  if (view.value === 'month') {
    selectedDate.value = addMonths(selectedDate.value, amount)
    return
  }
  selectedDate.value = addDays(
    selectedDate.value,
    view.value === 'week' ? amount * 7 : amount
  )
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Studio schedule</h1>
        <p class="text-sm text-muted-foreground">
          {{ format(selectedDate, 'MMMM yyyy') }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="moveDate(-1)">Previous</Button
        ><Button variant="outline" @click="selectedDate = new Date()"
          >Today</Button
        ><Button variant="outline" @click="moveDate(1)">Next</Button
        ><Button @click="openCreate">Add class</Button>
      </div>
    </div>
    <div class="flex gap-1 rounded-lg border p-1 w-fit">
      <Button
        v-for="item in ['day', 'week', 'month']"
        :key="item"
        size="sm"
        :variant="view === item ? 'default' : 'ghost'"
        @click="view = item as typeof view"
        >{{ item }}</Button
      >
    </div>
    <div class="space-y-3">
      <div
        v-if="!visibleSlots.length"
        class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
      >
        No classes in this period.
      </div>
      <div
        v-for="slot in visibleSlots"
        :key="slot.id"
        class="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4"
      >
        <div>
          <p class="font-medium">{{ slot.offeringName }}</p>
          <p class="text-sm text-muted-foreground">
            {{ format(new Date(slot.startTime), 'EEE, MMM d · HH:mm') }} -
            {{ format(new Date(slot.endTime), 'HH:mm') }} ·
            {{ slot.practitionerName }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground"
            >{{ slot.bookedCount }}/{{ slot.capacity || '∞' }}</span
          ><Button
            size="sm"
            variant="outline"
            @click="((bookingSlot = slot), (showBooking = true))"
            >Record client</Button
          ><Button size="sm" variant="ghost" @click="openEdit(slot)"
            >Edit</Button
          >
        </div>
      </div>
    </div>
    <div
      v-if="showForm"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    >
      <form
        class="w-full max-w-lg space-y-4 rounded-xl bg-background p-6 shadow-xl"
        @submit.prevent="saveSlot"
      >
        <h2 class="text-lg font-semibold">
          {{ editingId ? 'Edit class' : 'Add class' }}
        </h2>
        <label class="block text-sm"
          >Offering<select
            v-model="form.offeringId"
            class="mt-1 w-full rounded-md border bg-background p-2"
            required
          >
            <option
              v-for="item in offeringsData?.offerings || []"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select></label
        ><label class="block text-sm"
          >Practitioner<select
            v-model="form.practitionerId"
            class="mt-1 w-full rounded-md border bg-background p-2"
            required
          >
            <option
              v-for="item in teamData?.team || []"
              :key="item.linkId"
              :value="item.linkId"
            >
              {{ item.user.name }}
            </option>
          </select></label
        >
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm"
            >Starts<input
              v-model="form.startTime"
              type="datetime-local"
              class="mt-1 w-full rounded-md border bg-background p-2"
              required /></label
          ><label class="text-sm"
            >Ends<input
              v-model="form.endTime"
              type="datetime-local"
              class="mt-1 w-full rounded-md border bg-background p-2"
              required
          /></label>
        </div>
        <label class="block text-sm"
          >Capacity override<input
            v-model="form.capacityOverride"
            type="number"
            min="1"
            class="mt-1 w-full rounded-md border bg-background p-2"
            placeholder="Use offering capacity"
        /></label>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click="showForm = false"
            >Cancel</Button
          ><Button type="submit">Save</Button>
        </div>
      </form>
    </div>
    <div
      v-if="showBooking && bookingSlot"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    >
      <div
        class="w-full max-w-lg space-y-4 rounded-xl bg-background p-6 shadow-xl"
      >
        <h2 class="text-lg font-semibold">
          Record client for {{ bookingSlot.offeringName }}
        </h2>
        <div class="flex gap-2">
          <input
            v-model="search"
            class="min-w-0 flex-1 rounded-md border bg-background p-2"
            placeholder="Search by email, phone, or name"
            @keyup.enter="findClients"
          /><Button @click="findClients">Search</Button>
        </div>
        <div class="max-h-60 space-y-2 overflow-auto">
          <button
            v-for="client in clients"
            :key="client.id"
            class="block w-full rounded-md border p-3 text-left hover:bg-muted"
            @click="bookClient(client.id)"
          >
            <span class="font-medium">{{ client.name }}</span
            ><span class="ml-2 text-sm text-muted-foreground">{{
              client.email
            }}</span>
          </button>
        </div>
        <div class="flex justify-end">
          <Button variant="ghost" @click="showBooking = false">Close</Button>
        </div>
      </div>
    </div>
  </div>
</template>
