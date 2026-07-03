<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config.js'
import StudioOwnerDashboard from './_components/StudioOwnerDashboard.vue'
import StudioManagerDashboard from './_components/StudioManagerDashboard.vue'
import StudioPractitionerDashboard from './_components/StudioPractitionerDashboard.vue'
import StudioPartnerOnboarding from './_components/StudioPartnerOnboarding.vue'

definePageMeta({
  title: 'Business Overview',
  breadcrumbs: [
    { name: 'Businesses', url: '/business' },
    { name: 'Business Overview' }
  ]
})

useHead({
  title: 'Business Overview'
})

const route = useRoute()
const { getRolesInStudio } = useUserData()
const roles = computed(() => getRolesInStudio(route.params.slug as string))
</script>

<template>
  <div>
    <StudioOwnerDashboard v-if="roles?.includes(userRoles.BUSINESS)" />

    <StudioManagerDashboard v-if="roles?.includes(userRoles.MANAGER)" />

    <StudioPractitionerDashboard
      v-if="roles?.includes(userRoles.PRACTITIONER)"
    />

    <StudioPartnerOnboarding v-if="!roles?.length" />
  </div>
</template>
