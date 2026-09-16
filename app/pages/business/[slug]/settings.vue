<script lang="ts" setup>
import { toast } from 'vue-sonner'
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: studio, refresh } = await useFetch(
  `/api/business/studios/${slug.value}/settings`
)
const form = reactive({
  bio: '',
  mission: '',
  cancellationPolicy: '',
  liabilityWaiver: ''
})
watch(
  studio,
  value => {
    if (value)
      Object.assign(form, {
        bio: value.bio,
        mission: value.mission,
        cancellationPolicy: value.cancellationPolicy || '',
        liabilityWaiver: value.liabilityWaiver || ''
      })
  },
  { immediate: true }
)
const save = async () => {
  await $fetch(`/api/business/studios/${slug.value}/settings`, {
    method: 'PATCH',
    body: {
      ...form,
      cancellationPolicy: form.cancellationPolicy || null,
      liabilityWaiver: form.liabilityWaiver || null
    }
  })
  await refresh()
  toast.success('Studio settings saved')
}
useHead({ title: 'Studio Settings' })
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <div>
      <h1 class="text-2xl font-semibold">Studio settings</h1>
      <p class="text-sm text-muted-foreground">
        Profile, media, cancellation policy and liability waiver.
      </p>
    </div>
    <div
      v-if="studio?.logo || studio?.gallery?.length"
      class="space-y-3 rounded-lg border p-4"
    >
      <h2 class="font-semibold">Studio media</h2>
      <NuxtImg
        v-if="studio?.logo"
        :src="studio.logo"
        class="h-24 w-24 rounded-lg object-cover"
      />
      <div v-if="studio?.gallery?.length" class="flex flex-wrap gap-2">
        <NuxtImg
          v-for="image in studio.gallery"
          :key="image"
          :src="image"
          class="h-20 w-20 rounded-md object-cover"
        />
      </div>
      <p class="text-xs text-muted-foreground">
        Media is managed through the studio media uploader.
      </p>
    </div>
    <form class="space-y-6" @submit.prevent="save">
      <div>
        <label class="text-sm font-medium">Studio bio</label
        ><Textarea v-model="form.bio" class="mt-2" required />
      </div>
      <div>
        <label class="text-sm font-medium">Mission</label
        ><Textarea v-model="form.mission" class="mt-2" required />
      </div>
      <div>
        <label class="text-sm font-medium">Cancellation policy</label
        ><Textarea
          v-model="form.cancellationPolicy"
          class="mt-2"
          placeholder="Describe cancellation and refund rules"
        />
      </div>
      <div class="space-y-2 rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold">Liability waiver</h2>
            <p class="text-sm text-muted-foreground">
              Version {{ studio?.liabilityWaiverVersion || 1 }}. Changing the
              text creates a new version.
            </p>
          </div>
          <Badge>v{{ studio?.liabilityWaiverVersion || 1 }}</Badge>
        </div>
        <Textarea
          v-model="form.liabilityWaiver"
          class="min-h-40"
          placeholder="Enter the safety agreement text"
        />
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  </div>
</template>
