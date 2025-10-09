import process from "node:process"
import { config } from "@dotenvx/dotenvx"
import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

config({ convention: "flow" })

export const env = createEnv({
	experimental__runtimeEnv: process.env,
	server: {
		// db
		DATABASE_URL: z.string(),
		// auth
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.string().url(),
		// auth social providers
		GITHUB_CLIENT_ID: z.string().default(""),
		GITHUB_CLIENT_SECRET: z.string().default(""),
		GOOGLE_CLIENT_ID: z.string().default(""),
		GOOGLE_CLIENT_SECRET: z.string().default(""),

		// email (via better-auth)
		RESEND_API_KEY: z.string(),
	},
})
