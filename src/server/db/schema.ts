import { relations } from "drizzle-orm";
import {
  pgTableCreator,
  boolean,
  index,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// TODO: add username field as well or just name field
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    discordId: varchar("discord_id", { length: 255 }).unique(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 191 }),
    stripePriceId: varchar("stripe_price_id", { length: 191 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 191 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
    discordIdx: index("user_discord_idx").on(t.discordId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 21 }).unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("verification_code_user_idx").on(t.userId),
    emailIdx: index("verification_code_email_idx").on(t.email),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("password_token_user_idx").on(t.userId),
  }),
);

export const groups = pgTable(
  "groups",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 255 }).notNull(),
    avatar: varchar("avatar", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    usernameIdx: index("group_username_idx").on(t.username),
  }),
);

export type Group = typeof groups.$inferSelect;

export const groupMembers = pgTable(
  "group_members",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    groupId: varchar("group_id", { length: 21 }).notNull(),
    role: varchar("role", { length: 10, enum: ["member", "admin"] })
      .default("member")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdx: index("group_member_user_idx").on(t.userId),
    groupIdx: index("group_member_group_idx").on(t.groupId),
  }),
);

// groupMember relations with groups and users table
// One user can be part of many groups
// One group can have many users
export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export type GroupMember = typeof groupMembers.$inferSelect;

export const groupJoinRequests = pgTable(
  "group_join_requests",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    groupId: varchar("group_id", { length: 21 }).notNull(),
    message: text("message"),
    status: varchar("status", { length: 10, enum: ["pending", "accepted", "rejected"] })
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdx: index("group_join_request_user_idx").on(t.userId),
    groupIdx: index("group_join_request_group_idx").on(t.groupId),
    // TODO: remove this index in the light of users can send request even after being rejected
    userGroupIdx: uniqueIndex("group_join_request_user_group_idx").on(t.userId, t.groupId),
  }),
);

// groupJoinRequest relations with groups and users table
// One user can request to join many groups
// One group can have many join requests
export const groupJoinRequestRelations = relations(groupJoinRequests, ({ one }) => ({
  user: one(users, {
    fields: [groupJoinRequests.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupJoinRequests.groupId],
    references: [groups.id],
  }),
}));

export const groupPosts = pgTable(
  "group_posts",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    groupId: varchar("group_id", { length: 21 }).notNull(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: varchar("excerpt", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: varchar("status", { length: 10, enum: ["draft", "published"] })
      .default("draft")
      .notNull(),
    tags: varchar("tags", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    groupIdIdx: index("group_post_group_id_idx").on(t.groupId),
    createdAtIdx: index("group_post_created_at_idx").on(t.createdAt),
  }),
);

// groupPost relations with groups and users table
// One user can create many posts
// One group can have many posts
export const groupPostRelations = relations(groupPosts, ({ one }) => ({
  user: one(users, {
    fields: [groupPosts.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupPosts.groupId],
    references: [groups.id],
  }),
}));

export type GroupPost = typeof groupPosts.$inferSelect;

export const groupInvites = pgTable(
  "group_invites",
  {
    id: varchar("id", { length: 15 }).primaryKey(),
    groupId: varchar("group_id", { length: 21 }).notNull(),
    status: varchar("status", { length: 10, enum: ["valid", "invalid"] })
      .default("valid")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    groupIdIdx: index("group_invite_group_id_idx").on(t.groupId),
    // there will be a single row with valid status and group id
    // no two invite links can be valid for the same group at a time
  }),
);

export type GroupInvite = typeof groupInvites.$inferSelect;

export const groupInviteRelations = relations(groupInvites, ({ one }) => ({
  group: one(groups, {
    fields: [groupInvites.groupId],
    references: [groups.id],
  }),
}));
