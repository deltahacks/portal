import next, {
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
import ReactMarkdown from "react-markdown";

const TableOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

type TableOption = z.infer<typeof TableOptionSchema>;

// Add this type for better type safety
type ScoreType = 0 | 1 | 2 | 3;

const Judging: NextPage = () => {
  const { control, handleSubmit, reset, register } = useForm();
  // const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);

  const { data: tables, isLoading: tablesLoading } =
    trpc.table.getTables.useQuery();
  const { mutate: submitJudgment } =
    trpc.judging.createJudgingResult.useMutation();
  const {
    data: nextProject,
    refetch: refetchNextProject,
    isSuccess: projectSuccess,
  } = trpc.project.getNextProject.useQuery(
    { tableId: selectedTable?.value || "" },
    { enabled: !!selectedTable }
  );
  const generalTrackId = tables?.find(
    (t) => t.track.name.toLowerCase() === "general"
  )?.trackId;
  const { data: rubricQuestions } = trpc.judging.getRubricQuestions.useQuery(
    {
      trackId:
        tables?.find((t) => t.id === selectedTable?.value)?.trackId || "",
    },
    { enabled: !!selectedTable }
  );
  // need to add general questions to other tracks
  const { data: generalQuestions } = trpc.judging.getRubricQuestions.useQuery(
    {
      trackId: generalTrackId || "",
    },
    {
      enabled:
        !!selectedTable &&
        !!generalTrackId &&
        tables
          ?.find((t) => t.id === selectedTable?.value)
          ?.track.name.toLowerCase() !== "general",
    }
  );

  const allQuestions = [
    ...(rubricQuestions || []),
    ...((tables
      ?.find((t) => t.id === selectedTable?.value)
      ?.track.name.toLowerCase() !== "general"
      ? generalQuestions
      : []) || []),
  ];

  const onSubmit = (data: any) => {
    if (!nextProject?.id) return;

    submitJudgment(
      {
        projectId: nextProject.id,
        responses: Object.entries(data.scores || {}).map(
          ([questionId, score]) => ({
            questionId,
            score: Number(score),
          })
        ),
      },
      {
        onSuccess: () => {
          reset();
          refetchNextProject();
          window.scrollTo({ top: 0, behavior: "smooth" });
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

      <div className="drawer drawer-end relative min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Dashboard", link: "/dashboard" }]}>
          <main className="static flex flex-col items-center justify-center px-7 py-16 sm:px-14 md:flex-row md:gap-4 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            <div className="w-full p-4">
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
                      unstyled={true}
                      classNames={{
                        control: (state) =>
                          state.menuIsOpen
                            ? "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border"
                            : "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border",
                        menu: () =>
                          "dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border -mt-1 rounded-b-lg overflow-hidden",
                        option: () =>
                          "p-2 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-900",
                        valueContainer: () =>
                          "dark:text-neutral-500 text-neutral-700 gap-2",
                        singleValue: () => "dark:text-white text-black",
                      }}
                    />
                  )}
                />
              </div>

              {projectSuccess && nextProject && (
                <div className="rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">
                      {nextProject.name}
                    </h2>
                    <p className="line-clamp-4">{nextProject.description}</p>
                    <a
                      href={nextProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      Project Link
                    </a>

                    {allQuestions && allQuestions.length > 0 ? (
                      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                        {/* Track-specific questions section */}
                        {rubricQuestions &&
                          rubricQuestions.length > 0 &&
                          tables
                            ?.find((t) => t.id === selectedTable?.value)
                            ?.track.name.toLowerCase() !== "general" && (
                            <div className="mb-8">
                              <h3 className="text-lg font-bold mb-4 p-3 border-l-4 border-primary bg-base-200 rounded-r">
                                {
                                  tables?.find(
                                    (t) => t.id === selectedTable?.value
                                  )?.track.name
                                }{" "}
                                Track Questions
                              </h3>
                              {rubricQuestions.map((question, index) => (
                                <div key={question.id}>
                                  {index > 0 && (
                                    <hr className="my-6 border-neutral-700" />
                                  )}
                                  <div className="form-control mb-4">
                                    <label className="label">
                                      <span className="label-text">
                                        <div className="mb-1">
                                          <span className="font-bold">
                                            {question.title}
                                          </span>
                                          <span>
                                            {" "}
                                            • {question.points} points
                                          </span>
                                        </div>
                                        <ReactMarkdown className="prose">
                                          {question.question}
                                        </ReactMarkdown>
                                      </span>
                                    </label>
                                    <div className="rating rating-lg">
                                      <Controller
                                        name={`scores.${question.id}`}
                                        control={control}
                                        defaultValue={0}
                                        rules={{ required: true }}
                                        render={({
                                          field: { onChange, value },
                                        }) => (
                                          <div className="flex flex-col">
                                            <div className="flex gap-2">
                                              {[0, 1, 2, 3].map((score) => (
                                                <button
                                                  key={score}
                                                  type="button"
                                                  className={`btn ${
                                                    value === score
                                                      ? "btn-primary"
                                                      : "btn-outline"
                                                  }`}
                                                  onClick={() =>
                                                    onChange(score)
                                                  }
                                                >
                                                  {score}
                                                </button>
                                              ))}
                                            </div>
                                            <div className="mt-2 text-sm text-neutral-500">
                                              {value === 0 &&
                                                "0 - Ineffective / Bad"}
                                              {value === 1 &&
                                                "1 - Limited / Okay"}
                                              {value === 2 &&
                                                "2 - Functional / Good"}
                                              {value === 3 &&
                                                "3 - Exceptional / Phenomenal"}
                                            </div>
                                          </div>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {/* General questions section */}
                        <div className="mb-8">
                          <h3 className="text-lg font-bold mb-4 p-3 border-l-4 border-secondary bg-base-200 rounded-r">
                            {tables
                              ?.find((t) => t.id === selectedTable?.value)
                              ?.track.name.toLowerCase() === "general"
                              ? "General Track Questions"
                              : "General Questions"}
                          </h3>
                          {(tables
                            ?.find((t) => t.id === selectedTable?.value)
                            ?.track.name.toLowerCase() === "general"
                            ? rubricQuestions
                            : generalQuestions
                          )?.map((question, index) => (
                            <div key={question.id}>
                              {index > 0 && (
                                <hr className="my-6 border-neutral-700" />
                              )}
                              <div className="form-control mb-4">
                                <label className="label">
                                  <span className="label-text">
                                    <div className="mb-1">
                                      <span className="font-bold">
                                        {question.title}
                                      </span>
                                      <span> • {question.points} points</span>
                                    </div>

                                    <ReactMarkdown className="prose">
                                      {question.question}
                                    </ReactMarkdown>
                                  </span>
                                </label>
                                <div className="rating rating-lg">
                                  <Controller
                                    name={`scores.${question.id}`}
                                    control={control}
                                    defaultValue={0}
                                    rules={{ required: true }}
                                    render={({
                                      field: { onChange, value },
                                    }) => (
                                      <div className="flex flex-col">
                                        <div className="flex gap-2">
                                          {[0, 1, 2, 3].map((score) => (
                                            <button
                                              key={score}
                                              type="button"
                                              className={`btn ${
                                                value === score
                                                  ? "btn-primary"
                                                  : "btn-outline"
                                              }`}
                                              onClick={() => onChange(score)}
                                            >
                                              {score}
                                            </button>
                                          ))}
                                        </div>
                                        <div className="mt-2 text-sm text-neutral-500">
                                          {value === 0 &&
                                            "0 - Ineffective / Bad"}
                                          {value === 1 && "1 - Limited / Okay"}
                                          {value === 2 &&
                                            "2 - Functional / Good"}
                                          {value === 3 &&
                                            "3 - Exceptional / Phenomenal"}
                                        </div>
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button type="submit" className="btn btn-primary mt-4">
                          Submit Judgment
                        </button>
                      </form>
                    ) : (
                      <div className="mt-4 text-error">
                        No rubric questions available for this track.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!nextProject && <p>No project left😔</p>}
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
