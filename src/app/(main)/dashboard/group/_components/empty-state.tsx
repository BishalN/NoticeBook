import { FilePlusIcon, GroupIcon, PlusIcon } from "@/components/icons";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { NewGroupDialog } from "./create-new-group-dialog";

export default function EmptyState() {
  return (
    <div className="text-center">
      <FilePlusIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new group or join exisiting groups.
      </p>
      <div className="mt-6 space-x-4">
        <NewGroupDialog />

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
            <p>Content goes here</p>
          </div>
        </ResponsiveDialog>
      </div>
    </div>
  );
}
