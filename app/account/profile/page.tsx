"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	DatePicker,
	DatePickerCalendar,
	DatePickerContent,
	DatePickerTrigger,
	DatePickerValue,
} from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/auth-client"
import { AccountSettingsCards } from "@daveyplate/better-auth-ui"
import { Loader2 } from "lucide-react"
import { useEffect, useId, useState } from "react"

type ExtendedUser = {
	image?: string | null
	firstName?: string
	lastName?: string
	bio?: string
	phoneNumber?: string
	timeZone?: string
	language?: string
	birthDate?: string
}

export default function AccountSettingsPage() {
	const imageId = useId()
	const firstNameId = useId()
	const lastNameId = useId()
	const bioId = useId()
	const phoneNumberId = useId()
	const birthDateId = useId()
	const timeZoneId = useId()
	const languageId = useId()

	const [user, setUser] = useState<ExtendedUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<{
		type: "success" | "error"
		text: string
	} | null>(null)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formData, setFormData] = useState({
		image: "",
		firstName: "",
		lastName: "",
		bio: "",
		phoneNumber: "",
		timeZone: "",
		language: "",
		birthDate: "",
	})

	useEffect(() => {
		const fetchUser = async () => {
			try {
				// First check if user is authenticated
				const session = await authClient.getSession()
				if (!session?.data?.user) {
					setLoading(false)
					return
				}

				// Fetch complete profile data from database
				const profileResponse = await fetch("/api/profile")

				if (!profileResponse.ok) {
					throw new Error("Failed to fetch profile")
				}

				const profileData = await profileResponse.json()

				setUser(profileData)
				setFormData({
					image: profileData.image || "",
					firstName: profileData.firstName || "",
					lastName: profileData.lastName || "",
					bio: profileData.bio || "",
					phoneNumber: profileData.phoneNumber || "",
					timeZone: profileData.timeZone || "",
					language: profileData.language || "",
					birthDate: profileData.birthDate || "",
				})
			} catch (error) {
				console.error("Failed to fetch user:", error)
				setMessage({
					type: "error",
					text: "Failed to load profile data. Please refresh the page.",
				})
			} finally {
				setLoading(false)
			}
		}

		fetchUser()
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setMessage(null)
		setErrors({})

		try {
			// Frontend validation for required fields
			const validationErrors: Record<string, string> = {}

			if (!formData.firstName.trim()) {
				validationErrors.firstName = "First name is required"
			}

			if (!formData.lastName.trim()) {
				validationErrors.lastName = "Last name is required"
			}

			// Validate image URL if provided
			if (formData.image?.trim()) {
				try {
					new URL(formData.image)
				} catch {
					validationErrors.image = "Please enter a valid URL"
				}
			}
			if (Object.keys(validationErrors).length > 0) {
				setErrors(validationErrors)
				setMessage({
					type: "error",
					text: "Please fix the errors below and try again.",
				})
				return
			}

			// Update user image
			try {
				await authClient.updateUser({
					image: formData.image || null,
				})
			} catch (error) {
				console.error("Failed to update user image:", error)
				setErrors({ image: "Failed to update image" })
				setMessage({
					type: "error",
					text: "Failed to update profile picture. Please try again.",
				})
				return
			}

			// Update profile data
			const profileResponse = await fetch("/api/profile/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: formData.firstName.trim(),
					lastName: formData.lastName.trim(),
					bio: formData.bio.trim() || null,
					phoneNumber: formData.phoneNumber.trim() || null,
					timeZone: formData.timeZone.trim() || null,
					language: formData.language.trim() || null,
					birthDate: formData.birthDate || null,
				}),
			})

			if (!profileResponse.ok) {
				const errorData = await profileResponse.json().catch(() => ({}))
				const fieldErrors: Record<string, string> = {}

				// Parse Zod validation errors from backend
				if (errorData.details?.name === "ZodError") {
					// Prefer standard Zod error format: details.errors is an array
					if (Array.isArray(errorData.details.errors)) {
						errorData.details.errors.forEach((err: { path: string[]; message: string }) => {
							if (err.path && err.path.length > 0) {
								fieldErrors[err.path[0]] = err.message
							}
						})
					} else if (typeof errorData.details.message === "string") {
						// If only a message is present, use it as a general error
						fieldErrors["form"] = errorData.details.message
					}
				} else if (errorData.errors) {
					// Handle other error formats
					Object.entries(errorData.errors).forEach(([key, value]) => {
						fieldErrors[key] = String(value)
					})
				}

				if (Object.keys(fieldErrors).length > 0) {
					setErrors(fieldErrors)
					setMessage({
						type: "error",
						text: "Please fix the errors below and try again.",
					})
				} else {
					setMessage({
						type: "error",
						text:
							errorData.error || "Failed to update profile. Please try again.",
					})
				}

				return
			}

			setMessage({ type: "success", text: "Profile updated successfully" })

			// Refresh profile data from database
			try {
				const profileResponse = await fetch("/api/profile")

				if (profileResponse.ok) {
					const profileData = await profileResponse.json()
					setUser(profileData)
					// Update form with fresh data from database
					setFormData({
						image: profileData.image || "",
						firstName: profileData.firstName || "",
						lastName: profileData.lastName || "",
						bio: profileData.bio || "",
						phoneNumber: profileData.phoneNumber || "",
						timeZone: profileData.timeZone || "",
						language: profileData.language || "",
						birthDate: profileData.birthDate || "",
					})
				}
			} catch (error) {
				console.error("Failed to refresh profile data:", error)
			}
		} catch (error) {
			console.error("Failed to update profile:", error)

			setMessage({
				type: "error",
				text:
					error instanceof Error
						? error.message
						: "Failed to update profile. Please try again.",
			})
		} finally {
			setSaving(false)
		}
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[field]
				return newErrors
			})
		}
	}

	const getInitials = (firstName?: string, lastName?: string) => {
		const first = firstName?.charAt(0) || ""
		const last = lastName?.charAt(0) || ""
		return (first + last).toUpperCase() || "U"
	}

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">
							Please sign in to view your settings.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-foreground mb-2">
					Account Settings
				</h1>
				<p className="text-muted-foreground">
					Manage your profile information. Fields marked with{" "}
					<span className="text-red-500">*</span> are required.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<AccountSettingsCards />
				<Card>
					<CardHeader>
						<CardTitle>Profile Picture</CardTitle>
						<CardDescription>Update your avatar image</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage
									src={formData.image || user.image || ""}
									alt={`${formData.firstName || user.firstName || ""} ${formData.lastName || user.lastName || ""}`}
								/>
								<AvatarFallback className="text-2xl">
									{getInitials(
										formData.firstName || user.firstName,
										formData.lastName || user.lastName,
									)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<label
									htmlFor={imageId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Image URL
								</label>
								<Input
									id={imageId}
									type="url"
									value={formData.image}
									onChange={(e) => handleChange("image", e.target.value)}
									placeholder="https://example.com/avatar.jpg"
									className={errors.image ? "border-red-500" : ""}
								/>
								{errors.image && (
									<p className="text-sm text-red-500 mt-1">{errors.image}</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Personal Details</CardTitle>
						<CardDescription>Additional information about you</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor={firstNameId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									First Name <span className="text-red-500">*</span>
								</label>
								<Input
									id={firstNameId}
									type="text"
									value={formData.firstName}
									onChange={(e) => handleChange("firstName", e.target.value)}
									placeholder="John"
									required
									className={errors.firstName ? "border-red-500" : ""}
								/>
								{errors.firstName && (
									<p className="text-sm text-red-500 mt-1">
										{errors.firstName}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor={lastNameId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Last Name <span className="text-red-500">*</span>
								</label>
								<Input
									id={lastNameId}
									type="text"
									value={formData.lastName}
									onChange={(e) => handleChange("lastName", e.target.value)}
									placeholder="Doe"
									required
									className={errors.lastName ? "border-red-500" : ""}
								/>
								{errors.lastName && (
									<p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor={bioId}
								className="text-sm font-medium text-foreground block mb-2"
							>
								Bio
							</label>
							<Input
								id={bioId}
								type="text"
								value={formData.bio}
								onChange={(e) => handleChange("bio", e.target.value)}
								placeholder="Tell us about yourself"
								className={errors.bio ? "border-red-500" : ""}
							/>
							{errors.bio && (
								<p className="text-sm text-red-500 mt-1">{errors.bio}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor={phoneNumberId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Phone Number
								</label>
								<Input
									id={phoneNumberId}
									type="tel"
									value={formData.phoneNumber}
									onChange={(e) => handleChange("phoneNumber", e.target.value)}
									placeholder="+371 20507090"
									className={errors.phoneNumber ? "border-red-500" : ""}
								/>
								{errors.phoneNumber && (
									<p className="text-sm text-red-500 mt-1">
										{errors.phoneNumber}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor={birthDateId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Birth Date
								</label>
								<DatePicker
									mode="single"
									value={
										formData.birthDate ? new Date(formData.birthDate) : null
									}
									onValueChange={(date) =>
										handleChange("birthDate", date ? date.toISOString() : "")
									}
								>
									<DatePickerTrigger
										id={birthDateId}
										className={`w-full ${errors.birthDate ? "border-red-500" : ""}`}
									>
										<DatePickerValue placeholder="Pick a date" />
									</DatePickerTrigger>
									<DatePickerContent>
										<DatePickerCalendar
											captionLayout="dropdown"
											hideNavigation
											fromYear={1900}
											toYear={new Date().getFullYear()}
											disabled={(date) =>
												date > new Date() || date < new Date("1900-01-01")
											}
										/>
									</DatePickerContent>
								</DatePicker>
								{errors.birthDate && (
									<p className="text-sm text-red-500 mt-1">
										{errors.birthDate}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Preferences</CardTitle>
						<CardDescription>Customize your experience</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label
								htmlFor={timeZoneId}
								className="text-sm font-medium text-foreground block mb-2"
							>
								Time Zone
							</label>
							<Input
								id={timeZoneId}
								type="text"
								value={formData.timeZone}
								onChange={(e) => handleChange("timeZone", e.target.value)}
								placeholder="America/New_York"
								className={errors.timeZone ? "border-red-500" : ""}
							/>
							{errors.timeZone && (
								<p className="text-sm text-red-500 mt-1">{errors.timeZone}</p>
							)}
						</div>

						<div>
							<label
								htmlFor={languageId}
								className="text-sm font-medium text-foreground block mb-2"
							>
								Language (2-letter code)
							</label>
							<Input
								id={languageId}
								type="text"
								value={formData.language}
								onChange={(e) =>
									handleChange("language", e.target.value.slice(0, 2))
								}
								placeholder="en"
								maxLength={2}
								className={errors.language ? "border-red-500" : ""}
							/>
							{errors.language && (
								<p className="text-sm text-red-500 mt-1">{errors.language}</p>
							)}
						</div>
					</CardContent>
				</Card>

				{message && (
					<div
						className={`p-4 rounded-md ${
							message.type === "success"
								? "bg-green-500/10 text-green-500 border border-green-500/20"
								: "bg-red-500/10 text-red-500 border border-red-500/20"
						}`}
					>
						{message.text}
					</div>
				)}

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => window.history.back()}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={saving}>
						{saving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</div>
			</form>
		</div>
	)
}
