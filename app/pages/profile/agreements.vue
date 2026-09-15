<script setup lang="ts">
import { FileCheck2Icon } from '@lucide/vue'

definePageMeta({ title: 'Agreements', breadcrumbs: [{ name: 'Agreements' }] })
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
    <div class="rounded-xl border border-dashed p-8 text-center">
      <FileCheck2Icon class="mx-auto mb-3 size-8 text-muted-foreground" />
      <p class="font-medium">No signed agreements recorded</p>
      <p class="mt-1 text-sm text-muted-foreground">
        Agreements will appear here after you accept a studio document.
      </p>
    </div>
  </section>
</template>
