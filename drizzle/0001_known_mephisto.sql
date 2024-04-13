CREATE TABLE IF NOT EXISTS "noticebook_group_join_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"message" text,
	"status" varchar(10) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_join_request_user_idx" ON "noticebook_group_join_requests" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_join_request_group_idx" ON "noticebook_group_join_requests" ("group_id");