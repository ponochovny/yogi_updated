import type { Prisma } from '~/../prisma/generated/client'
import { prisma } from '../utils/db'
import type { DefaultArgs } from '@prisma/client/runtime/client'

export const getOfferings = <T>(
	params: Prisma.OfferingFindManyArgs<DefaultArgs> = {},
): Promise<T> => {
	return prisma.offering.findMany({ ...params }) as Promise<T>
}
