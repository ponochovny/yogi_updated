<script setup lang="ts">
import { FileCheck2Icon } from '@lucide/vue'

definePageMeta({ title: 'Agreements', breadcrumbs: [{ name: 'Agreements' }] })

type Agreement = {
  id: string
  title: string
  studioName?: string
  version?: number
  acceptedAt?: string
}

const { data, pending, error } = await useFetch<{
  agreements: Agreement[]
}>('/api/account/agreements')
const agreements = computed(() => data.value?.agreements ?? [])
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm text-muted-foreground">Account</p>
      <h1 class="text-3xl font-semibold tracking-tight">Agreements</h1>
      <p class="mt-2 text-muted-foreground">
        Safety rules and studio waivers you have accepted.
      </p>
    </div>
    <p v-if="pending" class="text-muted-foreground">Loading agreements...</p>
    <p v-else-if="error" class="text-destructive">Failed to load agreements.</p>
    <div
      v-else-if="agreements.length === 0"
      class="rounded-xl border border-dashed p-8 text-center"
    >
      <FileCheck2Icon class="mx-auto mb-3 size-8 text-muted-foreground" />
      <p class="font-medium">No signed agreements recorded</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Agreements will appear here after you accept a studio document.
      </p>
    </div>
    <div v-else class="grid gap-4">
      <article
        v-for="agreement in agreements"
        :key="agreement.id"
        class="rounded-xl border bg-card p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="font-semibold">{{ agreement.title }}</h2>
            <p
              v-if="agreement.studioName"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ agreement.studioName }}
            </p>
          </div>
          <span v-if="agreement.version" class="text-xs text-muted-foreground">
            Version {{ agreement.version }}
          </span>
        </div>
        <p
          v-if="agreement.acceptedAt"
          class="mt-3 text-sm text-muted-foreground"
        >
          Accepted {{ new Date(agreement.acceptedAt).toLocaleDateString() }}
        </p>
      </article>
    </div>
  </section>
</template>
