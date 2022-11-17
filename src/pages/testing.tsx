import { trpc } from "../utils/trpc";
import type { NextPage } from "next";

const Testing: NextPage = () => {
  const { data, isLoading, fetchNextPage } = trpc.useInfiniteQuery(
    ["reviewer.getApplications", {}],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  console.log(data, isLoading);

  return (
    <>
      {data?.pages.map((page) => {
        return page.data.map((application) => {
          return (
            <div key={application.response_id}>
              {application?.firstName} {application?.lastName}{" "}
              {application.resume}
              <iframe
                src={application.resume || " "}
                itemType="application/pdf"
                width={400}
                height={400}
                loading="lazy"
              ></iframe>
              {/*{application.emergencyContactInfo.phoneNumber}*/}
            </div>
          );
        });
      })}
      {isLoading ? null : (
        <button
          className="btn btn-primary"
          // tRPC fetch the next page
          onClick={() => fetchNextPage()}
        >
          Fetch More
        </button>
      )}
    </>
  );
};

export default Testing;
