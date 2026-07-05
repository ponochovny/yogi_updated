<script lang="ts" setup>
import { TicketIcon } from '@lucide/vue'
import MembershipCreationForm from './_components/MembershipCreationForm.vue'

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

const {
  data: membershipsData,
  pending,
  refresh
  // error,
} = await useFetch(`/api/business/studios/${studioSlug.value}/memberships`)

// GET MEMBERSHIPS LIST FOR BUSINESS
// MEMBERSHIP CREATION
// MEMBERSHIP EDIT
// ARCHIVE MEMBERSHIP

// type Membership = {
// 	id: string
// 	studioId: string
// 	offeringId: string | null

// 	applicableCategoryIds: string[]

// 	name: string // "Single Visit", "10-Class Package", "Unlimited Monthly"
// 	description: string
// 	type: string

// 	price: number

// 	// Limits logic
// 	credits: number | null // Visits amount. For DROP_IN = 1, PACK = 10, MEMBERSHIP = null (unlimited)
// 	durationDays: number // Duration of the pass after purchase (e.g., 1 day, 30 days, 365 days)

// 	isActive: boolean
// 	createdAt: Date
// }

// const memberships = ref<Partial<Membership>[]>([
// 	{
// 		name: 'Single Visit',
// 		description: 'One-time access to the studio for a single class or session.',
// 		type: 'DROP_IN',
// 		price: 2000, // $20.00
// 		credits: 1,
// 		durationDays: 1,
// 		isActive: true,
// 	},
// 	{
// 		name: '10-Class Package',
// 		description: 'Access to 10 classes or sessions within a specified period.',
// 		type: 'PACK',
// 		price: 15000, // $150.00
// 		credits: 10,
// 		durationDays: 30,
// 		isActive: true,
// 	},
// 	{
// 		name: 'Unlimited Monthly',
// 		description: 'Unlimited access to the studio for a month.',
// 		type: 'MEMBERSHIP',
// 		price: 50000, // $500.00
// 		credits: null,
// 		durationDays: 30,
// 		isActive: true,
// 	},
// ])

// Запись в БД: offeringId: null. Поле applicableCategoryIds содержит массив UUID глобальных категорий (например, ['id_йоги', 'id_растяжки']). Если массив пустой/null — абонемент действует на все услуги студии.

const isSheetOpen = ref(false)
const membershipCreated = () => {
  refresh()
  isSheetOpen.value = false
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold">Memberships</h2>
    <p class="text-sm text-muted-foreground">
      Manage your studio's memberships and offerings.
    </p>
    <Sheet v-model:open="isSheetOpen">
      <SheetTrigger as-child>
        <Button class="mt-4">Create Membership</Button>
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
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>

    <div v-else class="flex w-full flex-col gap-6 mt-6">
      <ItemGroup class="gap-4">
        <Item
          v-for="membership in membershipsData?.memberships"
          :key="membership.id"
          variant="outline"
        >
          <ItemMedia variant="icon">
            <TicketIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="line-clamp-1">
              {{ membership.name }} -
              <span class="text-muted-foreground">
                {{ membership.durationDays }} days
              </span>
            </ItemTitle>
            <ItemDescription>
              {{ membership.description }}
            </ItemDescription>
          </ItemContent>
          <ItemContent class="flex-none text-center">
            <ItemDescription class="flex flex-col text-sm font-medium">
              <span
                >Price: ${{ (Number(membership.price) / 100).toFixed(2) }}
              </span>
              <span>Credits: {{ membership.credits ?? 'Unlimited' }}</span>
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  </div>
</template>
