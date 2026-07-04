<script lang="ts" setup>
import { userRoles } from '~~/server/auth/config'
import MemberChooseBusiness from './_components/MemberChooseBusiness.vue'
import BusinessOwnerStudiosList from './_components/BusinessOwnerStudiosList.vue'

definePageMeta({
  title: 'Main Dashboard',
  breadcrumbs: [{ name: 'Main Dashboard', url: '/business' }]
})

const { userData } = useUserData()

useHead({
  title: 'Main Dashboard'
})
</script>

<template>
  <div>
    <BusinessOwnerStudiosList
      v-if="userData.roles.includes(userRoles.BUSINESS)"
    />

    <MemberChooseBusiness v-else />
  </div>
</template>
