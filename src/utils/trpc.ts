import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/trpc`,
        headers() {
          const token = localStorage.getItem("token");
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
