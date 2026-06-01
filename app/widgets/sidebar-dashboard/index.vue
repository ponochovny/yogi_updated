<script lang="ts" setup>
import AppSidebar from '@/shared/components/AppSidebar.vue'
// import {
// 	Breadcrumb,
// 	BreadcrumbItem,
// 	BreadcrumbLink,
// 	BreadcrumbList,
// 	BreadcrumbPage,
// 	BreadcrumbSeparator,
// } from '@/shared/ui/breadcrumb'
// import { Separator } from '@/shared/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	// SidebarTrigger,
} from '@/shared/ui/sidebar'
</script>

<template>
	<SidebarProvider>
		<AppSidebar />
		<SidebarInset>
			<div class="flex flex-1 flex-col gap-4 p-4">
				<!-- <div class="grid auto-rows-min gap-4 md:grid-cols-3">
					<div class="bg-muted/50 aspect-video rounded-xl" />
					<div class="bg-muted/50 aspect-video rounded-xl" />
					<div class="bg-muted/50 aspect-video rounded-xl" />
				</div>
				<div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" /> -->
				<slot />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
