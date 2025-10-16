"use client"

import {
	type AuthLocalization,
	AuthUIContext,
	SettingsCard,
	type SettingsCardClassNames,
	useCurrentOrganization,
} from "@daveyplate/better-auth-ui"
import type { Organization } from "better-auth/plugins/organization"
import { useContext, useMemo, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CustomMemberCell } from "./custom-member-cell"

export interface CustomOrganizationMembersCardProps {
	className?: string
	classNames?: SettingsCardClassNames
	localization?: Partial<AuthLocalization>
	slug?: string
}

export function CustomOrganizationMembersCard({
	className,
	classNames,
	localization: localizationProp,
	slug: slugProp,
	...props
}: CustomOrganizationMembersCardProps) {
	const {
		localization: contextLocalization,
		organization: organizationOptions,
	} = useContext(AuthUIContext)

	const localization = useMemo(
		() => ({ ...contextLocalization, ...localizationProp }),
		[contextLocalization, localizationProp],
	)

	const slug = slugProp || organizationOptions?.slug

	const { data: organization } = useCurrentOrganization({ slug })

	if (!organization) {
		return (
			<SettingsCard
				className={className}
				classNames={classNames}
				title={localization.MEMBERS}
				description={localization.MEMBERS_DESCRIPTION}
				instructions={localization.MEMBERS_INSTRUCTIONS}
				actionLabel={localization.INVITE_MEMBER}
				isPending
				{...props}
			/>
		)
	}

	return (
		<CustomOrganizationMembersContent
			className={className}
			classNames={classNames}
			localization={localization}
			organization={organization}
			{...props}
		/>
	)
}

function CustomOrganizationMembersContent({
	className,
	classNames,
	localization: localizationProp,
	organization,
	...props
}: CustomOrganizationMembersCardProps & { organization: Organization }) {
	const {
		hooks: { useHasPermission, useListMembers },
		localization: contextLocalization,
	} = useContext(AuthUIContext)

	const localization = useMemo(
		() => ({ ...contextLocalization, ...localizationProp }),
		[contextLocalization, localizationProp],
	)

	const { data: hasPermissionInvite, isPending: isPendingInvite } =
		useHasPermission({
			organizationId: organization.id,
			permissions: {
				invitation: ["create"],
			},
		})

	const { isPending: isPendingUpdateMember } = useHasPermission({
		organizationId: organization.id,
		permission: {
			member: ["update"],
		},
	})

	const isPending = isPendingInvite || isPendingUpdateMember

	const { data } = useListMembers({
		query: { organizationId: organization.id },
	})

	const members = data?.members

	const [_inviteDialogOpen, setInviteDialogOpen] = useState(false)

	return (
		<SettingsCard
			className={className}
			classNames={classNames}
			title={localization.MEMBERS}
			description={localization.MEMBERS_DESCRIPTION}
			instructions={localization.MEMBERS_INSTRUCTIONS}
			actionLabel={localization.INVITE_MEMBER}
			action={() => setInviteDialogOpen(true)}
			isPending={isPending}
			disabled={!hasPermissionInvite?.success}
			{...props}
		>
			{!isPending && members && members.length > 0 && (
				<CardContent className={cn("grid gap-4", classNames?.content)}>
					{members
						.sort(
							(a, b) =>
								new Date(a.createdAt).getTime() -
								new Date(b.createdAt).getTime(),
						)
						.map((member) => (
							<CustomMemberCell
								key={member.id}
								classNames={classNames}
								member={member}
							/>
						))}
				</CardContent>
			)}
		</SettingsCard>
	)
}
