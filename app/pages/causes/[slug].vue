<script lang="ts" setup>
import { Calendar, MapPin } from '@lucide/vue'
const route = useRoute()
console.log(route.params.slug)

const cause = {
	name: 'Cancer Free Society Fund',
	created: 'Oct 30, 2022',
	end_date: 'Dec 30, 2022',
	organizator_name: 'AER Africa',
	organizator_location: 'Diani Beach, Kenya',
	about:
		"Energy healing glowing rejuvenated skin sage smudge sticks music therapy bliss vitamins and supplements yoga wheel. Spirulina chlorella and chlorophyll wellness spa microbiome testing kit goopglow glowlotion nourishing chocolate protein supplement healthy blood sugar immune boosting wellness shots infrared sauna blanket. Rejuvenation facial spa nutrient dense all natural no nasties gummies powders and sprays infused reflexology oat almond rice and cashew mylk glutem sensitivity hyaluronic acid glow serum.Clean beauty superfoods practicing mindfulness beauty dust boost your mood sympathetic nervous system. Breathwork exercises high performance protein bar read it on goop essential oil heal oil balm wellness lymphatic drainage bone broth avoiding edocrine disruptors. Wellness spa healthy glow colon hydrotherapy brain boosting mushroom infused coffee holistic health inner beauty simple meditation mind-body diet fertility program.Support your microbiome keffir health literacy nourish your hair from the inside out ketogenic testing strips my aromatherapy personality diet culture. Green juice 3 ways microdermabrasion holotropic breathwork dry yoga fish oil omega 3 fats super elixer organic skincare. Melatonin infused gummies inner beauty support I'm gluten free irritable bowel syndrome activated charcoal toothpaste prebiotic probiotic postbiotic sleep mist doing whole30 daily rituals for divine feminine energy. Digestive enzymes clean beauty kombucha Himalayan salt lamps six day detox self love beauty supplements metaboloism boosting superpowder ayurvedic wellness. Infrared sauna what is wellness anyway?.",
	image: 'https://placehold.net/default.png',
	organizator_logo:
		'https://img.freepik.com/free-vector/branding-identity-corporate-vector-logo-a-design_460848-8717.jpg?w=2000',
	earned: 12000,
	goal: 50000,
	total_donations: 27,
}

const studioCauses = [
	{
		id: 1,
		name: 'Cause 1',
		description: 'Description for Cause 1',
		total: 12000,
		amount: 50000,
		tickets: [{ id: 1, name: 'Ticket 1', price: 10 }],
	},
	{
		id: 2,
		name: 'Cause 2',
		description: 'Description for Cause 2',
		total: 8000,
		amount: 30000,
		tickets: [{ id: 2, name: 'Ticket 2', price: 20 }],
	},
]

const chips = [5, 10, 20, 50]
const modelValue = ref<number | null>(null)
const currency = { symbol: '$' }
const handleChipClick = (chip: number) => {
	modelValue.value = chip
}
const handleDonateClick = () => {
	console.log('Donate clicked with amount:', modelValue.value)
}
const onSubmit = (event: Event) => {
	event.preventDefault()
	console.log('Form submitted with amount:', modelValue.value)
}
</script>

