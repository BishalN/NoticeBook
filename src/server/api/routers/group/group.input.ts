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

export const joinGroupSchema = z.object({
  groupId: z.string(),
});
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;

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
