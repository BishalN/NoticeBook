"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { CopyToClipboard } from "@/app/(landing)/_components/copy-to-clipboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { PencilIcon, ReplaceIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmUserPromotion } from "./confirm-promote-user-alert-dialog";
import { RemoveUserAlertDialog } from "./remove-user-alert-dialog";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Search from "./search";

dayjs.extend(relativeTime);

interface InviteAndManageUsersTabs {
  group: {
    avatar: string | null;
    username: string;
    description: string;
    id: string;
  };
  tab: "invite" | "manage";
}

// TODO: Add search functionality for user management
export function InviteAndManageUsersTabs({ group, tab }: InviteAndManageUsersTabs) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const utils = api.useContext();
  const { data: inviteData, isLoading: inviteDataLoading } = api.group.getInvite.useQuery(
    {
      groupId: group.id,
    },
    {},
  );
  const createInvite = api.group.createInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite link created");
      void utils.group.getInvite.invalidate();
    },
  });
  const revalidateInvite = api.group.revalidateInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite link revalidated");
      void utils.group.getInvite.invalidate();
    },
  });

  const { data: joinRequests, isLoading: joinRequestsLoading } = api.group.getJoinRequests.useQuery(
    { groupId: group.id },
  );
  const { data: groupMembers, isLoading: groupMembersLoading } = api.group.getMembers.useQuery({
    groupId: group.id,
  });

  const createPageURL = (tab: "invite" | "manage") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Tabs defaultValue={tab} className="my-3">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="manage"
          onClick={() => {
            router.push(createPageURL("manage"));
          }}
        >
          Manage Users
        </TabsTrigger>
        <TabsTrigger
          value="invite"
          onClick={() => {
            // update the url search params to tab = invite
            router.push(createPageURL("invite"));
          }}
        >
          Invite Users
        </TabsTrigger>
      </TabsList>
      <TabsContent value="invite">
        <Card>
          <CardHeader className="flex flex-col items-center justify-center space-y-2">
            <Avatar>
              <AvatarImage src={group.avatar!} />
              <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <CardTitle>{group.username}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center space-y-2">
            {inviteDataLoading && <p>Loading...</p>}

            {!inviteDataLoading && !inviteData && (
              <div>
                <Button
                  onClick={() => {
                    createInvite.mutate({ groupId: group.id });
                  }}
                  disabled={createInvite.isLoading}
                >
                  Create Invite Link
                </Button>
              </div>
            )}

            {!inviteDataLoading && inviteData && (
              <div className="w-full">
                <CopyToClipboard
                  text={`http://localhost:3000/dashboard/group/invite/${inviteData.id}`}
                />
                <p className="text-center text-muted-foreground">Invitation link</p>
              </div>
            )}
          </CardContent>

          {!inviteDataLoading && inviteData && (
            <CardFooter className="flex justify-center space-x-3">
              <Button
                onClick={() => {
                  revalidateInvite.mutate({ groupId: group.id, oldInviteId: inviteData.id });
                }}
                variant="destructive"
                className="space-x-2"
                disabled={revalidateInvite.isLoading}
              >
                <ReplaceIcon />
                <span>Revalidate</span>
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      <TabsContent value="manage">
        <Card>
          <CardHeader className="flex items-center justify-center">
            <Avatar>
              <AvatarImage src={group.avatar!} />
              <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-3">
              <p className="my-3 font-semibold">Requests to join</p>
              {joinRequestsLoading && <p className="text-muted-foreground">Loading...</p>}
              {!joinRequestsLoading && joinRequests?.length === 0 && (
                <p className="text-muted-foreground">No requests to join</p>
              )}
              {joinRequests?.map((request) => (
                <RequestCard
                  key={request.id}
                  group={{
                    avatar: request.user.avatar ?? "",
                    username: request.user.email,
                    message: request.message ?? "",
                    requestedAt: request.createdAt,
                    id: group.id,
                    requestId: request.id,
                    userId: request.userId,
                  }}
                />
              ))}
            </div>

            <div className="space-y-3">
              <p className="my-3 font-semibold">Users</p>
              {groupMembersLoading && <p className="text-muted-foreground">Loading...</p>}
              {!groupMembersLoading && groupMembers?.length === 0 && (
                <p className="text-muted-foreground">No users in the group</p>
              )}
              {groupMembers?.map((member) => (
                <UserCard
                  key={member.id}
                  avatar={member.user.avatar ?? ""}
                  isAdmin={member.role === "admin"}
                  isMe={false}
                  username={member.user.email}
                  groupId={member.groupId}
                  userId={member.userId}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export const RequestCard = ({
  group,
}: {
  group: {
    id: string;
    requestId: string;
    avatar: string;
    username: string;
    message: string;
    requestedAt: Date;
    userId: string;
  };
}) => {
  const utils = api.useContext();

  const rejectJoinRequest = api.group.rejectJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected successfully");
      void utils.group.getJoinRequests.invalidate();
    },
    onError: () => {
      toast.error("Failed to update request");
    },
  });

  const acceptJoinRequest = api.group.acceptJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Request accepted successfully");
      void utils.group.getJoinRequests.invalidate();
      void utils.group.getMembers.invalidate();
    },
    onError: () => {
      toast.error("Failed to update request");
    },
  });

  return (
    <Card>
      <CardHeader className="flex items-center justify-center space-y-2">
        <Avatar>
          <AvatarImage src={group.avatar} />
          <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-md">{group.username}</CardTitle>
        <CardDescription>{group.message}</CardDescription>
        <div className="space-x-3 space-y-3">
          <Button
            variant="secondary"
            onClick={() => {
              acceptJoinRequest.mutate({
                groupId: group.id,
                requestId: group.requestId,
                userId: group.userId,
              });
            }}
            disabled={acceptJoinRequest.isLoading}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              rejectJoinRequest.mutate({
                groupId: group.id,
                requestId: group.requestId,
              });
            }}
            disabled={rejectJoinRequest.isLoading}
          >
            Reject
          </Button>
          <div className="text-muted-foreground">{dayjs(group.requestedAt).fromNow()}</div>
        </div>
      </CardHeader>
    </Card>
  );
};

export const UserCard = ({
  username,
  avatar,
  isMe,
  isAdmin,
  userId,
  groupId,
}: {
  username: string;
  avatar: string;
  isMe: boolean;
  isAdmin: boolean;
  userId: string;
  groupId: string;
}) => {
  return (
    <div className="flex items-center justify-between space-x-3">
      <div className="flex items-center space-x-2">
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <p>{username}</p>
      </div>
      <div className="space-x-3">
        {isMe && (
          <Button>
            <PencilIcon />
          </Button>
        )}
        <ConfirmUserPromotion isAdmin={isAdmin} groupId={groupId} userId={userId} />

        <RemoveUserAlertDialog isAdmin={isAdmin} groupId={groupId} userId={userId} />
      </div>
    </div>
  );
};
