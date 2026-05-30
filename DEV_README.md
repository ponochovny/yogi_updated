
## 🛢️Database

### Database config

```
server/util/db/index.ts
```

### Database schema (Drizzle ORM)

```
server/util/db/schema.ts
```

### Drizzle ORM config

```
drizzle.config.ts
```

## 🔐Better Auth

### Generate the auth schema based on the config

```bash
npx auth@latest generate --config server/utils/auth/index.ts --output server/utils/db/auth-schema.ts
```

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
// or
npm run db:generate
npm run db:migrate
```

### Auth config

```
server/util/auth/index.ts
```

### Generated auth schema path

```
server/util/db/auth-schema.ts
```

# Other notes

## 📝Neon Auth (Alternative)

### - Remove auth-schema

### - Add Neon Auth URL

```
app/utils/auth-client.ts
```

```TS
export const authClient = createAuthClient({
	// baseURL: 'http://localhost:3000/api/auth,
	baseURL: process.env.NEON_AUTH_URL,
})
```

## 📝Better Auth - Extend user fields

```TS
export const auth = betterAuth({
	// ... other options
	user: {
		// ... other options
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
			},
			phoneNumber: {
				type: "string",
				required: false
			}
		}
	}
})
```
