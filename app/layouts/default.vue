<script lang="ts" setup>
import 'vue-sonner/style.css'

import LayoutHeader from './_components/header.vue'
import LayoutFooter from './_components/footer.vue'
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <DevOnly>
      <div
        class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md dark:bg-white/10 text-sm text-muted-foreground z-50 opacity-50 pointer-events-none"
      >
        <div>layouts/default.vue</div>
      </div>
    </DevOnly>
    <LayoutHeader />
    <main class="flex-1 pt-20 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
      <slot />
    </main>
    <LayoutFooter />
    <Toaster position="bottom-center" rich-colors />
  </div>
</template>
