CREATE TABLE IF NOT EXISTS "nbc_email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "nbc_email_verification_codes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_group_join_requests" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"message" text,
	"status" varchar(10) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_group_members" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"role" varchar(10) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_group_posts" (
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
CREATE TABLE IF NOT EXISTS "nbc_groups" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "nbc_groups_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_password_reset_tokens" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nbc_users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"discord_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"hashed_password" varchar(255),
	"avatar" varchar(255),
	"stripe_subscription_id" varchar(191),
	"stripe_price_id" varchar(191),
	"stripe_customer_id" varchar(191),
	"stripe_current_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "nbc_users_discord_id_unique" UNIQUE("discord_id"),
	CONSTRAINT "nbc_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "nb_email_verification_codes";--> statement-breakpoint
DROP TABLE "nb_group_join_requests";--> statement-breakpoint
DROP TABLE "nb_group_members";--> statement-breakpoint
DROP TABLE "nb_group_posts";--> statement-breakpoint
DROP TABLE "nb_groups";--> statement-breakpoint
DROP TABLE "nb_password_reset_tokens";--> statement-breakpoint
DROP TABLE "nb_sessions";--> statement-breakpoint
DROP TABLE "nb_users";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_code_user_idx" ON "nbc_email_verification_codes" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_code_email_idx" ON "nbc_email_verification_codes" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_join_request_user_idx" ON "nbc_group_join_requests" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_join_request_group_idx" ON "nbc_group_join_requests" ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "group_join_request_user_group_idx" ON "nbc_group_join_requests" ("user_id","group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_member_user_idx" ON "nbc_group_members" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_member_group_idx" ON "nbc_group_members" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_post_group_id_idx" ON "nbc_group_posts" ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_post_created_at_idx" ON "nbc_group_posts" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_username_idx" ON "nbc_groups" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_token_user_idx" ON "nbc_password_reset_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_idx" ON "nbc_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "nbc_users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_discord_idx" ON "nbc_users" ("discord_id");