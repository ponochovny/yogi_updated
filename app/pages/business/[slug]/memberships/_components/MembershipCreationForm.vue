<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import {
  createMembershipSchema,
  priceOptionsType,
  type CreateMembershipInput
} from '~/entities/membership/schema'

const props = defineProps<{
  studioSlug: string
}>()

const { data: paramsData } = await useFetch('/api/params', {
  method: 'GET'
})

const categories = computed(() => paramsData.value?.params.categories || [])

const {
  // isValidating,
  // isSubmitting,
  // values: formValues,
  handleSubmit
  // setFieldValue,
} = useForm({
  validationSchema: toTypedSchema(createMembershipSchema),
  initialValues: {
    name: '',
    description: '',
    type: priceOptionsType.DROP_IN,
    price: 0,
    credits: 0,
    durationDays: 1,
    isActive: true,
    applicableCategoryIds: []
  }
})

const submit = handleSubmit(async values => createMembership(values))

const createMembership = async (values: CreateMembershipInput) => {
  // errorMsg.value = ''
  // isProcessing.value = true

  try {
    const response = await $fetch(
      `/api/business/studios/${props.studioSlug}/memberships`,
      {
        method: 'POST',
        body: values
      }
    )

    if (response.membership) {
      toast.success('Membership created successfully!')
      // navigateTo(`/business/${props.studioSlug}`)
    }
  } catch (error) {
    toast.error('Failed to create membership. Please try again', {
      description: (error as Error).message || 'Unknown error.'
    })
  }
}
</script>

<template>
  <div>
    <form class="space-y-6" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-4">
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
            <FormLabel>Credits (leave blank for unlimited)</FormLabel>
            <FormControl>
              <Input
                placeholder="Example: 10"
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
      <Button type="submit" class="w-full">Create Membership</Button>
    </form>
  </div>
</template>
