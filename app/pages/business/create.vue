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
import { placeholderImageUrl } from '~/config/constants'

definePageMeta({
	title: 'Studio Creation',
	breadcrumbs: [
		{ name: 'Main Dashboard', url: '/business' },
		{ name: 'Create Studio', url: '/business/create' },
	],
})

useHead({
	title: 'Studio Creation',
	script: [
		{
			src: 'https://upload-widget.cloudinary.com/global/all.js',
			defer: true,
		},
	],
})

const { data: paramsData } = await useFetch('/api/params', {
	method: 'GET',
})

const types = computed(() => paramsData.value?.params.types || [])
const categories = computed(() => paramsData.value?.params.categories || [])
const currencies = computed(() => paramsData.value?.params.currencies || [])

const studioSchema = toTypedSchema(createStudioSchema)

const {
	isValidating,
	isSubmitting,
	values: formValues,
	handleSubmit,
	setFieldValue,
} = useForm({
	validationSchema: studioSchema,
	initialValues: {
		name: '',
		locations: [
			{
				name: 'Main Location',
				country: '',
				city: '',
				address: '',
				timezone: guessUserTimezone(),
			},
		],
		currency: paramsData.value?.params.currencies[0]?.id || '',
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
const submitDisabled = computed(
	() => isProcessing.value || isValidating.value || isSubmitting.value,
)

const {
	fields: locationFields,
	push: addLocation,
	remove: removeLocation,
} = useFieldArray('locations')

const submitStudio = handleSubmit(async (values) => createStudio(values))

const createStudio = async (values: CreateStudioInput) => {
	errorMsg.value = ''
	isProcessing.value = true

	try {
		const response = await $fetch('/api/business/studios', {
			method: 'POST',
			body: values,
		})

		if (response.studio) {
			toast.success('Studio created successfully!')
			navigateTo(`/business/${response.studio.slug}`)
		}
	} catch (error) {
		toast.error('Failed to create studio. Please try again.', {
			description: (error as Error).message || 'Unknown error.',
		})
	} finally {
		isProcessing.value = false
	}
}

// MEDIA FLOW >
const uploadLogo = () => {
	openUploadWidget({ multiple: false, cropping: true }, (media) => {
		setFieldValue('logo', media)
	})
}
const uploadGallery = () => {
	openUploadWidget({ multiple: true, cropping: false }, (media) => {
		setFieldValue('gallery', [...(formValues.gallery || []), media])
	})
}
const removeFromGallery = (index: number) => {
	setFieldValue(
		'gallery',
		formValues.gallery?.filter((_, i) => i !== index) || [],
	)
}
// MEDIA FLOW <
</script>

<template>
	<div>
		<form class="space-y-4" @submit.prevent="submitStudio">
			<div class="space-y-6">
				<h2 class="text-lg font-semibold border-b pb-2">Studio Logo</h2>
				<div class="mb-6 flex items-center space-x-4">
					<NuxtImg
						:src="formValues.logo?.url || placeholderImageUrl"
						alt="Avatar"
						class="w-20 h-20 rounded-full object-cover border"
					/>
					<Button type="button" @click="uploadLogo"> Set Logo </Button>
				</div>
				<h2 class="text-lg font-semibold border-b pb-2">
					Gallery (Interior, hall)
				</h2>
				<div class="mb-6 flex items-center flex-wrap space-x-4 space-y-4">
					<div
						v-for="(image, index) in formValues.gallery"
						:key="index"
						class="relative"
					>
						<NuxtImg
							:src="image.url || placeholderImageUrl"
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
						v-if="!formValues.gallery?.length"
						:src="placeholderImageUrl"
						class="h-40 aspect-video rounded-2xl object-cover border"
					/>
					<Button type="button" @click="uploadGallery"> Set Gallery </Button>
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
								<SelectContent position="item-aligned">
									<SelectGroup>
										<SelectLabel>Currencies</SelectLabel>
										<SelectItem
											v-for="currency in currencies"
											:key="currency.id"
											:value="currency.id"
										>
											{{ currency.name }}
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
								<SelectContent position="item-aligned">
									<SelectGroup>
										<SelectLabel>Categories</SelectLabel>
										<SelectItem
											v-for="cat in categories"
											:key="cat.id"
											:value="cat.id"
										>
											{{ cat.name }}
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
								<SelectContent position="item-aligned">
									<SelectGroup>
										<SelectLabel>Types</SelectLabel>
										<SelectItem
											v-for="type in types"
											:key="type.id"
											:value="type.id"
										>
											{{ type.name }}
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
				<Button type="submit" :disabled="submitDisabled">
					<Spinner v-if="submitDisabled" />
					{{
						isSubmitting
							? 'Submitting...'
							: isValidating
								? 'Validating...'
								: isProcessing
									? 'Creating...'
									: 'Create Studio'
					}}
				</Button>
			</div>

			<p v-if="errorMsg" class="mt-4 text-sm text-destructive">
				{{ errorMsg }}
			</p>
		</form>
	</div>
</template>
