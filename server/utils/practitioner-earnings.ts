export type CompensationType = 'FLAT_RATE' | 'PER_ATTENDEE' | 'REVENUE_SHARE'

export function calculateClassPayout({
  compensationType,
  compensationRate,
  attendedCount,
  revenueCents
}: {
  compensationType: CompensationType | string
  compensationRate: number | string
  attendedCount: number | string
  revenueCents: number | string
}) {
  const rate = Number(compensationRate) || 0
  const attended = Number(attendedCount) || 0
  const revenue = Number(revenueCents) || 0

  switch (compensationType) {
    case 'FLAT_RATE':
      return attended > 0 ? rate : 0
    case 'PER_ATTENDEE':
      return attended * rate
    case 'REVENUE_SHARE':
      return Math.round((revenue * rate) / 10000)
    default:
      return 0
  }
}
