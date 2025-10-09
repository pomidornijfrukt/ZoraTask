"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/auth-client"

type ExtendedUser = {
	name: string
	email: string
	image?: string | null
	firstName?: string
	lastName?: string
	bio?: string
	phoneNumber?: string
	timeZone?: string
	language?: string
	age?: string
}

export default function AccountSettingsPage() {
	const imageId = useId()
	const nameId = useId()
	const emailId = useId()
	const firstNameId = useId()
	const lastNameId = useId()
	const bioId = useId()
	const phoneNumberId = useId()
	const ageId = useId()
	const timeZoneId = useId()
	const languageId = useId()

	const [user, setUser] = useState<ExtendedUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState<{
		type: "success" | "error"
		text: string
	} | null>(null)

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		image: "",
		firstName: "",
		lastName: "",
		bio: "",
		phoneNumber: "",
		timeZone: "",
		language: "",
		age: "",
	})

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const session = await authClient.getSession()
				if (session?.data?.user) {
					const userData = session.data.user as ExtendedUser
					setUser(userData)
					setFormData({
						name: userData.name || "",
						email: userData.email || "",
						image: userData.image || "",
						firstName: userData.firstName || "",
						lastName: userData.lastName || "",
						bio: userData.bio || "",
						phoneNumber: userData.phoneNumber || "",
						timeZone: userData.timeZone || "",
						language: userData.language || "",
						age: userData.age || "",
					})
				}
			} catch (error) {
				console.error("Failed to fetch user:", error)
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

		try {
			await authClient.updateUser({
				name: formData.name,
				image: formData.image,
			})

			const profileResponse = await fetch("/api/profile/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
					bio: formData.bio,
					phoneNumber: formData.phoneNumber,
					timeZone: formData.timeZone,
					language: formData.language,
					age: formData.age ? Number.parseInt(formData.age, 10) : null,
				}),
			})

			if (!profileResponse.ok) {
				throw new Error("Failed to update profile")
			}

			setMessage({ type: "success", text: "Profile updated successfully" })

			const session = await authClient.getSession()
			if (session?.data?.user) {
				setUser(session.data.user)
			}
		} catch (error) {
			console.error("Failed to update profile:", error)
			setMessage({
				type: "error",
				text: "Failed to update profile. Please try again.",
			})
		} finally {
			setSaving(false)
		}
	}

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
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
				<p className="text-muted-foreground">Manage your profile information</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Profile Picture</CardTitle>
						<CardDescription>Update your avatar image</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage
									src={formData.image || user.image || "/placeholder.svg"}
									alt={formData.name}
								/>
								<AvatarFallback className="text-lg">
									{formData.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()}
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
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>Your core account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label
								htmlFor={nameId}
								className="text-sm font-medium text-foreground block mb-2"
							>
								Display Name
							</label>
							<Input
								id={nameId}
								type="text"
								value={formData.name}
								onChange={(e) => handleChange("name", e.target.value)}
								placeholder="John Doe"
								required={true}
							/>
						</div>

						<div>
							<label
								htmlFor={emailId}
								className="text-sm font-medium text-foreground block mb-2"
							>
								Email
							</label>
							<Input
								id={emailId}
								type="email"
								value={formData.email}
								disabled={true}
								className="bg-muted"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Email cannot be changed here. Use account management to update
								your email.
							</p>
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
									First Name
								</label>
								<Input
									id={firstNameId}
									type="text"
									value={formData.firstName}
									onChange={(e) => handleChange("firstName", e.target.value)}
									placeholder="John"
								/>
							</div>

							<div>
								<label
									htmlFor={lastNameId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Last Name
								</label>
								<Input
									id={lastNameId}
									type="text"
									value={formData.lastName}
									onChange={(e) => handleChange("lastName", e.target.value)}
									placeholder="Doe"
								/>
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
							/>
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
									placeholder="+1 234 567 8900"
								/>
							</div>

							<div>
								<label
									htmlFor={ageId}
									className="text-sm font-medium text-foreground block mb-2"
								>
									Age
								</label>
								<Input
									id={ageId}
									type="number"
									value={formData.age}
									onChange={(e) => handleChange("age", e.target.value)}
									placeholder="25"
									min="0"
									max="150"
								/>
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
							/>
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
							/>
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
