<script setup lang="ts">
import type { SidebarProps } from '@/shared/ui/sidebar'
import { useSession } from '@/utils/auth-client'

import NavMenu from './NavMenu.vue'
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
import { placeholderImageUrl } from '~/config/constants.js'
import { userRoles } from '~~/server/auth/config.js'

const props = withDefaults(defineProps<SidebarProps>(), {
	variant: 'inset',
})

const session = useSession()

const workspaceRoles =
	// @ts-expect-error: role is an array in the session, but we want to display a single role in the NavUser component. We can take the first role from the array for display purposes.
	session.value?.data?.user?.workspaces?.map((el) => el.role) ?? []

// TODO: prevent flickery when session gets updated
const userData = computed(() => ({
	name: session.value?.data?.user?.name || 'John Doe',
	email: session.value?.data?.user?.email || 'john@example.com',
	avatar:
		session.value?.data?.user?.image?.replace(
			'/upload/',
			'/upload/w_100,h_100,c_thumb,g_custom/',
		) || placeholderImageUrl,

	role: workspaceRoles[0] ?? userRoles.USER,
}))

const sidebarProps = inject('sidebarProps', [
	{
		group: '',
		menuLinks: [],
	},
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
				<NavUser :user="userData" />
			</ClientOnly>
		</SidebarFooter>
	</Sidebar>
</template>
