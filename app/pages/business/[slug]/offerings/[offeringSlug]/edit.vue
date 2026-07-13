<script setup lang="ts">
import { PlusIcon, Trash2Icon, XIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import {
  ActivityType,
  updateOfferingSchema,
  type CreateOfferingInput
} from '~/entities/offering/schema'
import openUploadWidget from '~/shared/composables/useCloudinary'

definePageMeta({
  title: 'Edit Offering',
  breadcrumbs: [
    { name: 'Business', url: `/business` },
    { name: 'Edit Offering' }
  ]
})

useHead({
  title: 'Edit Offering',
  script: [
    {
      src: 'https://upload-widget.cloudinary.com/global/all.js',
      defer: true
    }
  ]
})

const route = useRoute()
const slug = route.params.slug as string
const offeringSlug = route.params.offeringSlug as string

const { data: contextData, pending: contextPending } = await useFetch(
  `/api/business/studios/${slug}/offering-context`
)
const {
  data: offerData,
  pending: offerPending,
  error: offerError
} = await useFetch(`/api/business/studios/${slug}/offerings/${offeringSlug}`)

if (offerError.value) {
  toast.error('Failed to load offering data. Please try again.', {
    description: offerError.value.message || 'Unknown error.'
  })
  navigateTo(`/business/${slug}/offerings`)
}

const offering = computed(() => offerData.value?.offering)
const tickets = computed(() => offerData.value?.tickets)
const pending = computed(() => contextPending.value || offerPending.value)

const offeringSchema = toTypedSchema(updateOfferingSchema)

const {
  isValidating,
  isSubmitting,
  values: formValues,
  handleSubmit,
  setFieldValue
} = useForm({
  validationSchema: offeringSchema,
  initialValues: {
    name: '',
    description: '',
    activityType: ActivityType.CLASS,
    gallery: [],
    isPrivate: false,
    locationId: null as string | null,
    timezone: guessUserTimezone(),
    duration: 60 as number,
    capacity: null as number | null,
    practitionerIds: [],
    tickets: [
      {
        id: '',
        name: 'Drop-in',
        price: 0,
        description: ''
      }
    ]
  }
})

const { fields, push, remove } = useFieldArray('tickets')

const valuesInitialized = ref(false)
watch(
  () => offering.value,
  value => {
    if (value && !valuesInitialized.value) {
      setFieldValue('name', value.name)
      setFieldValue('description', value.description || '')
      setFieldValue('activityType', value.activityType)
      setFieldValue('gallery', value.gallery || [])
      setFieldValue('isPrivate', value.isPrivate)
      setFieldValue('locationId', value.locationId)
      setFieldValue('timezone', value.timezone)
      setFieldValue('duration', value.duration)
      setFieldValue('capacity', value.capacity)
      setFieldValue(
        'tickets',
        tickets.value?.map(ticket => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          description: ticket.description || ''
        })) || []
      )
      setFieldValue('practitionerIds', value.practitionerIds || [])
      valuesInitialized.value = true
    }
  },
  { immediate: true }
)

const errorMsg = ref('')
const isProcessing = ref(false)
const submitDisabled = computed(
  () => isProcessing.value || isValidating.value || isSubmitting.value
)

const updateOffering = async (values: CreateOfferingInput) => {
  errorMsg.value = ''
  isProcessing.value = true

  try {
    const response = await $fetch(
      `/api/business/studios/${slug}/offerings/${offeringSlug}`,
      {
        method: 'PUT',
        body: values
      }
    )

    if (response.offering) {
      toast.success('Offering updated successfully!')
      navigateTo(`/business/${slug}`)
    }
  } catch (error) {
    toast.error('Failed to update offering. Please try again', {
      description: (error as Error).message || 'Unknown error.'
    })
  } finally {
    isProcessing.value = false
  }
}

const submitOffering = handleSubmit(updateOffering, ({ errors }) => {
  console.log('Validation errors:', errors)
  const firstError = Object.keys(errors)[0]
  toast.error(`Please fix the field: ${firstError}`, {
    description: firstError || 'Unknown error.'
  })
})
function togglePractitioner(id: string) {
  const currentIds = [...(formValues.practitionerIds || [])]
  const index = currentIds.indexOf(id)

  if (index > -1) {
    currentIds.splice(index, 1)
  } else {
    currentIds.push(id)
  }

  setFieldValue('practitionerIds', currentIds)
}

const uploadGallery = () => {
  openUploadWidget({ multiple: true, cropping: false }, media => {
    setFieldValue('gallery', [...(formValues.gallery || []), media])
  })
}

