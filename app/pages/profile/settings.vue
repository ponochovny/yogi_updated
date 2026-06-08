<script setup lang="ts">
import type { user as DrizzleUser } from '~~/server/db/schema/auth-schema'
import { toast } from 'vue-sonner'
import { placeholderImageUrl } from '~/config/constants'
import { useForm } from 'vee-validate'
import {
	updateProfileSchema,
	type CreateProfileInput,
} from '~/entities/profile/schema'
import { toTypedSchema } from '@vee-validate/zod'
import openUploadWidget from '~/shared/composables/useCloudinary'

useHead({
	script: [
		{
			src: 'https://upload-widget.cloudinary.com/global/all.js',
			defer: true,
		},
	],
})
definePageMeta({
	title: 'Profile settings',
	breadcrumbs: [{ name: 'Profile settings' }],
})

const { data: sessionData } = await useFetch<{
	user: typeof DrizzleUser.$inferSelect
}>('/api/auth/get-session')
const user = computed(() => sessionData.value?.user)

const profileSchema = toTypedSchema(updateProfileSchema)

const {
	isValidating,
	isSubmitting,
	values: formValues,
	handleSubmit,
	// setFieldValue,
} = useForm({
	validationSchema: profileSchema,
	initialValues: {
		name: user.value?.name || '',
		bio: user.value?.bio || '',
		avatar: {
			url: user.value?.image || '',
			providerPublicId: '',
		},
		role: user.value?.role || [],
	},
})
const errorMsg = ref('')
const isProcessing = ref(false)
const submitDisabled = computed(
	() => isProcessing.value || isValidating.value || isSubmitting.value,
)

// const profileData = ref({
// 	name: sessionData.value?.user.name || '',
// 	bio: sessionData.value?.user.bio || '',
// 	profileImage: sessionData.value?.user.image || '',
// 	role: sessionData.value?.user.role || [],
// })
// const isSaving = ref(false)

// const openCloudinaryWidget = () => {
// 	if (typeof window !== 'undefined' && window.cloudinary) {
// 		const {
// 			public: { cloudinaryName, cloudinaryUploadPreset },
// 		} = useRuntimeConfig()

// 		const widget = window.cloudinary.createUploadWidget(
// 			{
// 				cloudName: cloudinaryName,
// 				uploadPreset: cloudinaryUploadPreset,
// 				sources: ['local', 'url', 'camera'],
// 				multiple: false,
// 				cropping: true,
// 				croppingAspectRatio: 1,
// 				clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
// 				maxImageFileSize: 5000000,
// 			},
// 			(error, result) => {
// 				if (!error && result && result.event === 'success') {
// 					const croppedUrl = result.info.secure_url.replace(
// 						'/upload/',
// 						'/upload/w_100,h_100,c_thumb,g_custom/',
// 					)

// 					formValues.value.profileImage = croppedUrl
// 				}
// 			},
// 		)
// 		widget.open(
// 			null,
// 			formValues.value.profileImage
// 				? {
// 						files: [
// 							formValues.value.profileImage.replace(
// 								'/upload/w_100,h_100,c_thumb,g_custom/',
// 								'/upload/',
// 							),
// 						],
// 					}
// 				: undefined,
// 		)
// 	}
// }

const saveProfile = async (values: CreateProfileInput) => {
	errorMsg.value = ''
	isProcessing.value = true

	console.log('Form Values:', values)
	try {
		const response = await $fetch('/api/account/profile', {
			method: 'PUT',
			body: {
				name: values.name,
				bio: values.bio,
				avatar: values.avatar,
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
		isProcessing.value = false
	}
}
const submitProfileUpdate = handleSubmit(saveProfile)

// const uploadAvatar = () => {
// 	openUploadWidget({ multiple: true, cropping: false }, (media) => {
// 		setFieldValue('profileImage', [...(formValues.profileImage || []), media])
// 	})
// }
const uploadAvatar = () => {
	openUploadWidget(
		{ multiple: false, cropping: true, isCamera: true, aspectRatio: 1 },
		async (media) => {
			try {
				await $fetch('/api/account/avatar', {
					method: 'POST',
					body: {
						url: media.url,
						providerPublicId: media.providerPublicId,
					},
				})

				toast.success('Avatar updated successfully!')
			} catch (error) {
				toast.error(
					'Failed to upload avatar: ' +
						(error instanceof Error ? error.message : 'Unknown error'),
				)
				console.error('Error:', error)
			}
		},
	)
}
</script>

<template>
	<div>
		<div class="mb-6 flex items-center space-x-4">
			<Avatar class="size-20 text-3xl">
				<AvatarImage
					:src="
						formValues.avatar?.url?.replace(
							'/upload/',
							'/upload/w_100,h_100,c_thumb,g_custom/',
						) || placeholderImageUrl
					"
					alt="Avatar"
					class="object-cover"
				/>
				<AvatarFallback>{{ formValues.name?.[0] }}</AvatarFallback>
			</Avatar>
			<Button type="button" @click="uploadAvatar"> Change Photo </Button>
		</div>

		<form class="space-y-4" @submit.prevent="submitProfileUpdate">
			<div>
				<div
					v-if="formValues.role?.filter((r) => r !== 'user').length"
					class="flex gap-1 flex-wrap mb-4"
				>
					<Badge
						v-for="role in Array.isArray(formValues.role)
							? formValues.role.filter((r) => r !== 'user')
							: [formValues.role]"
						:key="role"
						class="px-2 py-1 text-xs text-white rounded-full"
						:class="
							{
								user: 'bg-blue-500',
								practitioner: 'bg-blue-500',
								business: 'bg-yellow-600',
								'super-admin': 'bg-amber-600',
							}[role] || 'bg-gray-500'
						"
					>
						{{ role.charAt(0).toUpperCase() + role.slice(1) }}
					</Badge>
				</div>
				<Label for="profile-name" class="block text-sm font-medium mb-1">
					Name
				</Label>
				<Input
					id="profile-name"
					v-model="formValues.name"
					type="text"
					class="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			<div>
				<Label for="profile-bio" class="block text-sm font-medium mb-1">
					About (Bio)
				</Label>
				<Textarea
					id="profile-bio"
					v-model="formValues.bio"
					rows="4"
					class="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
				/>
			</div>

			<Button type="submit" :disabled="submitDisabled">
				<Spinner v-if="submitDisabled" />
				{{
					isSubmitting
						? 'Submitting...'
						: isValidating
							? 'Validating...'
							: isProcessing
								? 'Updating...'
								: 'Update Profile'
				}}
			</Button>

			<p v-if="errorMsg" class="mt-4 text-sm text-destructive">
				{{ errorMsg }}
			</p>
		</form>
	</div>
</template>
