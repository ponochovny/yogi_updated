<template>
	<div class="max-w-xl mx-auto p-6 bg-white/5 rounded-lg shadow-sm">
		<h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

		<div class="mb-6 flex items-center space-x-4">
			<NuxtImg
				:src="profileData.profileImage || 'https://placehold.net/default.png'"
				alt="Avatar"
				class="w-20 h-20 rounded-full object-cover border"
			/>
			<Button
				type="button"
				class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition"
				@click="openCloudinaryWidget"
			>
				Change Photo
			</Button>
		</div>

		<form class="space-y-4" @submit.prevent="saveProfile">
			<div>
				<Label for="profile-name" class="block text-sm font-medium mb-1"
					>Name</Label
				>
				<Input
					id="profile-name"
					v-model="profileData.name"
					type="text"
					class="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			<div>
				<Label for="profile-bio" class="block text-sm font-medium mb-1"
					>About (Bio)</Label
				>
				<Textarea
					id="profile-bio"
					v-model="profileData.bio"
					rows="4"
					class="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			<Button
				type="submit"
				:disabled="isSaving"
				class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition disabled:opacity-50"
			>
				{{ isSaving ? 'Updating...' : 'Update Profile' }}
			</Button>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { user as DrizzleUser } from '@/../server/utils/db/auth-schema'
import { toast } from 'vue-sonner'

const { data: sessionData } = await useFetch<{
	user: typeof DrizzleUser.$inferSelect
}>('/api/auth/get-session')

useHead({
	script: [
		{
			src: 'https://upload-widget.cloudinary.com/global/all.js',
			defer: true,
		},
	],
})
definePageMeta({
	middleware: ['auth'],
})

const profileData = ref({
	name: sessionData.value?.user.name || '',
	bio: sessionData.value?.user.bio || '',
	profileImage: sessionData.value?.user.image || '',
})
const isSaving = ref(false)

const openCloudinaryWidget = () => {
	if (typeof window !== 'undefined' && window.cloudinary) {
		const widget = window.cloudinary.createUploadWidget(
			{
				cloudName: 'dllruwqbd',
				uploadPreset: 'yogi_uploads',
				sources: ['local', 'url', 'camera'],
				multiple: false,
				cropping: true,
				croppingAspectRatio: 1,
				clientAllowedFormats: ['png', 'jpeg', 'webp'],
				maxImageFileSize: 5000000,
			},
			(error, result) => {
				if (!error && result && result.event === 'success') {
					const croppedUrl = result.info.secure_url.replace(
						'/upload/',
						'/upload/w_100,h_100,c_thumb,g_custom/',
					)

					profileData.value.profileImage = croppedUrl
				}
			},
		)
		widget.open(
			null,
			profileData.value.profileImage
				? {
						files: [
							profileData.value.profileImage.replace(
								'/upload/w_100,h_100,c_thumb,g_custom/',
								'/upload/',
							),
						],
					}
				: undefined,
		)
	}
}

const saveProfile = async () => {
	isSaving.value = true
	try {
		const response = await $fetch('/api/account/profile', {
			method: 'PUT',
			body: {
				name: profileData.value.name,
				bio: profileData.value.bio,
				profileImage: profileData.value.profileImage,
			},
		})
		toast.success('Profile updated successfully!')
		console.log(response)
	} catch (error) {
		toast.error(
			'Failed to update profile: ' +
				(error instanceof Error ? error.message : 'Unknown error'),
		)
		console.error('Error:', error)
	} finally {
		isSaving.value = false
	}
}
</script>
