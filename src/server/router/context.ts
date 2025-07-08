// src/server/router/context.ts
import * as trpcNext from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../db/client";
import { LogSnag } from "@logsnag/node";
import { env } from "../../env/server.mjs";
import { PostHog } from "posthog-node";

const logsnag = new LogSnag({
  token: env.LOGSNAG_TOKEN,
  project: "deltahacks-11",
});

const posthog = new PostHog(env.POSTHOG_KEY, {
  host: "https://us.i.posthog.com",
});

type CreateContextOptions = {
  session: Session | null;
};

/** Use this helper for:
 * - testing, where we dont have to Mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    logsnag,
    posthog,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions,
) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return await createContextInner({
    session,
  });
};
