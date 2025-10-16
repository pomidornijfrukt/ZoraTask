ALTER TABLE "categories" ADD COLUMN "order" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "order" text DEFAULT '0' NOT NULL;