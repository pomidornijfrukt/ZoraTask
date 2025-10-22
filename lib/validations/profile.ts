import z from "zod"

export const updateProfileSchema = z.object({
	firstName: z.string().min(3, "First name is required").max(100),
	lastName: z.string().min(3, "Last name is required").max(100),
	bio: z.string().max(1000).optional().nullable(),
	phoneNumber: z
		.string()
		.max(16, "Phone number too long")
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
	birthDate: z
		.string()
		.optional()
		.nullable()
		.refine(
			(val) => {
				// allow empty/null
				if (!val) return true
				const date = new Date(val)
				if (Number.isNaN(date.getTime())) return false
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				date.setHours(0, 0, 0, 0)
				return date <= today
			},
			{ message: "Birth date cannot be in the future" },
		),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
