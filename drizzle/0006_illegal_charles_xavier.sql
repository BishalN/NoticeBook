CREATE TABLE IF NOT EXISTS "nbc_group_invites" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"group_id" varchar(21) NOT NULL,
	"status" varchar(10) DEFAULT 'valid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_invite_group_id_idx" ON "nbc_group_invites" ("group_id");