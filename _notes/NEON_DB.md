## 📝Neon Auth (Alternative)

### - Remove auth-schema

### - Add Neon Auth URL

```TS
// app/utils/auth-client.ts

export const authClient = createAuthClient({
	// baseURL: 'http://localhost:3000/api/auth, <-- Replace this line
	baseURL: process.env.NEON_AUTH_URL, // with this
})
```
