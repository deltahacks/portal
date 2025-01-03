import {
  useForm,
  SubmitHandler,
  Controller,
  FieldError,
  UseFormRegister,
  FieldValues,
  Path,
} from "react-hook-form";

import React from "react";

interface FormInputProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  errors: FieldError | undefined;
  optional?: boolean;
  register: UseFormRegister<T>;
  link?: string | undefined;
}

const FormInput = <T extends FieldValues>({
  label,
  id,
  errors,
  optional,
  register,
  ...props
}: FormInputProps<T> & React.HTMLProps<HTMLInputElement>) => {
  return (
    <div className="flex flex-col flex-1 gap-2 pb-4">
      <label className="text-black dark:text-white" htmlFor={id}>
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
      </label>
      <input
        className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        type="text"
        id={id}
        {...register(id)}
        {...props}
      />
      {errors && <span className="text-error">{errors.message}</span>}
    </div>
  );
};

export default FormInput;
