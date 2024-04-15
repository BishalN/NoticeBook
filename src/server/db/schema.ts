import { relations } from "drizzle-orm";
import {
  pgTableCreator,
  boolean,
  index,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// TODO: add username field as well or just name field
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    id: uuid("id").defaultRandom().primaryKey(),
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
    id: uuid("id").defaultRandom().primaryKey(),
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
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("password_token_user_idx").on(t.userId),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
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
    userIdx: index("post_user_idx").on(t.userId),
    createdAtIdx: index("post_created_at_idx").on(t.createdAt),
  }),
);

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    id: uuid("id").defaultRandom().primaryKey(),

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
// first search the name of the group and send the join request to the group
// on the backend side, how to handle the join request ?
// may be create a new table for the join request and then the admin can accept or reject the request
// TODO: use the similar type of data for the primary key

export const groupJoinRequests = pgTable(
  "group_join_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),

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
    // there can be only one request from one user to join a group at a time
    // so we can create a unique index on userId and groupId
    // TODO: create a unique index on userId and groupId

    userGroupIdx: uniqueIndex("group_join_request_user_group_idx").on(t.userId, t.groupId),
  }),
);

export const groupPosts = pgTable(
  "group_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

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
