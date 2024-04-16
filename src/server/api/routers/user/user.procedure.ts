import { protectedProcedure, createTRPCRouter } from "../../trpc";
import * as inputs from "./user.input";
import * as services from "./user.service";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => ctx.user),

  addFCMToken: protectedProcedure
    .input(inputs.addFCMTokenSchema)
    .mutation(({ ctx, input }) => services.addFCMToken(ctx, input)),
});
