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
import { and, eq, inArray, ilike, not, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getMessaging } from "firebase/messaging";
import { firebase_admin } from "../firebase-admin";

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
  //TODO:  Pattern Ask for permission or forgiveness delima here
  // Use ask for forgiveness pattern rather than permission here

  const group = await ctx.db.query.groups.findFirst({
    where: (table, { eq }) => eq(table.username, input.username),
  });

  if (group) {
    throw new TRPCError({ message: "Username already taken", code: "CONFLICT", cause: "username" });
  }

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

export const getGroupByUsername = async (
  ctx: ProtectedTRPCContext,
  input: GetGroupByUsernameInput,
) => {
  return ctx.db.query.groups.findFirst({
    where: (table, { eq }) => eq(table.username, input.username),
  });
};

export const searchGroup = async (ctx: ProtectedTRPCContext, input: SearchGroupInput) => {
  const groupIds = await ctx.db
    .select({ id: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, ctx.user.id));

  const requestedGroupIds = await ctx.db
    .select({ groupId: groupJoinRequests.groupId })
    .from(groupJoinRequests)
    .where(
      and(
        eq(groupJoinRequests.userId, ctx.user.id),
        inArray(groupJoinRequests.status, ["pending", "accepted"]),
      ),
    );

  const noShowGroupIds = groupIds
    .map((group) => group.id)
    .concat(requestedGroupIds.map((group) => group.groupId));

  if (noShowGroupIds.length === 0) {
    return ctx.db
      .select()
      .from(groups)
      .where(and(ilike(groups.username, `%${input.username}%`)));
  } else {
    return ctx.db
      .select()
      .from(groups)
      .where(
        and(ilike(groups.username, `%${input.username}%`), not(inArray(groups.id, noShowGroupIds))),
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

export const createGroupPost = async (ctx: ProtectedTRPCContext, input: CreateGroupPostInput) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  const id = generateId(15);
  await ctx.db.insert(groupPosts).values({
    id,
    groupId: input.groupId,
    title: input.title,
    content: input.content,
    excerpt: input.excerpt,
    userId: ctx.user.id,
  });

  // TODO: send notification to all users in the group
  // Do this may be in a worker or a separate service
  // or in a cron job
  // const relatedTokens =
  // find all the tokens of the users in the group
  // send notification to all the tokens
  const relatedUserIds = await ctx.db.query.groupMembers.findMany({
    where: (table, { eq }) => eq(table.groupId, input.groupId),
    with: { user: { columns: { id: true } } },
  });

  const relatedTokens = await ctx.db.query.fcmTokens.findMany({
    where: (table, { inArray }) =>
      inArray(
        table.userId,
        relatedUserIds.map((user) => user.user.id),
      ),
  });

  const message = {
    title: input.title,
    excerpt: input.excerpt,
    postId: id,
    groupId: input.groupId,
  };

  void firebase_admin
    .messaging()
    .sendEachForMulticast({
      tokens: relatedTokens.map((token) => token.fcmToken),
      webpush: {
        notification: {
          title: input.title,
          body: input.excerpt,
        },
      },
      data: message,
      notification: {
        title: input.title,
      },
    })
    .then((res) => {
      console.log("Notification sent", res);
    });
};

export const listGroupPosts = async (ctx: ProtectedTRPCContext, input: ListGroupPostInput) => {
  const isMember = await ctx.db.query.groupMembers.findFirst({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
  });

  if (!isMember) {
    throw new TRPCError({
      message: "Unauthorized to view the posts of this group",
      code: "UNAUTHORIZED",
    });
  }

  const numOfPosts = await ctx.db
    .select({
      postsCount: count(),
    })
    .from(groupPosts)
    .where(eq(groupPosts.groupId, input.groupId));

  console.log(numOfPosts[0]?.postsCount, "post counts");

  const ITEMS_PER_PAGE = 6;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  const totalPages = Math.ceil(numOfPosts[0]?.postsCount / ITEMS_PER_PAGE);

  console.log(totalPages, "total pages");

  const data = await ctx.db.query.groupPosts.findMany({
    where: (table, { eq }) => eq(table.groupId, input.groupId),
    offset: (input.page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    orderBy: (table, { desc }) => desc(table.createdAt),
    with: { user: { columns: { avatar: true, email: true, username: true } } },
  });

  return {
    data,
    totalPages,
  };
};

export const getGroupPost = async (ctx: ProtectedTRPCContext, input: GetGroupPostInput) => {
  const isMember = await ctx.db.query.groupMembers.findFirst({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
  });

  if (!isMember) {
    throw new TRPCError({
      message: "Unauthorized to view the post of a group that you're not part of",
      code: "UNAUTHORIZED",
    });
  }

  return ctx.db.query.groupPosts.findFirst({
    where: (table, { eq }) => eq(table.id, input.postId),
    with: { user: { columns: { avatar: true, email: true } } },
  });
};

export const updateGroupPost = async (ctx: ProtectedTRPCContext, input: UpdateGroupPostInput) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);
  await ctx.db.update(groupPosts).set(input).where(eq(groupPosts.id, input.id));
};

export const deleteGroupPost = async (ctx: ProtectedTRPCContext, input: DeleteGroupPostInput) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  await ctx.db.delete(groupPosts).where(eq(groupPosts.id, input.postId));
};

export const getGroupInvite = async (ctx: ProtectedTRPCContext, input: GetGroupInviteInput) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  const groupInvite = await ctx.db.query.groupInvites.findFirst({
    where: (invite, { eq, and }) =>
      and(eq(invite.groupId, input.groupId), eq(invite.status, "valid")),
  });
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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  await ctx.db
    .update(groupInvites)
    .set({ status: "invalid" })
    .where(and(eq(groupInvites.groupId, input.groupId), eq(groupInvites.id, input.oldInviteId)));

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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  await ctx.db
    .update(groupJoinRequests)
    .set({ status: "rejected" })
    .where(eq(groupJoinRequests.id, input.requestId));
};

export const acceptJoinRequest = async (
  ctx: ProtectedTRPCContext,
  input: AcceptJoinRequestInput,
) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

  return ctx.db.query.groupMembers.findMany({
    where: (table, { eq, and }) => and(eq(table.groupId, input.groupId)),
    with: { user: { columns: { avatar: true, email: true } } },
  });
};

export const promoteUser = async (ctx: ProtectedTRPCContext, input: PromoteUserInput) => {
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

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
  await checkIfUserIsAdminOfGroup(ctx, input.groupId);

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

const checkIfUserIsAdminOfGroup = async (ctx: ProtectedTRPCContext, groupId: string) => {
  const isAdmin = await ctx.db
    .select()
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, ctx.user.id),
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.role, "admin"),
      ),
    );

  if (isAdmin.length === 0) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};
