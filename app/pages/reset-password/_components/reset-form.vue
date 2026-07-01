<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'

const resetPasswordSchema = z.object({
  email: z.email('Enter a valid email address')
})
const requestResetForm = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  initialValues: {
    email: ''
  }
})
const errorMsg = ref('')
const requestResetLoading = ref(false)
const submitRequestReset = requestResetForm.handleSubmit(async values => {
  requestResetLoading.value = true
  errorMsg.value = ''
  try {
    const res = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (res.error) {
      errorMsg.value = res.error.message || 'An unexpected error occurred.'
      toast.error('Failed to send reset link: ', {
        description: res.error.message || 'An unexpected error occurred.'
      })
      return
    }

    toast.success(
      'If an account with that email exists, a password reset link has been sent.'
    )
    requestResetForm.handleReset()
  } catch (error) {
    errorMsg.value = 'An unexpected error occurred.'
    toast.error('Failed to send reset link', {
      description: (error as Error).message || 'An unexpected error occurred.'
    })
  } finally {
    requestResetLoading.value = false
  }
})
</script>

<template>
  <div>
    <form class="space-y-4" @submit.prevent="submitRequestReset">
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email Address</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter your email to receive a reset link"
              type="email"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <ClientOnly>
        <Button
          type="submit"
          class="w-full"
          :disabled="
            requestResetForm.isSubmitting ||
            requestResetForm.isValidating ||
            requestResetLoading
          "
        >
          Send Reset Link
        </Button>
      </ClientOnly>
    </form>
    <p class="text-red-500 text-sm py-2">{{ errorMsg }}</p>
  </div>
</template>
