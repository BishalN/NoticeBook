// when the user with already an account clicks on the link
// the frontend will send a request to the backend to check if the link is valid
// if it is valid the user will be added to the group

import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// if the user doesn't have an account and clicks on the link
// the frontend will redirect the user to the signup page with the group id
// and the group id will be stored in the local storage or just in url params with redirect to param
// and the user will be added to the group after the signup

// if the admin wants to revalidate the link he can click on the revalidate button
// this will generate a new link and the old link will be invalid

export default async function Page({ params }: { params: { inviteId: string } }) {
  const { user } = await validateRequest();

  if (!user) {
    // redirect to signup page with inviteId
    // might as well store the inviteId in local storage
    // also can goto login page
    redirect(`/signup?inviteId=${params.inviteId}`);
  }

  const acceptInvite = await api.group.acceptInvite.mutate({ inviteId: params.inviteId });

  // TODO: show some details about the joined group
  return (
    <div>
      <h1 className="text-xl font-bold">{acceptInvite.message}</h1>
      <Link href="/dashboard">
        <Button className="my-4 space-x-2" variant="secondary">
          <ArrowLeftIcon />
          <span>Go to dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
