<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'
import MembershipCreationForm from './memberships/_components/MembershipCreationForm.vue'
import MembershipsDataTable from './memberships/_components/MembershipsDataTable.vue'
import type { MembershipItemBusiness } from '~/entities/membership/schema.ts'

definePageMeta({ title: 'Studio pricing' })
useHead({ title: 'Studio pricing' })

const route = useRoute()
const studioSlug = computed(() => String(route.params.slug))
const { data: membershipsData, refresh } = await useFetch(
  `/api/business/studios/${studioSlug.value}/memberships`
)
const isSheetOpen = ref(false)
const editingMembership = ref<MembershipItemBusiness | null>(null)
const openEdit = (membership: MembershipItemBusiness) => {
  editingMembership.value = membership
  isSheetOpen.value = true
}
const membershipSaved = async () => {
  await refresh()
  editingMembership.value = null
  isSheetOpen.value = false
}
</script>

<template>
  <Card class="border-0 bg-transparent p-0 shadow-none">
    <CardHeader class="px-0">
      <CardTitle class="text-2xl">Pricing</CardTitle>
      <CardDescription
        >Configure drop-ins, class packs, memberships, expiry and daily booking
        limits per pass.</CardDescription
      >
    </CardHeader>
    <CardContent class="px-0">
      <Sheet v-model:open="isSheetOpen">
        <SheetTrigger as-child
          ><Button class="mt-4"
            ><PlusIcon /> Create pricing option</Button
          ></SheetTrigger
        >
        <SheetContent>
          <SheetHeader
            ><SheetTitle>Create pricing option</SheetTitle
            ><SheetDescription
              >Set access, expiry, and the maximum bookings allowed per
              day.</SheetDescription
            ></SheetHeader
          >
          <div class="grid flex-1 auto-rows-min gap-6 p-4 overflow-y-auto">
            <MembershipCreationForm
              :studio-slug="studioSlug"
              :membership="editingMembership"
              @membership-saved="membershipSaved"
            />
          </div>
        </SheetContent>
      </Sheet>
      <MembershipsDataTable
        :memberships-data="membershipsData?.memberships"
        :studio-slug="studioSlug"
        @edit="openEdit"
      />
    </CardContent>
  </Card>
</template>
