import { defineConfig } from 'drizzle-kit';
import { env } from "@/lib/env";

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/drizzle',
  dbCredentials: {
    url: env.DATABASE_URL
  }
});