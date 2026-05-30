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
		<div class="grid grid-cols-4 gap-4 px-4 py-8">
			<Card
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
		</div>
		<Button @click="createStudio">Create studio</Button>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Card from '~/entities/product/Card.vue'
import { PagesConfig } from '~/config/pages.config'
const { locales, setLocale } = useI18n()

const res = await $fetch('/api/offerings')
// console.log(res)

const createStudio = async () => {
	try {
		const response = await $fetch('/api/studios', {
			method: 'POST',
			body: {
				name: 'My New Studio 2',
				slug: 'my-new-studio-3',
			},
		})
		console.log('Studio created successfully:', response)
	} catch (error) {
		console.error('Error creating studio:', error)
	}
}
</script>
