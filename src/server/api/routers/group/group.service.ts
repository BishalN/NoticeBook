import {
  groupInvites,
  groupJoinRequests,
  groupMembers,
  groupPosts,
  groups,
} from "@/server/db/schema";
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
  type CheckIfAlreadyRequestedInput,
  type GetGroupInviteInput,
  type CreateGroupInviteInput,
  type RevalidateInviteInput,
  type GetJoinRequestsInput,
  type GetMembersInput,
  type RejectJoinRequestInput,
  type AcceptJoinRequestInput,
  type PromoteUserInput,
  type RemoveUserInput,
  type LeaveGroupInput,
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
  // TODO: handle error properly e.g username already taken

  await ctx.db.transaction(async (db) => {
    await db.insert(groups).values({
      id,
      username: input.username,
      description: input.description,
    });

    await db.insert(groupMembers).values({
      id,
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
export const searchGroup = async (ctx: ProtectedTRPCContext, input: SearchGroupInput) => {
  // Search the group with username and user should not be the member of the group
  const groupIds = await ctx.db
    .select({ id: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, ctx.user.id));

  // groups already sent request to join should not be shown
  // whose `status` is `pending` or `accepted` in the `groupJoinRequests` table
  // otherwise so even if once rejected
  const requestedGroupIds = await ctx.db
    .select({ groupId: groupJoinRequests.groupId })
    .from(groupJoinRequests)
    .where(
      and(
        eq(groupJoinRequests.userId, ctx.user.id),
        inArray(groupJoinRequests.status, ["pending", "accepted"]),
      ),
    );

  // const requestedGroupIds = await ctx.db
  //   .select({ groupId: groupJoinRequests.groupId })
  //   .from(groupJoinRequests)
  //   .where(eq(groupJoinRequests.userId, ctx.user.id));

  const noShowGroupIds = groupIds
    .map((group) => group.id)
    .concat(requestedGroupIds.map((group) => group.groupId));

  // TODO: make username case insensitive search
  if (noShowGroupIds.length === 0) {
    return ctx.db
      .select()
      .from(groups)
      .where(and(like(groups.username, `%${input.username}%`)));
  } else {
    return ctx.db
      .select()
      .from(groups)
      .where(
        and(like(groups.username, `%${input.username}%`), not(inArray(groups.id, noShowGroupIds))),
      );
  }
};

// TODO: user should be able to send request even after once rejected currently not possible
// due to db constraint probably
export const createJoinGroupRequest = async (ctx: ProtectedTRPCContext, input: JoinGroupInput) => {
  await ctx.db.insert(groupJoinRequests).values({
    id: generateId(15),
    userId: ctx.user.id,
    groupId: input.groupId,
    message: input.message,
  });
};

// check if already requested to join the group
export const checkIfJoinRequested = async (
  ctx: ProtectedTRPCContext,
  input: CheckIfAlreadyRequestedInput,
) => {
  const isRequested = await ctx.db
    .select()
    .from(groupJoinRequests)
    .where(
      and(eq(groupJoinRequests.userId, ctx.user.id), eq(groupJoinRequests.groupId, input.groupId)),
    );

  return isRequested.length > 0;
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

export const getGroupInvite = async (ctx: ProtectedTRPCContext, input: GetGroupInviteInput) => {
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
    throw new Error("You are not allowed to get the invite link");
  }

  const groupInvite = await ctx.db.query.groupInvites.findFirst({
    where: (invite, { eq, and }) =>
      and(eq(invite.groupId, input.groupId), eq(invite.status, "valid")),
  });

  return groupInvite;
};

export const createGroupInvite = async (
  ctx: ProtectedTRPCContext,
  input: CreateGroupInviteInput,
) => {
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
    throw new Error("You are not allowed to get the invite link");
  }

  // check if the invite link already exists for the group which is valid
  const groupInvite = await ctx.db.query.groupInvites.findFirst({
    where: (invite, { eq, and }) =>
      and(eq(invite.groupId, input.groupId), eq(invite.status, "valid")),
  });
  // TODO: handle this may be differently
  if (groupInvite) return groupInvite;

  const inviteLink = generateId(15);
  const invite = await ctx.db
    .insert(groupInvites)
    .values({
      id: inviteLink,
      groupId: input.groupId,
      status: "valid",
    })
    .returning();

  return invite[0];
};

export const revalidateInvite = async (ctx: ProtectedTRPCContext, input: RevalidateInviteInput) => {
  // Check if the user is the admin of the group
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
    throw new Error("You are not allowed to revalidate the invite link");
  }

  // update the old invite link to invalid
  await ctx.db
    .update(groupInvites)
    .set({ status: "invalid" })
    .where(and(eq(groupInvites.groupId, input.groupId), eq(groupInvites.id, input.oldInviteId)));

  // Generate a new invite link
  const inviteLink = generateId(15);
  const newInvite = await ctx.db
    .insert(groupInvites)
    .values({
      id: inviteLink,
      groupId: input.groupId,
      status: "valid",
    })
    .returning();

  return newInvite[0];
};

export const acceptInvite = async (ctx: ProtectedTRPCContext, input: { inviteId: string }) => {
  const invite = await ctx.db.query.groupInvites.findFirst({
    where: (table, { eq, and }) => and(eq(table.id, input.inviteId), eq(table.status, "valid")),
  });

  if (!invite) {
    return {
      message: "Invalid invite link",
    };
  }

  // check if the user is already part of the group
  // also need to add and check not just userId but groupId as well
  const isMember = await ctx.db.query.groupMembers.findFirst({
    where: (table, { eq, and }) =>
      and(eq(table.userId, ctx.user.id), eq(table.groupId, invite.groupId)),
  });

  if (isMember) {
    return {
      message: "You are already part of the group",
      group: await ctx.db.query.groups.findFirst({
        where: (table, { eq }) => eq(table.id, invite.groupId),
      }),
    };
  }

  await ctx.db.insert(groupMembers).values({
    id: generateId(15),
    userId: ctx.user.id,
    groupId: invite.groupId,
    role: "member",
  });

  return {
    message: "You have successfully joined the group",
    group: await ctx.db.query.groups.findFirst({
      where: (table, { eq }) => eq(table.id, invite.groupId),
    }),
  };
};

export const getJoinRequests = async (ctx: ProtectedTRPCContext, input: GetJoinRequestsInput) => {
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
    throw new Error("You are not allowed to get the join requests");
  }

  return ctx.db.query.groupJoinRequests.findMany({
    where: (table, { eq, and }) =>
      and(eq(table.groupId, input.groupId), eq(table.status, "pending")),
    with: { user: { columns: { avatar: true, email: true } } },
  });
};

export const rejectJoinRequest = async (
  ctx: ProtectedTRPCContext,
  input: RejectJoinRequestInput,
) => {
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
    throw new Error("You are not allowed to update the join request");
  }

  await ctx.db
    .update(groupJoinRequests)
    .set({ status: "rejected" })
    .where(eq(groupJoinRequests.id, input.requestId));
};

