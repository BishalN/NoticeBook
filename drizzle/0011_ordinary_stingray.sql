ALTER TABLE "yb_users" ADD COLUMN "google_id" varchar(255);--> statement-breakpoint
ALTER TABLE "yb_users" ADD CONSTRAINT "yb_users_google_id_unique" UNIQUE("google_id");