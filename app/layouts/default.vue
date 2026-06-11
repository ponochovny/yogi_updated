<script lang="ts" setup>
import 'vue-sonner/style.css'

import Darkmodetoggle from '~/features/darkmodetoggle.vue'

import { signOut, useSession } from '@/utils/auth-client'
const session = useSession()

const signOutHandler = async () => {
	await signOut()
	await navigateTo('/')
}
</script>

<template>
	<div role="main" class="relative pt-28">
		<div
			class="fixed right-1 bottom-1 border border-gray-500 px-4 py-2 rounded-md bg-white/10 text-sm text-white z-50 opacity-50 pointer-events-none"
		>
			<div>layouts/default.vue</div>
		</div>
		<div
			class="fixed left-0 top-0 flex justify-between items-center w-full p-4"
		>
			<NuxtLinkLocale to="/" as-child>
				<NuxtImg src="/img/logoBg.svg" width="65" height="65" alt="Nuxt Logo" />
			</NuxtLinkLocale>
			<div class="flex gap-3">
				<Darkmodetoggle />
				<template v-if="session.isPending">
					<div
						class="rounded-lg border border-dashed border-gray-500 p-2 text-center text-sm text-gray-400"
					>
						Loading...
					</div>
				</template>
				<template v-else-if="!session.data?.user">
					<NuxtLink to="/register" as-child>
						<Button> Sign up </Button>
					</NuxtLink>
					<NuxtLink to="/login" as-child>
						<Button variant="outline">Log in</Button>
					</NuxtLink>
				</template>
				<template v-else>
					<Button variant="outline" @click="$router.push('/profile/settings')">
						Profile
					</Button>
					<Button variant="secondary" @click="signOutHandler">
						Sign Out
					</Button>
				</template>
			</div>
		</div>
		<slot />
		<Toaster position="bottom-center" rich-colors />
	</div>
</template>
