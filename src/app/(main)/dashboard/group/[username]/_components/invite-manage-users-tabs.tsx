"use client";

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
import { Crown, MinusIcon, PencilIcon, ReplaceIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InviteAndManageUsersTabs {
  group: {
    avatar: string | null;
    username: string;
    description: string;
    id: string;
  };
}
export function InviteAndManageUsersTabs({ group }: InviteAndManageUsersTabs) {
  const router = useRouter();
  const { data: inviteData, isLoading: inviteDataLoading } = api.group.getInvite.useQuery({
    groupId: group.id,
  });
  const createInvite = api.group.createInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite link created");
    },
  });
  const revalidateInvite = api.group.revalidateInvite.useMutation({
    onSuccess: () => {
      toast.success("Invite link revalidated");
      // TODO: invalidate the getInvite query
      router.refresh(); // this is hack to revalidate the query for now
    },
  });

  const { data: joinRequests, isLoading: joinRequestsLoading } = api.group.getJoinRequests.useQuery(
    { groupId: group.id },
  );
  const { data: groupMembers, isLoading: groupMembersLoading } = api.group.getMembers.useQuery({
    groupId: group.id,
  });

  return (
    <Tabs defaultValue="invite-users" className="my-3">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
        <TabsTrigger value="invite-users">Invite Users</TabsTrigger>
      </TabsList>
      <TabsContent value="invite-users">
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
      <TabsContent value="manage-users">
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
  const rejectJoinRequest = api.group.rejectJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Request rejected successfully");
    },
    onError: () => {
      toast.error("Failed to update request");
    },
  });

  const acceptJoinRequest = api.group.acceptJoinRequest.useMutation({
    onSuccess: () => {
      toast.success("Request accepted successfully");
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
          <div className="text-muted-foreground">{group.requestedAt.toLocaleDateString()}</div>
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
}: {
  username: string;
  avatar: string;
  isMe: boolean;
  isAdmin: boolean;
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
        <Button variant={isAdmin ? "destructive" : "default"}>
          <Crown />
        </Button>
        <Button>
          <MinusIcon />
        </Button>
      </div>
    </div>
  );
};
