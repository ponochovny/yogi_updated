<script lang="ts" setup>
import MembershipCreationForm from './_components/MembershipCreationForm.vue'
import MembershipsDataTable from './_components/MembershipsDataTable.vue'
import { PlusIcon } from '@lucide/vue'
import type { MembershipItemBusiness } from '~/entities/membership/schema'

definePageMeta({
  title: 'Business Memberships',
  breadcrumbs: [
    { name: 'Businesses', url: '/business' },
    { name: 'Memberships' }
  ]
})
useHead({
  title: 'Business Memberships'
})

const route = useRoute()
const studioSlug = computed(() => route.params.slug as string)

const { data: membershipsData, refresh } = await useFetch(
  `/api/business/studios/${studioSlug.value}/memberships`
)

// GET MEMBERSHIPS LIST FOR BUSINESS
// MEMBERSHIP CREATION
// MEMBERSHIP EDIT
// ARCHIVE MEMBERSHIP

const isSheetOpen = ref(false)
const editingMembership = ref<MembershipItemBusiness | null>(null)
const tableKey = ref(0)
const openCreate = () => {
  editingMembership.value = null
  isSheetOpen.value = true
}
const openEdit = (membership: MembershipItemBusiness) => {
  editingMembership.value = membership
  isSheetOpen.value = true
}
const membershipSaved = async () => {
  await refresh()
  tableKey.value += 1
  isSheetOpen.value = false
}
</script>

<template>
  <Card class="border-0 bg-transparent p-0 shadow-none">
    <CardHeader class="px-0">
      <CardTitle class="text-2xl">Memberships</CardTitle>
      <CardDescription>
        Manage your studio's memberships and offerings.
      </CardDescription>
    </CardHeader>
    <CardContent class="px-0">
      <Sheet v-model:open="isSheetOpen">
        <SheetTrigger as-child>
          <Button class="mt-4" @click="openCreate">
            <PlusIcon />
            Create Membership</Button
          >
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{{
              editingMembership ? 'Edit Membership' : 'Create Membership'
            }}</SheetTitle>
            <SheetDescription>
              Fill in the details for the new membership.
            </SheetDescription>
          </SheetHeader>
          <div class="grid flex-1 auto-rows-min gap-6 p-4 overflow-y-auto">
            <MembershipCreationForm
              :studio-slug="studioSlug"
              :membership="editingMembership"
              @membership-saved="membershipSaved"
            />
          </div>
        </SheetContent>
      </Sheet>

      <memberships-data-table
        :key="tableKey"
        :memberships-data="membershipsData?.memberships"
        :studio-slug="studioSlug"
        @edit="openEdit"
      />
    </CardContent>
  </Card>
</template>
