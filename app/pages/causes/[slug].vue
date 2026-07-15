<script lang="ts" setup>
import { Calendar, MapPin } from '@lucide/vue'
import { placeholderImageUrl } from '~/config/constants'

const cause = {
  name: 'Cancer Free Society Fund',
  created: 'Oct 30, 2022',
  end_date: 'Dec 30, 2022',
  organization_name: 'AER Africa',
  organization_location: 'Diani Beach, Kenya',
  about:
    "Energy healing glowing rejuvenated skin sage smudge sticks music therapy bliss vitamins and supplements yoga wheel. Spirulina chlorella and chlorophyll wellness spa microbiome testing kit goopglow glowlotion nourishing chocolate protein supplement healthy blood sugar immune boosting wellness shots infrared sauna blanket. Rejuvenation facial spa nutrient dense all natural no nasties gummies powders and sprays infused reflexology oat almond rice and cashew mylk glutem sensitivity hyaluronic acid glow serum.Clean beauty superfoods practicing mindfulness beauty dust boost your mood sympathetic nervous system. Breathwork exercises high performance protein bar read it on goop essential oil heal oil balm wellness lymphatic drainage bone broth avoiding edocrine disruptors. Wellness spa healthy glow colon hydrotherapy brain boosting mushroom infused coffee holistic health inner beauty simple meditation mind-body diet fertility program.Support your microbiome keffir health literacy nourish your hair from the inside out ketogenic testing strips my aromatherapy personality diet culture. Green juice 3 ways microdermabrasion holotropic breathwork dry yoga fish oil omega 3 fats super elixer organic skincare. Melatonin infused gummies inner beauty support I'm gluten free irritable bowel syndrome activated charcoal toothpaste prebiotic probiotic postbiotic sleep mist doing whole30 daily rituals for divine feminine energy. Digestive enzymes clean beauty kombucha Himalayan salt lamps six day detox self love beauty supplements metaboloism boosting superpowder ayurvedic wellness. Infrared sauna what is wellness anyway?.",
  image: placeholderImageUrl,
  organization_logo:
    'https://img.freepik.com/free-vector/branding-identity-corporate-vector-logo-a-design_460848-8717.jpg?w=2000',
  earned: 12000,
  goal: 50000,
  total_donations: 27
}

const studioCauses = [
  {
    id: 1,
    name: 'Cause 1',
    description: 'Description for Cause 1',
    total: 12000,
    amount: 50000,
    tickets: [{ id: 1, name: 'Ticket 1', price: 10 }]
  },
  {
    id: 2,
    name: 'Cause 2',
    description: 'Description for Cause 2',
    total: 8000,
    amount: 30000,
    tickets: [{ id: 2, name: 'Ticket 2', price: 20 }]
  }
]

const chips = [5, 10, 20, 50]
const modelValue = ref<number>(5)
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
      <div class="mb-5">
        <h1 class="font-bold text-3xl mb-3">{{ cause.name }}</h1>
        <div class="flex gap-3 items-center">
          <Calendar class="w-4 h-4" />
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
          class="content mx-2.5 bg-neutral-900 -mt-12.5 rounded-4xl p-17 mb-25 flex"
        >
          <div class="grow">
            <h2 class="font-bold text-h2 mb-6">Organization</h2>
            <div class="flex gap-5 items-center mb-12">
              <NuxtImg
                :src="cause.organization_logo"
                alt="logo"
                class="w-23 h-23 rounded-full border border-solid border-[#E5EAEA]"
              />
              <div>
                <span class="font-bold text-body1">{{
                  cause.organization_name
                }}</span>
                <div class="flex text-body3 items-center gap-1 text-basic-800">
                  <MapPin class="w-5 h-5" />
                  <span>{{ cause.organization_location }}</span>
                </div>
              </div>
            </div>
            <div class="mb-12">
              <p class="mb-6 font-bold text-body1">About this cause</p>
              <p class="max-w-182">
                {{ cause.about }}
              </p>
            </div>
            <div>
              <p class="mb-6 font-bold text-body1">Our causes</p>
              <ul>
                <template v-for="sCause in studioCauses" :key="sCause.id">
                  <li
                    class="mb-4 last:mb-0 flex flex-col md:flex-row items-start gap-4 md:gap-0 justify-between md:items-center py-5 px-6 bg-neutral-800 rounded-2xl bg-decoration-charity-block bg-cover lg:bg-contain bg-right bg-no-repeat"
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
                        <Button class="max-w-25.25 md:max-w-none"
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
                          <div class="mb-4 flex items-center gap-1.5 text-2xl">
                            <Button
                              :variant="
                                modelValue === 5 ? 'default' : 'outline'
                              "
                              @click="modelValue = 5"
                            >
                              5
                            </Button>
                            <Button
                              :variant="
                                modelValue === 10 ? 'default' : 'outline'
                              "
                              @click="modelValue = 10"
                            >
                              10
                            </Button>
                            <Button
                              :variant="
                                modelValue === 20 ? 'default' : 'outline'
                              "
                              @click="modelValue = 20"
                            >
                              20
                            </Button>
                            <Button
                              :variant="
                                modelValue === 50 ? 'default' : 'outline'
                              "
                              @click="modelValue = 50"
                            >
                              50
                            </Button>
                          </div>

                          <div
                            class="grid w-full max-w-sm items-center gap-1.5 mb-4"
                          >
                            <Label for="donation-amount-modal"
                              >Custom amount</Label
                            >
                            <InputGroup>
                              <InputGroupAddon>
                                <InputGroupText>$</InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput
                                id="donation-amount-modal"
                                v-model.number="modelValue"
                                placeholder="0.00"
                                step="0.1"
                                type="number"
                                min="1"
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupText>USD</InputGroupText>
                              </InputGroupAddon>
                            </InputGroup>
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
          <div class="w-86.5 bg-neutral-800 ml-9 rounded-2xl p-6 self-baseline">
            <div class="mb-8">
              <p class="font-bold mb-1">
                $ {{ cause.earned }} / {{ cause.goal }} goal
              </p>

              <div
                class="h-3 rounded-2xl mb-1"
                :class="{
                  'bg-basic-200': false,
                  'border border-amber-500': true
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
              <label class="text-sm mb-3 block" for="donation-amount">
                Enter how much you want to donate
              </label>
              <div class="flex flex-col">
                <div class="flex gap-2 mb-3 overflow-x-auto">
                  <Button
                    v-for="chip in chips"
                    :key="chip"
                    class="rounded-[120px] border border-solid flex-1"
                    :variant="modelValue === chip ? 'default' : 'outline'"
                    @click="handleChipClick(chip)"
                  >
                    $ {{ chip }}
                  </Button>
                </div>
                <div class="grid w-full max-w-sm items-center gap-1.5 mb-4">
                  <Label for="donation-amount">Custom amount</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="donation-amount"
                      v-model.number="modelValue"
                      placeholder="0.00"
                      step="0.1"
                      type="number"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>USD</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <Button @click="handleDonateClick"> Donate </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
