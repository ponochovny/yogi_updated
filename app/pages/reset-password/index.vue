<script lang="ts" setup>
import ResetForm from './_components/reset-form.vue'
import NewPasswordForm from './_components/new-password-form.vue'

const route = useRoute()
const token = computed(() => route.query.token)

const isValidToken = computed(() => {
  return typeof token.value === 'string' && token.value.length > 0
})
const isInvite = computed(() => route.query.flow === 'invite')

useHead({
  title: isInvite.value ? 'Activate practitioner account' : 'Reset Password'
})
</script>
<template>
  <div class="max-w-sm mx-auto bg-white/10 p-8 rounded-xl border shadow-sm">
    <h2 class="text-2xl mb-2">
      {{ isInvite ? 'Activate your practitioner account' : 'Reset password' }}
    </h2>
    <p v-if="isInvite" class="mb-6 text-sm text-muted-foreground">
      Set a password to activate your studio team profile.
    </p>
    <div v-else class="mb-6" />
    <div v-if="!isValidToken">
      <!-- Invalid or missing reset token. Please request a new password reset link. -->
      <ResetForm />
    </div>
    <div v-else-if="token && typeof token === 'string'">
      <NewPasswordForm :token="token" :invite="isInvite" />
    </div>
  </div>
</template>
