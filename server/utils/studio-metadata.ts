export function resolveStudioMetadata(
  studio: {
    categories?: string[] | null
    types?: string[] | null
    currency?: string | null
  },
  categoriesData: Array<{ id: string; name: string }>,
  typesData: Array<{ id: string; name: string }>,
  currenciesData: Array<{ id: string; name: string }>
) {
  const studioCategoryIds = studio.categories || []
  const studioTypeIds = studio.types || []

  return {
    categories: categoriesData
      .filter(category => studioCategoryIds.includes(category.id))
      .map(category => category.name),
    types: typesData
      .filter(type => studioTypeIds.includes(type.id))
      .map(type => type.name),
    currency:
      currenciesData.find(currency => currency.id === studio.currency)?.name ||
      null
  }
}
