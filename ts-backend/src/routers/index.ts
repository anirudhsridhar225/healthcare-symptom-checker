import { router } from "../trpc.js";
import { authRouter } from "./authRouter.js";
import { llmRouter } from "./llmRouter.js";
import { userRouter } from "./userRouter.js";

export const appRouter = router({
  auth: authRouter,
  llm: llmRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;