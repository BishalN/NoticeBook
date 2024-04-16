"use client";

import { GroupIcon } from "@/components/icons";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";

export const JoinGroupDialog = () => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchTerm = useDebounce(searchValue, 300);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = api.group.search.useQuery(
    { username: debouncedSearchTerm },
    { enabled: debouncedSearchTerm.length > 0 },
  );
  const createJoinRequest = api.group.createJoinRequest.useMutation();

  const utils = api.useContext();

  const handleJoinGroupRequest = async (groupId: string) => {
    if (createJoinRequest.isLoading) {
      return;
    }
    await createJoinRequest.mutateAsync(
      { groupId, message: "Please accept my request" },
      {
        onSuccess: () => {
          toast.success("Request sent successfully");
          void utils.group.search.invalidate();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to send request");
        },
      },
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      setOpen={setOpen}
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
