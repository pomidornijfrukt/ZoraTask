import z from "zod"

export const updateProfileSchema = z.object({
	firstName: z.string().min(3, "First name is required").max(100),
	lastName: z.string().min(3, "Last name is required").max(100),
	bio: z.string().max(1000).optional().nullable(),
	phoneNumber: z
		.string()
		.max(32, "Phone number too long")
		.optional()
		.nullable()
		.transform((val) => (val === "" ? null : val)),
	timeZone: z.string().max(100).optional().nullable(),
	language: z
		.string()
		.max(2, "Language code too long")
		.optional()
		.nullable()
		.or(z.literal("")),
	birthDate: z.string().optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