const removeFromGallery = (index: number) => {
  setFieldValue(
    'gallery',
    formValues.gallery?.filter((_, i) => i !== index) || []
  )
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-6">
      <NuxtImg
        :src="
          offering?.studio?.logo?.replace(
            '/upload/',
            '/upload/w_180,h_180,c_fill/'
          ) || placeholderImageUrl
        "
        class="w-20 h-20 rounded-full object-cover border"
      />
      <div>
        <h1 class="text-2xl font-bold">Edit Offering</h1>
        <p class="text-sm text-muted-foreground">
          {{ offering?.studio?.name }} · {{ offering?.name }}
        </p>
      </div>
    </div>

    <div>
      <div v-if="pending" class="py-10 text-center">Loading data...</div>

      <form v-else class="space-y-6" @submit.prevent="submitOffering">
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem class="col-span-2">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Example: Morning Yoga"
                  v-bind="componentField"
                  autocomplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem class="col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Offering description"
                  v-bind="componentField"
                  autocomplete="off"
                  class="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="col-span-2 mb-6">
            <h2 class="text-lg font-semibold border-b pb-2 mb-4">Gallery</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div
                v-for="(image, index) in formValues.gallery"
                :key="index"
                class="relative"
              >
                <NuxtImg
                  :src="
                    image.url?.replace(
                      '/upload/',
                      '/upload/w_600,h_400,c_fill/'
                    ) || placeholderImageUrl
                  "
                  class="w-full aspect-video rounded-2xl object-cover border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  @click="removeFromGallery(index)"
                >
                  <XIcon class="w-4 h-4" />
                </Button>
              </div>
              <NuxtImg
                v-if="!formValues.gallery?.length"
                :src="placeholderImageUrl"
                class="h-40 aspect-video rounded-2xl object-cover border"
              />
            </div>
            <Button type="button" @click="uploadGallery">
              <PlusIcon class="size-4" /> Upload Images
            </Button>
          </div>

          <FormField v-slot="{ componentField }" name="activityType">
            <FormItem>
              <FormLabel>Activity Type</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectGroup>
                      <SelectLabel>Activity Types</SelectLabel>
                      <SelectItem
                        v-for="activityType in ActivityType"
                        :key="activityType"
                        :value="activityType"
                      >
                        {{ activityType }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="duration">
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Offering duration"
                  v-bind="componentField"
                  autocomplete="off"
                  :min="5"
                  :step="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="locationId">
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    <SelectItem :value="null"> Online (Zoom/Meet) </SelectItem>
                    <SelectGroup>
                      <SelectLabel>Locations</SelectLabel>
                      <SelectItem
                        v-for="location in contextData?.studio.locations"
                        :key="location.id"
                        :value="location.id"
                      >
                        {{ location.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="capacity">
            <FormItem>
              <FormLabel>Capacity (people)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Leave empty for unlimited"
                  v-bind="componentField"
                  autocomplete="off"
                  type="number"
                  :min="0"
                  :step="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField, setValue }" name="isPrivate">
            <FormItem>
              <FormLabel>Is Private</FormLabel>
              <FormControl>
                <Checkbox
                  :model-value="componentField.modelValue"
                  @update:model-value="setValue"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Card class="bg-transparent border-0 shadow-none col-span-2">
            <CardHeader class="px-0">
              <CardTitle>Tickets (drop-in)</CardTitle>
              <CardDescription
                >Create single-use tickets for this class (for example:
                Standard, Student, VIP)</CardDescription
              >
            </CardHeader>
            <CardContent class="p-0">
              <ItemGroup>
                <template v-for="(field, idx) in fields" :key="field.key">
                  <Item class="px-0">
                    <div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 w-full">
                      <FormField
                        v-slot="{ componentField }"
                        :name="`tickets[${idx}].name`"
                      >
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Title"
                              v-bind="componentField"
                              autocomplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField
                        v-slot="{ componentField }"
                        :name="`tickets[${idx}].description`"
                      >
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Description"
                              v-bind="componentField"
                              autocomplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField
                        v-slot="{ errorMessage, componentField }"
                        :name="`tickets[${idx}].price`"
                      >
                        <FormItem>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <InputGroupText>$</InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput
                                v-bind="componentField"
                                :aria-invalid="!!errorMessage"
                                placeholder="0.00"
                                type="number"
                                step="any"
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupText>USD</InputGroupText>
                              </InputGroupAddon>
                            </InputGroup>
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
                  </Item>
                  <ItemSeparator v-if="idx < fields.length - 1" />
                </template>
              </ItemGroup>
              <Button
                type="button"
                variant="outline"
                class="w-fit mt-2"
                @click="push({ id: '', name: '', description: '', price: 0 })"
              >
                + Add Ticket
              </Button>
            </CardContent>
          </Card>

          <div class="col-span-2">
            <FormField name="practitionerIds">
              <FormItem class="flex flex-col gap-2">
                <div class="mb-2">
                  <FormLabel class="text-base">Practitioners</FormLabel>
                  <FormDescription>
                    Choose at least one practitioner
                  </FormDescription>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="prac in contextData?.studio.practitioners"
                    :key="prac.id"
                    class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-white/5"
                    @click="togglePractitioner(prac.id)"
                  >
                    <FormControl>
                      <Checkbox
                        class="m-0"
                        :model-value="
                          formValues.practitionerIds?.includes(prac.id)
                        "
                        @click.stop
                        @update:checked="() => togglePractitioner(prac.id)"
                      />
                    </FormControl>

                    <NuxtImg
                      :src="
                        prac.avatar?.replace(
                          '/upload/',
                          '/upload/w_44,h_44,c_thumb,g_custom/'
                        ) || placeholderImageUrl
                      "
                      class="w-6 h-6 rounded-full m-0"
                    />
                    <span class="text-sm font-medium">{{ prac.name }}</span>
                  </div>
                </div>

                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>

        <div class="pt-6 border-t flex justify-end">
          <Button type="submit" :disabled="submitDisabled">
            <Spinner v-if="submitDisabled" />
            {{
              isSubmitting
                ? 'Submitting...'
                : isValidating
                  ? 'Validating...'
                  : isProcessing
                    ? 'Updating...'
                    : 'Update offering'
            }}
          </Button>
        </div>

        <p v-if="errorMsg" class="mt-4 text-sm text-destructive">
          {{ errorMsg }}
        </p>
      </form>
    </div>
  </div>
</template>
