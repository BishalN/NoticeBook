import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { inviteId: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    // TODO: redirect to signup page with inviteId
    // might as well store the inviteId in local storage
    // also can goto login page
    redirect(`/signup?inviteId=${params.inviteId}`);
  }

  const acceptInvite = await api.group.acceptInvite.mutate({ inviteId: params.inviteId });

  return (
    <div>
      <h1 className="my-2 text-2xl font-bold">{acceptInvite.group?.username} Invitation</h1>
      <h1 className="text-xl font-bold">{acceptInvite.message}</h1>
      <Link href={`/dashboard/group/${acceptInvite.group?.username}`}>
        <Button className="my-4 space-x-2" variant="secondary">
          <ArrowLeftIcon />
          <span>Go to group page</span>
        </Button>
      </Link>
    </div>
  );
}