<template>
	<div role="main">
		<div class="px-20 py-10">
			<div class="mb-[20px]">
				<h1 class="font-bold text-3xl mb-3">{{ cause.name }}</h1>
				<div class="flex gap-3 items-center">
					<Calendar class="w-4 h-4 text-amber-500" />
					<p class="flex gap-1 text-sm">
						Created<span class="font-bold">{{ cause.created }}</span> - End
						date<span class="font-bold">{{ cause.end_date }}</span>
					</p>
				</div>
			</div>
			<div class="flex flex-col items-center">
				<NuxtImg
					:src="cause.image"
					class="w-full h-150 rounded-4xl background object-cover object-center"
					alt="banner"
				/>
				<div
					class="content mx-2.5 bg-gray-900 -mt-12.5 rounded-4xl p-17 mb-25 flex"
				>
					<div class="grow">
						<h2 class="font-bold text-h2 mb-6">Organizator</h2>
						<div class="flex gap-[20px] items-center mb-[48px]">
							<img
								:src="cause.organizator_logo"
								alt="logo"
								class="w-[92px] h-[92px] rounded-full border border-solid border-[#E5EAEA]"
							/>
							<div>
								<span class="font-bold text-body1">{{
									cause.organizator_name
								}}</span>
								<div class="flex text-body3 items-center gap-1 text-basic-800">
									<MapPin class="w-5 h-5" />
									<span>{{ cause.organizator_location }}</span>
								</div>
							</div>
						</div>
						<div class="mb-[48px]">
							<p class="mb-[24px] font-bold text-body1">About this cause</p>
							<p class="max-w-[728px]">
								{{ cause.about }}
							</p>
						</div>
						<div>
							<p class="mb-[24px] font-bold text-body1">Our causes</p>
							<ul>
								<template v-for="sCause in studioCauses" :key="sCause.id">
									<li
										class="mb-4 last:mb-0 flex flex-col md:flex-row items-start gap-4 md:gap-0 justify-between md:items-center py-5 px-6 bg-gray-800 rounded-2xl bg-decoration-charity-block bg-cover lg:bg-contain bg-right bg-no-repeat"
									>
										<div>
											<div class="text-h2 font-bold mb-1">
												{{ sCause.name }}
											</div>
											<div class="text-body3 text-basic-800 mb-3.5">
												{{ sCause.description }}
											</div>
											<div class="text-body3 font-bold">
												{{ sCause.total }} / {{ sCause.amount }} goal
											</div>
										</div>

										<Dialog>
											<DialogTrigger as-child>
												<Button class="max-w-[101px] md:max-w-none"
													>Donate</Button
												>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Donate to {{ sCause.name }}</DialogTitle>
													<DialogDescription>
														Enter how much you want to donate
													</DialogDescription>
												</DialogHeader>
												<form @submit="onSubmit">
													<Badge class="mb-3">10 </Badge>

													<!-- v-model="sum"
														mask="#*.##" -->
													<div class="relative mb-6">
														<Input
															id="donation-amount"
															v-model="modelValue"
															class="pl-6"
															type="number"
															name="donation-amount"
															placeholder="Enter amount"
														/>
														<span class="absolute left-3 top-1 text-basic-600"
															>$</span
														>
													</div>

													<!-- SOME PREORDER PART -->
													<div class="mb-2 sm:mb-4 font-bold">
														Payment method
													</div>
													<ul>
														<li>Stripe</li>
														<li>PayPal</li>
													</ul>
													<!-- PREORDER END -->

													<Button type="submit" class="mt-6">Donate</Button>
												</form>
											</DialogContent>
										</Dialog>
									</li>
								</template>
							</ul>
						</div>
					</div>
					<div
						class="w-[346px] bg-gray-800 max-h-[314px] ml-[36px] rounded-2xl p-[24px]"
					>
						<div class="mb-[32px]">
							<p class="font-bold mb-[4px]">
								$ {{ cause.earned }} / {{ cause.goal }} goal
							</p>

							<div
								class="h-3 rounded-2xl mb-[4px]"
								:class="{
									'bg-basic-200': false,
									'border border-amber-500': true,
								}"
							>
								<div
									class="h-full bg-amber-600 rounded-2xl"
									:style="{ width: '60%' }"
								/>
							</div>
							<p class="text-basic-800 text-body3">
								{{ cause.total_donations }} donations
							</p>
						</div>
						<div>
							<label
								class="text-basic-800 text-body3 mb-3"
								for="donation-amount"
							>
								Enter how much you want to donate
							</label>
							<div class="flex flex-col">
								<div class="flex gap-2 mb-[12px] overflow-x-auto">
									<button
										v-for="chip in chips"
										:key="chip"
										class="flex justify-center text-basic-800 text-body3 px-6 py-1.25 whitespace-nowrap rounded-[120px] border border-solid border-basic-800 hover:text-amber-800 hover:border-amber-400 active:text-amber-400 max-w-[68.5px]"
										@click="handleChipClick(chip)"
									>
										<span>$ {{ chip }}</span>
									</button>
								</div>
								<Input
									id="donation-amount"
									:currency="currency?.symbol"
									:model-value="modelValue"
									class="dark:bg-gray-900 mb-4"
									name="donation-amount"
									type="number"
									label="Custom amount"
								/>
								<Button @click="handleDonateClick"> Donate </Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
