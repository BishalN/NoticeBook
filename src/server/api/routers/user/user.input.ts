import { z } from "zod";

export const addFCMTokenSchema = z.object({
  token: z.string(),
});
export type AddFCMTokenInput = z.infer<typeof addFCMTokenSchema>;
