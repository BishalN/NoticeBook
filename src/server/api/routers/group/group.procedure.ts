import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./group.input";
import * as services from "./group.service";

export const groupRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listGroupsSchema)
    .query(({ ctx, input }) => services.listGroups(ctx, input)),

  myGroups: protectedProcedure.query(({ ctx }) => services.myGroups(ctx)),

  getByUsername: protectedProcedure
    .input(inputs.getGroupByUsernameSchema)
    .query(({ ctx, input }) => services.getGroupByUsername(ctx, input)),

  create: protectedProcedure
    .input(inputs.createGroupSchema)
    .mutation(({ ctx, input }) => services.createGroup(ctx, input)),

  search: protectedProcedure
    .input(inputs.searchGroupSchema)
    .query(({ ctx, input }) => services.searchGroup(ctx, input)),

  createJoinRequest: protectedProcedure
    .input(inputs.joinGroupSchema)
    .mutation(({ ctx, input }) => services.createJoinGroupRequest(ctx, input)),

  // checkIfAlreadyRequested
  checkIfJoinRequested: protectedProcedure
    .input(inputs.checkIfAlreadyRequestedSchema)
    .query(({ ctx, input }) => services.checkIfJoinRequested(ctx, input)),

  createGroupPost: protectedProcedure
    .input(inputs.createGroupPostSchema)
    .mutation(({ ctx, input }) => services.createGroupPost(ctx, input)),

  updateGroupPost: protectedProcedure
    .input(inputs.updateGroupPostSchema)
    .mutation(({ ctx, input }) => services.updateGroupPost(ctx, input)),

  deleteGroupPost: protectedProcedure
    .input(inputs.deleteGroupPostSchema)
    .mutation(({ ctx, input }) => services.deleteGroupPost(ctx, input)),

  listPosts: protectedProcedure
    .input(inputs.listGroupPostSchema)
    .query(({ ctx, input }) => services.listGroupPosts(ctx, input)),

  getPost: protectedProcedure
    .input(inputs.getGroupPostSchema)
    .query(({ ctx, input }) => services.getGroupPost(ctx, input)),
});
