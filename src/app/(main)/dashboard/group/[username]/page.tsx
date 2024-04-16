import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { NoticeCard } from "./_components/notice-card";
import { LeaveGroupAlertDialog } from "./_components/leave-group-alert-dialog";

export default async function Page({ params }: { params: { username: string } }) {
  // Redirect if user not member of the group
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  if (!group) {
    redirect("/dashboard/group");
  }

  const recentNotices = await api.group.listPosts.query({ groupId: String(group.groupId) });

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">{params.username}</h1>
        {group.role === "member" && <LeaveGroupAlertDialog groupId={group.groupId} />}
        {group.role === "admin" && (
          <Link href={`/dashboard/group/${params.username}/admin`} passHref>
            <Button className="space-x-2" variant="secondary">
              <ArrowRightIcon className="h-4 w-4" />
              <span>Go to Admin page</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="my-3 space-y-3">
        {recentNotices.length > 0 ? (
          recentNotices.map((notice) => {
            return (
              <NoticeCard
                isAdmin={group.role === "admin"}
                title={notice.title}
                createdAt={notice.createdAt}
                username={notice.user.email}
                avatar={notice.user.avatar ?? ""}
                excerpt={notice.excerpt}
                key={notice.id}
                groupUsername={group.group.username}
                groupId={group.groupId}
                noticeId={notice.id}
              />
            );
          })
        ) : (
          <div>
            {/* TODO: improve this empty state */}
            <p>No notices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
