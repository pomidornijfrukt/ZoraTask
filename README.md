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

## Docker Deployment

To run ZoraTask in a production-ready containerized environment using Docker Compose:

1. Ensure Docker and Docker Compose are installed on your system.

2. Clone the repository and navigate to the project directory.

3. (Optional) Create a `.env` file in the project root with your desired environment variables (Docker Compose will read from this file automatically). If omitted, default values will be used.

4. Start the application stack:
   ```bash
   docker compose up --build -d
   ```

5. Once PostgreSQL is healthy, apply database migrations:
   ```bash
   docker compose exec app pnpm run migrate
   ```

6. Access the application at <http://localhost:3000>. PostgreSQL is exposed on `localhost:5432`.

For production deployment on platforms like Dokploy or Coolify:
- Upload the `docker-compose.yml` and `Dockerfile` to your platform.
- Override the default environment variables via the platform's UI to set secure production values for `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (note: `DATABASE_URL` is auto-constructed from the PostgreSQL variables).

To stop and clean up:
```bash
docker compose down
```
Data persists in the `postgres_data` named volume between restarts.

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