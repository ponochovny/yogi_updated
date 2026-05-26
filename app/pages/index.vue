<template>
	<div>
		<h1 class="text-3xl font-bold underline">Hello world!</h1>

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
		<div>
			<ClientOnly>
				<h1>Color mode: {{ $colorMode.value }}</h1>
			</ClientOnly>
			<Select v-model="$colorMode.preference">
				<SelectTrigger>
					<SelectValue placeholder="Select a color mode" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="system"> System </SelectItem>
					<SelectItem value="light"> Light </SelectItem>
					<SelectItem value="dark"> Dark </SelectItem>
					<SelectItem value="sepia"> Sepia </SelectItem>
				</SelectContent>
			</Select>
		</div>
		<div class="flex gap-1 flex-wrap">
			<NuxtLink :to="PagesConfig.CAUSES + '/1'" as-child>
				<Button>Go to single cause page</Button>
			</NuxtLink>
		</div>
		<div class="grid grid-cols-4 gap-4 px-4 py-8">
			<Card
				v-for="offering in res.data
					.sort((a, b) => b.isActive - a.isActive)
					.filter((offering) => offering.isActive)"
				:key="offering.id"
				:offering="offering"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Card from '~/entities/product/Card.vue'
import { PagesConfig } from '~/config/pages.config'
const { locales, setLocale } = useI18n()

const res = await $fetch('/api/offerings')
console.log(res)

const colorMode = useColorMode()
console.log(colorMode.preference)

console.log(PagesConfig)
</script>
