export type CurrencyCode = 'USD' | 'PHP'

interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
}

const currencyMap: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' }
}

export function useCurrency() {
  const currency = useState<CurrencyCode>('currency', () => 'USD')

  // Hydrate from localStorage on client
  if (import.meta.client) {
    const stored = localStorage.getItem('yogi-currency') as CurrencyCode | null
    if (stored && currencyMap[stored]) {
      currency.value = stored
    }
  }

  const currencyInfo = computed(() => currencyMap[currency.value])
  const currencySymbol = computed(() => currencyInfo.value.symbol)

  function setCurrency(code: CurrencyCode) {
    currency.value = code
    if (import.meta.client) {
      localStorage.setItem('yogi-currency', code)
    }
  }

  function toggleCurrency() {
    setCurrency(currency.value === 'USD' ? 'PHP' : 'USD')
  }

  return {
    currency: readonly(currency),
    currencyInfo,
    currencySymbol,
    setCurrency,
    toggleCurrency,
    currencies: Object.values(currencyMap)
  }
}
