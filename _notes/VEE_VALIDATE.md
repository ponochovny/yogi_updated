## Vee Validate - Boilerplate

```TS
// export type CreateStudioInput = z.infer<typeof createStudioSchema>
import {
	type CreateStudioInput,
} from '~/entities/studio/schema'

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
	}
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
		toast.error(
			(error as Error).message || 'Failed to create studio. Please try again.',
		)
	} finally {
		isProcessing.value = false
	}
}

const submitHandler = handleSubmit(createStudio)
// const submitHandler = handleSubmit(createStudio, (errors) => {
// 	errorMsg.value = 'Please fix the validation errors before submitting.'
// 	console.log('Validation Errors:', errors)
// })
```

```VUE
<template>
	<form class="space-y-4" @submit.prevent="submitHandler">
		<!-- SINGLE -->
		<FormField v-slot="{ componentField }" name="name">
			<FormItem>
				<FormLabel>Label</FormLabel>
				<FormControl>
					<Input
						placeholder=""
						type="text"
						v-bind="componentField"
						autocomplete="off"
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>

		<!-- LOOPED -->
		<div
			v-for="(location, index) in locationFields"
			:key="location.key"
			class="flex flex-col gap-4"
		>
			<FormField
				v-slot="{ componentField: innerField }"
				:name="`locations[${index}].name`"
			>
				<FormItem>
					<FormLabel>Label</FormLabel>
					<FormControl>
						<Input
							placeholder=""
							type="text"
							v-bind="innerField"
							autocomplete="off"
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>
		</div>

		<!-- SUBMIT BUTTON -->
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

		<p v-if="errorMsg" class="mt-4 text-sm text-destructive">
			{{ errorMsg }}
		</p>
	</form>
</template>
```
