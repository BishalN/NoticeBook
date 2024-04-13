import { groupJoinRequests, groupMembers, groups } from "@/server/db/schema";
import { type ProtectedTRPCContext } from "../../trpc";
import {
  type JoinGroupInput,
  type CreateGroupInput,
  type ListGroupsInput,
  type SearchGroupInput,
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
