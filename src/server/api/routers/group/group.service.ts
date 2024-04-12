import { groups } from "@/server/db/schema";
import { type ProtectedTRPCContext } from "../../trpc";
import { type CreateGroupInput, type ListGroupsInput } from "./group.input";
import { generateId } from "lucia";

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
  // create a group and then associate the user with the group and make them the admin
  // we're using drizzle orm here
};
