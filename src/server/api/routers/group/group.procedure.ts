import { groupMembers } from "@/server/db/schema";
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

  getJoinRequests: protectedProcedure
    .input(inputs.getJoinRequestsSchema)
    .query(({ ctx, input }) => services.getJoinRequests(ctx, input)),

  acceptJoinRequest: protectedProcedure
    .input(inputs.acceptJoinRequestSchema)
    .mutation(({ ctx, input }) => services.acceptJoinRequest(ctx, input)),

  rejectJoinRequest: protectedProcedure
    .input(inputs.rejectJoinRequestSchema)
    .mutation(({ ctx, input }) => services.rejectJoinRequest(ctx, input)),

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

  createInvite: protectedProcedure
    .input(inputs.createGroupInviteSchema)
    .mutation(({ ctx, input }) => services.createGroupInvite(ctx, input)),

  getInvite: protectedProcedure
    .input(inputs.getGroupInviteSchema)
    .query(({ ctx, input }) => services.getGroupInvite(ctx, input)),

  revalidateInvite: protectedProcedure
    .input(inputs.revalidateInviteSchema)
    .mutation(({ ctx, input }) => services.revalidateInvite(ctx, input)),

  acceptInvite: protectedProcedure
    .input(inputs.acceptInviteSchema)
    .mutation(({ ctx, input }) => services.acceptInvite(ctx, input)),

  getMembers: protectedProcedure
    .input(inputs.getMembersSchema)
    .query(({ ctx, input }) => services.getMembers(ctx, input)),

  // TODO: add a demote user who to turn admins to user which only the superadmin can do
  promoteUser: protectedProcedure
    .input(inputs.promoteUserSchema)
    .mutation(({ ctx, input }) => services.promoteUser(ctx, input)),

  removeUser: protectedProcedure
    .input(inputs.removeUserSchema)
    .mutation(({ ctx, input }) => services.removeUser(ctx, input)),

  leaveGroup: protectedProcedure
    .input(inputs.leaveGroupSchema)
    .mutation(({ ctx, input }) => services.leaveGroup(ctx, input)),
});
