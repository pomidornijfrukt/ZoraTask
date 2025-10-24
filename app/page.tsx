import { ArrowRight, CheckCircle, Kanban, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
						Streamline Your Projects with{" "}
						<span className="text-primary">Agile Workflows</span>
					</h1>
					<p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
						Zora empowers teams to manage projects efficiently with intuitive
						kanban boards, real-time collaboration, and powerful agile tools
						designed for modern workflows.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild={true} className="text-lg px-8">
							<Link href="/projects">
								Get Started
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-foreground mb-4">
						Everything You Need for Agile Project Management
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Built for teams who value efficiency, collaboration, and results.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					<Card className="bg-card border-border">
						<CardHeader>
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Kanban className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-card-foreground">
								Kanban Boards
							</CardTitle>
							<CardDescription>
								Visualize your workflow with drag-and-drop kanban boards that
								make task management intuitive.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="bg-card border-border">
						<CardHeader>
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Users className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-card-foreground">
								Team Collaboration
							</CardTitle>
							<CardDescription>
								Work together seamlessly with real-time updates, comments, and
								team member assignments.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="bg-card border-border">
						<CardHeader>
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<CheckCircle className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-card-foreground">
								Task Management
							</CardTitle>
							<CardDescription>
								Create, assign, and track tasks with priorities, due dates, and
								detailed descriptions.
							</CardDescription>
						</CardHeader>
					</Card>

				</div>
			</section>

			{/* Stats Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="bg-card rounded-2xl p-12 border border-border">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-card-foreground mb-4">
							Trusted by Teams
						</h2>
						<p className="text-lg text-muted-foreground">
							Join teams already using Zora to deliver better projects faster.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 text-center">
						<div>
							<div className="text-4xl font-bold text-primary mb-2">10+</div>
							<div className="text-muted-foreground">Active Projects</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-primary mb-2">50+</div>
							<div className="text-muted-foreground">Tasks Completed</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-primary mb-2">99.9%</div>
							<div className="text-muted-foreground">Downtime</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-20">
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="text-4xl font-bold text-foreground mb-6 text-balance">
						Ready to Transform Your Project Management?
					</h2>
					<p className="text-xl text-muted-foreground mb-8 text-pretty">
						Start organizing your projects with Zora today and experience the
						power of agile workflows.
					</p>
					<Button size="lg" asChild={true} className="text-lg px-8">
						<Link href="/projects">
							Start Your First Project
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					</Button>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border bg-card">
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Kanban className="h-6 w-6 text-primary" />
							<span className="text-lg font-semibold text-card-foreground">
								Zora
							</span>
						</div>
						<p className="text-sm text-muted-foreground">
							© 2025 Zora. Built for modern project management.
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}
