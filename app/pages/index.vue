<template>
	<div class="flex flex-col items-start gap-8">
		<div class="flex flex-col gap-1">
			<div class="flex gap-1 flex-wrap">
				<Button
					v-for="locale in locales"
					:key="locale.code"
					@click="setLocale(locale.code)"
				>
					{{ locale.name }}
				</Button>
			</div>
			<h1 class="text-3xl font-bold">{{ $t('welcome') }}</h1>
		</div>
		<div class="flex gap-1 flex-wrap">
			<NuxtLinkLocale :to="PagesConfig.CAUSES + '/1'" as-child>
				<Button>Go to single cause page</Button>
			</NuxtLinkLocale>
		</div>

		<div class="flex flex-col gap-4 px-4 py-8">
			<h2 class="text-2xl font-semibold">All Offerings list</h2>
			<div
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
			>
				<OfferingCard
					v-for="offering in offerings"
					:key="offering.id"
					:offering="offering"
				/>
				<div
					v-if="!offerings.length"
					class="col-span-4 text-center text-muted-foreground"
				>
					No active offerings available.
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-4 px-4 py-8">
			<h2 class="text-2xl font-semibold">All Studios list</h2>
			<div
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
			>
				<StudioCard
					v-for="studio in studios"
					:key="studio.id"
					:studio="studio"
				/>
				<div
					v-if="!studios.length"
					class="col-span-4 text-center text-muted-foreground"
				>
					No studios
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import OfferingCard from '~/entities/offering/ui/Card.vue'
import StudioCard from '~/entities/studio/ui/Card.vue'
import { PagesConfig } from '~/config/pages.config'

definePageMeta({
	title: 'Home',
})

const { locales, setLocale } = useI18n()

const { data: studiosData } = useFetch(`/api/studios`)
$fetch(`/api/studios`)
const studios = computed(() => studiosData.value?.studios || [])

const { data: offeringsData } = useFetch(`/api/offerings`)
const offerings = computed(() => offeringsData.value?.offerings || [])
</script>
