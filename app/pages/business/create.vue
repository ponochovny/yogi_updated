<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldArray, useForm } from 'vee-validate'
import { XIcon } from '@lucide/vue'
import {
	createStudioSchema,
	type CreateStudioInput,
} from '~/entities/studio/schema'
import openUploadWidget from '~/shared/composables/useCloudinary'
import { toast } from 'vue-sonner'

definePageMeta({
	title: 'Studio Creation',
	breadcrumbs: [
		{ name: 'Main Dashboard', url: '/business' },
		{ name: 'Create Studio', url: '/business/create' },
	],
})

useHead({
	script: [
		{
			src: 'https://upload-widget.cloudinary.com/global/all.js',
			defer: true,
		},
	],
})

const currencies = ['USD', 'EUR']
const categories = [
	'Flow Arts',
	'Yoga',
	'Meditation',
	'Breath work',
	'Aerial',
	'Energy Reading & Healing',
	'Dance',
	'Massage',
	'Pilates',
	'Physiotherapy',
	'Coaching',
	'Acupuncture',
	'Psychotherapy',
	'Sound Healing',
	'Transformational Tool',
]
const types = [
	'Festival',
	'Retreat',
	'Workshop',
	'Teacher Training',
	'Course',
	'Group Class',
	'Private Session',
	'Treatment',
	'Private Party',
]
const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const studioSchema = toTypedSchema(createStudioSchema)

const form = useForm({
	validationSchema: studioSchema,
	initialValues: {
		name: '',
		locations: [
			{
				name: 'Main Location',
				country: '',
				city: '',
				address: '',
				timezone: localTimezone, // Automatically set (e.g. 'Europe/Kyiv')
			},
		],
		currency: currencies[0],
		bio: '',
		mission: '',
		categories: [],
		types: [],
		logo: undefined,
		gallery: [],
	},
})

const errorMsg = ref('')
const isProcessing = ref(false)

const createStudio = form.handleSubmit(async (values) => {
	errorMsg.value = ''

	console.log('Form Values:', values)

	await submitStudio(values)

	// try {
	// 	// Call your API to create the studio with the form values
	// 	// Example: await api.createStudio(values)
	// 	// On success, you can redirect or show a success message

	// } catch {
	// 	errorMsg.value = 'Failed to create studio. Please try again.'
	// } finally {
	// 	isProcessing.value = false
	// }
})

const {
	fields: locationFields,
	push: addLocation,
	remove: removeLocation,
} = useFieldArray('locations')

const submitStudio = async (values: CreateStudioInput) => {
	isProcessing.value = true

	try {
		const response = await $fetch('/api/studios', {
			method: 'POST',
			body: values,
		})

		if (response.studio) {
			toast.success('Studio created successfully!')
			navigateTo(`/business/${response.studio.slug}`)
		}
	} catch (error) {
		toast.error(
			(error as Error).message || 'Failed to create studio. Please try again.',
		)
	} finally {
		isProcessing.value = false
	}
}

const uploadLogo = () => {
	openUploadWidget({ multiple: false, cropping: true }, (media) => {
		form.setFieldValue('logo', media)
	})
	// widget.open(
	// 	null,
	// 	form.values.logo
	// 		? {
	// 				files: [
	// 					form.values.logo.url?.replace(
	// 						'/upload/w_100,h_100,c_thumb,g_custom/',
	// 						'/upload/',
	// 					),
	// 				],
	// 			}
	// 		: undefined,
	// )
}
const uploadGallery = () => {
	openUploadWidget({ multiple: true, cropping: false }, (media) => {
		form.setFieldValue('gallery', [...(form.values.gallery || []), media])
	})
	// widget.open(
	// 	null,
	// 	form.values.gallery && form.values.gallery.length > 0
	// 		? {
	// 				files: [
	// 					form.values.gallery && form.values.gallery.length > 0
	// 						? form.values.gallery.map((image) =>
	// 								image.url.replace('/upload/c_thumb,g_custom/', '/upload/'),
	// 							)
	// 						: '',
	// 				],
	// 			}
	// 		: undefined,
	// )
}

const removeFromGallery = (index: number) => {
	form.setFieldValue(
		'gallery',
		form.values.gallery?.filter((_, i) => i !== index) || [],
	)
}
</script>

