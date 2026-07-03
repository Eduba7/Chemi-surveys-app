import { router } from "../trpc";
import { authRouter } from "./auth";
import { clientRouter } from "./client";
import { consultationRouter } from "./consultation";
import { projectRouter } from "./project";
import { serviceRouter } from "./service";
import { notificationRouter } from "./notification";

export const appRouter = router({
  auth: authRouter,
  clients: clientRouter,
  consultation: consultationRouter,
  project: projectRouter,
  service: serviceRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
