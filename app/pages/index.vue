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
		<!-- <div class="grid grid-cols-4 gap-4 px-4 py-8">
			<OfferingCard
				v-for="offering in res.data
					.sort((a, b) => b.isActive - a.isActive)
					.filter((offering) => offering.isActive)"
				:key="offering.id"
				:offering="offering"
			/>
			<div
				v-if="!res.data.length"
				class="col-span-4 text-center text-muted-foreground"
			>
				No active offerings available.
			</div>
		</div> -->
		<div class="grid grid-cols-4 gap-4 px-4 py-8">
			<template v-if="studios">
				<StudioCard
					v-for="studio in studios"
					:key="studio.id"
					:studio="studio"
					:studio-media="{ logo: studio.logo, gallery: studio.gallery }"
					:studio-location="studio.locations"
				/>
			</template>
			<div v-else class="col-span-4 text-center text-muted-foreground">
				No studios
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
// import OfferingCard from '~/entities/offering/ui/Card.vue'
import StudioCard from '~/entities/studio/ui/Card.vue'
import { PagesConfig } from '~/config/pages.config'
const { locales, setLocale } = useI18n()

const { data: studiosData } = useFetch(`/api/studios`)
const studios = computed(() => studiosData.value?.studios)
</script>
