"use client"

import type { User } from "better-auth"
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

export default function MemberAddSelect({
	organizationMembers,
	className,
}: {
	organizationMembers: User[]
} & ComponentProps<"div">) {
	const [value, setValue] = useState<string>("")

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<input type="hidden" name={"memberId"} value={value} />

			<Select value={value} onValueChange={setValue}>
				<SelectTrigger aria-label="Choose member" className="min-w-[220px]">
					<SelectValue placeholder={"Select a member..."} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Organization members</SelectLabel>
						{organizationMembers.map((m) => (
							<SelectItem key={m.id} value={m.id}>
								{m.name} {m.email ? `· ${m.email}` : ""}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	)
}
