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
import { Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConfirmUserPromotionProps {
  isAdmin: boolean;
  userId: string;
  groupId: string;
}

export function ConfirmUserPromotion({ isAdmin, groupId, userId }: ConfirmUserPromotionProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useContext();
  const promoteUser = api.group.promoteUser.useMutation({
    onSuccess: () => {
      toast.success("User promoted to admin");
      void utils.group.getMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => {
          if (!isAdmin) setOpen(true);
        }}
        variant={isAdmin ? "destructive" : "default"}
      >
        <Crown />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pormote user to admin ?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently promote this user to admin and give
            them full permissions to manage the group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              promoteUser.mutate({ userId, groupId });
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
