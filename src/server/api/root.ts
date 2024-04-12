import { groupRouter } from "./routers/group/group.procedure";
import { postRouter } from "./routers/post/post.procedure";
import { stripeRouter } from "./routers/stripe/stripe.procedure";
import { userRouter } from "./routers/user/user.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  group: groupRouter,
  post: postRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
