<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/new-york-v4/lib/utils'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must contain at least 6 characters'),
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
              <Button variant="outline" type="button" @click="loginWithGoogle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Google
              </Button>
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
