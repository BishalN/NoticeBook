// This page shows the recent posts of a group

import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { TabsDemo } from "./_components/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Page({ params }: { params: { username: string } }) {
  // Redirect if user not member of the group
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  // const isCurrentUserAdmin
  // use the groupmembers table to check if the user is an admin

  if (!group) {
    redirect("/dashboard/group");
  }

  // get recent posts
  const recentPosts = await api.group.listPosts.query({ groupId: String(group.id) });

  console.log(recentPosts);

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">{params.username}</h1>
        {/* // TODO: only show this button if user is admin */}
        <Link href={`/dashboard/group/${params.username}/admin`} passHref>
          <Button className="space-x-2" variant="secondary">
            <ArrowRightIcon className="h-4 w-4" />
            <span>Go to Admin page</span>
          </Button>
        </Link>
      </div>

      <div className="my-3 space-y-3">
        <NoticeCard />
        <NoticeCard />
        <NoticeCard />
      </div>
    </div>
  );
}

export const NoticeCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="mb-3 flex justify-between space-x-3">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">Shad</span>
              <span className="text-xs text-gray-500">admin</span>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
          </div>

          {/* TODO: only show for admins */}
          <Button variant="secondary" className="space-x-2">
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        </div>
        <div className="mb-3">
          <h1 className="text-2xl font-semibold">Notice Title</h1>
          <h2 className="text-muted-foreground">Notice Excerpts</h2>
        </div>
        <Button variant="secondary" className="space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Read More</span>
        </Button>
      </CardHeader>
    </Card>
  );
};
