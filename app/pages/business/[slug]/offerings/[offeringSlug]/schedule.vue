<script setup lang="ts">
import { Trash2Icon } from '@lucide/vue'
import { format } from 'date-fns'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import { offeringSlotStatus } from '~/entities/offering/schema'
import type { updateSlotsSchemaInput } from '~/entities/slots/schema'

useHead({
  title: 'Schedule Management'
})
definePageMeta({
  title: 'Schedule Management',
  breadcrumbs: [
    { name: 'Business', url: '/business' },
    { name: 'Schedule Management' }
  ]
})
const route = useRoute()
const slug = route.params.slug as string
const offeringSlug = route.params.offeringSlug as string

// Form state for generating slots
const form = ref({
  startDate: '',
  endDate: '',
  rules: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', practitionerId: '' }
  ]
})

// Add new day rule to the generator
const addRule = () => {
  form.value.rules.push({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    practitionerId: ''
  })
}

// Generate slots via API
const generateSlots = async () => {
  try {
    await $fetch(
      `/api/business/studios/${slug}/offerings/${offeringSlug}/slots/generate`,
      {
        method: 'POST',
        body: form.value
      }
    )
    toast.success('Slots generated successfully!')
    // Here we would typically refresh a list/calendar of existing slots below
  } catch (err) {
    toast.error('Generation failed', {
      description: (err as Error).message || 'Unknown error.'
    })
  }
}

const { data: offeringsSlots } = await useFetch(
  `/api/business/studios/${slug}/offerings/${offeringSlug}/slots`
)
const rawSlots = computed(() => offeringsSlots.value?.slots || [])

const { data: offeringPractitioners } = await useFetch(
  `/api/business/studios/${slug}/offerings/${offeringSlug}/practitioners`
)
const practitioners = computed(
  () => offeringPractitioners.value?.practitioners || []
)
const practitionerById = computed(
  () => new Map(practitioners.value.map(p => [p.practitionerId, p]))
)

const updateSlot = async (slot: updateSlotsSchemaInput) => {
  try {
    await $fetch(
      `/api/business/studios/${slug}/offerings/${offeringSlug}/slots`,
      {
        method: 'PATCH',
        body: {
          id: slot.id,
          practitionerId: slot.practitionerId,
          status: slot.status
        }
      }
    )
    toast.success('Slot updated successfully!')
  } catch (err) {
    toast.error('Update failed', {
      description: (err as Error)?.message || 'Unknown error.'
    })
  }
}

