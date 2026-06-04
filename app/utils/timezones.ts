export interface TimezoneOption {
	value: string
	label: string
	offset: number
}

function getTimezonesList(): TimezoneOption[] {
	const timezones = Intl.supportedValuesOf('timeZone')
	const now = new Date()

	const list = timezones
		.map((zone) => {
			try {
				const formatter = new Intl.DateTimeFormat('en-US', {
					timeZone: zone,
					timeZoneName: 'longOffset',
				})

				const parts = formatter.formatToParts(now)
				const offsetPart =
					parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT'

				let displayOffset = offsetPart.replace('GMT', 'UTC')
				if (displayOffset === 'UTC') displayOffset = 'UTC+00:00'
				if (
					displayOffset.includes(':') === false &&
					displayOffset !== 'UTC+00:00'
				) {
					const sign = displayOffset.includes('+') ? '+' : '-'
					const hours = displayOffset?.split(sign)[1]?.padStart(2, '0')
					displayOffset = `UTC${sign}${hours}:00`
				}

				const tzOffsetFormatter = new Intl.DateTimeFormat('en-US', {
					timeZone: zone,
					hour12: false,
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
				})

				const dateInZone = new Date(tzOffsetFormatter.format(now))
				const utcDate = new Date(
					tzOffsetFormatter.format(now).replace(/,.*/, '') + ' GMT',
				)
				const offsetMinutes = (dateInZone.getTime() - utcDate.getTime()) / 60000

				return {
					value: zone,
					label: `(${displayOffset}) ${zone.replace(/_/g, ' ')}`,
					offset: offsetMinutes,
				}
			} catch {
				return null
			}
		})
		.filter(Boolean) as TimezoneOption[]

	return list.sort(
		(a, b) => a.offset - b.offset || a.value.localeCompare(b.value),
	)
}
export const CACHED_TIMEZONES_LIST = getTimezonesList()

/**
 * Auto detection of user's timezone using Intl API. This is a best effort and may not be 100% accurate in all environments, but it works well in modern browsers and Node.js.
 */
export function guessUserTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}
