"use client";

import { GroupIcon } from "@/components/icons";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// first search the name of the group and send the join request to the group
// on the backend side, how to handle the join request ?
// may be create a new table for the join request and then the admin can accept or reject the request

// TODO: Use debounce for search and eliminate the jaggering effect
export const JoinGroupDialog = () => {
  const [searchValue, setSearchValue] = useState("");
  const { data, isLoading } = api.group.search.useQuery({ username: searchValue });
  const createJoinRequest = api.group.createJoinRequest.useMutation();

  const router = useRouter();

  const handleJoinGroupRequest = async (groupId: string) => {
    // check if already sending the request
    if (createJoinRequest.isLoading) {
      return;
    }
    await createJoinRequest.mutateAsync(
      { groupId, message: "Please accept my request" },
      {
        onSuccess: () => {
          toast.success("Request sent successfully");
        },
        onError: () => {
          toast.error("Failed to send request");
        },
        onSettled: () => {
          // close the dialog
          router.refresh();
        },
      },
    );
    toast.success("Request sent successfully");
    // close the dialog
    router.refresh();
  };

  return (
    <ResponsiveDialog
      trigger={
        <Button type="button" variant="outline">
          <GroupIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Join Group
        </Button>
      }
      title="Join a group"
      description="Join an existing group to collaborate with your team."
    >
      <div className="space-y-4">
        <Input
          placeholder="Type the username of the group"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {data && data?.length > 0 ? (
              <div>
                {data.map((group) => (
                  <div key={group.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{group.username}</h3>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleJoinGroupRequest(group.id)}
                    >
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div>No groups found</div>
            )}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
};
