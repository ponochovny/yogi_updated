import {
	BoxesIcon,
	CalendarClockIcon,
	ChartNoAxesCombinedIcon,
	CrownIcon,
	LayersIcon,
	PlusIcon,
	ShoppingCartIcon,
	SlidersVerticalIcon,
	UserIcon,
	UsersIcon,
	type LucideIcon,
} from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'
import { userRoles, type UserRole } from '~~/server/auth/config'

interface Menu {
	group: string
	menuLinks: {
		name: string
		url: string
		icon: LucideIcon
		roles: Array<(typeof userRoles)[keyof typeof userRoles]>
	}[]
}

export const useBusinessMenu = () => {
	const route = useRoute()
	const slug = computed(() => route.params.slug as string)

	const session = useSession()
	const user = computed(() => session.value?.data?.user || null)

	const notMemberMenu = reactive<Menu[]>([
		{
			group: 'Platform',
			menuLinks: [
				{
					name: 'Profile settings',
					url: PagesConfig.PROFILE_SETTINGS,
					icon: UserIcon,
					roles: [userRoles.BUSINESS],
				},
				{
					name: 'My Bookings',
					url: PagesConfig.PROFILE_BOOKINGS,
					icon: ShoppingCartIcon,
					roles: [userRoles.BUSINESS],
				},
			],
		},
		{
			group: 'Business',
			menuLinks: [
				{
					name: 'Create studio',
					url: PagesConfig.BUSINESS,
					icon: PlusIcon,
					roles: [userRoles.BUSINESS],
				},
			],
		},
	])

	const businessMenu = ref<Menu>({
		group: 'Business',
		menuLinks: [
			{
				name: 'Main Dashboard',
				url: `${PagesConfig.BUSINESS}`,
				icon: ChartNoAxesCombinedIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'My Studios',
				url: `${PagesConfig.BUSINESS}`,
				icon: BoxesIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'Global Calendar', // For practitioner and manager to see all their studios' schedules in one place
				url: `${PagesConfig.BUSINESS}/calendar`,
				icon: CalendarClockIcon,
				roles: [userRoles.MANAGER, userRoles.PRACTITIONER],
			},
		],
	})

	const studioMenu = computed<Menu>(() => ({
		group: 'Business',
		menuLinks: [
			{
				name: 'Dashboard',
				url: `${PagesConfig.BUSINESS}/${slug.value}`,
				icon: ChartNoAxesCombinedIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'Calendar',
				url: `${PagesConfig.BUSINESS}/${slug.value}/calendar`,
				icon: CalendarClockIcon,
				roles: [userRoles.BUSINESS, userRoles.MANAGER, userRoles.PRACTITIONER],
			},
			{
				name: 'Offerings',
				url: `${PagesConfig.BUSINESS}/${slug.value}/offerings`,
				icon: LayersIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'Members',
				url: `${PagesConfig.BUSINESS}/${slug.value}/members`,
				icon: UsersIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'Memberships',
				url: `${PagesConfig.BUSINESS}/${slug.value}/memberships`,
				icon: CrownIcon,
				roles: [userRoles.BUSINESS],
			},
			{
				name: 'Settings',
				url: `${PagesConfig.BUSINESS}/${slug.value}/settings`,
				icon: SlidersVerticalIcon,
				roles: [userRoles.BUSINESS],
			},
		],
	}))

	const visibleMenu = computed<Menu[]>(() => {
		// type WorkspaceRole = {
		// 	studio: {
		// 		slug: string
		// 	}
		// 	role: (typeof userRoles)[keyof typeof userRoles]
		// }

		const workspaceRoles =
			(user.value?.workspaces as IWorkSpace[])?.map((el) => el.role) ?? []
		const uRoles = (user.value?.role as UserRole[]) ?? []

		const roles = [...new Set([...workspaceRoles, ...uRoles])]

		// const workspaceRoles = (user.value?.workspaces ?? []) as WorkspaceRole[]
		// const roles = slug.value
		// 	? workspaceRoles
		// 			.filter((w) => w.studio.slug === slug.value)
		// 			.map((w) => w.role)
		// 	: workspaceRoles.map((w) => w.role)

		const isJustUser = roles.length === 1 && roles.includes(userRoles.USER)
		if (isJustUser) return notMemberMenu

		const filteredMenu = (menu: Menu) => {
			return {
				...menu,
				menuLinks: menu.menuLinks.filter((item) =>
					item.roles.some((el) => roles.includes(el)),
				),
			}
		}
		const filteredMenuByStudioSlug = () => {
			const studioSlug = slug.value

			const workspace = (user.value?.workspaces as IWorkSpace[]).find(
				(w) => w.studio.slug === studioSlug,
			)
			const isSuperAdmin = uRoles.includes(userRoles.SUPER_ADMIN)

			if (workspace || isSuperAdmin) {
				return [filteredMenu(studioMenu.value)]
			}

			return [filteredMenu(businessMenu.value)]
		}

		if (!slug.value) return [filteredMenu(businessMenu.value)]

		return filteredMenuByStudioSlug()
	})

	return { visibleMenu }
}
