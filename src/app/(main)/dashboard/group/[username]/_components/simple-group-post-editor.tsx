"use client";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import Link from "next/link";
import { createGroupPostSchema } from "@/server/api/routers/group/group.input";
import { PostPreview } from "@/app/(main)/editor/[postId]/_components/post-preview";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const markdownlink = "https://remarkjs.github.io/react-markdown/";

interface GroupPostEditorProps {
  groupId: string;
  groupUsername: string;
}

export const GroupPostEditor = ({ groupId, groupUsername }: GroupPostEditorProps) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const createPost = api.group.createGroupPost.useMutation();
  const form = useForm({
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      groupId: String(groupId),
    },
    resolver: zodResolver(createGroupPostSchema),
  });

  console.log(form.formState.errors);

  const onSubmit = form.handleSubmit(async (values) => {
    createPost.mutate(
      { ...values, groupId },
      {
        onSuccess: () => {
          toast.success("Post created successfully!");
          // TODO: invalidate the list posts
          router.push(`/dashboard/group/${groupUsername}`);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      },
    );
  });

  return (
    <div className="my-4">
      <Form {...form}>
        <form ref={formRef} onSubmit={onSubmit} className="block max-w-screen-md space-y-4">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} className="min-h-0" />
                </FormControl>
                <FormDescription>A short description of your post</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <Tabs defaultValue="code">
                <TabsList>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="code">
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} className="min-h-[200px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </TabsContent>
                <TabsContent value="preview" className="space-y-2">
                  <div className="prose prose-sm min-h-[200px] max-w-[none] rounded-lg border px-3 py-2 dark:prose-invert">
                    <PostPreview text={form.watch("content")} />
                  </div>
                </TabsContent>
                <Link href={markdownlink}>
                  <span className="text-[0.8rem] text-muted-foreground underline underline-offset-4">
                    Supports markdown
                  </span>
                </Link>
              </Tabs>
            )}
          />
          <Button
            onClick={() => {
              console.log("req submitted");
              formRef.current?.requestSubmit();
            }}
            disabled={!form.formState.isDirty || createPost.isLoading}
            type="submit"
            className="ml-auto"
          >
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
