"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { MinusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RemoveUserAlertDialogProps {
  isAdmin: boolean;
  userId: string;
  groupId: string;
}

export function RemoveUserAlertDialog({ isAdmin, groupId, userId }: RemoveUserAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useContext();
  const removeUser = api.group.removeUser.useMutation({
    onSuccess: () => {
      toast.success("User removed from the group");
      void utils.group.getMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isAdmin && (
        <Button onClick={() => setOpen(true)}>
          <MinusIcon />
        </Button>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove user from group ?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the user from the group and they will not receive any notifications
            about the post in the group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              removeUser.mutate({ userId, groupId });
              setOpen(false);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
