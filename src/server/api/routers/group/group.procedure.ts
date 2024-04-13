import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./group.input";
import * as services from "./group.service";

export const groupRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listGroupsSchema)
    .query(({ ctx, input }) => services.listGroups(ctx, input)),

  myGroups: protectedProcedure.query(({ ctx }) => services.myGroups(ctx)),

  create: protectedProcedure
    .input(inputs.createGroupSchema)
    .mutation(({ ctx, input }) => services.createGroup(ctx, input)),

  search: protectedProcedure
    .input(inputs.searchGroupSchema)
    .query(({ ctx, input }) => services.searchGroup(ctx, input)),

  createJoinRequest: protectedProcedure
    .input(inputs.joinGroupSchema)
    .mutation(({ ctx, input }) => services.createJoinGroupRequest(ctx, input)),
});
