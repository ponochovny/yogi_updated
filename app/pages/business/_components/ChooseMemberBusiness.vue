<script lang="ts" setup>
const { data: memberStudiosData } = useFetch(`/api/member/studios`)
const memberStudios = computed(() => memberStudiosData.value?.studios)
</script>

<template>
	<ul class="mb-4">
		<li v-for="studio in memberStudios" :key="studio.id">
			<NuxtLink :to="`/business/${studio.slug}`">{{ studio.name }}</NuxtLink>
			<Badge class="ml-2">
				{{ studio.role }}
			</Badge>
		</li>
	</ul>
</template>
