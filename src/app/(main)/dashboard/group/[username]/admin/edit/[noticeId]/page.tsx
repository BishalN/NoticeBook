import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { GroupPostUpdateEditor } from "../../../_components/group-post-update-editor";

export default async function Page({ params }: { params: { username: string; noticeId: string } }) {
  // Redirect if user not member of the group
  const groups = await api.group.myGroups.query();
  const group = groups.find((group) => group.group.username === params.username);
  if (!group) {
    redirect("/dashboard/group");
  }
  // Also redirect if user is not an admin
  if (group.role !== "admin") {
    redirect(`/dashboard/group/${params.username}`);
  }

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
        <h1>This is edit notice page</h1>
      </div>

      <GroupPostUpdateEditor groupId={group.groupId} notice={notice} />
    </div>
  );
}
