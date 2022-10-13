import type { GetServerSidePropsContext, NextPage } from "next";
import { Widget } from "@typeform/embed-react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

import { trpc } from "../utils/trpc";
import { appRouter } from "../server/router";
import { createContext } from "../server/router/context";

const Apply: NextPage = () => {
  const submitResponseId = trpc.useMutation("application.submit");

  return (
    <Widget
      id="MVo09hRB"
      style={{ borderRadius: "none", width: "100%", height: "100%" }}
      className="rounded-none"
      onSubmit={(event) => {
        submitResponseId.mutate({ id: event.responseId });
        window.location.href = "/dashboard";
      }}
    />
  );
};

export const getServerSideProps = async (
  context: any,
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const trpcCtx = await createContext({ req: context.req, res: context.res });
  const caller = appRouter.createCaller(trpcCtx);
  const result = await caller.query("application.received");

  if (result) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};

export default Apply;
