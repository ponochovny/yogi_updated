<script setup lang="ts">
import { format } from 'date-fns'
import { ShoppingBagIcon } from '@lucide/vue'

definePageMeta({ title: 'My passes', breadcrumbs: [{ name: 'My passes' }] })
const { data, pending, error } = await useFetch('/api/account/passes')
const passes = computed(() => data.value?.passes ?? [])
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-muted-foreground">Wallet</p>
        <h1 class="text-3xl font-semibold tracking-tight">My passes</h1>
      </div>
      <Button as-child
        ><NuxtLink to="/explore"
          ><ShoppingBagIcon class="mr-2 size-4" /> Buy a pass</NuxtLink
        ></Button
      >
    </div>
    <p v-if="pending" class="text-muted-foreground">Loading passes...</p>
    <p v-else-if="error" class="text-destructive">Failed to load passes.</p>
    <div
      v-else-if="!passes.length"
      class="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
    >
      You have no active passes.
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <article
        v-for="pass in passes"
        :key="pass.id"
        class="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div class="flex justify-between gap-4">
          <div>
            <p class="text-sm text-muted-foreground">{{ pass.studio.name }}</p>
            <h2 class="text-xl font-semibold">{{ pass.name }}</h2>
          </div>
          <span
            class="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
            >{{ pass.status }}</span
          >
        </div>
        <div class="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Remaining credits</p>
            <p class="text-2xl font-semibold">
              {{ pass.remainingCredits ?? 'Unlimited' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Valid until</p>
            <p class="font-medium">
              {{ format(new Date(pass.validUntil), 'MMM d, yyyy') }}
            </p>
          </div>
        </div>
        <p class="mt-5 border-t pt-4 text-sm text-muted-foreground">
          Daily visit limit: Not specified by this studio
        </p>
      </article>
    </div>
  </section>
</template>
