## Nuxt

### Project Scaffolding

`npx nuxi@latest init <project-name>`

`npx nuxi@latest add <item-type> <name>`: Quickly generate boilerplate files (e.g., npx nuxi add page dashboard or npx nuxi add component header)

### Development Workflow

`npx nuxi dev`: Start the local hot-module-replacement (HMR) development server (usually at http://localhost:3000).

`npx nuxi prepare`: Generate type stubs and set up the .nuxt environment.

`cleanup`: Clear out caches and generated folders like .nuxt and .output

`typecheck`: Run a type check on your Vue/TypeScript codebase to spot errors.

### Production & Deployment


`npx nuxi build`: Compile and generate a standalone server package in the .output directory.

`npx nuxi generate`: Pre-render your entire application into static HTML and payload files.

`npx nuxi preview`: Run the locally-built production output to test your app locally before deploying

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
