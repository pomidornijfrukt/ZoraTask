import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, openAPI, organization } from "better-auth/plugins"
import * as schema from "@/lib/db/schemas"
import { db } from "./db"
import { env } from "./env"

export const auth = betterAuth<BetterAuthOptions>({
	secret: env.BETTER_AUTH_SECRET,
	session: {
		cookieCache: {
			enabled: true,
		},
	},
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),

	user: {
		deleteUser: {
			enabled: true,
		},
	},

	plugins: [organization(), admin(), openAPI()],
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},

	advanced: {
		useSecureCookies: true,
	},

	emailAndPassword: {
		enabled: false,
	},
})
