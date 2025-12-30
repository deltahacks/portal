import { useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useForm, useFieldArray } from "react-hook-form";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import Drawer from "../../components/Drawer";
import { rbac } from "../../components/RBACWrapper";
import { Role } from "@prisma/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { DynamicGrading } from "../../components/DynamicGrading";

interface CriterionForm {
  id?: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
  order: number;
}

interface RubricForm {
  name: string;
  description: string;
  dhYear: string;
  criteria: CriterionForm[];
}

const RubricEditor: NextPage = () => {
  const [selectedRubricId, setSelectedRubricId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { register, control, handleSubmit, reset, watch, setValue } =
    useForm<RubricForm>({
      defaultValues: {
        name: "",
        description: "",
        dhYear: "DH12",
        criteria: [],
      },
    });

  const {
    fields: criteriaFields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: "criteria",
  });

  // Fetch rubrics (tracks with rubric questions)
  const { data: rubrics, refetch: refetchRubrics } =
    trpc.rubric.getRubrics.useQuery();

  // Fetch selected rubric details
  const { data: selectedRubric, refetch: refetchSelectedRubric } =
    trpc.rubric.getRubric.useQuery(
      { trackId: selectedRubricId || "" },
      { enabled: !!selectedRubricId },
    );

  // Track operations
  const createRubricMutation = trpc.rubric.createRubric.useMutation({
    onSuccess: () => {
      refetchRubrics();
      reset();
    },
  });

  const updateRubricMutation = trpc.rubric.updateRubric.useMutation({
    onSuccess: () => {
      refetchRubrics();
      refetchSelectedRubric();
      setIsEditing(false);
    },
  });

  const manageCriteriaMutation = trpc.rubric.manageCriteria.useMutation({
    onSuccess: () => {
      refetchSelectedRubric();
      if (selectedRubricId) {
        refetchRubrics();
      }
    },
  });

  const deleteRubricMutation = trpc.rubric.deleteRubric.useMutation({
    onSuccess: () => {
      refetchRubrics();
      setSelectedRubricId(null);
    },
  });

  // Form submission
  const onSubmit = (data: RubricForm) => {
    if (selectedRubricId && isEditing) {
      // Update existing rubric
      updateRubricMutation.mutate({
        trackId: selectedRubricId,
        name: data.name,
        description: data.description,
      });
    } else {
      // Create new rubric (track)
      createRubricMutation.mutate({
        name: data.name,
        description: data.description,
        dhYear: data.dhYear,
      });
    }
  };

  // Handle criterion operations
  const handleAddCriterion = () => {
    append({
      name: "",
      description: "",
      maxScore: 10,
      weight: 1.0,
      order: criteriaFields.length,
    });
  };

  const handleRemoveCriterion = (index: number) => {
    remove(index);
  };

  const handleMoveCriterion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < criteriaFields.length) {
      move(index, newIndex);
    }
  };

  const handleSaveCriteria = () => {
    if (!selectedRubricId) return;

    const currentCriteria = watch("criteria");

    currentCriteria.forEach((criterion, index) => {
      if (criterion.id) {
        // Update existing criterion
        manageCriteriaMutation.mutate({
          trackId: selectedRubricId,
          action: "update",
          criterion: {
            id: criterion.id,
            name: criterion.name,
            description: criterion.description,
            maxScore: criterion.maxScore,
            weight: criterion.weight,
            order: index,
          },
        });
      } else {
        // Create new criterion
        manageCriteriaMutation.mutate({
          trackId: selectedRubricId,
          action: "create",
          criterion: {
            name: criterion.name,
            description: criterion.description,
            maxScore: criterion.maxScore,
            weight: criterion.weight,
            order: index,
          },
        });
      }
    });
  };

  const handleEditRubric = (rubricId: string) => {
    const rubric = rubrics?.find((r) => r.id === rubricId);
    if (rubric) {
      setValue("name", rubric.name);
      setValue("description", rubric.description || "");
      setSelectedRubricId(rubricId);
      setIsEditing(true);
    }
  };

  const handleDeleteRubric = (rubricId: string) => {
    if (confirm("Are you sure you want to delete this rubric?")) {
      deleteRubricMutation.mutate({ trackId: rubricId });
    }
  };

  const handleSelectRubric = (rubricId: string) => {
    setSelectedRubricId(rubricId);
    setIsEditing(false);
    refetchSelectedRubric();
  };

  const handleNewRubric = () => {
    setSelectedRubricId(null);
    setIsEditing(false);
    reset({
      name: "",
      description: "",
      dhYear: "DH12",
      criteria: [],
    });
  };

  // Calculate preview data
  const previewRubric = {
    id: selectedRubricId || "preview",
    name: watch("name") || "New Rubric",
    description: watch("description") || "",
    criteria: watch("criteria").map((criterion, index) => ({
      id: `temp-${index}`,
      name: criterion.name || "Untitled Criterion",
      description: criterion.description || "",
      maxScore: criterion.maxScore || 10,
      weight: criterion.weight || 1.0,
      order: index,
    })),
  };

  return (
    <>
      <Head>
        <title>Rubric Editor - DeltaHacks</title>
      </Head>

      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Admin", link: "/admin" },
        ]}
      >
        <main className="px-14 py-16">
          <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
            Rubric Editor
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Rubric List */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">Rubrics</h2>
                  <Button onClick={handleNewRubric} size="sm">
                    New Rubric
                  </Button>
                </div>

                <div className="space-y-4 mt-4">
                  {rubrics?.map((rubric) => (
                    <div
                      key={rubric.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedRubricId === rubric.id
                          ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                          : "bg-base-100 hover:bg-base-300"
                      }`}
                      onClick={() => handleSelectRubric(rubric.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{rubric.name}</h3>
                          <p className="text-sm text-gray-500">
                            {rubric.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {rubric.criteriaCount} criteria
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRubric(rubric.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRubric(rubric.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {rubrics?.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No rubrics created yet. Create your first rubric!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Editor/Preview Area */}
            <div className="space-y-6">
              {/* Rubric Metadata Form */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    {isEditing ? "Edit Rubric" : "Create New Rubric"}
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Rubric Name</span>
                      </label>
                      <input
                        type="text"
                        {...register("name", { required: true })}
                        className="input input-bordered"
                        placeholder="Enter rubric name"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        {...register("description")}
                        className="textarea textarea-bordered"
                        placeholder="Enter rubric description"
                        rows={3}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">DH Year</span>
                      </label>
                      <input
                        type="text"
                        {...register("dhYear")}
                        className="input input-bordered"
                        placeholder="DH12"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createRubricMutation.isPending}
                      >
                        {createRubricMutation.isPending
                          ? "Saving..."
                          : isEditing
                            ? "Update Rubric"
                            : "Create Rubric"}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            reset();
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Criterion Builder */}
              {selectedRubricId && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <h2 className="card-title">Criterion Builder</h2>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewMode(!previewMode)}
                        >
                          {previewMode ? "Edit Mode" : "Preview Mode"}
                        </Button>
                      </div>
                    </div>

                    {previewMode ? (
                      // Preview Mode
                      <DynamicGrading
                        rubric={previewRubric}
                        application={{
                          id: "preview-app",
                          firstName: "Preview",
                          lastName: "Applicant",
                        }}
                        onSubmit={(grades, totalScore, comments) => {
                          console.log("Preview submit:", {
                            grades,
                            totalScore,
                            comments,
                          });
                        }}
                        readOnly={false}
                      />
                    ) : (
                      // Edit Mode
                      <>
                        <div className="space-y-4 mt-4">
                          {criteriaFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="p-4 bg-base-100 rounded-lg"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <span className="font-bold">
                                  Criterion {index + 1}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleMoveCriterion(index, "up")
                                    }
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleMoveCriterion(index, "down")
                                    }
                                    disabled={
                                      index === criteriaFields.length - 1
                                    }
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveCriterion(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>

                              <div className="grid gap-3">
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text">Name</span>
                                  </label>
                                  <input
                                    type="text"
                                    {...register(`criteria.${index}.name`)}
                                    className="input input-bordered"
                                    placeholder="Criterion name"
                                  />
                                </div>

                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text">
                                      Description
                                    </span>
                                  </label>
                                  <textarea
                                    {...register(
                                      `criteria.${index}.description`,
                                    )}
                                    className="textarea textarea-bordered"
                                    placeholder="Criterion description/prompt"
                                    rows={2}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="form-control">
                                    <label className="label">
                                      <span className="label-text">
                                        Max Score
                                      </span>
                                    </label>
                                    <input
                                      type="number"
                                      {...register(
                                        `criteria.${index}.maxScore`,
                                        {
                                          valueAsNumber: true,
                                          min: 1,
                                        },
                                      )}
                                      className="input input-bordered"
                                      min="1"
                                    />
                                  </div>

                                  <div className="form-control">
                                    <label className="label">
                                      <span className="label-text">Weight</span>
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      {...register(`criteria.${index}.weight`, {
                                        valueAsNumber: true,
                                        min: 0.1,
                                      })}
                                      className="input input-bordered"
                                      step="0.1"
                                      min="0.1"
                                    />
                                  </div>

                                  <div className="form-control">
                                    <label className="label">
                                      <span className="label-text">Order</span>
                                    </label>
                                    <input
                                      type="number"
                                      {...register(`criteria.${index}.order`, {
                                        valueAsNumber: true,
                                      })}
                                      className="input input-bordered"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button onClick={handleAddCriterion}>
                            Add Criterion
                          </Button>
                          <Button
                            onClick={handleSaveCriteria}
                            variant="secondary"
                            disabled={manageCriteriaMutation.isPending}
                          >
                            {manageCriteriaMutation.isPending
                              ? "Saving..."
                              : "Save Criteria"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </Drawer>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: Record<string, unknown> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output,
  );
  return { props: {} };
}

export default RubricEditor;
