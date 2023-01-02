import { Role } from "@prisma/client";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { rbac } from "../components/RBACWrapper";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";

const Roles: NextPage = () => {
  const router = useRouter();
  const [role, setRole] = useState("");

  const { data, isLoading } = trpc.useQuery([
    "user.byRole",
    { role: Role[role] },
  ]);

  return (
    <>
      <label>
        Role:
        <input
          type="text"
          name="role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value || "");
          }}
        />
      </label>
      <br />
      {JSON.stringify(data)}
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    ["ADMIN"],
    undefined,
    output
  );
  return output;
}

export default Roles;
