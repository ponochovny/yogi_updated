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

const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Password doesn't match",
    path: ['confirmPassword']
  })
type FormValues = z.infer<typeof signupSchema>

const { handleSubmit, isSubmitting } = useForm<FormValues>({
  validationSchema: toTypedSchema(signupSchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
})
const handleRegister = async (values: FormValues) => {
  try {
    await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: '/profile/settings'
    })

    navigateTo('/profile/settings')
  } catch (error) {
    toast.error('Failed to sign up', {
      description: `${(error as { data: { message: string } }).data.message}`
    })
  }
}
const submit = handleSubmit(handleRegister)
const loginWithGoogle = async () => {
  try {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/profile/settings'
    })
  } catch (error) {
    toast.error('Failed to login', {
      description: `${(error as { data: { message: string } }).data.message}`
    })
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl"> Create your account </CardTitle>
        <CardDescription> Sign up with your Google account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="submit">
          <FieldGroup>
            <Field>
              <GoogleAuthButton
                title="Sign up with Google"
                @click="loginWithGoogle"
              />
            </Field>
            <FieldSeparator
              class="*:data-[slot=field-separator-content]:bg-card"
            >
              Or sign up with
            </FieldSeparator>
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
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    v-bind="componentField"
                    autocomplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <Field>
              <Field class="grid grid-cols-2 gap-4">
                <FormField v-slot="{ componentField }" name="password">
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        v-bind="componentField"
                        autocomplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="confirmPassword">
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm your password"
                        type="password"
                        v-bind="componentField"
                        autocomplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </Field>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" :disabled="isSubmitting">
                <Spinner v-if="isSubmitting" class="animate-spin" />
                Create Account
              </Button>
              <FieldDescription class="text-center">
                Already have an account?
                <NuxtLink to="/login">Sign in</NuxtLink>
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
