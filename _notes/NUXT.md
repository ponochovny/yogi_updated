## Nuxt - Request Typing

```TS
export type Offering = Omit<typeof offerings.$inferSelect,
'createdAt' | 'updatedAt'
> & {
	createdAt: string
	updatedAt: string
}
```

```TS
import type { InternalApi } from 'nitropack'

export type OfferingItem = InternalApi['/api/offerings']['get']['offerings'][number]

```

```TS
import type { InternalApi } from 'nitropack'
export type StudioTransactionItem =
  InternalApi['/api/business/studios/:slug/transactions']['get'][number]

import type { StudioTransactionItem } from '../../../entities/payment/schema'
// StudioTransactionItem[]
```
