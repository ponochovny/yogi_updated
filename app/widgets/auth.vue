<script setup lang="ts">
import LoginForm from '~/shared/login-03/components/LoginForm.vue'
import SignupForm from '~/shared/signup-03/components/SignupForm.vue'

const props = defineProps<{
  mode?: 'sign-up' | 'login'
}>()
</script>

<template>
  <div class="space-y-6">
    <LoginForm v-if="props.mode === 'login'" />
    <SignupForm v-else-if="props.mode === 'sign-up'" />
  </div>
</template>
