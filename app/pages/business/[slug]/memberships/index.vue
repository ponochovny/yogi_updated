<script lang="ts" setup>
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
  pending
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
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold">Memberships</h2>
    <p class="text-sm text-muted-foreground">
      Manage your studio's memberships and offerings.
    </p>
    <div v-if="pending" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>
    <div class="flex flex-col space-y-2 mt-6">
      <div
        v-for="membership in membershipsData?.memberships"
        :key="membership.id"
        class="flex items-center justify-between rounded-lg border p-4"
      >
        <div class="flex justify-between items-center w-full gap-4">
          <div>
            <h3 class="text-md font-medium">{{ membership.name }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ membership.description }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium">
              Price: ${{ (Number(membership.price) / 100).toFixed(2) }}
            </p>
            <p class="text-sm text-muted-foreground">
              Credits: {{ membership.credits ?? 'Unlimited' }}
            </p>
            <p class="text-sm text-muted-foreground">
              Duration: {{ membership.durationDays }} days
            </p>
            <p class="text-sm text-muted-foreground">
              Expires
              <NuxtTime
                :datetime="
                  new Date(membership.createdAt).setDate(
                    new Date(membership.createdAt).getDate() +
                      membership.durationDays
                  )
                "
                relative
              />
            </p>
          </div>
        </div>
      </div>
    </div>
    <MembershipCreationForm :studio-slug="studioSlug" class="mt-6" />
  </div>
</template>
