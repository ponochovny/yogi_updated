<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  createMembershipSchema,
  expiryRuleType,
  priceOptionsType,
  type CreateMembershipInput,
  type MembershipItemBusiness
} from '~/entities/membership/schema'

const props = defineProps<{
  studioSlug: string
  membership?: MembershipItemBusiness | null
}>()

const emit = defineEmits<{
  (e: 'membershipSaved'): void
}>()

const { data: paramsData } = await useFetch('/api/params', {
  method: 'GET'
})

const categories = computed(() => paramsData.value?.params.categories || [])

const { isSubmitting, handleSubmit, resetForm, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(createMembershipSchema),
    initialValues: {
      name: '',
      description: '',
      type: priceOptionsType.MEMBERSHIP,
      price: 0,
      credits: 0,
      durationDays: 1,
      expiryRule: expiryRuleType.DURATION,
      expiryBufferDays: 0,
      maxBookingsPerDay: null,
      isActive: true,
      applicableCategoryIds: []
    }
  })

watch(
  () => props.membership,
  membership => {
    if (membership) {
      resetForm({
        values: {
          ...membership,
          price: membership.price / 100,
          description: membership.description || '',
          applicableCategoryIds: membership.applicableCategoryIds || []
        }
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => values.type,
  newType => {
    if (newType === priceOptionsType.DROP_IN) {
      setFieldValue('credits', 1)
    } else if (newType === priceOptionsType.MEMBERSHIP) {
      setFieldValue('credits', 0)
    }
  }
)

const saveMembership = async (values: CreateMembershipInput) => {
  try {
    const response = await $fetch(
      `/api/business/studios/${props.studioSlug}/memberships${props.membership ? `/${props.membership.id}` : ''}`,
      {
        method: props.membership ? 'PATCH' : 'POST',
        body: values
      }
    )

    if (response.memberships?.length) {
      toast.success(
        props.membership
          ? 'Membership updated successfully!'
          : 'Membership created successfully!'
      )
      resetForm()
      emit('membershipSaved')
    }
  } catch (error) {
    toast.error('Failed to save membership. Please try again', {
      description: (error as Error).message || 'Unknown error.'
    })
  }
}
const submit = handleSubmit(saveMembership)
</script>

<template>
  <div>
    <form class="space-y-6" @submit.prevent="submit">
      <div class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem class="col-span-2">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Example: Unlimited Monthly Membership"
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
                placeholder="Example: A monthly membership with unlimited access to all classes."
                v-bind="componentField"
                autocomplete="off"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="type">
          <FormItem class="col-span-2">
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger>
                  <SelectValue placeholder="Select membership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="priceOptionsType.DROP_IN">
                    Drop-in
                  </SelectItem>
                  <SelectItem :value="priceOptionsType.PACK">
                    Class Pack
                  </SelectItem>
                  <SelectItem :value="priceOptionsType.MEMBERSHIP">
                    Membership
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="price">
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input
                placeholder="Example: $29.99"
                v-bind="componentField"
                autocomplete="off"
                type="number"
                step="0.01"
                min="0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="credits">
          <FormItem>
            <FormLabel>Credits</FormLabel>
            <FormControl>
              <Input
                placeholder="Example: 10"
                v-bind="componentField"
                autocomplete="off"
                type="number"
                step="0.01"
                min="0"
                :disabled="
                  values.type === priceOptionsType.MEMBERSHIP ||
                  values.type === priceOptionsType.DROP_IN
                "
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="durationDays">
          <FormItem>
            <FormLabel>Duration (Days)</FormLabel>
            <FormControl>
              <Input
                placeholder="Example: 10"
                v-bind="componentField"
                autocomplete="off"
                type="number"
                step="1"
                min="1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="expiryRule">
          <FormItem>
            <FormLabel>Expiry rule</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger
                  ><SelectValue placeholder="Select expiry rule"
                /></SelectTrigger>
                <SelectContent>
                  <SelectItem :value="expiryRuleType.DURATION"
                    >After duration</SelectItem
                  >
                  <SelectItem :value="expiryRuleType.END_OF_YEAR"
                    >Until end of year</SelectItem
                  >
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="expiryBufferDays">
          <FormItem>
            <FormLabel>Year-end buffer (days)</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="number"
                min="0"
                max="31"
                :disabled="values.expiryRule !== expiryRuleType.END_OF_YEAR"
              />
            </FormControl>
            <FormDescription
              >Extra days for passes purchased in November or
              December.</FormDescription
            >
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="maxBookingsPerDay">
          <FormItem>
            <FormLabel>Max bookings per day</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="number"
                min="1"
                placeholder="Unlimited"
              />
            </FormControl>
            <FormDescription
              >Leave empty for unlimited bookings.</FormDescription
            >
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="applicableCategoryIds">
          <FormItem>
            <FormLabel>Categories</FormLabel>
            <FormControl>
              <Select v-bind="componentField" multiple>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select categories" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem
                      v-for="cat in categories"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField, setValue }" name="isActive">
          <FormItem class="col-span-2">
            <FormLabel>Is Active</FormLabel>
            <FormControl>
              <Switch
                :model-value="componentField.modelValue"
                @update:model-value="setValue"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" class="animate-spin" />
        {{ props.membership ? 'Save Changes' : 'Create Membership' }}
      </Button>
    </form>
  </div>
</template>
