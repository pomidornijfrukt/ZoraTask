import { organizationViewPaths } from "@daveyplate/better-auth-ui/server"
import { CustomOrganizationView } from "@/components/organization/custom-organization-view"

export const dynamicParams = false

export function generateStaticParams() {
	return Object.values(organizationViewPaths).map((path) => ({ path }))
}

export default async function OrganizationPage({
	params,
}: {
	params: Promise<{ path: string }>
}) {
	const { path } = await params
	return (
		<main className="container p-4 md:p-6">
			<CustomOrganizationView path={path} />
		</main>
	)
}
