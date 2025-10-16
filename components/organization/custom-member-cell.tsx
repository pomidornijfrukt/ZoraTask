"use client"

import type { SettingsCardClassNames } from "@daveyplate/better-auth-ui"
import { AuthUIContext, UserView } from "@daveyplate/better-auth-ui"
import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { EllipsisIcon, UserXIcon } from "lucide-react"
import { useContext, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"

export interface CustomMemberCellProps {
	className?: string
	classNames?: SettingsCardClassNames
	member: Member & { user?: Partial<User> | null }
}

export function CustomMemberCell({
	className,
	classNames,
	member,
}: CustomMemberCellProps) {
	const {
		organization: organizationOptions,
		hooks: { useSession, useListOrganizations },
		localization,
	} = useContext(AuthUIContext)

	const { data: sessionData } = useSession()
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

	const builtInRoles = [
		{ role: "owner", label: localization.OWNER },
		{ role: "admin", label: localization.ADMIN },
		{ role: "member", label: localization.MEMBER },
	]

	const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])]
	const role = roles.find((r) => r.role === member.role)

	const isSelf = sessionData?.user.id === member?.userId

	const { data: organizations } = useListOrganizations()
	const organization = organizations?.find(
		(org) => org.id === member.organizationId,
	)

	return (
		<>
			<Card
				className={cn("flex-row items-center p-4", className, classNames?.cell)}
			>
				<UserView
					user={member.user}
					localization={localization}
					className="flex-1"
				/>

				<span className="text-xs opacity-70">{role?.label}</span>

				{isSelf && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className={cn(
									"relative ms-auto",
									classNames?.button,
									classNames?.outlineButton,
								)}
								size="icon"
								type="button"
								variant="outline"
							>
								<EllipsisIcon className={classNames?.icon} />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
							<DropdownMenuItem
								onClick={() => setLeaveDialogOpen(true)}
								className="text-destructive focus:text-destructive"
							>
								<UserXIcon className={classNames?.icon} />
								{localization?.LEAVE_ORGANIZATION}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</Card>

			{organization && (
				<LeaveOrganizationDialog
					open={leaveDialogOpen}
					onOpenChange={setLeaveDialogOpen}
					organization={organization}
					classNames={classNames}
				/>
			)}
		</>
	)
}
