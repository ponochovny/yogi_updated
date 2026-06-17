import {
	BoxesIcon,
	CalendarClockIcon,
	ChartNoAxesCombinedIcon,
	LayersIcon,
	SlidersVerticalIcon,
	UsersIcon,
	type LucideIcon,
} from '@lucide/vue'
import { PagesConfig } from '~/config/pages.config'
import { userRoles } from '~~/server/auth/config'

interface Menu {
	group: string
	menuLinks: {
		name: string
		url: string
		icon: LucideIcon
		roles: string[]
	}[]
}

export const useBusinessMenu = () => {
	const route = useRoute()
	const slug = computed(() => route.params.slug as string)

	const session = useSession()
	const user = computed(() => session.value?.data?.user || null)

	const businessMenu = ref({
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

	const studioMenu = computed(() => ({
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
				name: 'Settings',
				url: `${PagesConfig.BUSINESS}/${slug.value}/settings`,
				icon: SlidersVerticalIcon,
				roles: [userRoles.BUSINESS],
			},
		],
	}))

	const visibleMenu = computed<Menu[]>(() => {
		const roles =
			// @ts-expect-error: workspaces field error
			(user.value?.workspaces.map(
				(w: { role: typeof userRoles }) => w.role,
			) as (typeof userRoles)[keyof typeof userRoles][]) || []

		// If there no user or we're not on the studio page then return an empty array
		if (!roles.length) return []

		const filteredMenu = (menu: Menu) => {
			return {
				...menu,
				menuLinks: menu.menuLinks.filter((item) =>
					// @ts-expect-error: role field error
					item.roles.some((el) => roles.includes(el)),
				),
			}
		}

		if (!slug.value) return [filteredMenu(businessMenu.value)]

		return [filteredMenu(studioMenu.value)]
	})

	return { visibleMenu }
}
