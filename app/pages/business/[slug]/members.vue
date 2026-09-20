<script setup lang="ts">
import MembersDataTable from '~/widgets/Studio/members-data-table.vue'
import InviteTeamMember from './_components/InviteTeamMember.vue'

definePageMeta({
  title: 'Team Management',
  breadcrumbs: [{ name: 'Businesses', url: '/business' }, { name: 'Team' }]
})

const route = useRoute()
const slug = route.params.slug as string

const membersTableRef = ref<{ refresh: () => Promise<void> | void } | null>(
  null
)

useHead({
  title: () => `${slug || 'Studio'} - Team Management`
})
</script>

<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-6">Studio members</h1>

    <InviteTeamMember :slug="slug" @invited="membersTableRef?.refresh()" />

    <members-data-table ref="membersTableRef" />
  </div>
</template>
