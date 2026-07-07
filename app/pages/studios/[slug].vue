<script lang="ts" setup>
import { MapPinIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'

const route = useRoute()

const { data: membershipsData } = await useFetch(
  `/api/business/studios/${route.params.slug}/memberships`
)
const memberships = computed(() => membershipsData.value?.memberships || [])

const formatList = (list: string[]) => list?.join(', ') || ''

const isProcessing = ref<boolean>(false)

async function buyMembership(pricingOptionId: string) {
  isProcessing.value = true
  try {
    const response = await $fetch<{ url: string }>(
      '/api/checkout/create-session',
      {
        method: 'POST',
        body: { pricingOptionId }
      }
    )

    if (response.url) {
      window.location.href = response.url // Redirect to Stripe checkout
    }
  } catch (error) {
    toast.error(
      (error as { data: { message: string } }).data.message ||
        'An error occurred while processing your request.'
    )
  } finally {
    isProcessing.value = false
  }
}

const { data: studioData, error: studioError } = await useFetch(
  `/api/studios/${route.params.slug}`
)
if (studioError.value) {
  navigateTo('/404')
}
const studio = computed(() => studioData.value?.studio || null)
</script>

<template>
  <div class="max-w-6xl mx-auto mb-20">
    <div class="rounded-4xl bg-neutral-900">
      <div class="rounded-tr-4xl rounded-tl-4xl h-112.5">
        <NuxtImg
          v-if="studio?.gallery && studio.gallery.length > 0"
          :src="studio.gallery[0]?.url || placeholderImageUrl"
          alt="Studio Gallery Image"
          class="w-full h-full object-cover rounded-tr-4xl rounded-tl-4xl"
        />
      </div>
      <div>
        <NuxtImg
          v-if="studio?.logo"
          :src="
            studio.logo.url.replace(
              '/upload/',
              '/upload/w_160,h_160,c_fill/'
            ) || placeholderImageUrl
          "
          alt="Studio Logo"
          class="size-40 object-cover rounded-full -mt-16 ml-16"
        />
        <div class="flex gap-6 py-8 px-16">
          <div class="flex flex-col shrink gap-6">
            <div class="flex gap-2 items-center h-5 text-xs">
              <div>
                <span
                  v-for="type in studio?.types || []"
                  :key="type"
                  class="text-rose-600 uppercase"
                >
                  {{ type }},
                </span>
              </div>
              <Separator orientation="vertical" class="mx-2" />
              <div>
                <span
                  v-for="category in studio?.categories || []"
                  :key="category"
                >
                  {{ category }},
                </span>
              </div>
            </div>
            <h1 class="text-2xl font-semibold">{{ studio?.name }}</h1>
            <div class="flex items-center gap-2">
              <MapPinIcon class="size-5" />
              {{
                studio?.locations.map(location => location.address)?.join(', ')
              }}
            </div>
            <h2 class="text-lg font-bold">About</h2>
            <p class="text-gray-400">{{ studio?.bio }}</p>
            <h2 class="text-lg font-bold">Practitioners</h2>
            <div class="flex gap-2">
              <div
                v-for="practitioner in studio?.practitioners || []"
                :key="practitioner.id"
                class="flex items-center gap-4"
              >
                <NuxtImg
                  v-if="practitioner.avatar"
                  :src="practitioner.avatar || placeholderImageUrl"
                  alt="Practitioner Avatar"
                  class="w-12 h-12 object-cover rounded-full"
                />
                <div>
                  <p class="font-semibold">{{ practitioner.name }}</p>
                </div>
              </div>
            </div>
            <h2 class="text-lg font-bold">Mission</h2>
            <p class="text-gray-400">{{ studio?.mission }}</p>
          </div>

          <div
            class="min-w-sm grow border border-border px-6 py-4 rounded-3xl flex flex-col gap-4 bg-neutral-900"
          >
            <h2 class="text-2xl font-medium">Memberships</h2>
            <ul class="flex flex-col gap-4">
              <li
                v-for="membership in memberships"
                :key="membership.id"
                class="border border-border p-4 rounded-2xl flex flex-col gap-2 items-start bg-neutral-800"
              >
                <div>
                  <h3 class="font-semibold">{{ membership.name }}</h3>
                  <p class="text-sm text-muted-foreground">
                    {{ membership.description }}
                  </p>
                </div>
                <div class="text-sm text-muted-foreground">
                  ${{ Math.round(membership.price / 100) }} - Duration:
                  {{
                    membership.durationDays
                      ? membership.durationDays + ' days'
                      : 'Unlimited'
                  }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Credits:
                  <span class="font-bold">{{
                    membership.credits ? membership.credits : 'Unlimited'
                  }}</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Applies for
                  <template v-if="membership.applicableCategories.length">
                    categories:
                    <span class="font-bold">{{
                      formatList(membership.applicableCategories)
                    }}</span>
                  </template>
                  <template v-else> all categories </template>
                </div>
                <Button type="button" @click="buyMembership(membership.id)"
                  >Buy membership</Button
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
