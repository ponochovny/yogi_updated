<script lang="ts" setup>
const route = useRoute()
</script>

<template>
	<div>
		<h1 class="text-3xl font-bold">Booking details</h1>
		<p>Business slug: {{ route.params.slug }}</p>
		<p>Slot ID: {{ route.params.slotId }}</p>
	</div>
</template>
