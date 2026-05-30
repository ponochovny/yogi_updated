<script lang="ts" setup>
import 'vue-sonner/style.css'
</script>

<template>
	<div role="main">
		<div class="border border-gray-500">
			<div>layouts/default.vue</div>
		</div>
		<slot />
		<Toaster />
	</div>
</template>
