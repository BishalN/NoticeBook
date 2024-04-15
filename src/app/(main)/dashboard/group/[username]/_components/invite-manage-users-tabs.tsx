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

// On backend side we need to generate a temporary invite link for the user to join the group

// Workflow for invite users works like this
// on backend we'll have a table that will have
// id, groupid, status = "valid" or "invalid"
// here invite id will work like a code/token

// on front first check if there is an invite link for the group
// if there is no invite link then show the create invite link button
// on frontend the admin will first click on the create invite button to create
// first invite link and it'll be shown in a text box with a copy button
// the admin can then send the link to the user

// when the user with already an account clicks on the link
// the frontend will send a request to the backend to check if the link is valid
// if it is valid the user will be added to the group

// if the user doesn't have an account and clicks on the link
// the frontend will redirect the user to the signup page with the group id
// and the group id will be stored in the local storage or just in url params with redirect to param
// and the user will be added to the group after the signup

// if the admin wants to revalidate the link he can click on the revalidate button
// this will generate a new link and the old link will be invalid

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
  const { data, isLoading } = api.group.getInvite.useQuery({ groupId: group.id });
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
            {isLoading && <p>Loading...</p>}

            {!isLoading && !data && (
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

            {!isLoading && data && (
              <div className="w-full">
                <CopyToClipboard text={`http://localhost:3000/dashboard/group/invite/${data.id}`} />
                <p className="text-center text-muted-foreground">Invitation link</p>
              </div>
            )}
          </CardContent>

          {!isLoading && data && (
            <CardFooter className="flex justify-center space-x-3">
              <Button
                onClick={() => {
                  revalidateInvite.mutate({ groupId: group.id, oldInviteId: data.id });
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
              <RequestCard group={{ avatar: group.avatar ?? "", username: group.username }} />
              <RequestCard group={{ avatar: group.avatar ?? "", username: group.username }} />
            </div>

            <div className="space-y-3">
              <p className="my-3 font-semibold">Users</p>
              <UserCard avatar="" isAdmin={true} isMe={false} username="Bishal Neupane" />
              <UserCard avatar="" isAdmin={false} isMe={true} username="Matt" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export const RequestCard = ({ group }: { group: { avatar: string; username: string } }) => {
  return (
    <Card>
      <CardHeader className="flex items-center justify-center space-y-2">
        <Avatar>
          <AvatarImage src={group.avatar} />
          <AvatarFallback>{group.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-md">Emilia Gates</CardTitle>
        <CardDescription>Please accept me into your group</CardDescription>
        <div className="space-x-3 space-y-3">
          <Button variant="secondary">Accept</Button>
          <Button variant="destructive">Reject</Button>
          <div className="text-muted-foreground">Requested 2 days ago</div>
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
