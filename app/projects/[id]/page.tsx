import {
	ArrowLeft,
	BarChart3,
	Calendar,
	Kanban,
	Settings,
	Users,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getProject, getProjectMembers } from "@/lib/data/projects"
import { getTaskMetadataById, getTasksByProject } from "@/lib/data/task"

export default async function ProjectPage({
	params,
}: {
	params: { id: string }
}) {
	const { id } = await params
	const project = await getProject(id)

	if (!project) {
		notFound()
	}

	const members = await getProjectMembers(id)

	const tasks = await getTasksByProject(id)
	const todoTasks = tasks.filter((task) => task.executionStatus === "todo")
	const inProgressTasks = tasks.filter(
		(task) => task.executionStatus === "in-progress",
	)
	const doneTasks = tasks.filter((task) => task.executionStatus === "done")

	const completionRate =
		tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" size="sm" asChild={true}>
						<Link href="/projects" className="flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back to Projects
						</Link>
					</Button>
				</div>

				<div className="flex items-start justify-between mb-8">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-3xl font-bold text-foreground">
								{project.name}
							</h1>
						</div>
						<p className="text-muted-foreground mb-4">{project.description}</p>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								Created {new Date(project.createdAt).toLocaleDateString()}
							</div>
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								{members.length} members
							</div>
						</div>
					</div>
					<div className="flex gap-2">
						<Button asChild variant="outline">
							<Link
								href={`/projects/${project.id}/settings`}
								className="flex items-center gap-2"
							>
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</Link>
						</Button>
						<Button asChild>
							<Link href={`/projects/${project.id}/board`}>
								<Kanban className="h-4 w-4 mr-2" />
								Open Board
							</Link>
						</Button>
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Progress Overview */}
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-card-foreground flex items-center gap-2">
									<BarChart3 className="h-5 w-5" />
									Project Progress
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-muted-foreground">
												Overall Completion
											</span>
											<span className="text-sm font-medium text-card-foreground">
												{completionRate}%
											</span>
										</div>
										<Progress value={completionRate} className="h-2" />
									</div>

									<div className="grid grid-cols-3 gap-4">
										<div className="text-center p-4 bg-muted/50 rounded-lg">
											<div className="text-2xl font-bold text-card-foreground">
												{todoTasks.length}
											</div>
											<div className="text-sm text-muted-foreground">To Do</div>
										</div>
										<div className="text-center p-4 bg-yellow-500/10 rounded-lg">
											<div className="text-2xl font-bold text-yellow-500">
												{inProgressTasks.length}
											</div>
											<div className="text-sm text-muted-foreground">
												In Progress
											</div>
										</div>
										<div className="text-center p-4 bg-green-500/10 rounded-lg">
											<div className="text-2xl font-bold text-green-500">
												{doneTasks.length}
											</div>
											<div className="text-sm text-muted-foreground">Done</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Recent Tasks */}
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-card-foreground">
									Recent Tasks
								</CardTitle>
								<CardDescription>
									Latest activity in this project
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{tasks.slice(0, 5).map(async (task) => {
										const metadata = await getTaskMetadataById(task.id)
										return (
											<div
												key={task.id}
												className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
											>
												<div className="flex-1">
													<h4 className="font-medium text-card-foreground">
														{task.name}
													</h4>
													{metadata.description && (
														<p className="text-sm text-muted-foreground">
															{metadata.description.body}
														</p>
													)}
													<div className="flex items-center gap-2 mt-2">
														{metadata.priority?.name}
													</div>
												</div>
												<div className="flex items-center gap-2">
													{metadata.assignees.map((assignee) => {
														return (
															<Avatar key={assignee.id} className="h-8 w-8">
																<AvatarImage
																	src={assignee.image ?? undefined}
																	alt={assignee.name}
																/>
																<AvatarFallback className="text-xs bg-muted text-muted-foreground">
																	{assignee.name
																		.split(" ")
																		.map((n) => n[0])
																		.join("")}
																</AvatarFallback>
															</Avatar>
														)
													})}
													<Badge
														variant="outline"
														className={
															task.executionStatus === "done"
																? "bg-green-500/10 text-green-500 border-green-500/20"
																: task.executionStatus === "in-progress"
																	? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
																	: "bg-muted text-muted-foreground"
														}
													>
														{task.executionStatus}
													</Badge>
												</div>
											</div>
										)
									})}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Team Members */}
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-card-foreground flex items-center gap-2">
									<Users className="h-5 w-5" />
									Team Members
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{members.map((member) => (
										<div key={member.id} className="flex items-center gap-3">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={member.image ?? undefined}
													alt={member.name}
												/>
												<AvatarFallback className="bg-muted text-muted-foreground">
													{member.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="font-medium text-card-foreground">
													{member.name}
												</div>
												<div className="text-sm text-muted-foreground">
													{member.role}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card className="bg-card border-border">
							<CardHeader>
								<CardTitle className="text-card-foreground">
									Quick Actions
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									asChild
									variant="outline"
									className="w-full justify-start bg-transparent"
								>
									<Link href={`/projects/${project.id}/board`}>
										<Kanban className="h-4 w-4 mr-2" />
										Open Board
									</Link>
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start bg-transparent"
								>
									<BarChart3 className="h-4 w-4 mr-2" />
									View Reports
								</Button>
								<Button
									asChild
									variant="outline"
									className="w-full justify-start bg-transparent"
								>
									<Link
										href={`/projects/${project.id}/settings`}
										className="flex items-center gap-2"
									>
										<Settings className="h-4 w-4 mr-2" />
										Settings
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
