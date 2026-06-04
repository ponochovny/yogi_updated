<script setup lang="ts">
import { BadgeCheck, ChevronsUpDown, LogOut, Sparkles } from '@lucide/vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/shared/ui/sidebar'
import { signOut } from '@/utils/auth-client'

defineProps<{
	user: {
		name: string
		email: string
		avatar: string
		role: string[] | string
	}
}>()

const { isMobile } = useSidebar()

const signOutHandler = async () => {
	await signOut().finally(() => navigateTo('/'))
}
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar class="h-8 w-8 rounded-lg">
							<AvatarImage :src="user.avatar" :alt="user.name" />
							<AvatarFallback class="rounded-lg"> CN </AvatarFallback>
						</Avatar>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{{ user.name }}</span>
							<span class="truncate text-xs">{{ user.email }}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
					:side="isMobile ? 'bottom' : 'right'"
					align="end"
					:side-offset="4"
				>
					<template v-if="user.role.length > 1">
						<DropdownMenuGroup>
							<DropdownMenuItem v-if="user.role.includes('practitioner')">
								<NuxtLink to="/" class="flex items-center gap-2">
									<Sparkles />
									Practitioner
								</NuxtLink>
							</DropdownMenuItem>
							<DropdownMenuItem v-if="user.role.includes('business')">
								<NuxtLink to="/business" class="flex items-center gap-2">
									<BadgeCheck />
									Business owner
								</NuxtLink>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
					</template>
					<DropdownMenuItem @click="signOutHandler">
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
