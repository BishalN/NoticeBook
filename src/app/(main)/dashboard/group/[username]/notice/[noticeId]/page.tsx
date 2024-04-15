import { api } from "@/trpc/server";
import { NoticeCard } from "../../_components/notice-card";
import { redirect } from "next/navigation";
import { NoticeDetailCard } from "../../_components/notice-detail-card";

export default async function Page({ params }: { params: { username: string; noticeId: string } }) {
  // Redirect if user not member of the group
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);

  if (!group) {
    redirect("/dashboard/group");
  }

  console.log(params);

  // Redirect if notice not found
  // const notice = await api.group.getPost.query({ postId: params.noticeId });

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
        <h1 className="text-3xl font-bold">{params.username}</h1>
      </div>
      <NoticeDetailCard
        avatar=""
        createdAt={notice.createdAt}
        content={notice.content}
        title={notice.title}
        username="iamcurrentuser"
        groupUsername={params.username}
        noticeId={params.noticeId}
      />
    </div>
  );
}
