<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const offeringSlug = route.params.offeringSlug as string

// Form state for generating slots
const form = ref({
	startDate: '',
	endDate: '',
	rules: [
		{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00', practitionerId: '' },
	],
})

// Add new day rule to the generator
const addRule = () => {
	form.value.rules.push({
		dayOfWeek: 1,
		startTime: '09:00',
		endTime: '10:00',
		practitionerId: '',
	})
}

// Generate slots via API
const generateSlots = async () => {
	try {
		await $fetch(
			`/api/business/studios/${slug}/offerings/${offeringSlug}/slots/generate`,
			{
				method: 'POST',
				body: form.value,
			},
		)
		alert('Slots generated successfully!')
		// Here we would typically refresh a list/calendar of existing slots below
	} catch (err) {
		alert((err as Error)?.message || 'Generation failed')
	}
}
</script>

<template>
	<div class="max-w-3xl space-y-8">
		<h1 class="text-2xl font-bold">Schedule Management</h1>

		<div class="p-6 bg-white/10 border rounded-xl shadow-sm">
			<h2 class="text-lg font-semibold mb-4">Generate Recurring Slots</h2>

			<div class="grid grid-cols-2 gap-4 mb-6">
				<div>
					<label class="block text-sm font-medium mb-1">Start Date</label>
					<Input v-model="form.startDate" type="date" class="text-sm w-70" />
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">End Date</label>

					<Input v-model="form.endDate" type="date" class="text-sm w-70" />
				</div>
			</div>

			<div class="space-y-4 mb-6">
				<h3 class="text-sm font-medium text-gray-200">Weekly Rules</h3>
				<div
					v-for="(rule, index) in form.rules"
					:key="index"
					class="flex gap-2 items-center bg-white/10 p-3 rounded"
				>
					<NativeSelect v-model="rule.dayOfWeek" class="w-[130px]">
						<NativeSelectOption :value="1"> Monday </NativeSelectOption>
						<NativeSelectOption :value="2"> Tuesday </NativeSelectOption>
						<NativeSelectOption :value="3"> Wednesday </NativeSelectOption>
						<NativeSelectOption :value="4"> Thursday </NativeSelectOption>
						<NativeSelectOption :value="5"> Friday </NativeSelectOption>
						<NativeSelectOption :value="6"> Saturday </NativeSelectOption>
						<NativeSelectOption :value="0"> Sunday </NativeSelectOption>
					</NativeSelect>

					<Input
						id="time-picker"
						v-model="rule.startTime"
						type="time"
						class="text-sm w-70"
					/>
					<span class="text-gray-500">-</span>
					<Input
						id="time-picker"
						v-model="rule.endTime"
						type="time"
						class="text-sm w-70"
					/>

					<Input
						v-model="rule.practitionerId"
						type="text"
						placeholder="Practitioner UUID"
						class="w-80"
					/>

					<button
						@click="form.rules.splice(index, 1)"
						class="text-red-500 text-sm"
					>
						Remove
					</button>
				</div>
				<button @click="addRule" class="text-sm text-blue-600 font-medium">
					+ Add Rule
				</button>
			</div>

			<button
				class="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800"
				@click="generateSlots"
			>
				Generate Slots
			</button>
		</div>
	</div>
</template>
