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
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LeaveGroupAlertDialogProps {
  groupId: string;
}

export function LeaveGroupAlertDialog({ groupId }: LeaveGroupAlertDialogProps) {
  const router = useRouter();
  const leaveGroup = api.group.leaveGroup.useMutation({
    onSuccess: () => {
      toast.success("Left the group successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button className="space-x-2" variant="secondary">
          <ExitIcon />
          <span>Leave Group</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove you from the group and you will not receive any notifications about the
            post in the group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              leaveGroup.mutate({ groupId });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
