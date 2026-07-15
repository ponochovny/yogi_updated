type ReferenceDataCacheEntry<T> = {
  value?: T
  expiresAt: number
  promise?: Promise<T> | null
}

export const STUDIO_REFERENCE_DATA_TTL_MS = 5 * 60 * 1000

export const getCachedReferenceData = async <T>(
  cache: Record<string, ReferenceDataCacheEntry<T>>,
  key: string,
  loader: () => Promise<T>,
  ttlMs = STUDIO_REFERENCE_DATA_TTL_MS
): Promise<T> => {
  const now = Date.now()
  const existingEntry = cache[key]

  if (existingEntry?.promise) {
    return existingEntry.promise
  }

  if (existingEntry?.value !== undefined && existingEntry.expiresAt > now) {
    return existingEntry.value
  }

  const pendingPromise = loader()
    .then(result => {
      cache[key] = {
        value: result,
        expiresAt: Date.now() + ttlMs,
        promise: null
      }
      return result
    })
    .catch(error => {
      cache[key] = {
        value: undefined,
        expiresAt: 0,
        promise: null
      }
      throw error
    })

  cache[key] = {
    value: undefined,
    expiresAt: 0,
    promise: pendingPromise
  }

  return pendingPromise
}
