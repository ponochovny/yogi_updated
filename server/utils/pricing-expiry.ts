type PricingExpiry = {
  durationDays: number
  expiryRule: string
  expiryBufferDays: number
}

export function calculatePricingValidUntil(
  validFrom: Date,
  pricing: PricingExpiry
) {
  const validUntil = new Date(validFrom)

  if (pricing.expiryRule === 'END_OF_YEAR') {
    validUntil.setMonth(11, 31)
    validUntil.setHours(23, 59, 59, 999)

    if (validFrom.getMonth() >= 10) {
      validUntil.setDate(validUntil.getDate() + pricing.expiryBufferDays)
    }

    return validUntil
  }

  validUntil.setDate(validUntil.getDate() + pricing.durationDays)
  return validUntil
}
