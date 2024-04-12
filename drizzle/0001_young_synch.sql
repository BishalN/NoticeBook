CREATE TABLE IF NOT EXISTS "acme_group_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acme_group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acme_group_posts" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(10) DEFAULT 'draft' NOT NULL,
	"tags" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acme_groups" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "acme_groups_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_admin_user_idx" ON "acme_group_admins" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_admin_group_idx" ON "acme_group_admins" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_member_user_idx" ON "acme_group_members" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_member_group_idx" ON "acme_group_members" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_post_group_id_idx" ON "acme_group_posts" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_post_created_at_idx" ON "acme_group_posts" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_username_idx" ON "acme_groups" ("username");