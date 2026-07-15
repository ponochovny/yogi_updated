<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'

const resetPasswordSchema = z.object({
  email: z.email('Enter a valid email address')
})
export type resetPasswordInput = z.infer<typeof resetPasswordSchema>

const { isSubmitting, handleSubmit, handleReset } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  initialValues: {
    email: ''
  }
})
const resetForm = async (values: resetPasswordInput) => {
  try {
    const res = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (res.error) {
      toast.error('Failed to send reset link: ', {
        description: res.error.message || 'An unexpected error occurred.'
      })
      return
    }

    toast.success(
      'If an account with that email exists, a password reset link has been sent.'
    )
    handleReset()
  } catch (error) {
    toast.error('Failed to send reset link', {
      description: (error as Error).message || 'An unexpected error occurred.'
    })
  }
}
const submit = handleSubmit(resetForm)
</script>

<template>
  <div>
    <form class="space-y-4" @submit.prevent="submit">
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
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        <Spinner v-if="isSubmitting" class="animate-spin" />
        Send Reset Link
      </Button>
    </form>
  </div>
</template>
