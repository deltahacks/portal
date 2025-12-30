import React, { useState } from "react";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import { trpc } from "../../utils/trpc";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Role } from "@prisma/client";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Checkbox } from "../../components/Checkbox";
import Link from "next/link";

// Field types available
const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown Select" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
];

// DH Years for selection
const DH_YEARS = Array.from({ length: 5 }, (_, i) => `DH${12 + i}`);

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  order: number;
}

interface SchemaMetadata {
  name: string;
  dhYear: string;
  description: string;
  published: boolean;
}

const SchemaEditor: React.FC = () => {
  // State for schema list view
  const [view, setView] = useState<"list" | "edit" | "preview">("list");
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // State for schema editor
  const [metadata, setMetadata] = useState<SchemaMetadata>({
    name: "",
    dhYear: "DH12",
    description: "",
    published: false,
  });
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null,
  );
  const [showFieldConfig, setShowFieldConfig] = useState(false);

  // tRPC mutations and queries
  const utils = trpc.useUtils();
  const { data: schemas, isLoading: loadingSchemas } =
    trpc.applicationSchema.getAll.useQuery();
  const createMutation = trpc.applicationSchema.create.useMutation({
    onSuccess: () => {
      utils.applicationSchema.getAll.invalidate();
      setView("list");
      resetEditor();
    },
  });
  const updateMutation = trpc.applicationSchema.update.useMutation({
    onSuccess: () => {
      utils.applicationSchema.getAll.invalidate();
      setView("list");
      resetEditor();
    },
  });
  const deleteMutation = trpc.applicationSchema.delete.useMutation({
    onSuccess: () => {
      utils.applicationSchema.getAll.invalidate();
    },
  });
  const duplicateMutation = trpc.applicationSchema.duplicate.useMutation({
    onSuccess: () => {
      utils.applicationSchema.getAll.invalidate();
    },
  });

  // Query for editing existing schema
  const { data: editSchema } = trpc.applicationSchema.getById.useQuery(
    { id: selectedSchemaId! },
    { enabled: !!selectedSchemaId && view === "edit" },
  );

  // Reset editor state
  const resetEditor = () => {
    setMetadata({
      name: "",
      dhYear: "DH12",
      description: "",
      published: false,
    });
    setFields([]);
    setSelectedFieldIndex(null);
    setSelectedSchemaId(null);
    setIsCreating(false);
  };

  // Load schema data for editing
  React.useEffect(() => {
    if (editSchema) {
      setMetadata({
        name: editSchema.name,
        dhYear: editSchema.dhYear,
        description: editSchema.description || "",
        published: editSchema.published,
      });
      setFields(
        editSchema.fields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder || undefined,
          helpText: field.helpText || undefined,
          options: field.options,
          validation: field.validation as Field["validation"],
          order: field.order,
        })),
      );
    }
  }, [editSchema]);

  // Field management functions
  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length);
    setShowFieldConfig(true);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    // Reorder fields
    updatedFields.forEach((field, i) => {
      field.order = i;
    });
    setFields(updatedFields);
    setSelectedFieldIndex(null);
    setShowFieldConfig(false);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }

    const updatedFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap fields
    [updatedFields[index], updatedFields[targetIndex]] = [
      updatedFields[targetIndex],
      updatedFields[index],
    ];

    // Update orders
    updatedFields[index].order = index;
    updatedFields[targetIndex].order = targetIndex;

    setFields(updatedFields);
    setSelectedFieldIndex(targetIndex);
  };

  // Save schema
  const handleSave = () => {
    if (!metadata.name || !metadata.dhYear || fields.length === 0) {
      alert("Please fill in all required fields and add at least one field.");
      return;
    }

    const schemaData = {
      ...metadata,
      fields: fields.map((field) => ({
        ...field,
        options: field.options || [],
        validation: field.validation || {},
      })),
    };

    if (isCreating) {
      createMutation.mutate(schemaData);
    } else if (selectedSchemaId) {
      updateMutation.mutate({ id: selectedSchemaId, data: schemaData });
    }
  };

  // Handle edit click
  const handleEdit = (schemaId: string) => {
    setSelectedSchemaId(schemaId);
    setIsCreating(false);
    setView("edit");
  };

  // Handle create new
  const handleCreate = () => {
    resetEditor();
    setIsCreating(true);
    setView("edit");
  };

  // Handle delete
  const handleDelete = (schemaId: string) => {
    if (confirm("Are you sure you want to delete this schema?")) {
      deleteMutation.mutate({ id: schemaId });
    }
  };

  // Handle duplicate
  const handleDuplicate = (schemaId: string) => {
    duplicateMutation.mutate({ id: schemaId });
  };

  // Render schema list view
  const renderSchemaList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Application Schemas</h2>
        <Button onClick={handleCreate} variant="default">
          Create New Schema
        </Button>
      </div>

      {loadingSchemas ? (
        <div className="text-center py-8">Loading schemas...</div>
      ) : schemas && schemas.length > 0 ? (
        <div className="grid gap-4">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="card-title">{schema.name}</h3>
                    <p className="text-sm text-gray-500">
                      {schema.dhYear} • {schema._count.fields} fields
                      {schema.published && (
                        <span className="badge badge-success ml-2">
                          Published
                        </span>
                      )}
                    </p>
                    {schema.description && (
                      <p className="mt-2">{schema.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(schema.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSchemaId(schema.id);
                        setView("preview");
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(schema.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(schema.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No application schemas found.</p>
          <Button onClick={handleCreate} variant="default">
            Create Your First Schema
          </Button>
        </div>
      )}
    </div>
  );

  // Render field configuration panel
  const renderFieldConfig = () => {
    if (selectedFieldIndex === null || !fields[selectedFieldIndex]) {
      return (
        <div className="text-center py-8 text-gray-500">
          Select a field to configure
        </div>
      );
    }

    const field = fields[selectedFieldIndex];
    const isSelectField =
      field.type === "select" || field.type === "multiselect";

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Field Configuration</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFieldConfig(false)}
          >
            Close
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Field Label</span>
            </label>
            <Input
              value={field.label}
              onChange={(e) =>
                updateField(selectedFieldIndex, { label: e.target.value })
              }
              placeholder="Enter field label"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Field Type</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={field.type}
              onChange={(e) =>
                updateField(selectedFieldIndex, { type: e.target.value })
              }
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Required Field</span>
              <Checkbox
                checked={field.required}
                onCheckedChange={(checked) =>
                  updateField(selectedFieldIndex, { required: !!checked })
                }
              />
            </label>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Placeholder Text</span>
            </label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) =>
                updateField(selectedFieldIndex, { placeholder: e.target.value })
              }
              placeholder="Enter placeholder text"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Help Text</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={field.helpText || ""}
              onChange={(e) =>
                updateField(selectedFieldIndex, { helpText: e.target.value })
              }
              placeholder="Enter help text for applicants"
              rows={2}
            />
          </div>

          {isSelectField && (
            <div>
              <label className="label">
                <span className="label-text">Options (one per line)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={field.options?.join("\n") || ""}
                onChange={(e) =>
                  updateField(selectedFieldIndex, {
                    options: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="Enter options, one per line"
                rows={4}
              />
            </div>
          )}

          {(field.type === "text" || field.type === "textarea") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Min Length</span>
                </label>
                <Input
                  type="number"
                  value={field.validation?.minLength || ""}
                  onChange={(e) =>
                    updateField(selectedFieldIndex, {
                      validation: {
                        ...field.validation,
                        minLength: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Min characters"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Max Length</span>
                </label>
                <Input
                  type="number"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) =>
                    updateField(selectedFieldIndex, {
                      validation: {
                        ...field.validation,
                        maxLength: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Max characters"
                />
              </div>
            </div>
          )}

          {field.type === "number" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Minimum Value</span>
                </label>
                <Input
                  type="number"
                  value={field.validation?.min || ""}
                  onChange={(e) =>
                    updateField(selectedFieldIndex, {
                      validation: {
                        ...field.validation,
                        min: parseFloat(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Min value"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Maximum Value</span>
                </label>
                <Input
                  type="number"
                  value={field.validation?.max || ""}
                  onChange={(e) =>
                    updateField(selectedFieldIndex, {
                      validation: {
                        ...field.validation,
                        max: parseFloat(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="Max value"
                />
              </div>
            </div>
          )}

          <div className="divider"></div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => removeField(selectedFieldIndex)}
          >
            Remove Field
          </Button>
        </div>
      </div>
    );
  };

  // Render schema editor
  const renderSchemaEditor = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView("list")}>
            ← Back
          </Button>
          <h2 className="text-2xl font-bold">
            {isCreating ? "Create New Schema" : "Edit Schema"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView("preview")}>
            Preview
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : "Save Schema"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schema Metadata */}
        <div className="lg:col-span-3 card bg-base-200 p-6">
          <h3 className="font-semibold mb-4">Schema Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Schema Name *</span>
              </label>
              <Input
                value={metadata.name}
                onChange={(e) =>
                  setMetadata({ ...metadata, name: e.target.value })
                }
                placeholder="e.g., Hacker Application"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">DeltaHacks Year *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={metadata.dhYear}
                onChange={(e) =>
                  setMetadata({ ...metadata, dhYear: e.target.value })
                }
              >
                {DH_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={metadata.description}
                onChange={(e) =>
                  setMetadata({ ...metadata, description: e.target.value })
                }
                placeholder="Enter schema description"
                rows={2}
              />
            </div>
            <div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Published</span>
                  <Checkbox
                    checked={metadata.published}
                    onCheckedChange={(checked) =>
                      setMetadata({ ...metadata, published: !!checked })
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fields List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Form Fields</h3>
            <Button variant="default" size="sm" onClick={addField}>
              + Add Field
            </Button>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`card bg-base-200 cursor-pointer transition-all ${
                    selectedFieldIndex === index
                      ? "ring-2 ring-primary"
                      : "hover:bg-base-300"
                  }`}
                  onClick={() => {
                    setSelectedFieldIndex(index);
                    setShowFieldConfig(true);
                  }}
                >
                  <div className="card-body py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">
                          {index + 1}.
                        </span>
                        <div>
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-gray-500">
                            {FIELD_TYPES.find((t) => t.value === field.type)
                              ?.label || field.type}
                            {field.required && (
                              <span className="text-error ml-1">*</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, "up");
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === fields.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(index, "down");
                          }}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-base-300 rounded-lg">
              <p>No fields added yet.</p>
              <p className="text-sm">
                Click "Add Field" to start building your form.
              </p>
            </div>
          )}
        </div>

        {/* Field Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 p-4 sticky top-4">
            {showFieldConfig ? (
              renderFieldConfig()
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a field to configure
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render preview mode
  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView("edit")}>
            ← Back to Editor
          </Button>
          <h2 className="text-2xl font-bold">Form Preview</h2>
        </div>
      </div>

      <div className="card bg-base-200 max-w-2xl mx-auto">
        <div className="card-body">
          <h3 className="card-title justify-center">{metadata.name}</h3>
          {metadata.description && (
            <p className="text-center text-gray-500">{metadata.description}</p>
          )}
          <div className="divider"></div>

          <div className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="label">
                  <span className="label-text font-medium">
                    {field.label}
                    {field.required && (
                      <span className="text-error ml-1">*</span>
                    )}
                  </span>
                </label>

                {field.type === "text" && (
                  <Input
                    type="text"
                    placeholder={field.placeholder}
                    disabled
                    className="bg-base-100"
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    className="textarea textarea-bordered w-full bg-base-100"
                    placeholder={field.placeholder}
                    disabled
                    rows={3}
                  />
                )}

                {field.type === "number" && (
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    disabled
                    className="bg-base-100"
                  />
                )}

                {field.type === "email" && (
                  <Input
                    type="email"
                    placeholder={field.placeholder}
                    disabled
                    className="bg-base-100"
                  />
                )}

                {field.type === "phone" && (
                  <Input
                    type="tel"
                    placeholder={field.placeholder}
                    disabled
                    className="bg-base-100"
                  />
                )}

                {field.type === "url" && (
                  <Input
                    type="url"
                    placeholder={field.placeholder}
                    disabled
                    className="bg-base-100"
                  />
                )}

                {field.type === "date" && (
                  <Input type="date" disabled className="bg-base-100" />
                )}

                {field.type === "select" && (
                  <select
                    className="select select-bordered w-full bg-base-100"
                    disabled
                  >
                    <option value="">
                      {field.placeholder || "Select an option"}
                    </option>
                    {field.options?.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "multiselect" && (
                  <div className="space-y-2">
                    {field.options?.map((option, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          disabled
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "checkbox" && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      disabled
                    />
                    <span>{field.placeholder || "Yes"}</span>
                  </label>
                )}

                {field.helpText && (
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      {field.helpText}
                    </span>
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <Button className="w-full" disabled>
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Schema Editor - DeltaHacks Admin</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Application Schema Editor
          </h1>

          {view === "list" && renderSchemaList()}
          {view === "edit" && renderSchemaEditor()}
          {view === "preview" && renderPreview()}
        </main>
      </Drawer>
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

export default SchemaEditor;
