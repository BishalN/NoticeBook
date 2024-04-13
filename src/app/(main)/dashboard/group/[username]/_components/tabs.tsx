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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, MinusIcon, PencilIcon } from "lucide-react";

// On backend side we need to generate a temporary invite link for the user to join the group

interface TabProps {
  group: {
    avatar: string | null;
    username: string;
    description: string;
    id: string;
  };
}
export function TabsDemo({ group }: TabProps) {
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
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Input readOnly value="somelinkhere" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-3">
            <Button variant="secondary">Copy Link</Button>
            <Button variant="destructive">Revalidate</Button>
          </CardFooter>
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
