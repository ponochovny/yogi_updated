<script setup lang="ts">
import { placeholderImageUrl } from '~/config/constants'
import { userRoles } from '~~/server/auth/config'

definePageMeta({
	title: 'Team Management',
	breadcrumbs: [{ name: 'Businesses', url: '/business' }, { name: 'Team' }],
})

const route = useRoute()
const slug = route.params.slug as string

const form = ref({
	name: '',
	email: '',
	role: userRoles.PRACTITIONER,
})

const isSubmitting = ref(false)

const { data, refresh, pending } = await useFetch(
	`/api/business/studios/${slug}/practitioners`,
)
const team = computed(() => data.value?.team || [])

const addTeamMember = async () => {
	if (!form.value.email || !form.value.name) return
	isSubmitting.value = true

	try {
		await $fetch(`/api/business/studios/${slug}/members`, {
			method: 'POST',
			body: form.value,
		})

		form.value.name = ''
		form.value.email = ''
		await refresh()
	} catch (error) {
		alert((error as Error).message || 'Error adding team member')
	} finally {
		isSubmitting.value = false
	}
}

useHead({
	title: () => `${slug || 'Studio'} - Team Management`,
})
</script>

<template>
	<div class="space-y-8">
		<h1 class="text-2xl font-bold">Team</h1>

		<div class="bg-white/10 p-6 rounded-xl border shadow-sm">
			<h2 class="text-lg font-semibold mb-4">Add Team Member</h2>
			<form class="flex items-end gap-4" @submit.prevent="addTeamMember">
				<div class="flex-1">
					<label class="block text-sm font-medium mb-1">Name</label>
					<Input
						v-model="form.name"
						type="text"
						class="w-full"
						placeholder="John Doe"
						required
					/>
				</div>
				<div class="flex-1">
					<label class="block text-sm font-medium mb-1">Email</label>
					<Input
						v-model="form.email"
						type="email"
						class="w-full"
						placeholder="john@example.com"
						required
					/>
				</div>
				<div class="w-40">
					<label class="block text-sm font-medium mb-1">Role</label>
					<div class="*:w-full">
						<NativeSelect v-model="form.role">
							<NativeSelectOption :value="userRoles.PRACTITIONER">
								Trainer
							</NativeSelectOption>
							<NativeSelectOption :value="userRoles.MANAGER">
								Manager
							</NativeSelectOption>
						</NativeSelect>
					</div>
				</div>
				<Button type="submit" :disabled="isSubmitting">
					{{ isSubmitting ? '...' : 'Add Member' }}
				</Button>
			</form>
		</div>

		<div class="bg-white/10 rounded-xl border shadow-sm overflow-hidden">
			<div v-if="pending" class="p-8 text-center text-gray-300">Loading...</div>

			<table v-else class="w-full text-left">
				<thead class="bg-white/10 border-b">
					<tr>
						<th class="px-6 py-3 text-sm font-medium text-gray-300">
							Team Member
						</th>
						<th class="px-6 py-3 text-sm font-medium text-gray-300">Role</th>
						<th class="px-6 py-3 text-sm font-medium text-gray-300">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					<tr v-for="member in team" :key="member.linkId">
						<td class="px-6 py-4 flex items-center gap-3">
							<NuxtImg
								:src="
									member.user.image?.replace(
										'/upload/',
										'/upload/w_100,h_100,c_thumb,g_custom/',
									) || placeholderImageUrl
								"
								class="w-10 h-10 rounded-full bg-gray-100 object-cover"
							/>
							<div>
								<div class="font-medium text-gray-200">
									{{ member.user.name }}
								</div>
								<div class="text-sm text-gray-300">{{ member.user.email }}</div>
							</div>
						</td>
						<td class="px-6 py-4 text-sm text-gray-200">
							{{
								member.role === userRoles.MANAGER
									? 'Manager'
									: member.role === userRoles.BUSINESS
										? 'Owner'
										: 'Trainer'
							}}
						</td>
						<td class="px-6 py-4">
							<span
								v-if="member.user.emailVerified"
								class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
								>Active</span
							>
							<span
								v-else
								class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
								>Waiting to sign in</span
							>
						</td>
					</tr>
					<tr v-if="team.length === 0">
						<td colspan="3" class="px-6 py-8 text-center text-gray-300">
							No team members yet
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
