// export const listGroups = async (ctx: ProtectedTRPCContext, input: ListGroupsInput) => {
//   return ctx.db.query.groups.findMany({
//     offset: (input.page - 1) * input.perPage,
//     limit: input.perPage,
//     orderBy: (table, { desc }) => desc(table.createdAt),
//   });
// };

import { fcmTokens } from "@/server/db/schema";
import { type ProtectedTRPCContext } from "../../trpc";
import { type AddFCMTokenInput } from "./user.input";
import { generateId } from "lucia";

export const addFCMToken = async (ctx: ProtectedTRPCContext, input: AddFCMTokenInput) => {
  // TODO: Handle unique constraint error for fcmtoken
  const token = await ctx.db.insert(fcmTokens).values({
    id: generateId(15),
    userId: ctx.user.id,
    fcmToken: input.token,
  });
};
