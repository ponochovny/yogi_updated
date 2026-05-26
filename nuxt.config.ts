import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },

	modules: [
		'@nuxtjs/seo',
		'@nuxtjs/leaflet',
		'@nuxtjs/i18n',
		'@nuxtjs/eslint-module',
		'@nuxtjs/color-mode',
		'@nuxt/image',
		'@nuxt/fonts',
		'@nuxt/eslint',
		'@nuxt/a11y',
		'@nuxt/test-utils',
		'@pinia/nuxt',
		'nuxt-zod-i18n',
		'nuxt-vitalizer',
		'shadcn-nuxt',
	],

	css: ['./app/assets/css/main.css'],

	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: [
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'class-variance-authority',
				'clsx',
				'reka-ui',
				'tailwind-merge',
			],
		},
	},

	i18n: {
		defaultLocale: 'en',
		locales: [
			{ code: 'en', name: 'English', file: 'en.json' },
			{ code: 'nl', name: 'Nederlands', file: 'nl.json' },
		],
	},

	shadcn: {
		prefix: '',
		componentDir: './app/shared/ui',
	},
})
