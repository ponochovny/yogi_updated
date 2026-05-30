<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/shared/ui/form'
import { signIn, signOut, signUp, useSession } from '@/utils/auth-client'

const router = useRouter()
const session = useSession()
const errorMsg = ref('')
const isProcessing = ref(false)

const authSchema = toTypedSchema(
	z.object({
		name: z.string().trim().optional(),
		email: z.string().email('Enter a valid email address'),
		password: z.string().min(6, 'Password must contain at least 6 characters'),
	}),
)

const form = useForm({
	validationSchema: authSchema,
	initialValues: {
		name: '',
		email: '',
		password: '',
	},
})

const handleRegister = form.handleSubmit(async (values) => {
	errorMsg.value = ''

	if (!values.name?.trim()) {
		errorMsg.value = 'Please enter your name'
		return
	}

	isProcessing.value = true

	const { error } = await signUp.email({
		email: values.email,
		password: values.password,
		name: values.name,
		callbackURL: '/',
	})

	isProcessing.value = false

	if (error) {
		errorMsg.value = error.message || 'Error registering'
		return
	}

	await router.push('/profile/settings')
})

const handleLogin = form.handleSubmit(async (values) => {
	console.log('Login values 2:', values) // Debug log
	errorMsg.value = ''
	isProcessing.value = true

	const { error } = await signIn.email({
		email: values.email,
		password: values.password,
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
			<h2 class="mb-4 text-2xl font-semibold">Registration / Login</h2>

			<form @submit.prevent>
				<div class="space-y-4">
					<FormField v-slot="{ componentField }" name="name">
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your name"
									type="text"
									v-bind="componentField"
								/>
							</FormControl>
							<FormDescription
								>This name will be displayed in your profile.</FormDescription
							>
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
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					</FormField>
				</div>

				<div class="mt-6 flex flex-col gap-3 sm:flex-row">
					<Button
						type="button"
						variant="default"
						class="w-full sm:w-auto"
						:disabled="isProcessing"
						@click="handleRegister"
					>
						Register
					</Button>
					<Button
						type="button"
						variant="secondary"
						class="w-full sm:w-auto"
						:disabled="isProcessing"
						@click="handleLogin"
					>
						Log in
					</Button>
				</div>

				<p v-if="errorMsg" class="mt-4 text-sm text-destructive">
					{{ errorMsg }}
				</p>
			</form>
		</div>
	</div>
</template>
