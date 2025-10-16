"use client"

import type { SettingsCardClassNames } from "@daveyplate/better-auth-ui"
import { AuthUIContext, OrganizationCellView } from "@daveyplate/better-auth-ui"
import type { Organization } from "better-auth/plugins/organization"
import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface LeaveOrganizationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	className?: string
	classNames?: SettingsCardClassNames
	organization: Organization
}

export function LeaveOrganizationDialog({
	organization,
	className,
	classNames,
	open,
	onOpenChange,
}: LeaveOrganizationDialogProps) {
	const {
		authClient,
		hooks: { useListOrganizations },
		localization,
		toast,
	} = useContext(AuthUIContext)

	const { refetch: refetchOrganizations } = useListOrganizations()

	const [isLeaving, setIsLeaving] = useState(false)

	const handleLeaveOrganization = async () => {
		setIsLeaving(true)

		try {
			await authClient.organization.leave({
				organizationId: organization.id,
				fetchOptions: { throw: true },
			})

			await refetchOrganizations?.()

			toast({
				variant: "success",
				message: localization.LEAVE_ORGANIZATION_SUCCESS,
			})

			onOpenChange?.(false)
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			toast({
				variant: "error",
				message: errorMessage,
			})
		}

		setIsLeaving(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={classNames?.dialog?.content}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<DialogHeader className={classNames?.dialog?.header}>
					<DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
						{localization.LEAVE_ORGANIZATION}
					</DialogTitle>

					<DialogDescription
						className={cn("text-xs md:text-sm", classNames?.description)}
					>
						{localization.LEAVE_ORGANIZATION_CONFIRM}
					</DialogDescription>
				</DialogHeader>

				<Card className={cn("my-2 flex-row p-4", className, classNames?.cell)}>
					<OrganizationCellView
						organization={organization}
						localization={localization}
					/>
				</Card>

				<DialogFooter className={classNames?.dialog?.footer}>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange?.(false)}
						className={cn(classNames?.button, classNames?.outlineButton)}
						disabled={isLeaving}
					>
						{localization.CANCEL}
					</Button>

					<Button
						type="button"
						variant="destructive"
						onClick={handleLeaveOrganization}
						className={cn(classNames?.button, classNames?.destructiveButton)}
						disabled={isLeaving}
					>
						{isLeaving && <Loader2 className="animate-spin" />}

						{localization.LEAVE_ORGANIZATION}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
