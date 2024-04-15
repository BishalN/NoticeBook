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

export const leaveGroupSchema = z.object({
  groupId: z.string(),
});
export type LeaveGroupInput = z.infer<typeof leaveGroupSchema>;

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
