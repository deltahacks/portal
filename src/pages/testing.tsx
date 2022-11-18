import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { prisma } from "../server/db/client";

const Testing: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["reviewer.getApplications"]);
  trpc.useQuery(["reviewer.getReviewed"]);
  console.log(data, isLoading);

  return (
    <>
      {data?.data.map((blob, index) => {
        return (
          <div key={index}>
            {blob.firstName} {blob.lastName}
            <iframe
              src={blob.resume || " "}
              itemType="application/pdf"
              width={400}
              height={400}
              loading="lazy"
            ></iframe>
          </div>
        );
      })}
    </>
  );
};

export default Testing;
