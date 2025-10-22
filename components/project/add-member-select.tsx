"use client"

import { randomBytes } from "node:crypto"
import type { User } from "better-auth"
import Image from "next/image"
import { type ComponentProps, useState } from "react"
import { cn } from "@/lib/utils"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select"

export default function AddMemberSelect({
	organizationMembers,
	className,
}: {
	organizationMembers: User[]
} & ComponentProps<"div">) {
	const [value, setValue] = useState<string>("")

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Select name="memberId" value={value} onValueChange={setValue}>
				<SelectTrigger aria-label="Choose member" className="min-w-[220px]">
					<SelectValue placeholder={"Select a member..."} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Organization members</SelectLabel>
						{organizationMembers.map((m) => (
							<SelectItem key={m.id} value={m.id}>
								{m.image && (
									<Image
										src={m.image}
										alt={m.name}
										width={24}
										height={24}
										className="rounded-full"
									/>
								)}
								{m.name} {m.email}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	)
}