export const acceptJoinRequest = async (
  ctx: ProtectedTRPCContext,
  input: AcceptJoinRequestInput,
) => {
  // TODO: use a middleware to check if the user is the admin of the group
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
    throw new Error("You are not allowed to update the join request");
  }

  await ctx.db
    .update(groupJoinRequests)
    .set({ status: "accepted" })
    .where(eq(groupJoinRequests.id, input.requestId));

  await ctx.db.insert(groupMembers).values({
    id: generateId(15),
    userId: input.userId,
    groupId: input.groupId,
    role: "member",
  });
};

export const getMembers = async (ctx: ProtectedTRPCContext, input: GetMembersInput) => {
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
    throw new Error("You are not allowed to get the members");
  }

  return ctx.db.query.groupMembers.findMany({
    where: (table, { eq }) => eq(table.groupId, input.groupId),
    with: { user: { columns: { avatar: true, email: true } } },
  });
};

export const promoteUser = async (ctx: ProtectedTRPCContext, input: PromoteUserInput) => {
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
    throw new Error("You are not allowed to promote the member");
  }

  // TODO: may be check if the user is the member of the group first\
  // or just try and catch the error and return a message
  // Similar pattern needs to be followed in other functions
  // don't just consider the happy path handle all possible cases

  await ctx.db
    .update(groupMembers)
    .set({ role: "admin" })
    .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, input.userId)));
};

export const removeUser = async (ctx: ProtectedTRPCContext, input: RemoveUserInput) => {
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
    throw new Error("You are not allowed to remove the member");
  }

  await ctx.db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, input.userId)));
};

export const leaveGroup = async (ctx: ProtectedTRPCContext, input: LeaveGroupInput) => {
  // TODO: similar check if the member of the group or just let it fail and catch the error
  await ctx.db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.user.id)));
};
