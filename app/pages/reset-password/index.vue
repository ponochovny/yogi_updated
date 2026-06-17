<script lang="ts" setup>
import ResetForm from './_components/reset-form.vue'
import NewPasswordForm from './_components/new-password-form.vue'

const route = useRoute()
const token = computed(() => route.query.token)

const isValidToken = computed(() => {
	return typeof token.value === 'string' && token.value.length > 0
})

useHead({
	title: 'Reset Password',
})
</script>
<template>
	<div class="max-w-sm mx-auto bg-white/10 p-8 rounded-xl border shadow-sm">
		<h2 class="text-2xl mb-6">Reset password</h2>
		<div v-if="!isValidToken">
			<!-- Invalid or missing reset token. Please request a new password reset link. -->
			<ResetForm />
		</div>
		<div v-else-if="token && typeof token === 'string'">
			<NewPasswordForm :token="token" />
		</div>
	</div>
</template>
