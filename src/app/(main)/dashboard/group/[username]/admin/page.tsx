// This page is for admins only

// create a simple dynamic page that displays the username from the url

import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { TabsDemo } from "../_components/tabs";

export default async function Page({ params }: { params: { username: string } }) {
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  if (!group) {
    redirect("/dashboard/group");
  }

  // TODO: add check if user is admin

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">{params.username}</h1>
        <Link href={`/dashboard/group/${params.username}/admin/new-post`} passHref>
          <Button className="space-x-2" variant="secondary">
            <PlusIcon className="h-4 w-4" />
            <span>New Post</span>
          </Button>
        </Link>
      </div>
      <TabsDemo group={group.group} />
    </div>
  );
}
