import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import Head from "next/head";
import { trpc } from "../../../utils/trpc";
import { useForm, Controller } from "react-hook-form";
import Drawer from "../../../components/Drawer";
import { rbac } from "../../../components/RBACWrapper";
import { Role } from "@prisma/client";
import Select from "react-select";
import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic<any>(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

type RubricFormData = {
  question: string;
  points: number;
  trackId: string;
  title: string;
};

const JSONUploader: React.FC = () => {
  const importRubricMutation = trpc.judging.importRubricQuestions.useMutation();

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          importRubricMutation.mutate({ questions: json });
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    },
    [importRubricMutation],
  );

  return (
    <div className="card bg-base-200 shadow-xl mb-8">
      <div className="card-body">
        <h2 className="card-title">Import Rubric Questions</h2>
        <div className="form-control">
          <label className="label">
            <span>Upload JSON file</span>
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
            disabled={importRubricMutation.isPending}
          />
        </div>
        {importRubricMutation.isPending && (
          <div className="text-info">Importing questions...</div>
        )}
        {importRubricMutation.isSuccess && (
          <div className="text-success">
            Successfully imported {importRubricMutation.data?.count} questions!
          </div>
        )}
        {importRubricMutation.isError && (
          <div className="text-error">
            Error: {importRubricMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
};

const RubricPage: NextPage = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const { register, handleSubmit, reset, control, setValue } =
    useForm<RubricFormData>();

  const { data: tracks } = trpc.track.getTracks.useQuery();
  const { data: rubricQuestions, refetch: refetchQuestions } =
    trpc.judging.getRubricQuestions.useQuery(
      { trackId: selectedTrack || "" },
      { enabled: !!selectedTrack },
    );

  const createQuestion = trpc.judging.createRubricQuestion.useMutation({
    onSuccess: () => {
      reset();
      reset({ trackId: selectedTrack || "" });
      refetchQuestions();
    },
  });

  const onSubmit = (data: RubricFormData) => {
    createQuestion.mutate(data);
  };

  const trackOptions =
    tracks?.map((track) => ({
      value: track.id,
      label: track.name,
    })) || [];

  const [markdownValue, setMarkdownValue] = useState("");
  const questionDialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  return (
    <>
      <Head>
        <title>Rubric Management - DeltaHacks XI</title>
      </Head>

      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Judging", link: "/judging" }]}>
          <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-8">Rubric Management</h1>

            <JSONUploader />

            <div className="grid gap-8 md:grid-cols-3">
              {/* Create New Question Form */}
              <div className="card bg-base-200 shadow-xl md:col-span-2">
                <div className="card-body">
                  <h2 className="card-title">Create New Question</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="text-black dark:text-white">
                          Track
                        </span>
                      </label>
                      <Controller
                        name="trackId"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            options={trackOptions}
                            onChange={(option) => {
                              field.onChange(option?.value);
                              setSelectedTrack(option?.value || null);
                            }}
                            classNames={{
                              control: () =>
                                "text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500",
                              menu: () => "bg-base-100 dark:bg-neutral-800",
                              option: (state) =>
                                `hover:bg-base-200 dark:hover:bg-neutral-700 ${
                                  state.isFocused
                                    ? "bg-base-200 dark:bg-neutral-700"
                                    : ""
                                }`,
                              singleValue: () => "text-black dark:text-white",
                            }}
                            styles={{
                              input: (base) => ({
                                ...base,
                                color: "inherit",
                              }),
                              menuList: (base) => ({
                                ...base,
                                padding: 0,
                              }),
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span>Title</span>
                      </label>
                      <input
                        type="text"
                        {...register("title", { required: true })}
                        className="input input-bordered"
                        placeholder="Enter a brief title for the question"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span>Question</span>
                      </label>
                      <div data-color-mode="dark">
                        <MDEditor
                          value={markdownValue}
                          onChange={(val: string | undefined) => {
                            setMarkdownValue(val || "");
                            setValue("question", val || "");
                          }}
                          preview="edit"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span>Points</span>
                      </label>
                      <input
                        type="number"
                        {...register("points", {
                          required: true,
                          min: 0,
                          max: 100,
                          valueAsNumber: true,
                        })}
                        className="input input-bordered"
                        min={0}
                        max={100}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={createQuestion.isPending}
                    >
                      {createQuestion.isPending
                        ? "Creating..."
                        : "Create Question"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Existing Questions List */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Existing Questions</h2>
                  {selectedTrack ? (
                    rubricQuestions && rubricQuestions.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {rubricQuestions.map((question) => (
                          <div
                            key={question.id}
                            className="p-4 bg-base-100 rounded-lg cursor-pointer hover:bg-base-300"
                            onClick={() => {
                              setSelectedQuestion(question);
                              questionDialogRef.current?.showModal();
                            }}
                          >
                            <h3 className="font-bold">{question.title}</h3>
                            <p className="text-sm text-gray-500">
                              Points: {question.points}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No questions created for this track yet.
                      </p>
                    )
                  ) : (
                    <p className="text-gray-500">
                      Select a track to view its questions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </Drawer>
      </div>

      {/* Question Details Modal */}
      <dialog
        className="modal modal-bottom sm:modal-middle"
        ref={questionDialogRef}
      >
        <div className="modal-box dark:bg-[#1F1F1F]">
          <h3 className="text-lg font-bold dark:text-white">
            {selectedQuestion?.title}
          </h3>
          <div className="py-4">
            <p className="font-semibold mb-2">Question:</p>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{selectedQuestion?.question || ""}</ReactMarkdown>
            </div>
            <p className="mt-4">
              <span className="font-semibold">Points:</span>{" "}
              {selectedQuestion?.points}
            </p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary dark:text-white border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output,
  );
  return output;
}

export default RubricPage;
