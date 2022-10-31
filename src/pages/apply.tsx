import type { GetServerSidePropsContext, NextPage } from "next";
import { Widget } from "@typeform/embed-react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
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

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  // If submitted then go dashboard
  if (
    userEntry &&
    (userEntry.typeform_response_id === null ||
      userEntry.typeform_response_id === undefined)
  ) {
    return { props: {} };
  }
  return { redirect: { destination: "/dashboard", permanent: false } };
};

export default Apply;
