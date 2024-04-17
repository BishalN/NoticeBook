ALTER TABLE "nbc_users" ADD COLUMN "username" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "nbc_users" ADD CONSTRAINT "nbc_users_username_unique" UNIQUE("username");