import { defineConfig } from 'drizzle-kit';
import { env } from "@/lib/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schemas",
  out: "./lib/db/drizzle",
  dbCredentials: {
    url: env.DATABASE_URL
  }
});