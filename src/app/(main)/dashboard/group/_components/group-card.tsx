"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type RouterOutputs } from "@/trpc/shared";
import { useRouter } from "next/navigation";
import React from "react";
import EmptyState from "./empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GroupsProps {
  promises: Promise<[RouterOutputs["group"]["myGroups"]]>;
}

export function GroupCard({ promises }: GroupsProps) {
  const router = useRouter();
  const [groups] = React.use(promises);

  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        {groups.length > 0 &&
          groups.map((group) => (
            <Card
              className="cursor-pointer"
              key={group.id}
              onClick={() => {
                router.push(`/dashboard/group/${group.group.username}`);
              }}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={group.group.avatar!} />
                    <AvatarFallback>{group.group.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex w-full justify-between">
                    <CardTitle>{group.group.username}</CardTitle>
                    <p>{group.role}</p>
                  </div>
                </div>
                <CardDescription>{group.group.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
      </div>
      {groups.length === 0 && (
        <div className="flex w-full items-center justify-center">
          <EmptyState />
        </div>
      )}
    </>
  );
}
