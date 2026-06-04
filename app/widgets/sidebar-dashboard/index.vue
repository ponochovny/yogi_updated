<script lang="ts" setup>
import AppSidebar from '@/shared/components/AppSidebar.vue'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Separator } from '@/shared/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/shared/ui/sidebar'

const route = useRoute()

const pageTitle = computed(() => route.meta.title || 'Unnamed Page')
const breadcrumbs = computed(
	() => (route.meta.breadcrumbs as { name: string; url: string }[]) || [],
)
</script>

<template>
	<SidebarProvider>
		<AppSidebar />
		<SidebarInset>
			<header class="flex h-16 shrink-0 items-center gap-2">
				<div class="flex items-center gap-2 px-4">
					<SidebarTrigger class="-ml-1" />
					<Separator
						orientation="vertical"
						class="mr-2 data-[orientation=vertical]:h-4"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<template v-if="breadcrumbs.length === 0">
								<BreadcrumbItem>
									<BreadcrumbPage>{{ pageTitle }}</BreadcrumbPage>
								</BreadcrumbItem>
							</template>
							<template v-else>
								<BreadcrumbItem
									v-for="(breadcrumb, index) in breadcrumbs"
									:key="index"
								>
									<BreadcrumbLink
										v-if="breadcrumb.url !== $route.path"
										:href="breadcrumb.url"
									>
										{{ breadcrumb.name }}
									</BreadcrumbLink>
									<BreadcrumbPage v-else>{{ breadcrumb.name }}</BreadcrumbPage>

									<BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
								</BreadcrumbItem>
							</template>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div class="p-4 pt-0 flex-1">
				<div class="h-full p-6 bg-white/5 rounded-lg shadow-sm">
					<slot />
				</div>
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
