<script setup lang="ts">
import type { user as DrizzleUser } from '~~/server/db/schema/auth-schema'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  updateProfileSchema,
  type UpdateProfileInput
} from '~/entities/profile/schema'
import openUploadWidget from '~/shared/composables/useCloudinary'
import { userRoles } from '~~/server/auth/config'

definePageMeta({ title: 'Profile', breadcrumbs: [{ name: 'Profile' }] })
useHead({
  title: 'Profile',
  script: [
    { src: 'https://upload-widget.cloudinary.com/global/all.js', defer: true }
  ]
})

const {
  data: sessionData,
  pending,
  refresh
} = await useFetch<{ user: typeof DrizzleUser.$inferSelect }>(
  '/api/auth/get-session'
)
const user = computed(() => sessionData.value?.user)
const {
  isValidating,
  isSubmitting,
  values: formValues,
  handleSubmit
} = useForm({
  validationSchema: toTypedSchema(updateProfileSchema),
  initialValues: {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    bio: user.value?.bio || ''
  }
})
const isProcessing = ref(false)
const errorMsg = ref('')
const submitDisabled = computed(
  () => isProcessing.value || isValidating.value || isSubmitting.value
)

const saveProfile = async (values: UpdateProfileInput) => {
  errorMsg.value = ''
  isProcessing.value = true
  try {
    await $fetch('/api/account/profile', { method: 'PUT', body: values })
    await refresh()
    toast.success('Profile updated successfully!')
  } catch (error) {
    toast.error('Failed to update profile.', {
      description: (error as Error).message || 'Unknown error'
    })
  } finally {
    isProcessing.value = false
  }
}

const submitProfileUpdate = handleSubmit(saveProfile, () => {
  errorMsg.value = 'Please fix the validation errors before submitting.'
})

const uploadAvatar = () => {
  openUploadWidget(
    { multiple: false, cropping: true, isCamera: true, aspectRatio: 1 },
    async media => {
      try {
        await $fetch('/api/account/avatar', {
          method: 'POST',
          body: { url: media.url, providerPublicId: media.providerPublicId }
        })
        await refresh()
        toast.success('Avatar updated successfully!')
      } catch (error) {
        toast.error('Failed to upload avatar.', {
          description: (error as Error).message || 'Unknown error'
        })
      }
    }
  )
}
</script>

<template>
  <section class="space-y-8">
    <div>
      <p class="text-sm text-muted-foreground">Account</p>
      <h1 class="text-3xl font-semibold tracking-tight">Profile</h1>
    </div>
    <div v-if="pending" class="text-muted-foreground">Loading profile...</div>
    <template v-else>
      <div class="flex items-center gap-4">
        <Avatar class="size-20 text-3xl"
          ><AvatarImage
            :src="
              user?.image?.replace(
                '/upload/',
                '/upload/w_100,h_100,c_thumb,g_custom/'
              ) || placeholderImageUrl
            "
            alt="Avatar"
            class="object-cover"
          /><AvatarFallback>{{ formValues.name?.[0] }}</AvatarFallback></Avatar
        >
        <Button type="button" @click="uploadAvatar">Change photo</Button>
      </div>
      <div
        v-if="user?.role?.some(role => role !== userRoles.USER)"
        class="flex flex-wrap gap-1"
      >
        <Badge
          v-for="role in user.role.filter(role => role !== userRoles.USER)"
          :key="role"
          >{{ role }}</Badge
        >
      </div>
      <form class="max-w-2xl space-y-6" @submit.prevent="submitProfileUpdate">
        <FormField v-slot="{ componentField }" name="name"
          ><FormItem
            ><FormLabel>Name</FormLabel
            ><FormControl
              ><Input
                v-bind="componentField"
                autocomplete="name" /></FormControl
            ><FormMessage /></FormItem
        ></FormField>
        <FormField v-slot="{ componentField }" name="email"
          ><FormItem
            ><FormLabel>Email</FormLabel
            ><FormControl
              ><Input
                v-bind="componentField"
                type="email"
                autocomplete="email" /></FormControl
            ><FormMessage /></FormItem
        ></FormField>
        <FormField v-slot="{ componentField }" name="phone"
          ><FormItem
            ><FormLabel>Phone</FormLabel
            ><FormControl
              ><Input
                v-bind="componentField"
                type="tel"
                autocomplete="tel"
                placeholder="+1 555 000 0000" /></FormControl
            ><FormMessage /></FormItem
        ></FormField>
        <FormField v-slot="{ componentField }" name="bio"
          ><FormItem
            ><FormLabel>About</FormLabel
            ><FormControl
              ><Textarea v-bind="componentField" rows="4" /></FormControl
            ><FormMessage /></FormItem
        ></FormField>
        <Button type="submit" :disabled="submitDisabled"
          ><Spinner v-if="submitDisabled" />{{
            isSubmitting || isProcessing ? 'Updating...' : 'Save changes'
          }}</Button
        >
        <p v-if="errorMsg" class="text-sm text-destructive">{{ errorMsg }}</p>
      </form>
      <div class="flex flex-wrap gap-3">
        <Button variant="outline" as-child
          ><NuxtLink to="/my-bookings">View my bookings</NuxtLink></Button
        ><Button variant="outline" as-child
          ><NuxtLink to="/profile/agreements">View agreements</NuxtLink></Button
        >
      </div>
    </template>
  </section>
</template>
