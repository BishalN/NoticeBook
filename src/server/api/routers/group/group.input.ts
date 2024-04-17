import { title } from "process";
import { z } from "zod";

export const createGroupSchema = z.object({
  username: z.string().min(3).max(50),
  description: z.string().min(3).max(255),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = createGroupSchema.extend({
  id: z.string(),
});
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export const deleteGroupSchema = z.object({
  id: z.string(),
});
export type DeleteGroupInput = z.infer<typeof deleteGroupSchema>;

export const searchGroupSchema = z.object({
  username: z.string(),
});
export type SearchGroupInput = z.infer<typeof searchGroupSchema>;

export const getGroupByUsernameSchema = z.object({
  username: z.string(),
});
export type GetGroupByUsernameInput = z.infer<typeof getGroupByUsernameSchema>;

export const joinGroupSchema = z.object({
  groupId: z.string(),
  message: z.string().optional(),
});
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;

export const checkIfAlreadyRequestedSchema = z.object({
  groupId: z.string(),
});
export type CheckIfAlreadyRequestedInput = z.infer<typeof checkIfAlreadyRequestedSchema>;

export const listGroupsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type ListGroupsInput = z.infer<typeof listGroupsSchema>;

export const getGroupSchema = z.object({
  id: z.string(),
});
export type GetGroupInput = z.infer<typeof getGroupSchema>;

// creategrouppostinput

export const createGroupPostSchema = z.object({
  groupId: z.string(),
  title: z.string().min(3).max(255),
  content: z.string().min(3),
  excerpt: z.string().min(3).max(255),
});
export type CreateGroupPostInput = z.infer<typeof createGroupPostSchema>;

export const updateGroupPostSchema = createGroupPostSchema.extend({
  id: z.string(),
  titlle: z.string().min(3).max(255).optional(),
  content: z.string().min(3).optional(),
  excerpt: z.string().min(3).max(255).optional(),
});
export type UpdateGroupPostInput = z.infer<typeof updateGroupPostSchema>;

export const deleteGroupPostSchema = z.object({
  postId: z.string(),
  groupId: z.string(),
});
export type DeleteGroupPostInput = z.infer<typeof deleteGroupPostSchema>;

export const searchGroupPostSchema = z.object({
  groupId: z.string(),
  title: z.string(),
});
export type SearchGroupPostInput = z.infer<typeof searchGroupPostSchema>;

export const listGroupPostSchema = z.object({
  groupId: z.string(),
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type ListGroupPostInput = z.infer<typeof listGroupPostSchema>;

export const getGroupPostSchema = z.object({
  postId: z.string(),
  groupId: z.string(),
});
export type GetGroupPostInput = z.infer<typeof getGroupPostSchema>;

export const revalidateInviteSchema = z.object({
  groupId: z.string(),
  oldInviteId: z.string(),
});
export type RevalidateInviteInput = z.infer<typeof revalidateInviteSchema>;

export const getGroupInviteSchema = z.object({
  groupId: z.string(),
});
export type GetGroupInviteInput = z.infer<typeof getGroupInviteSchema>;

export const createGroupInviteSchema = z.object({
  groupId: z.string(),
});
export type CreateGroupInviteInput = z.infer<typeof createGroupInviteSchema>;

export const acceptInviteSchema = z.object({
  inviteId: z.string(),
});
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const getJoinRequestsSchema = z.object({
  groupId: z.string(),
});
export type GetJoinRequestsInput = z.infer<typeof getJoinRequestsSchema>;

export const rejectJoinRequestSchema = z.object({
  requestId: z.string(),
  groupId: z.string(),
});
export type RejectJoinRequestInput = z.infer<typeof rejectJoinRequestSchema>;

export const acceptJoinRequestSchema = z.object({
  requestId: z.string(),
  groupId: z.string(),
  userId: z.string(),
});
export type AcceptJoinRequestInput = z.infer<typeof acceptJoinRequestSchema>;

export const getMembersSchema = z.object({
  groupId: z.string(),
  query: z.string().optional(),
});
export type GetMembersInput = z.infer<typeof getMembersSchema>;

export const updateMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(["admin", "member"]),
});
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const promoteUserSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
});
export type PromoteUserInput = z.infer<typeof promoteUserSchema>;

export const removeUserSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
});
export type RemoveUserInput = z.infer<typeof removeUserSchema>;

export const leaveGroupSchema = z.object({
  groupId: z.string(),
});
export type LeaveGroupInput = z.infer<typeof leaveGroupSchema>;

export const defaultPaginationSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type DefaultPaginationInput = z.infer<typeof defaultPaginationSchema>;

// rather than throwing error during parsing
// we can

// accept string and convert to number

export const defaultPaginationSchemaWithStrings = z.object({
  page: z.string().transform(Number).default("1"),
  perPage: z.string().transform(Number).default("12"),
});
export type DefaultPaginationInputWithStrings = z.infer<typeof defaultPaginationSchemaWithStrings>;

// if transform fails then just use default value dont throw error
// without using safeparse

export const groupAdminTabsSchema = z.object({
  tab: z.enum(["invite", "manage"]),
  query: z.string().optional(),
});
export type GroupAdminTabsInput = z.infer<typeof groupAdminTabsSchema>;
