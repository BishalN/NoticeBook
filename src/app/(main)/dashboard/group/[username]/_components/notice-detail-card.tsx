"use client";

import { PostPreview } from "@/app/(main)/editor/[postId]/_components/post-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface NoticeCardProps {
  title: string;
  content: string;
  username: string;
  avatar: string;
  createdAt: Date;
  groupUsername: string;
  noticeId: string;
  isAdmin: boolean;
}

export const NoticeDetailCard = ({
  avatar,
  createdAt,
  content,
  title,
  username,
  groupUsername,
  noticeId,
  isAdmin,
}: NoticeCardProps) => {
  const router = useRouter();
  return (
    <Card className="my-4">
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
          )}
        </div>
        <div className="mb-3 ">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        <div className="prose prose-sm my-4 min-h-[200px] max-w-[none]  dark:prose-invert">
          <PostPreview text={content} />
        </div>
      </CardHeader>
    </Card>
  );
};
