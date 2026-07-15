<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/new-york-v4/lib/utils'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import GoogleAuthButton from '~/shared/components/GoogleAuthButton.vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters')
})
type FormValues = z.infer<typeof loginSchema>

const { handleSubmit, isSubmitting } = useForm<FormValues>({
  validationSchema: toTypedSchema(loginSchema)
})

const handleLogin = async (values: FormValues) => {
  const { error } = await signIn.email({
    email: values.email,
    password: values.password
  })
  if (error) {
    toast.error('Failed to login', {
      description: error.message || 'Unknown error.'
    })
    return
  }
  await navigateTo('/profile/settings')
}
const submit = handleSubmit(handleLogin)
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl"> Welcome back </CardTitle>
        <CardDescription> Login with your Google account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="submit">
          <FieldGroup>
            <Field>
              <GoogleAuthButton title="Login with Google" />
            </Field>
            <FieldSeparator
              class="*:data-[slot=field-separator-content]:bg-card"
            >
              Or continue with
            </FieldSeparator>
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    v-bind="componentField"
                    autocomplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <div class="flex items-center">
                  <FormLabel> Password </FormLabel>
                  <NuxtLink
                    to="/reset-password"
                    class="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </NuxtLink>
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type="password"
                    v-bind="componentField"
                    autocomplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <Field>
              <Button type="submit" :disabled="isSubmitting">
                <Spinner v-if="isSubmitting" class="animate-spin" />
                Login
              </Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <NuxtLink to="/register">Sign Up</NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our
      <NuxtLink to="/terms">Terms of Service</NuxtLink> and
      <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
    </FieldDescription>
  </div>
</template>
