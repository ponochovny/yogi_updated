<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const route = useRoute()
const { token } = route.query

const resetPasswordSchema = z
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
			})
		}
	})

const form = useForm({
	validationSchema: toTypedSchema(resetPasswordSchema),
	initialValues: {
		newPassword: '',
		newPasswordConfirm: '',
	},
})
const errorMsg = ref('')

const submitReset = form.handleSubmit(
	async (values) => {
		const res = await authClient.resetPassword({
			token: token as string,
			newPassword: values.newPassword,
		})

		if (res.error) {
			errorMsg.value =
				res.error.message +
					'. You have to request a new password reset link.' ||
				'Failed to reset password.'
			toast.error('Failed to reset password: ', {
				description: res.error.message || 'An unexpected error occurred.',
			})
		} else {
			toast.success(
				'Password reset successful! You can now log in with your new password.',
			)
			navigateTo('/login')
		}
	},
	() => {
		errorMsg.value = 'Password does not match confirmation.'
	},
)
</script>
<template>
	<div class="max-w-xs mx-auto">
		<h2 class="text-2xl mb-6">Reset password</h2>
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
			<Button type="submit" class="w-full"> Reset Password </Button>
		</form>
		<p class="text-red-500 text-sm py-2">{{ errorMsg }}</p>
	</div>
</template>
