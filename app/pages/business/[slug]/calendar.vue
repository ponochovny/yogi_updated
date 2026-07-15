<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config'
import PractitionerSlots from '../_components/PractitionerSlots.vue'
import BusinessSlots from '../_components/BusinessSlots.vue'

useHead({
  title: 'Studio calendar'
})
definePageMeta({
  title: 'Studio calendar'
})

const { userData } = useUserData()

const isPractitioner = computed(() => {
  const roles = unref(userData)?.roles
  return roles?.includes(userRoles.PRACTITIONER) ?? false
})
const isManager = computed(() => {
  const roles = unref(userData)?.roles
  return roles?.includes(userRoles.MANAGER) ?? false
})
const isBusinessOwner = computed(() => {
  const roles = unref(userData)?.roles
  return roles?.includes(userRoles.BUSINESS) ?? false
})
</script>

<template>
  <div>
    <practitioner-slots v-if="isPractitioner" />
    <manager-slots v-if="isManager" />
    <business-slots v-if="isBusinessOwner" />
    <p v-if="!isPractitioner && !isManager && !isBusinessOwner">
      You do not have access to this page.
    </p>
  </div>
</template>
