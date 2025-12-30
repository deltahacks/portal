// Field type enum for dynamic form
export enum FieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
  NUMBER = "NUMBER",
  FILE = "FILE",
}

// Select option type
export interface SelectOption {
  value: string;
  label: string;
}

// Validation rule type
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternError?: string;
}

// Application field definition
export interface ApplicationField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  options?: SelectOption[]; // For SELECT and MULTI_SELECT
  validation?: ValidationRule;
  order: number;
  link?: string; // For checkbox/link combinations
  conditionalDisplay?: {
    fieldId: string;
    value: string | boolean | string[];
  };
}

// Application schema definition
export interface ApplicationSchema {
  id: string;
  name: string;
  fields: ApplicationField[];
  sections?: {
    title: string;
    fieldIds: string[];
  }[];
}

// Form data type - maps field IDs to their values
export type FormData = Record<
  string,
  string | number | boolean | string[] | File | null | undefined
>;

// File upload data type
export interface FileUploadData {
  objectId: string;
  uploadUrl: string | null;
  currentValue: string | null | undefined;
}

// Form submit handler type
export type FormSubmitHandler = (data: FormData) => Promise<void> | void;

// Form state interface
export interface DynamicFormState {
  values: FormData;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}
