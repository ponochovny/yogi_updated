<script setup lang="ts">
import { PagesConfig } from '~/config/pages.config'
import type { SidebarProps } from '@/shared/ui/sidebar'
import { useSession } from '@/utils/auth-client'
import type { user as DrizzleUser } from '@/../server/utils/db/auth-schema'

import { InfoIcon, MapPinIcon, ShoppingCartIcon } from '@lucide/vue'

import NavProjects from './NavProjects.vue'
import NavUser from './NavUser.vue'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/shared/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
	variant: 'inset',
})

const session = useSession()

const user = session.value?.data
	?.user as unknown as typeof DrizzleUser.$inferSelect

const userData = computed(() => ({
	name: session.value?.data?.user?.name || 'John Doe',
	email: session.value?.data?.user?.email || 'john@example.com',
	avatar:
		session.value?.data?.user?.image || 'https://placehold.net/default.png',
	role: session.value?.data?.user?.role || ['user'],
}))

const data = {
	user: {
		name: user?.name || 'John Doe',
		email: user?.email || 'john@example.com',
		avatar: user?.image || 'https://placehold.net/default.png',
		role: user?.role || ['user'],
	},
	projects: [
		{
			name: 'General',
			url: PagesConfig.PROFILE_SETTINGS,
			icon: InfoIcon,
		},

		{
			name: 'Location & Categories',
			url: PagesConfig.PROFILE_ADDITIONAL, //
			icon: MapPinIcon,
		},
		{
			name: 'Purchase History',
			url: PagesConfig.PROFILE_VENUES,
			icon: ShoppingCartIcon,
		},
	],
}
</script>

<template>
	<Sidebar v-bind="props">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" as-child>
						<NuxtLink to="/">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<NuxtImg
									src="https://placehold.net/default.png"
									width="40"
									height="40"
									alt="Yogi Logo"
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
			<NavProjects :projects="data.projects" />
		</SidebarContent>
		<SidebarFooter>
			<NavUser :user="userData" />
		</SidebarFooter>
	</Sidebar>
</template>
