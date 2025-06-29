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
import { keepPreviousData } from "@tanstack/react-query";

const TableOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

type TableOption = z.infer<typeof TableOptionSchema>;

// Add this type for better type safety
type ScoreType = 0 | 1 | 2 | 3;

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Judging: NextPage = () => {
  const { control, handleSubmit, reset, register } = useForm();
  // const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const { data: tables, isPending: tablesLoading } =
    trpc.table.getTables.useQuery();
  const { mutate: submitJudgment } =
    trpc.judging.createJudgingResult.useMutation();
  // TODO: Change this endpoint to only handle one thing, not filtering on projectId
  const {
    data: nextProject,
    refetch: refetchNextProject,
    isSuccess: projectSuccess,
    isPending: isProjectLoading,
  } = trpc.project.getNextProject.useQuery(
    {
      tableId: selectedTable?.value || "",
      projectId: selectedProjectId,
    },
    {
      enabled: !!selectedTable,
      placeholderData: keepPreviousData,
    },
  );
  const generalTrackId = tables?.find(
    (t) => t.track.name.toLowerCase() === "general",
  )?.trackId;
  const { data: rubricQuestions } = trpc.judging.getRubricQuestions.useQuery(
    {
      trackId:
        tables?.find((t) => t.id === selectedTable?.value)?.trackId || "",
    },
    { enabled: !!selectedTable },
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
    },
  );

  const allQuestions = [
    ...(rubricQuestions || []),
    ...((tables
      ?.find((t) => t.id === selectedTable?.value)
      ?.track.name.toLowerCase() !== "general"
      ? generalQuestions
      : []) || []),
  ];

  const { data: tableProjects, refetch: refetchTableProjects } =
    trpc.table.getTableProjects.useQuery(
      { tableId: selectedTable?.value || "" },
      { enabled: !!selectedTable },
    );

  const { data: existingScores, refetch: refetchExistingScores } =
    trpc.judging.getProjectScores.useQuery(
      { projectId: nextProject?.id || "" },
      { enabled: !!nextProject },
    );

  useEffect(() => {
    if (existingScores && nextProject) {
      // Reset form with existing scores
      const scores: Record<string, number> = {};
      existingScores.forEach((response) => {
        scores[response.questionId] = response.score;
      });
      reset({ scores });
    } else {
      // Reset form when switching to a new project
      reset({ scores: {} });
    }
  }, [existingScores, nextProject, reset]);

  const onSubmit = (data: any) => {
    if (!nextProject?.id || !selectedTable?.value) return;

    submitJudgment(
      {
        projectId: nextProject.id,
        tableId: selectedTable.value,
        responses: Object.entries(data.scores || {}).map(
          ([questionId, score]) => ({
            questionId,
            score: Number(score),
          }),
        ),
      },
      {
        onSuccess: () => {
          // Only clear selectedProjectId if there are more unjudged projects
          const hasMoreUnjudgedProjects = tableProjects?.some(
            (p) => !p.isJudged && p.id !== nextProject.id,
          );
          if (hasMoreUnjudgedProjects) {
            setSelectedProjectId(null);
          }
          refetchExistingScores();
          refetchNextProject();
          refetchTableProjects();
          reset({ scores: {} });
          // Scroll to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  };

  const tableOptions =
    tables?.map((table) => ({
      value: table.id,
      label: `Table ${table.number} - ${table.track.name}`,
    })) || [];

  const QuestionSection = ({
    title,
    questions,
    control,
  }: {
    title: string;
    questions: typeof rubricQuestions;
    control: any;
  }) => (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="space-y-4">
        {questions?.map((question) => (
          <div key={question.id} className="card bg-base-200 shadow-sm">
            <div className="card-body p-4 sm:p-8 gap-4">
              {/* Question header with points */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold">{question.title}</h4>
                <div className="badge badge-neutral whitespace-nowrap">
                  {question.points} points
                </div>
              </div>

              {/* Main question text */}
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{question.question}</ReactMarkdown>
              </div>

              {/* Scoring section */}
              <div className="pt-2">
                <div className="text-sm font-semibold text-neutral-500 mb-2">
                  Score:
                </div>
                <Controller
                  name={`scores.${question.id}`}
                  control={control}
                  defaultValue={0}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col">
                      <div className="flex gap-2 sm:gap-3">
                        {[0, 1, 2, 3].map((score) => (
                          <button
                            key={score}
                            type="button"
                            className={`btn sm:btn-md aspect-square rounded-xl p-0 ${
                              value === score ? "btn-primary" : "btn-outline"
                            }`}
                            onClick={() => onChange(score)}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-neutral-500">
                        {value === 0 && "0 - Ineffective / Bad"}
                        {value === 1 && "1 - Limited / Okay"}
                        {value === 2 && "2 - Functional / Good"}
                        {value === 3 && "3 - Exceptional / Phenomenal"}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Dashboard - DeltaHacks XI</title>
      </Head>

      <div className="drawer drawer-end relative min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Dashboard", link: "/dashboard" }]}>
          <main className="static flex flex-col items-center justify-center px-4 py-8 sm:px-14 lg:pl-20 sm:py-16">
            <div className="w-full lg:flex lg:gap-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">Project Judging</h1>
                {/* Table selection */}
                <div className="mb-4">
                  <label className="label">
                    <span>Select your table:</span>
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
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Project judging form */}
                  {!nextProject && (
                    /* Placeholder for no projects */

                    <div className="flex-1 rounded-md h-fit p-3 sm:p-6 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
                      <h1>No projects available</h1>
                      <p className="text-neutral-500">
                        There are no more projects available for judging at this
                        time.
                      </p>
                    </div>
                  )}
                  {nextProject && selectedTable && (
                    <div className="flex-1 rounded-md h-fit p-3 sm:p-6 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
                      <div
                        className={`${isProjectLoading ? "opacity-50" : ""}`}
                      >
                        <div className="card bg-base-200">
                          <div className="card-body p-4 sm:p-8">
                            <div>
                              <div className="text-sm font-semibold text-neutral-500">
                                Project Name
                              </div>
                              <h2 className="card-title text-2xl">
                                {nextProject.name}
                              </h2>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-neutral-500">
                                Project Link
                              </div>
                              <a
                                href={nextProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link break-all"
                              >
                                {nextProject.link || "No link available"}
                              </a>
                            </div>
                            <div className="">
                              <div className="text-sm font-semibold text-neutral-500">
                                Project Description
                              </div>
                              <p className="text-base line-clamp-3 text-neutral-700 dark:text-neutral-300">
                                {nextProject.description ||
                                  "No description available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rest of the form */}
                        {allQuestions && allQuestions.length > 0 ? (
                          <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Track-specific questions */}
                            {rubricQuestions &&
                              rubricQuestions.length > 0 &&
                              tables
                                ?.find((t) => t.id === selectedTable?.value)
                                ?.track.name.toLowerCase() !== "general" && (
                                <QuestionSection
                                  title={`${
                                    tables?.find(
                                      (t) => t.id === selectedTable?.value,
                                    )?.track.name
                                  } Track Questions`}
                                  questions={rubricQuestions}
                                  control={control}
                                />
                              )}

                            {/* General questions */}
                            {(tables
                              ?.find((t) => t.id === selectedTable?.value)
                              ?.track.name.toLowerCase() === "general"
                              ? rubricQuestions
                              : generalQuestions) && (
                              <QuestionSection
                                title={
                                  tables
                                    ?.find((t) => t.id === selectedTable?.value)
                                    ?.track.name.toLowerCase() === "general"
                                    ? "General Track Questions"
                                    : "General Questions"
                                }
                                questions={
                                  tables
                                    ?.find((t) => t.id === selectedTable?.value)
                                    ?.track.name.toLowerCase() === "general"
                                    ? rubricQuestions
                                    : generalQuestions
                                }
                                control={control}
                              />
                            )}

                            <button
                              type="submit"
                              className="btn btn-primary mt-8"
                            >
                              {tableProjects?.find(
                                (t) => t.id === selectedProjectId,
                              )?.isJudged
                                ? "Update Judgment"
                                : "Submit Judgement"}
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

                  {/* Projects list */}
                  {selectedTable && (
                    <div className="lg:w-80 h-fit rounded-md border dark:border-neutral-700 divide-y dark:divide-neutral-700 bg-white dark:bg-neutral-800">
                      {tableProjects?.map((project, index) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            if (project.id !== nextProject?.id) {
                              setSelectedProjectId(project.id);
                            }
                          }}
                          className={`w-full p-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors
                            ${index === 0 ? "rounded-t-md" : ""}
                            ${
                              index === tableProjects.length - 1
                                ? "rounded-b-md"
                                : ""
                            }
                            ${
                              project.id === nextProject?.id
                                ? "bg-neutral-100 dark:bg-neutral-900"
                                : ""
                            }`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span>{project.name}</span>
                              {project.isJudged && (
                                <div className="badge badge-success">
                                  Judged
                                </div>
                              )}
                            </div>
                            {project.TimeSlot?.[0] && (
                              <div className="text-sm text-neutral-500">
                                {formatTime(project.TimeSlot[0].startTime)} -{" "}
                                {formatTime(project.TimeSlot[0].endTime)}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </Drawer>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN, Role.JUDGE],
    undefined,
    output,
  );
  return output;
};

export default Judging;
