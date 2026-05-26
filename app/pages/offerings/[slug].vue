<script lang="ts" setup>
const route = useRoute()
console.log(route.params.slug)
</script>

<template>
	<div>
		<h1 class="text-3xl font-bold">{{ route.params.slug }}</h1>
	</div>
</template>
