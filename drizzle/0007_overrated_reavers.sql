CREATE TABLE IF NOT EXISTS "nbc_fcm_tokens" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"fcm_token" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "nbc_fcm_tokens_fcm_token_unique" UNIQUE("fcm_token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fcm_token_user_idx" ON "nbc_fcm_tokens" ("user_id");