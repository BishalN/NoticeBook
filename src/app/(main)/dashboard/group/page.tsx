import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import React from "react";
import { type RouterOutputs } from "@/trpc/shared";
import EmptyState from "./_components/empty-state";

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

  // get the mygroups data
  const myGroups = Promise.all([api.group.myGroups.query()]);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Groups</h1>
        <p className="text-sm text-muted-foreground">Manage your account groups</p>
      </div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Group promises={myGroups} />
      </React.Suspense>
    </div>
  );
}

interface GroupsProps {
  promises: Promise<[RouterOutputs["group"]["myGroups"]]>;
}

export function Group({ promises }: GroupsProps) {
  const [groups] = React.use(promises);

  console.log(groups);
  return (
    <div>
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.id}>
            <h2>{group.group.username}</h2>
            <p>{group.group.description}</p>
          </div>
        ))
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
