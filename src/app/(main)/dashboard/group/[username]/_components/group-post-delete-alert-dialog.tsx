import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ConfirmGroupPostDeleteProps {
  groupId: string;
  postId: string;
}

export function ConfirmGroupPostDelete({ groupId, postId }: ConfirmGroupPostDeleteProps) {
  const deletePost = api.group.deleteGroupPost.useMutation();
  const router = useRouter();

  const handleDeletePost = () => {
    deletePost.mutate(
      { groupId, postId },
      {
        onSuccess: () => {
          toast.success("Post deleted successfully!");
          router.refresh();
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="space-x-2">
          <TrashIcon className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePost}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
