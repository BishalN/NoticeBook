import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { NoticeDetailCard } from "../../_components/notice-detail-card";

export default async function Page({ params }: { params: { username: string; noticeId: string } }) {
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  if (!group) {
    redirect("/dashboard/group");
  }

  const notice = await api.group.getPost.query({
    groupId: group.group.id,
    postId: params.noticeId,
  });

  if (!notice) {
    redirect(`/dashboard/group/${params.username}`);
  }

  return (
    <div>
      <div className="flex justify-between">
        <h1 className=" text-2xl font-bold sm:text-3xl">{params.username}</h1>
      </div>
      <NoticeDetailCard
        avatar={notice.user.avatar ?? ""}
        createdAt={notice.createdAt}
        content={notice.content}
        title={notice.title}
        username={notice.user.email}
        groupUsername={params.username}
        noticeId={params.noticeId}
        isAdmin={group.role === "admin"}
      />
    </div>
  );
}
