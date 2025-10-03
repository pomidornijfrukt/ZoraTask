# [ZoraTask](https://github.com/pomidornijfrukt/ZoraTask/)

**Open-source** Agile project management tool with progress and activity tracking. It's like Jira but open-source and without bloat with stronger progress and [Activity](https://github.com/ActivityWatch/activitywatch) tracking integration.

## Features

- Project Creation and Task Management
- Planning and Backlog Management
- Kanban Board
- Time and Activity Tracking with [ActivityWatch](https://github.com/ActivityWatch/activitywatch)

## Tech-stack

- Full-Stack
  - [Next.js](https://nextjs.org/)
- UI and Styling
  - [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs) & [ShadcnUI](https://github.com/shadcn-ui/ui)
- Database
  - [Drizzle ORM](https://orm.drizzle.team/docs/get-started)
  - PostgreSQL or Supabase
- Auth
  - [Better-Auth](https://www.better-auth.com/)

## Installation
Recommended package manager: pnpm

```bash
# install deps
pnpm install

# build
pnpm run build

# start production
pnpm run start

# generate drizzle migration from the provided schema
pnpm run generate

# migrate to the database
pnpm run migrate
```

You can also use a quick one-liner `pnpm build && pnpm start` for production.

## Environment

Zora (almost) works out-of-the-box with committed `NODE_ENV` environment-specific (production/development/test) `.env.*` defaults. For `DATABASE_URL` default to work you are expected to have a pg database setup locally.

If you need to override secrets or provider keys, create `.env.*.local` for the according environment and put your sensitive values there, they wont be commited.

Read more about [node environment](https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used).

### Where to find typed env names

All used environment variables and types live in:
`/lib/env.ts` - we use zod + dotenvx for typed env validation.

### OAuth (required for auth)

OAuth cannot / will not work out of the box due to the required secret keys for every prodiver, so if you want a proper auth you are expected to fill them yourself:

`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (defaults are not safe for production):
https://www.better-auth.com/docs/installation#set-environment-variables

`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`:
https://www.better-auth.com/docs/authentication/github#get-your-github-credentials

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`:
https://www.better-auth.com/docs/authentication/google#get-your-google-credentials

## Development

```bash
# install deps
pnpm install

# dev server
pnpm run dev
```
Use `pnpm dev` while developing (hot reload).

Project has a set-up biome lint, thus there are a few handy commands for a cleaner code in development:

```bash
# find issues with the code through the set-up biome lint
pnpm run lint

# fix the code with biome lint
pnpm run fix
```