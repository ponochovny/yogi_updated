<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config'
import PractitionerSlots from './_components/PractitionerSlots.vue'
import BusinessSlots from './_components/BusinessSlots.vue'

useHead({
  title: 'Global calendar'
})
definePageMeta({
  title: 'Global calendar'
})

const { userData } = useUserData()

const isPractitioner = computed(() => {
  const roles = unref(userData)?.roles
  return roles?.includes(userRoles.PRACTITIONER) ?? false
})
const isBusinessOwner = computed(() => {
  const roles = unref(userData)?.roles
  return roles?.includes(userRoles.BUSINESS) ?? false
})
</script>

<template>
  <div>
    <practitioner-slots v-if="isPractitioner" />
    <business-slots v-if="isBusinessOwner" />
  </div>
</template>
