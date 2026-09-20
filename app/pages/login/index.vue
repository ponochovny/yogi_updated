<script lang="ts" setup>
import Auth from '~/widgets/auth.vue'
import { getSafeCallbackURL } from '~/utils/auth-client'

const route = useRoute()
const callbackURL = computed(() => getSafeCallbackURL(route.query.redirect))
</script>

<template>
  <div class="max-w-md mx-auto">
    <Auth mode="login" :callback-url="callbackURL" />
  </div>
</template>
