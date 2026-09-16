<script lang="ts" setup>
import 'vue-sonner/style.css'
import SidebarDashboardLayout from '~/widgets/sidebar-dashboard/index.vue'
import {
  CreditCardIcon,
  FileTextIcon,
  PlusIcon,
  ShoppingCartIcon,
  UserIcon,
  WalletCardsIcon
} from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'

const sidebarProps = [
  {
    group: 'Platform',
    menuLinks: [
      {
        name: 'Profile',
        url: PagesConfig.PROFILE,
        icon: UserIcon
      },
      {
        name: 'My Bookings',
        url: PagesConfig.MY_BOOKINGS,
        icon: ShoppingCartIcon
      },
      {
        name: 'My Passes',
        url: PagesConfig.MY_PASSES,
        icon: WalletCardsIcon
      },
      {
        name: 'Transactions',
        url: PagesConfig.MY_TRANSACTIONS,
        icon: CreditCardIcon
      },
      {
        name: 'Agreements',
        url: PagesConfig.PROFILE_AGREEMENTS,
        icon: FileTextIcon
      }
    ]
  },
  {
    group: 'Business',
    menuLinks: [
      {
        name: 'Create studio',
        url: PagesConfig.BUSINESS,
        icon: PlusIcon
      }
    ]
  }
]
provide('sidebarProps', sidebarProps)
</script>

<template>
  <SidebarDashboardLayout>
    <NuxtLoadingIndicator color="var(--color-primary)" />
    <DevOnly>
      <div
        class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md bg-white/10 text-sm text-muted-foreground z-50 opacity-50 pointer-events-none"
      >
        <div>layouts/dashboard-user.vue</div>
      </div>
    </DevOnly>
    <slot />
    <Toaster position="bottom-center" rich-colors />
  </SidebarDashboardLayout>
</template>
