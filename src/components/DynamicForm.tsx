import * as React from "react";
import {
  useForm,
  SubmitHandler,
  Controller,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "./Input";
import CustomSelect from "./CustomSelect";
import { Checkbox } from "./Checkbox";
import { Button } from "./Button";
import FormDivider from "./FormDivider";
import {
  ApplicationField,
  ApplicationSchema,
  FieldType,
  FormData,
  SelectOption,
} from "../types/application";

interface DynamicFormProps {
  schema: ApplicationSchema;
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => Promise<void> | void;
  submitLabel?: string;
  showSubmitButton?: boolean;
  fileUploadConfig?: {
    getUploadUrl: (filename: string, contentType: string) => Promise<string>;
    objectId: string;
  };
}

// Custom textarea component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  optional?: boolean;
  value?: string;
}

const FormTextArea: React.FC<TextAreaProps> = ({
  label,
  id,
  error,
  optional,
  value,
  ...props
}) => {
  const wordLength = value?.trim()?.split(/\s/g).length ?? 0;
  const currentLength = value?.trim()?.length ?? 0;

  return (
    <div className="flex flex-col flex-1 gap-2 pb-4">
      <label className="text-black dark:text-white" htmlFor={id}>
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
        <div
          className={
            "pt-4 flex justify-between items-center " +
            (wordLength > 150
              ? "text-red-500"
              : "text-neutral-500 dark:text-neutral-400")
          }
        >
          {151 - wordLength - (currentLength > 0 ? 1 : 0)} words left
          {error && <span className="text-error text-sm">{error}</span>}
        </div>
      </label>
      <textarea
        className="text-black rounded-lg textarea textarea-bordered border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        id={id}
        placeholder="Type here..."
        value={value}
        {...props}
      />
    </div>
  );
};

