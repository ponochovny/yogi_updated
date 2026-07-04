<script setup lang="ts">
import type { SidebarProps } from '@/shared/ui/sidebar'

import NavMenu from './NavMenu.vue'
import NavUser from './NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/shared/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset'
})

const { userData, session } = useUserData()

const sidebarProps = inject('sidebarProps', [
  {
    group: '',
    menuLinks: []
  }
])
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-full bg-white/10 text-sidebar-primary-foreground"
              >
                <NuxtImg
                  src="/img/logoBg.svg"
                  alt="Yogi app"
                  width="40"
                  height="40"
                  class="rounded-full object-contain"
                />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Yogi App</span>
                <!-- <span class="truncate text-xs">Enterprise</span> -->
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMenu
        v-for="(item, index) in sidebarProps || []"
        :key="index"
        :group="item?.group || ''"
        :menu-items="item?.menuLinks || []"
      />
    </SidebarContent>
    <SidebarFooter>
      <ClientOnly>
        <NavUser
          :user="userData"
          :class="{ 'opacity-70': session.isPending }"
          class="transition-opacity"
        />
      </ClientOnly>
    </SidebarFooter>
  </Sidebar>
</template>
