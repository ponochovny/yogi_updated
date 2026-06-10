## 📝Neon Auth (Alternative)

### - Remove auth-schema

### - Add Neon Auth URL

```TS
// app/utils/auth-client.ts
import { createAuthClient } from '@neondatabase/auth'

export const authClient = createAuthClient({
	baseURL: process.env.NEON_AUTH_URL,
})
```
