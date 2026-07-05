<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/ui/form'
import { signIn, signOut, signUp, useSession } from '@/utils/auth-client'

const props = defineProps<{
  mode?: 'sign-up' | 'login'
}>()

const router = useRouter()
const session = useSession()
const errorMsg = ref('')
const isProcessing = ref(false)

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must contain at least 6 characters')
})

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, 'Name is required')
})

type FormValues = z.infer<typeof registerSchema>

const validationSchema = computed(() => {
  return toTypedSchema(props.mode === 'sign-up' ? registerSchema : loginSchema)
})

const { handleSubmit } = useForm<FormValues>({
  validationSchema
})

const handleRegister = handleSubmit(async values => {
  errorMsg.value = ''
  isProcessing.value = true

  const { error } = await signUp.email({
    email: values.email,
    password: values.password,
    name: values.name,
    callbackURL: '/'
  })

  isProcessing.value = false

  if (error) {
    errorMsg.value = error.message || 'Error registering'
    return
  }

  await router.push('/profile/settings')
})

const handleLogin = handleSubmit(async values => {
  errorMsg.value = ''
  isProcessing.value = true

  const { error } = await signIn.email({
    email: values.email,
    password: values.password
  })

  isProcessing.value = false

  if (error) {
    errorMsg.value = error.message || 'Email or password is incorrect'
    return
  }

  await router.push('/profile/settings')
})

const handleSignOut = async () => {
  await signOut()
  await router.push('/')
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="session.isPending"
      class="rounded-lg border border-dashed border-gray-500 p-6 text-center text-sm text-gray-400"
    >
      Session is loading...
    </div>

    <div
      v-else-if="session.data"
      class="rounded-xl border bg-white/5 p-6 shadow-sm"
    >
      <p class="text-lg font-semibold text-gray-100">
        Hello, {{ session.data.user.name || session.data.user.email }}
      </p>
      <p class="text-sm">{{ session.data.user.email }}</p>

      <div class="mt-4 flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          @click="router.push('/profile/settings')"
        >
          Profile
        </Button>
        <Button variant="secondary" size="sm" @click="handleSignOut">
          Sign Out
        </Button>
      </div>
    </div>

    <div v-else class="rounded-xl border bg-white/5 p-6 shadow-sm">
      <h2 class="mb-4 text-2xl font-semibold text-center">
        {{ props.mode === 'sign-up' ? 'Sign Up' : 'Log In' }}
      </h2>

      <form @submit.prevent>
        <div class="space-y-6">
          <template v-if="props.mode === 'sign-up'">
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
          </template>

          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  v-bind="componentField"
                  :autocomplete="props.mode === 'sign-up' ? 'off' : 'email'"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  v-bind="componentField"
                  :autocomplete="
                    props.mode === 'sign-up'
                      ? 'new-password'
                      : 'current-password'
                  "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="mt-6">
          <Button
            v-if="props.mode === 'sign-up'"
            type="button"
            class="w-full"
            :disabled="isProcessing"
            @click="handleRegister"
          >
            <Spinner v-if="isProcessing" class="animate-spin" />
            Register
          </Button>
          <Button
            v-else
            type="button"
            class="w-full"
            :disabled="isProcessing"
            @click="handleLogin"
          >
            <Spinner v-if="isProcessing" class="animate-spin" />
            Log in
          </Button>
        </div>

        <p v-if="errorMsg" class="mt-4 text-sm text-destructive">
          {{ errorMsg }}
        </p>
      </form>
      <div v-if="props.mode !== 'sign-up'" class="mt-4 text-center">
        <NuxtLink
          to="/reset-password"
          class="text-sm text-gray-400 hover:underline"
        >
          Reset password
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
