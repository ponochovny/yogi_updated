<script lang="ts" setup>
import { PlusIcon } from '@lucide/vue'

const { data: studiosData, pending } = useFetch(`/api/business/studios`)
const studios = computed(() => studiosData.value?.studios)
</script>

<template>
	<div>
		<div v-if="pending" class="flex justify-center py-20">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
		</div>
		<div
			v-else-if="studios?.length === 0"
			class="size-full rounded-4xl bg-white/10 flex items-center justify-center p-24 flex-col gap-4 text-center"
		>
			<h2 class="text-4xl">Create your studio</h2>
			<p class="text-gray-300 max-w-xl mx-auto mb-6">
				Create your first studio to start add offerings, practitioners and
				schedules
			</p>
			<Button as-child variant="outline" size="lg">
				<NuxtLink to="/business/create" class="inline-flex gap-1 items-center">
					<PlusIcon />
					Create Studio
				</NuxtLink>
			</Button>
		</div>
		<div v-else>
			<div class="grid grid-cols-1 gap-6">
				<NuxtLink
					v-for="studio in studios"
					:key="studio.id"
					:to="`/business/${studio.slug}`"
					class="group block bg-white/10 rounded-2xl p-6 shadow-sm border border-gray-600 hover:shadow-md hover:border-gray-500 transition-all"
				>
					<div class="flex items-start gap-4 mb-6">
						<div
							class="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden"
						>
							<NuxtImg
								v-if="studio.logo"
								:src="studio.logo"
								class="w-full h-full object-cover"
							/>
							<div
								v-else
								class="w-full h-full flex items-center justify-center text-muted font-bold text-xl"
							>
								{{ studio.name.charAt(0).toUpperCase() }}
							</div>
						</div>

						<div class="flex-1 min-w-0">
							<h3 class="text-lg font-bold truncate">
								{{ studio.name }}
							</h3>
							<p class="text-sm text-gray-300 truncate mt-0.5">
								{{ studio.categories?.join(', ') || 'No categories' }}
							</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-500">
						<div>
							<p
								class="text-xs text-gray-300 font-medium uppercase tracking-wider mb-1"
							>
								Locations
							</p>
							<p class="text-sm font-semibold">
								{{ studio.locations.length }}
							</p>
						</div>
						<div>
							<p
								class="text-xs text-gray-300 font-medium uppercase tracking-wider mb-1"
							>
								Currency
							</p>
							<p class="text-sm font-semibold">
								{{ studio.currency }}
							</p>
						</div>
					</div>
				</NuxtLink>
			</div>

			<Button as-child variant="outline" size="lg" class="w-full mt-6">
				<NuxtLink to="/business/create" class="flex gap-1 items-center">
					<PlusIcon />
					Create Studio
				</NuxtLink>
			</Button>
		</div>
	</div>
</template>
