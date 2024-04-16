"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createGroupSchema } from "@/server/api/routers/group/group.input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const CreateGroupDialog = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const createGroup = api.group.create.useMutation();
  const form = useForm({
    defaultValues: {
      username: "",
      description: "",
    },
    resolver: zodResolver(createGroupSchema),
  });
  const utils = api.useContext();
  const onSubmit = form.handleSubmit(async (values) => {
    await createGroup.mutateAsync(values, {
      onSuccess: () => {
        toast.success("Group created successfully");
        void utils.group.myGroups.invalidate();
        // TODO: close the dialog
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  });

  // TODO: show error message inside of the fields e.g username is already taken
  return (
    <ResponsiveDialog
      trigger={
        <Button type="button" variant="secondary">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Group
        </Button>
      }
      title="Create a new group"
      description="Create a new group to collaborate with your team."
    >
      <Form {...form}>
        <form ref={formRef} onSubmit={onSubmit} className="block max-w-screen-md space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>It has to be unique</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} className="min-h-0" />
                </FormControl>
                <FormDescription>A short description of your group</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="secondary" disabled={createGroup.isLoading}>
            Create Group
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
