<script setup lang="ts">
import { MoonIcon, SunIcon } from '@lucide/vue'

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="relative h-9 w-9 rounded-full"
    @click="toggleTheme"
  >
    <SunIcon
      class="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90"
    />
    <MoonIcon
      class="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