<template>
	<div>
		<form class="space-y-4" @submit.prevent="createStudio">
			<div class="space-y-6">
				<h2 class="text-lg font-semibold border-b pb-2">Studio Logo</h2>
				<div class="mb-6 flex items-center space-x-4">
					<NuxtImg
						:src="form.values.logo?.url || 'https://placehold.net/default.png'"
						alt="Avatar"
						class="w-20 h-20 rounded-full object-cover border"
					/>
					<Button
						type="button"
						class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition"
						@click="uploadLogo"
					>
						Set Logo
					</Button>
				</div>
				<h2 class="text-lg font-semibold border-b pb-2">
					Gallery (Interior, hall)
				</h2>
				<div class="mb-6 flex items-center flex-wrap space-x-4 space-y-4">
					<div
						v-for="(image, index) in form.values.gallery"
						:key="index"
						class="relative"
					>
						<NuxtImg
							:src="image.url || 'https://placehold.net/default.png'"
							class="h-40 aspect-video rounded-2xl object-cover border"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute top-2 right-2 text-red-500 hover:text-red-700"
							@click="removeFromGallery(index)"
						>
							<XIcon class="w-4 h-4" />
						</Button>
					</div>
					<NuxtImg
						v-if="!form.values.gallery?.length"
						:src="'https://placehold.net/default.png'"
						class="h-40 aspect-video rounded-2xl object-cover border"
					/>
					<Button
						type="button"
						class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition"
						@click="uploadGallery"
					>
						Set Gallery
					</Button>
				</div>
				<h2 class="text-lg font-semibold border-b pb-2">1. Main Information</h2>
				<FormField v-slot="{ componentField }" name="name">
					<FormItem>
						<FormLabel>Studio Name</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter studio name"
								type="text"
								v-bind="componentField"
								autocomplete="off"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="bio">
					<FormItem>
						<FormLabel>Bio</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Enter studio bio"
								v-bind="componentField"
								autocomplete="off"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="mission">
					<FormItem>
						<FormLabel>Mission</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Enter studio mission"
								v-bind="componentField"
								autocomplete="off"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>

				<div class="flex items-center justify-between border-b pb-2">
					<h2 class="text-lg font-semibold">2. Locations</h2>
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="text-sm font-medium"
						@click="addLocation({ country: '', city: '', address: '' })"
					>
						+ Add Location
					</Button>
				</div>
				<div
					v-for="(location, index) in locationFields"
					:key="location.key"
					class="flex flex-col gap-4"
				>
					<!-- class="grid grid-cols-[repeat(3,1fr)_auto] gap-2 items-end" -->
					<div class="p-6 rounded-2xl bg-white/10">
						<div class="flex items-center justify-between mb-2">
							<h3 class="font-medium mb-3">Location #{{ index + 1 }}</h3>
							<Button
								v-if="index !== 0"
								type="button"
								variant="ghost"
								size="icon"
								class="text-red-500 hover:text-red-700"
								@click="removeLocation(index)"
							>
								<XIcon class="w-4 h-4" />
							</Button>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<FormField
								v-slot="{ componentField: innerField }"
								:name="`locations[${index}].name`"
							>
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter name"
											type="text"
											v-bind="innerField"
											autocomplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
							<FormField
								v-slot="{ componentField: innerField }"
								:name="`locations[${index}].timezone`"
							>
								<FormItem>
									<FormLabel>Timezone</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter timezone"
											type="text"
											v-bind="innerField"
											autocomplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
							<FormField
								v-slot="{ componentField: innerField }"
								:name="`locations[${index}].country`"
							>
								<FormItem>
									<FormLabel>Country</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter country"
											type="text"
											v-bind="innerField"
											autocomplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
							<FormField
								v-slot="{ componentField: innerField }"
								:name="`locations[${index}].city`"
							>
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter city"
											type="text"
											v-bind="innerField"
											autocomplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
							<FormField
								v-slot="{ componentField: innerField }"
								:name="`locations[${index}].address`"
							>
								<FormItem class="col-span-2">
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter address"
											type="text"
											v-bind="innerField"
											autocomplete="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							</FormField>
						</div>
					</div>
				</div>
				<FormField v-slot="{ componentField }" name="currency">
					<FormItem>
						<FormLabel>Currency</FormLabel>
						<FormControl>
							<Select v-bind="componentField">
								<SelectTrigger class="w-full">
									<SelectValue placeholder="Select currencies" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Currencies</SelectLabel>
										<SelectItem
											v-for="currency in currencies"
											:key="currency"
											:value="currency"
										>
											{{ currency }}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="categories">
					<FormItem>
						<FormLabel>Categories</FormLabel>
						<FormControl>
							<Select v-bind="componentField" multiple>
								<SelectTrigger class="w-full">
									<SelectValue placeholder="Select categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Categories</SelectLabel>
										<SelectItem
											v-for="cat in categories"
											:key="cat"
											:value="cat"
										>
											{{ cat }}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
				<FormField v-slot="{ componentField }" name="types">
					<FormItem>
						<FormLabel>Types</FormLabel>
						<FormControl>
							<Select v-bind="componentField" multiple>
								<SelectTrigger class="w-full">
									<SelectValue placeholder="Select types" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Types</SelectLabel>
										<SelectItem v-for="type in types" :key="type" :value="type">
											{{ type }}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				</FormField>
			</div>
			<div class="mt-6 flex justify-end">
				<Button type="submit" :disabled="isProcessing"> Create Studio </Button>
			</div>

			<p v-if="errorMsg" class="mt-4 text-sm text-destructive">
				{{ errorMsg }}
			</p>
		</form>
	</div>
</template>
