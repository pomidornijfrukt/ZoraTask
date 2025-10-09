# Agent Guidelines for ZoraTask

## Commands
- **Build**: `npm run build` or `pnpm build`
- **Lint**: `npm run lint` (uses Biome)
- **Fix**: `npm run fix` (auto-fixes lint issues with `--write --unsafe`)
- **Dev**: `npm run dev`
- **Tests**: No test suite configured (verify changes manually via dev server)

## Code Style
- **Formatter**: Biome with tab indentation, double quotes, semicolons as needed
- **Imports**: Use `@/` path alias (e.g., `@/components/ui/button`). Organize imports automatically (Biome enabled)
- **Types**: TypeScript strict mode enabled. Use `type` for unions/intersections, prefer explicit function return types
- **Naming**: PascalCase for components/types, camelCase for functions/variables, kebab-case for files
- **Error Handling**: Use Zod for validation (`lib/env.ts` pattern), handle errors explicitly
- **React**: Server Components by default (Next.js 14 App Router), use `"use client"` only when needed
- **Database**: Drizzle ORM with PostgreSQL schemas in `lib/db/schemas/`, use `satisfies PgTable` pattern
- **Styling**: Tailwind CSS with `cn()` utility from `lib/utils.ts`, theme tokens via CSS variables
- **Components**: shadcn/ui patterns with Radix UI primitives, export named functions (e.g., `export { Button }`)

## Libraries & Dependencies
- **UI Components**: Use shadcn/ui components from `components/ui/` (built on Radix UI primitives)
- **Icons**: Use `lucide-react` for all icons
- **Styling**: Use `cn()` from `@/lib/utils` (combines `clsx` and `tailwind-merge`)
- **Forms**: Use `react-hook-form` with `@hookform/resolvers` and Zod validation
- **Auth**: Use Better Auth (`better-auth` and `@daveyplate/better-auth-ui`)
- **Database**: Use Drizzle ORM (`drizzle-orm`) with `postgres` driver
- **Validation**: Use `zod` for all schema validation (see `lib/env.ts`)
- **Date Handling**: Use `date-fns` for date formatting and manipulation
- **Theming**: Use `next-themes` for dark mode support

## Best Practices
- **NEVER** create custom UI components—always check `components/ui/` first
- Follow existing component patterns in `components/ui/`
- Use server-side data fetching where possible
- Never commit `.env.*` files or secrets
- Run `npm run fix` before committing to auto-format code
