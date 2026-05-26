import { getOfferings } from '@/../server/db/offerings'

export default defineEventHandler(async () => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const offerings = await getOfferings<any[]>({
			include: {
				studio: {
					include: {
						logo: true,
					},
				},
				banners: true,
				practitioners: {
					include: {
						user: true,
					},
				},
			},
		})

		// const offerings = await new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		resolve([
		// 			{
		// 				id: 1,
		// 				title: 'Offering 1',
		// 				description: 'Description for Offering 1',
		// 			},
		// 			{
		// 				id: 2,
		// 				title: 'Offering 2',
		// 				description: 'Description for Offering 2',
		// 			},
		// 		])
		// 	}, 1000)
		// })

		return {
			data: offerings,
			status: 'Success!',
		}
	} catch {
		return {
			data: [],
			status: 'Error!',
		}
	}
})
