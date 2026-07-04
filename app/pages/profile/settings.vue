<script setup lang="ts">
import type { user as DrizzleUser } from '~~/server/db/schema/auth-schema'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import { useForm } from 'vee-validate'
import {
  updateProfileSchema,
  type UpdateProfileInput
} from '~/entities/profile/schema'
import { toTypedSchema } from '@vee-validate/zod'
import openUploadWidget from '~/shared/composables/useCloudinary'
import { userRoles } from '~~/server/auth/config'

useHead({
  title: 'Profile settings',
  script: [
    {
      src: 'https://upload-widget.cloudinary.com/global/all.js',
      defer: true
    }
  ]
})
definePageMeta({
  title: 'Profile settings',
  breadcrumbs: [{ name: 'Profile settings' }]
})

const { data: sessionData, refresh } = await useFetch<{
  user: typeof DrizzleUser.$inferSelect
}>('/api/auth/get-session')
const user = computed(() => sessionData.value?.user)

const profileSchema = toTypedSchema(updateProfileSchema)

const {
  isValidating,
  isSubmitting,
  values: formValues,
  handleSubmit
} = useForm({
  validationSchema: profileSchema,
  initialValues: {
    name: sessionData.value?.user?.name || '',
    bio: sessionData.value?.user?.bio || ''
  }
})
const errorMsg = ref('')
const isProcessing = ref(false)
const submitDisabled = computed(
  () => isProcessing.value || isValidating.value || isSubmitting.value
)

const saveProfile = async (values: UpdateProfileInput) => {
  errorMsg.value = ''
  isProcessing.value = true

  try {
    await $fetch('/api/account/profile', {
      method: 'PUT',
      body: {
        name: values.name,
        bio: values.bio
      }
    })
    toast.success('Profile updated successfully!')
  } catch (error) {
    toast.error('Failed to update profile.', {
      description: (error as Error).message || 'Unknown error'
    })
    console.error('Error:', error)
  } finally {
    isProcessing.value = false
  }
}
const submitProfileUpdate = handleSubmit(saveProfile, errors => {
  errorMsg.value = 'Please fix the validation errors before submitting.'
  console.log('Validation errors:', errors)
})

const uploadAvatar = () => {
  openUploadWidget(
    { multiple: false, cropping: true, isCamera: true, aspectRatio: 1 },
    async media => {
      try {
        await $fetch('/api/account/avatar', {
          method: 'POST',
          body: {
            url: media.url,
            providerPublicId: media.providerPublicId
          }
        })

        await refresh() // Refresh session to get updated user data
        toast.success('Avatar updated successfully!')
      } catch (error) {
        toast.error('Failed to upload avatar.', {
          description: (error as Error).message || 'Unknown error'
        })
        console.error('Error:', error)
      }
    }
  )
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center space-x-4">
      <Avatar class="size-20 text-3xl">
        <AvatarImage
          :src="
            user?.image?.replace(
              '/upload/',
              '/upload/w_100,h_100,c_thumb,g_custom/'
            ) || placeholderImageUrl
          "
          alt="Avatar"
          class="object-cover"
        />
        <AvatarFallback>{{ formValues.name?.[0] }}</AvatarFallback>
      </Avatar>
      <Button type="button" @click="uploadAvatar"> Change Photo </Button>
    </div>

    <div
      v-if="
        user &&
        (Array.isArray(user.role) ? user.role : [user.role]).filter(
          r => r && r !== userRoles.USER
        ).length > 0
      "
      class="flex gap-1 flex-wrap mb-4"
    >
      <Badge
        v-for="role in user.role?.filter(r => r !== userRoles.USER)"
        :key="role"
        class="px-2 py-1 text-xs text-white rounded-full"
        :class="
          {
            [userRoles.USER]: 'bg-blue-500',
            [userRoles.PRACTITIONER]: 'bg-blue-500',
            [userRoles.BUSINESS]: 'bg-yellow-600',
            [userRoles.SUPER_ADMIN]: 'bg-amber-600'
          }[role] || 'bg-gray-500'
        "
      >
        {{ role.charAt(0).toUpperCase() + role.slice(1) }}
      </Badge>
    </div>

    <form class="space-y-6" @submit.prevent="submitProfileUpdate">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your name"
              type="text"
              v-bind="componentField"
              autocomplete="off"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="bio">
        <FormItem>
          <FormLabel>About (Bio)</FormLabel>
          <FormControl>
            <Textarea
              rows="4"
              placeholder="You can write a short bio about yourself here."
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" :disabled="submitDisabled">
        <Spinner v-if="submitDisabled" />
        {{
          isSubmitting
            ? 'Submitting...'
            : isValidating
              ? 'Validating...'
              : isProcessing
                ? 'Updating...'
                : 'Update Profile'
        }}
      </Button>

      <p v-if="errorMsg" class="mt-4 text-sm text-destructive">
        {{ errorMsg }}
      </p>
    </form>
  </div>
</template>
