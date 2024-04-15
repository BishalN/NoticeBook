import { groupJoinRequests, groupMembers, groupPosts, groups } from "@/server/db/schema";
import { type ProtectedTRPCContext } from "../../trpc";
import {
  type JoinGroupInput,
  type CreateGroupInput,
  type ListGroupsInput,
  type SearchGroupInput,
  type CreateGroupPostInput,
  type UpdateGroupPostInput,
  type DeleteGroupPostInput,
  type ListGroupPostInput,
  type GetGroupPostInput,
  type GetGroupByUsernameInput,
} from "./group.input";
import { generateId } from "lucia";
import { and, eq, inArray, like, not } from "drizzle-orm";

export const listGroups = async (ctx: ProtectedTRPCContext, input: ListGroupsInput) => {
  return ctx.db.query.groups.findMany({
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
  });
};

export const myGroups = async (ctx: ProtectedTRPCContext) => {
  return ctx.db.query.groupMembers.findMany({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
    with: { group: { columns: { id: true, username: true, description: true, avatar: true } } },
  });
};

export const createGroup = async (ctx: ProtectedTRPCContext, input: CreateGroupInput) => {
  const id = generateId(15);
  await ctx.db.transaction(async (db) => {
    await db.insert(groups).values({
      id,
      username: input.username,
      description: input.description,
    });

    await db.insert(groupMembers).values({
      userId: ctx.user.id,
      groupId: id,
      role: "admin",
    });
  });
};

// getbyusername
export const getGroupByUsername = async (
  ctx: ProtectedTRPCContext,
  input: GetGroupByUsernameInput,
) => {
  return ctx.db.query.groups.findFirst({
    where: (table, { eq }) => eq(table.username, input.username),
  });
};

// Search the group of which the user is not part of
//TODO: Also avoid showing the group already sent request to join
export const searchGroup = async (ctx: ProtectedTRPCContext, input: SearchGroupInput) => {
  // Search the group with username and user should not be the member of the group
  const groupIds = await ctx.db
    .select({ id: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, ctx.user.id));

  const data = await ctx.db
    .select()
    .from(groups)
    .where(
      and(
        like(groups.username, `%${input.username}%`),
        not(
          inArray(
            groups.id,
            groupIds.map((group) => group.id),
          ),
        ),
      ),
    );

  return data;
};

export const createJoinGroupRequest = async (ctx: ProtectedTRPCContext, input: JoinGroupInput) => {
  await ctx.db.insert(groupJoinRequests).values({
    userId: ctx.user.id,
    groupId: input.groupId,
    message: input.message,
  });
};

// createGroupPost
export const createGroupPost = async (ctx: ProtectedTRPCContext, input: CreateGroupPostInput) => {
  const id = generateId(15);

  const isAdmin = await ctx.db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, ctx.user.id),
        eq(groupMembers.groupId, input.groupId),
        eq(groupMembers.role, "admin"),
      ),
    );

  if (isAdmin.length === 0) {
    throw new Error("You are not allowed to create a post in this group");
  }

  await ctx.db.insert(groupPosts).values({
    id,
    groupId: input.groupId,
    title: input.title,
    content: input.content,
    excerpt: input.excerpt,
    userId: ctx.user.id,
  });
};

// listGroupPosts
export const listGroupPosts = async (ctx: ProtectedTRPCContext, input: ListGroupPostInput) => {
  const isMember = await ctx.db.query.groupMembers.findFirst({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
  });

  if (!isMember) {
    throw new Error("Unauthorized to view the posts of this group");
  }

  console.log(`groupId is ${input.groupId}`);

  // expand the userId to get the user details
  // use the with option to get the user details
  return ctx.db.query.groupPosts.findMany({
    where: (table, { eq }) => eq(table.groupId, input.groupId),
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    with: { user: { columns: { avatar: true, email: true } } },
  });
};

// getGroupPost
export const getGroupPost = async (ctx: ProtectedTRPCContext, input: GetGroupPostInput) => {
  const isMember = await ctx.db.query.groupMembers.findFirst({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
  });

  if (!isMember) {
    throw new Error("Unauthorized to view the post of a group that you're not part of");
  }

  return ctx.db.query.groupPosts.findFirst({
    where: (table, { eq }) => eq(table.id, input.postId),
  });
};

// updateGroupPost
export const updateGroupPost = async (ctx: ProtectedTRPCContext, input: UpdateGroupPostInput) => {
  const isAdmin = await ctx.db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, ctx.user.id),
        eq(groupMembers.groupId, input.groupId),
        eq(groupMembers.role, "admin"),
      ),
    );

  // TODO: also check if the post is created by the current user
  if (isAdmin.length === 0) {
    throw new Error("You are not allowed to update a post in this group");
  }
  await ctx.db.update(groupPosts).set(input).where(eq(groupPosts.id, input.id));
};

// deleteGroupPost
export const deleteGroupPost = async (ctx: ProtectedTRPCContext, input: DeleteGroupPostInput) => {
  const isAdmin = await ctx.db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, ctx.user.id),
        eq(groupMembers.groupId, input.groupId),
        eq(groupMembers.role, "admin"),
      ),
    );

  if (isAdmin.length === 0) {
    throw new Error("You are not allowed to delete a post in this group");
  }

  await ctx.db.delete(groupPosts).where(eq(groupPosts.id, input.postId));
};
