import z from "zod"

export const updateProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(100),
	lastName: z.string().min(1, "Last name is required").max(100),
	bio: z.string().max(500).optional().nullable(),
	phoneNumber: z
		.string()
		.regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
		.optional()
		.nullable()
		.or(z.literal("")),
	timeZone: z.string().max(100).optional().nullable(),
	language: z
		.string()
		.length(2, "Language must be a 2-letter code")
		.optional()
		.nullable()
		.or(z.literal("")),
	birthDate: z.coerce.date().optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
