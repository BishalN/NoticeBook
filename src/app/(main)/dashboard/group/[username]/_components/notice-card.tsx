"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmGroupPostDelete } from "./group-post-delete-alert-dialog";

// dayjs import and use relative time
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface NoticeCardProps {
  title: string;
  excerpt: string;
  username: string;
  avatar: string;
  createdAt: Date;
  groupUsername: string;
  noticeId: string;
  groupId: string;
  isAdmin: boolean;
}

export const NoticeCard = ({
  avatar,
  createdAt,
  excerpt,
  title,
  username,
  groupUsername,
  noticeId,
  groupId,
  isAdmin,
}: NoticeCardProps) => {
  const router = useRouter();
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="mb-3 flex justify-between space-x-3">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={avatar} />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{username}</span>
              <span className="text-xs text-gray-500">admin</span>
              <span className="text-xs text-gray-500">{dayjs(createdAt).fromNow()}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="space-x-3">
              <Button
                variant="secondary"
                className="space-x-2"
                onClick={() =>
                  router.push(`/dashboard/group/${groupUsername}/admin/edit/${noticeId}`)
                }
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </Button>

              <ConfirmGroupPostDelete groupId={groupId} postId={noticeId} />
            </div>
          )}
        </div>
        <div className="mb-3">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <h2 className="text-muted-foreground">{excerpt}</h2>
          <Button
            variant="secondary"
            className="mt-4 space-x-2"
            onClick={() => router.push(`/dashboard/group/${groupUsername}/notice/${noticeId}`)}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Read More</span>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