const groupedSlots = ref(
  {} as Record<
    string,
    Array<{
      id: string
      startTime: string
      endTime: string
      practitionerId: string
      status: (typeof offeringSlotStatus)[keyof typeof offeringSlotStatus]
    }>
  >
)
const groupSlots = () => {
  groupedSlots.value = rawSlots.value.reduce((acc, slot) => {
    // Format UTC to Local string representation for grouping (e.g., 'June 15, 2026')
    const dateKey = format(new Date(slot.startTime), 'MMMM d, yyyy')

    // @ts-expect-error: We know the structure of the slot object and that practitioner is included
    if (!acc[dateKey]) acc[dateKey] = []
    // @ts-expect-error: We know the structure of the slot object and that practitioner is included
    acc[dateKey].push({
      ...slot,
      startTime: format(new Date(slot.startTime), 'HH:mm'), // Format for time input
      endTime: format(new Date(slot.endTime), 'HH:mm'), // Format for time input
      practitionerId:
        slot.practitioner?.id ??
        // keep compatibility if API includes flat practitionerId
        (slot as { practitionerId?: string }).practitionerId ??
        '' // Assuming practitioner object has an id field
    })
    return acc
  }, {})
}
groupSlots()
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <h1 class="text-2xl font-bold">Schedule Management</h1>

    <div class="p-6 bg-white/10 border rounded-xl shadow-sm">
      <h2 class="text-lg font-semibold mb-4">Generate Recurring Slots</h2>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-1">Start Date</label>
          <Input v-model="form.startDate" type="date" class="text-sm w-70" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">End Date</label>

          <Input v-model="form.endDate" type="date" class="text-sm w-70" />
        </div>
      </div>

      <div class="space-y-4 mb-6">
        <h3 class="text-sm font-medium text-gray-200">Weekly Rules</h3>
        <div
          v-for="(rule, index) in form.rules"
          :key="index"
          class="flex gap-2 items-center bg-white/10 p-3 rounded-xl justify-start"
        >
          <NativeSelect v-model="rule.dayOfWeek" class="w-32.5">
            <NativeSelectOption :value="1"> Monday </NativeSelectOption>
            <NativeSelectOption :value="2"> Tuesday </NativeSelectOption>
            <NativeSelectOption :value="3"> Wednesday </NativeSelectOption>
            <NativeSelectOption :value="4"> Thursday </NativeSelectOption>
            <NativeSelectOption :value="5"> Friday </NativeSelectOption>
            <NativeSelectOption :value="6"> Saturday </NativeSelectOption>
            <NativeSelectOption :value="0"> Sunday </NativeSelectOption>
          </NativeSelect>

          <Input v-model="rule.startTime" type="time" class="text-sm w-30" />
          <span class="text-gray-500">-</span>
          <Input v-model="rule.endTime" type="time" class="text-sm w-30" />

          <Select v-model="rule.practitionerId">
            <SelectTrigger class="grow">
              <div class="flex items-center gap-3">
                <NuxtImg
                  v-if="practitionerById.get(rule.practitionerId)"
                  :src="
                    practitionerById
                      .get(rule.practitionerId)
                      ?.avatar?.replace(
                        '/upload/',
                        '/upload/w_48,h_48,c_fill/'
                      ) || placeholderImageUrl
                  "
                  class="w-6 h-6 rounded-full"
                />
                <span>{{
                  practitionerById.get(rule.practitionerId)?.name ||
                  'Select practitioner'
                }}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="practitioner in practitioners"
                :key="practitioner.practitionerId"
                :value="practitioner.practitionerId"
              >
                {{ practitioner.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            v-if="form.rules.length > 1"
            class="text-red-700 text-sm"
            variant="ghost"
            @click="form.rules.splice(index, 1)"
          >
            <Trash2Icon />
          </Button>
        </div>
        <Button @click="addRule"> + Add Rule </Button>
      </div>

      <Button class="w-full" @click="generateSlots"> Generate Slots </Button>
    </div>

    <div
      v-if="Object.keys(groupedSlots).length"
      class="p-6 bg-white/10 border rounded-xl shadow-sm"
    >
      <h2 class="text-lg font-semibold mb-4">Edit Slots</h2>
      <div class="flex flex-col gap-4">
        <div
          v-for="(slots, date) in groupedSlots"
          :key="date"
          class="flex flex-col gap-2"
        >
          <h3 class="font-medium">{{ date }}</h3>
          <div v-for="slot in slots" :key="slot.id" class="flex gap-2">
            <Input
              :value="slot.startTime"
              :default-value="slot.startTime"
              type="time"
              disabled
              class="scheme-dark"
            />
            <Input
              :value="slot.endTime"
              :default-value="slot.endTime"
              type="time"
              disabled
            />
            <!-- <Input v-model="slot.practitionerId" /> -->

            <Select v-model="slot.practitionerId">
              <SelectTrigger class="w-full">
                <!-- <SelectValue placeholder="Select location" /> -->
                <NuxtImg
                  :src="
                    practitionerById
                      .get(slot.practitionerId)
                      ?.avatar?.replace(
                        '/upload/',
                        '/upload/w_48,h_48,c_fill/'
                      ) || placeholderImageUrl
                  "
                  class="w-6 h-6 rounded-full"
                />
                <span>{{
                  practitionerById.get(slot.practitionerId)?.name || 'Not found'
                }}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="practitioner in practitioners"
                  :key="practitioner.practitionerId"
                  :value="practitioner.practitionerId"
                >
                  {{ practitioner.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="slot.status" class="w-40">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectItem
                  v-for="status in [
                    offeringSlotStatus.ACTIVE,
                    offeringSlotStatus.COMPLETED,
                    offeringSlotStatus.CANCELLED
                  ]"
                  :key="status"
                  :value="status"
                  class="capitalize"
                >
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              @click="
                updateSlot({
                  id: slot.id,
                  practitionerId: slot.practitionerId,
                  status:
                    slot.status as (typeof offeringSlotStatus)[keyof typeof offeringSlotStatus]
                })
              "
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
