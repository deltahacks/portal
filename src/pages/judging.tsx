import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useEffect, useRef, useState } from "react";
import Drawer from "../components/Drawer";
import { rbac } from "../components/RBACWrapper";
import { Project, Role } from "@prisma/client";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { z } from "zod";

const TableOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

type TableOption = z.infer<typeof TableOptionSchema>;

const Judging: NextPage = () => {
  const { control, handleSubmit, reset, register } = useForm();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);

  const { data: tables, isLoading: tablesLoading } =
    trpc.table.getTables.useQuery();
  const { mutate: submitJudgment } =
    trpc.judging.createJudgingResult.useMutation();
  const { data: nextProject, refetch: refetchNextProject } =
    trpc.project.getNextProject.useQuery(
      { tableId: selectedTable?.value || "" },
      { enabled: !!selectedTable }
    );

  useEffect(() => {
    if (nextProject) {
      setCurrentProject(nextProject);
    } else {
      setCurrentProject(null);
    }
  }, [nextProject]);

  const onSubmit = (data: any) => {
    submitJudgment(
      {
        projectId: currentProject?.id,
        ...data,
      },
      {
        onSuccess: () => {
          reset();
          refetchNextProject();
        },
      }
    );
  };

  const tableOptions =
    tables?.map((table) => ({
      value: table.id,
      label: `Table ${table.number} - ${table.track.name}`,
    })) || [];

  return (
    <>
      <Head>
        <title>Dashboard - DeltaHacks XI</title>
      </Head>

      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Dashboard", link: "/dashboard" }]}>
          <main className="-transform-x-1/2  static left-1/2 top-1/2 flex flex-col items-center justify-center px-7 py-16 sm:px-14 md:flex-row md:gap-4 lg:pl-20 2xl:w-8/12 2xl:pt-20 ">
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Project Judging</h1>

              <div className="mb-4">
                <label className="label">
                  <span className="label-text">Select your table:</span>
                </label>
                <Controller
                  name="table"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={tableOptions}
                      isLoading={tablesLoading}
                      onChange={(option) => {
                        field.onChange(option);
                        setSelectedTable(option as TableOption);
                      }}
                      classNames={{
                        control: () => "input input-bordered",
                        menu: () => "bg-base-200",
                        option: () => "hover:bg-base-300",
                      }}
                    />
                  )}
                />
              </div>

              {currentProject && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">{currentProject.name}</h2>
                    <p className="line-clamp-4">{currentProject.description}</p>
                    <a
                      href={currentProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      Project Link
                    </a>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Comment</span>
                        </label>
                        <textarea
                          {...register("comment", { required: true })}
                          className="textarea textarea-bordered h-24"
                          placeholder="Enter your judgment here"
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary mt-4">
                        Submit Judgment
                      </button>
                    </form>
                  </div>
                </div>
              )}
              {!currentProject && <p>No project left😔</p>}
            </div>
          </main>
        </Drawer>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN, Role.JUDGE],
    undefined,
    output
  );
  return output;
};

export default Judging;
