<script lang="ts" setup>
import { MapPinIcon } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'

const route = useRoute()
console.log(route.params.slug)

const memberships = ref([
  {
    id: 1,
    types: ['Yoga', 'Pilates'],
    categories: ['Beginner', 'Intermediate'],
    credits: 10,
    name: 'Yoga & Pilates Membership',
    description: 'Access to all yoga and pilates classes for a month.',
    price: '$99',
    valid_until: '2024-12-31'
  },
  {
    id: 2,
    types: ['Meditation'],
    categories: ['Advanced'],
    credits: 5,
    name: 'Yoga & Pilates Membership',
    description: 'Access to all yoga and pilates classes for a month.',
    price: '$99',
    valid_until: '2024-12-31'
  },
  {
    id: 3,
    types: ['Meditation'],
    categories: ['Advanced'],
    credits: null,
    name: 'Yoga & Pilates Membership',
    description: 'Access to all yoga and pilates classes for a month.',
    price: '$99',
    valid_until: '2024-12-31'
  }
])
const formatList = (list: string[]) => list.join(', ')

const buyMembership = (membershipId: number) => {
  const membership = memberships.value.find(m => m.id === membershipId)
  console.log('Buying membership:', membership)
  // Implement the logic to handle membership purchase
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
                studio?.locations.map(location => location.address).join(', ')
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
                  {{ membership.price }} - Valid until:
                  {{ membership.valid_until }}
                </div>
                <div class="text-sm text-muted-foreground">
                  Credits:
                  <span class="font-bold">{{
                    membership.credits ? membership.credits : 'Unlimited'
                  }}</span>
                </div>
                <div class="text-sm text-muted-foreground">
                  Applies for types
                  <span class="font-bold">{{
                    formatList(membership.types)
                  }}</span>
                  with categories
                  <span class="font-bold">{{
                    formatList(membership.categories)
                  }}</span>
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
