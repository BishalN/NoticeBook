import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import React from "react";
import { CreateGroupDialog } from "./_components/create-new-group-dialog";
import { JoinGroupDialog } from "./_components/join-group-dialog";
import { GroupCard } from "./_components/group-card";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Group",
  description: "Manage your groups",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function GroupPage({ searchParams }: Props) {
  // TODO: parse it before using it like in other pages
  const { page, perPage } = searchParams;

  const { user } = await validateRequest();

  if (!user) {
    redirect("/signin");
  }

  const myGroups = Promise.all([api.group.myGroups.query()]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Groups</h1>
          <p className="text-sm text-muted-foreground">Manage your account groups</p>
        </div>
        <div className="space-x-3">
          <CreateGroupDialog />
          <JoinGroupDialog />
        </div>
      </div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <GroupCard promises={myGroups} />
      </React.Suspense>
    </div>
  );
}