// Checkbox component
interface FormCheckboxProps {
  field: ApplicationField;
  error?: string;
  register: UseFormRegister<FormData>;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  field,
  error,
  register,
}) => {
  return (
    <div className="flex items-center justify-between w-full gap-2 pt-4 md:flex-row-reverse md:justify-end">
      <div className="flex flex-col gap-1">
        <label className="text-black dark:text-white" htmlFor={field.id}>
          {field.link ? (
            <a
              className="underline"
              href={field.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {field.label}
            </a>
          ) : (
            field.label
          )}
          {field.validation?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <span className="text-error text-sm h-6 block pt-2">{error || ""}</span>
      </div>
      <input
        className="p-2 bg-white rounded-sm checkbox-primary checkbox checkbox-lg dark:bg-neutral-800"
        type="checkbox"
        id={field.id}
        {...register(field.id)}
      />
    </div>
  );
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  initialData = {},
  onSubmit,
  submitLabel = "Submit",
  showSubmitButton = true,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData,
  });

  const watchFields = watch();

  // Sort fields by order
  const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);

  // Group fields by section
  const fieldsBySection = sortedFields.reduce(
    (acc, field) => {
      const sectionIndex =
        schema.sections?.findIndex((s) => s.fieldIds.includes(field.id)) ?? 0;
      const sectionTitle = schema.sections?.[sectionIndex]?.title || "General";

      if (!acc[sectionTitle]) {
        acc[sectionTitle] = [];
      }
      acc[sectionTitle].push(field);
      return acc;
    },
    {} as Record<string, ApplicationField[]>,
  );

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col pb-8 mx-auto"
    >
      {Object.entries(fieldsBySection).map(([sectionTitle, fields]) => (
        <React.Fragment key={sectionTitle}>
          {sectionTitle !== "General" && <FormDivider label={sectionTitle} />}

          <div className="flex flex-col w-full lg:flex-row lg:gap-4">
            {fields.map((field) => {
              // Check conditional display
              if (field.conditionalDisplay) {
                const conditionValue =
                  watchFields[field.conditionalDisplay.fieldId];
                const expectedValue = field.conditionalDisplay.value;
                const shouldShow = Array.isArray(expectedValue)
                  ? expectedValue.includes(conditionValue)
                  : conditionValue === expectedValue;

                if (!shouldShow) return null;
              }

              const error = errors[field.id]?.message;
              const fieldValue = watchFields[field.id];

              switch (field.type) {
                case FieldType.TEXT:
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col flex-1 gap-2 pb-4"
                    >
                      <label
                        className="text-black dark:text-white"
                        htmlFor={field.id}
                      >
                        {field.label}
                        {field.validation?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <Input
                        type="text"
                        id={field.id}
                        placeholder={field.placeholder}
                        {...register(field.id)}
                      />
                      {field.description && (
                        <p className="text-sm text-neutral-500">
                          {field.description}
                        </p>
                      )}
                      {error && (
                        <span className="text-error text-sm">{error}</span>
                      )}
                    </div>
                  );

                case FieldType.NUMBER:
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col flex-1 gap-2 pb-4"
                    >
                      <label
                        className="text-black dark:text-white"
                        htmlFor={field.id}
                      >
                        {field.label}
                        {field.validation?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <Input
                        type="number"
                        id={field.id}
                        placeholder={field.placeholder}
                        min={field.validation?.min}
                        max={field.validation?.max}
                        {...register(field.id, {
                          valueAsNumber: true,
                        })}
                        onWheel={(e: React.WheelEvent<HTMLInputElement>) =>
                          e.preventDefault()
                        }
                      />
                      {field.description && (
                        <p className="text-sm text-neutral-500">
                          {field.description}
                        </p>
                      )}
                      {error && (
                        <span className="text-error text-sm">{error}</span>
                      )}
                    </div>
                  );

                case FieldType.DATE:
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col flex-1 gap-2 pb-4"
                    >
                      <label
                        className="text-black dark:text-white"
                        htmlFor={field.id}
                      >
                        {field.label}
                        {field.validation?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <Input
                        type="date"
                        id={field.id}
                        placeholder={field.placeholder}
                        {...register(field.id)}
                      />
                      {field.description && (
                        <p className="text-sm text-neutral-500">
                          {field.description}
                        </p>
                      )}
                      {error && (
                        <span className="text-error text-sm">{error}</span>
                      )}
                    </div>
                  );

                case FieldType.TEXTAREA:
                  return (
                    <div key={field.id} className="w-full">
                      <FormTextArea
                        label={field.label}
                        id={field.id}
                        error={error}
                        optional={!field.validation?.required}
                        value={(fieldValue as string) || ""}
                        placeholder={field.placeholder}
                        {...register(field.id)}
                      />
                    </div>
                  );

                case FieldType.SELECT:
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 pb-4 w-full"
                    >
                      <div className="flex justify-between items-center">
                        <label
                          className="text-black dark:text-white"
                          htmlFor={`${field.id}-select`}
                        >
                          {field.label}
                          {field.validation?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {error && (
                          <span className="text-error text-sm">{error}</span>
                        )}
                      </div>
                      <Controller
                        name={field.id}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CustomSelect
                            options={field.options || []}
                            onChange={(val: any) => onChange(val?.value)}
                            value={field.options?.find(
                              (opt) => opt.value === value,
                            )}
                            isMulti={false}
                          />
                        )}
                      />
                    </div>
                  );

                case FieldType.MULTI_SELECT:
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 pb-4 w-full"
                    >
                      <div className="flex justify-between items-center">
                        <label
                          className="text-black dark:text-white"
                          htmlFor={`${field.id}-multiselect`}
                        >
                          {field.label}
                          {field.validation?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {error && (
                          <span className="text-error text-sm">{error}</span>
                        )}
                      </div>
                      <Controller
                        name={field.id}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CustomSelect
                            options={field.options || []}
                            onChange={(val: any) =>
                              onChange(val?.map((v: any) => v.value))
                            }
                            value={field.options?.filter((opt) =>
                              (value as string[])?.includes(opt.value),
                            )}
                            isMulti={true}
                          />
                        )}
                      />
                    </div>
                  );

                case FieldType.CHECKBOX:
                  return (
                    <div key={field.id} className="w-full">
                      <FormCheckbox
                        field={field}
                        error={error}
                        register={register}
                      />
                    </div>
                  );

                case FieldType.FILE:
                  return (
                    <div key={field.id} className="w-full">
                      <div className="flex flex-col flex-1 gap-2 pb-4">
                        <label
                          className="text-black dark:text-white"
                          htmlFor={field.id}
                        >
                          {field.label}
                          {field.validation?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <div className="text-sm text-neutral-500">
                          File upload requires additional configuration
                        </div>
                        {error && (
                          <span className="text-error text-sm">{error}</span>
                        )}
                      </div>
                    </div>
                  );

                default:
                  console.warn(`Unknown field type: ${field.type}`);
                  return null;
              }
            })}
          </div>
        </React.Fragment>
      ))}

      {showSubmitButton && onSubmit && (
        <Button type="submit" className="mt-4 mb-4">
          {submitLabel}
        </Button>
      )}
    </form>
  );
};

export default DynamicForm;

// Export types for external use
export type { DynamicFormProps, FormCheckboxProps, TextAreaProps };
