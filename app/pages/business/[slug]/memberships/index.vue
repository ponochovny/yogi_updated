<script lang="ts" setup>
import MembershipCreationForm from './_components/MembershipCreationForm.vue'
import MembershipsDataTable from './_components/MembershipsDataTable.vue'
import { PlusIcon } from '@lucide/vue'

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
const membershipCreated = () => {
  refresh()
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
          <Button class="mt-4">
            <PlusIcon />
            Create Membership</Button
          >
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Membership</SheetTitle>
            <SheetDescription>
              Fill in the details for the new membership.
            </SheetDescription>
          </SheetHeader>
          <div class="grid flex-1 auto-rows-min gap-6 px-4">
            <MembershipCreationForm
              :studio-slug="studioSlug"
              @membership-created="membershipCreated"
            />
          </div>
        </SheetContent>
      </Sheet>

      <memberships-data-table
        :memberships-data="membershipsData?.memberships"
        :studio-slug="studioSlug"
      />
    </CardContent>
  </Card>
</template>
