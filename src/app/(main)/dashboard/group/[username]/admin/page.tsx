import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { InviteAndManageUsersTabs } from "../_components/invite-manage-users-tabs";
import { groupAdminTabsSchema } from "@/server/api/routers/group/group.input";

export default async function Page({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  if (!group) {
    redirect("/dashboard/group");
  }

  if (group.role !== "admin") {
    redirect("/dashboard");
  }

  const { tab, query } = groupAdminTabsSchema.parse(searchParams);

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
      <InviteAndManageUsersTabs group={group.group} tab={tab} />
    </div>
  );
}
