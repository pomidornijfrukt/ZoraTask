import { Calendar, Plus, Users } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import CreateProjectDialog from "@/components/project/create-project-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { createProject } from "@/lib/actions/projects"
import { auth } from "@/lib/auth"
import { getProjectMembers, getProjects } from "@/lib/data/projects"

export default async function ProjectsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	if (!session?.user) throw new Error("Unauthorized")
	const projects = await getProjects(session.user.id)
	const organizations = await auth.api.listOrganizations({
		headers: await headers(),
	})

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Projects
						</h1>
						<p className="text-muted-foreground">
							Manage and track all your projects in one place
						</p>
					</div>
					<CreateProjectDialog
						organizations={organizations}
						createProject={createProject}
					/>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map(async (project) => {
						const members = await getProjectMembers(project.id)

						return (
							<Card
								key={project.id}
								className="bg-card border-border hover:border-primary/50 transition-colors"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-card-foreground mb-2 truncate max-w-sm">
												{project.name}
											</CardTitle>
											<CardDescription className="text-sm line-clamp-2">
												{project.description || "No description provided."}
											</CardDescription>
										</div>
									</div>
								</CardHeader>

								<CardContent>
									<div className="space-y-4">
										{/* Team Members */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Users className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Team
												</span>
											</div>
											<div className="flex -space-x-2">
												{members.slice(0, 3).map((member) => (
													<Avatar
														key={member.id}
														className="h-8 w-8 border-2 border-card"
													>
														<AvatarImage
															src={member.image || "/placeholder.svg"}
															alt={member.name}
														/>
														<AvatarFallback className="text-xs bg-muted text-muted-foreground">
															{member.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
												))}
												{members.length > 3 && (
													<div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center">
														<span className="text-xs text-muted-foreground">
															+{members.length - 3}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Updated Date */}
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Calendar className="h-4 w-4" />
											<span>
												Updated{" "}
												{new Date(project.updatedAt).toLocaleDateString()}
											</span>
										</div>

										{/* Action Buttons */}
										<div className="flex gap-2 pt-2">
											<Button asChild={true} className="flex-1">
												<Link href={`/projects/${project.id}`}>
													View Overview
												</Link>
											</Button>
											<Button
												asChild={true}
												variant="outline"
												className="flex-1 bg-transparent"
											>
												<Link href={`/projects/${project.id}/board`}>
													Open Board
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>

				{/* Empty State */}
				{projects.length === 0 && (
					<div className="text-center py-12">
						<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
							<Plus className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold text-foreground mb-2">
							No projects yet
						</h3>
						<p className="text-muted-foreground mb-6">
							Create your first project to get started with Zora.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
