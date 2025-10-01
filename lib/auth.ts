import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { organization, admin, openAPI } from "better-auth/plugins";
import { env } from "./env";
import * as schema from "@/lib/db/schemas/index"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    plugins: [organization(), admin(), openAPI() ],
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
        }
    },
    enableEmailPassword: false
});