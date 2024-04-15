import { api } from "@/trpc/server";
import { GroupPostEditor } from "../../_components/simple-group-post-editor";

export default async function Page({ params }: { params: { username: string } }) {
  // gert group using username
  // if group not found return 404
  // if user is not part of the group return 403
  // if user is part of the group and is admin show the editor

  const group = await api.group.getByUsername.query({ username: params.username });
  if (!group) {
    return <h1>Group not found</h1>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{params.username}</h1>

      <GroupPostEditor groupId={group.id} groupUsername={params.username} />
    </div>
  );
}
