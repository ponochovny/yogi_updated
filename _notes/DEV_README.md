
## 🛢️Database + ORM

### Database config

```
server/utils/db/index.ts
```

### Database schema (Drizzle ORM)

```
server/db/schema (folder)
```

### Drizzle ORM config

```
drizzle.config.ts
```

## 🔐Auth (Better Auth)

### Generate the auth schema based on the config

```bash
npx auth@latest generate --config server/utils/auth/index.ts --output server/db/schema/auth-schema.ts
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
server/utils/auth/index.ts
```

### Generated auth schema path

```
server/utils/db/schema/auth-schema.ts
```
