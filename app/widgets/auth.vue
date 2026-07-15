<script setup lang="ts">
import LoginForm from '~/shared/login-03/components/LoginForm.vue'
import SignupForm from '~/shared/signup-03/components/SignupForm.vue'

const props = defineProps<{
  mode?: 'sign-up' | 'login'
}>()

const resolvedMode = computed(() => props.mode ?? 'login')
</script>

<template>
  <div class="space-y-6">
    <LoginForm v-if="resolvedMode === 'login'" />
    <SignupForm v-else-if="resolvedMode === 'sign-up'" />
  </div>
</template>
