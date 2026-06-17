<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const props = defineProps<{
	token: string
}>()

const confirmNewPasswordSchema = z
	.object({
		newPassword: z.string().min(8, 'Password must be at least 8 characters'),
		newPasswordConfirm: z
			.string()
			.min(8, 'Password confirmation must be at least 8 characters'),
	})
	.superRefine((data, ctx) => {
		if (data.newPassword !== data.newPasswordConfirm) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Passwords do not match',
				path: ['newPasswordConfirm'],
			})
		}
	})

const newPasswordForm = useForm({
	validationSchema: toTypedSchema(confirmNewPasswordSchema),
	initialValues: {
		newPassword: '',
		newPasswordConfirm: '',
	},
})
const errorMsg = ref('')

const submitReset = newPasswordForm.handleSubmit(async (values) => {
	errorMsg.value = ''
	try {
		const res = await authClient.resetPassword({
			token: props.token,
			newPassword: values.newPassword,
		})

		if (res.error) {
			errorMsg.value =
				(res.error.message || 'Failed to reset password') +
				'. You have to request a new password reset link.'
			toast.error('Failed to reset password: ', {
				description: res.error.message || 'An unexpected error occurred.',
			})
			return
		}

		toast.success(
			'Password reset successful! You can now log in with your new password.',
		)
		newPasswordForm.handleReset()
		await navigateTo('/login')
	} catch (error) {
		errorMsg.value =
			'Failed to reset password. You have to request a new password reset link.'
		toast.error('Failed to reset password', {
			description: (error as Error).message || 'An unexpected error occurred.',
		})
	}
})
</script>

<template>
	<div>
		<form class="space-y-4" @submit.prevent="submitReset">
			<FormField v-slot="{ componentField }" name="newPassword">
				<FormItem>
					<FormLabel>New Password</FormLabel>
					<FormControl>
						<Input
							placeholder="Enter your new password"
							type="password"
							v-bind="componentField"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="newPasswordConfirm">
				<FormItem>
					<FormLabel>Confirm New Password</FormLabel>
					<FormControl>
						<Input
							placeholder="Confirm your new password"
							type="password"
							v-bind="componentField"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>
			<ClientOnly>
				<Button type="submit" class="w-full"> Reset Password </Button>
			</ClientOnly>
		</form>
		<p class="text-red-500 text-sm py-2">{{ errorMsg }}</p>
	</div>
</template>
