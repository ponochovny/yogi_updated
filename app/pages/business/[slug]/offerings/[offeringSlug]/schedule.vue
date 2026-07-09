<script setup lang="ts">
import { Trash2Icon } from '@lucide/vue'
import { format } from 'date-fns'
import { useFieldArray, useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import { offeringSlotStatus } from '~/entities/offering/schema'
import type { updateSlotsSchemaInput } from '~/entities/slots/schema'
import {
  scheduleSchema,
  type UpdateScheduleInput
} from '~/entities/schedule/schema'
import { toTypedSchema } from '@vee-validate/zod'

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

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(scheduleSchema),
  initialValues: {
    startDate: '',
    endDate: '',
    rules: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', practitionerId: '' }
    ]
  }
})

const { fields, push, remove } = useFieldArray('rules')

// Generate slots via API
const generateSlots = async (values: UpdateScheduleInput) => {
  try {
    await $fetch(
      `/api/business/studios/${slug}/offerings/${offeringSlug}/slots/generate`,
      {
        method: 'POST',
        body: values
      }
    )
    toast.success('Slots generated successfully!')
    refreshOfferingsSlots()
  } catch (err) {
    toast.error('Generation failed', {
      description:
        (err as { data?: { message?: string } }).data?.message ||
        'Unknown error.'
    })
  }
}

const submitRules = handleSubmit(generateSlots)

const { data: offeringsSlots, refresh: refreshOfferingsSlots } = await useFetch(
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
      description:
        (err as { data?: { message?: string } }).data?.message ||
        'Unknown error.'
    })
  }
}

const groupedSlots = computed<
  Record<
    string,
    Array<{
      id: string
      startTime: string
      endTime: string
      practitionerId: string
      status: (typeof offeringSlotStatus)[keyof typeof offeringSlotStatus]
    }>
  >
>(() => {
  return rawSlots.value.reduce<
    Record<
      string,
      Array<{
        id: string
        startTime: string
        endTime: string
        practitionerId: string
        status: (typeof offeringSlotStatus)[keyof typeof offeringSlotStatus]
      }>
    >
  >((acc, slot) => {
    // Format UTC to Local string representation for grouping (e.g., 'June 15, 2026')
    const dateKey = format(new Date(slot.startTime), 'MMMM d, yyyy')

    if (!acc[dateKey]) acc[dateKey] = []
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
})
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <h1 class="text-2xl font-bold">Schedule Management</h1>

    <form
      class="p-6 bg-white/10 border rounded-xl shadow-sm space-y-6"
      @submit.prevent="submitRules"
    >
      <h2 class="text-lg font-semibold mb-4">Generate Recurring Slots</h2>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <FormField v-slot="{ value, setValue }" name="startDate">
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  :model-value="value"
                  @update:model-value="setValue"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <div>
          <FormField v-slot="{ value, setValue }" name="endDate">
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  :model-value="value"
                  @update:model-value="setValue"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <div class="space-y-4 mb-6">
        <!-- RULES -->
        <div class="flex flex-col gap-4 col-span-2">
          <div class="mb-2">
            <label
              class="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >Weekly Rules</label
            >
            <p class="text-[0.8rem] text-muted-foreground mt-2">
              Define the recurring schedule for this offering. Each rule
              specifies a day of the week, start and end time, and the
              practitioner assigned to that slot.
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="(field, idx) in fields"
              :key="field.key"
              class="flex flex-col gap-3 p-4 border rounded-lg bg-white/5 hover:bg-white/10 relative"
            >
              <div
                class="grid grid-cols-[130px_120px_120px_1fr_auto] gap-2 w-full mt-2"
              >
                <FormField
                  v-slot="{ setValue, value }"
                  :name="`rules[${idx}].dayOfWeek`"
                >
                  <FormItem>
                    <FormControl>
                      <NativeSelect
                        class="w-32.5"
                        :model-value="value"
                        @update:model-value="setValue"
                      >
                        <NativeSelectOption :value="1">
                          Monday
                        </NativeSelectOption>
                        <NativeSelectOption :value="2">
                          Tuesday
                        </NativeSelectOption>
                        <NativeSelectOption :value="3">
                          Wednesday
                        </NativeSelectOption>
                        <NativeSelectOption :value="4">
                          Thursday
                        </NativeSelectOption>
                        <NativeSelectOption :value="5">
                          Friday
                        </NativeSelectOption>
                        <NativeSelectOption :value="6">
                          Saturday
                        </NativeSelectOption>
                        <NativeSelectOption :value="0">
                          Sunday
                        </NativeSelectOption>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ value, setValue }"
                  :name="`rules[${idx}].startTime`"
                >
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        :model-value="value"
                        class="text-sm w-30"
                        @update:model-value="setValue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ value, setValue }"
                  :name="`rules[${idx}].endTime`"
                >
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        :model-value="value"
                        class="text-sm w-30"
                        @update:model-value="setValue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  v-slot="{ value, setValue }"
                  :name="`rules[${idx}].practitionerId`"
                >
                  <FormItem>
                    <FormControl>
                      <Select
                        :model-value="value"
                        @update:model-value="setValue"
                      >
                        <SelectTrigger class="w-full">
                          <div class="flex items-center gap-3">
                            <NuxtImg
                              v-if="practitionerById.get(value)"
                              :src="
                                practitionerById
                                  .get(value)
                                  ?.avatar?.replace(
                                    '/upload/',
                                    '/upload/w_48,h_48,c_fill/'
                                  ) || placeholderImageUrl
                              "
                              class="w-6 h-6 rounded-full"
                            />
                            <span>
                              {{
                                practitionerById.get(value)?.name ||
                                'Select practitioner'
                              }}
                            </span>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <Button
                  v-if="fields.length > 1"
                  type="button"
                  class="text-red-700 text-sm w-fit"
                  variant="ghost"
                  @click="remove(idx)"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="button"
            class="w-fit"
            @click="
              push({
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
                practitionerId: ''
              })
            "
          >
            + Add Rule
          </Button>
        </div>
      </div>

      <Button class="w-full" type="submit"> Generate Slots </Button>
    </form>

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
