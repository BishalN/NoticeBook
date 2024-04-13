import { FilePlusIcon } from "@/components/icons";
import { CreateGroupDialog } from "./create-new-group-dialog";
import { JoinGroupDialog } from "./join-group-dialog";

export default function EmptyState() {
  return (
    <div className="text-center">
      <FilePlusIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new group or join exisiting groups.
      </p>
      <div className="mt-6 space-x-4">
        <CreateGroupDialog />
        <JoinGroupDialog />
      </div>
    </div>
  );
}
