interface FormDividerProps {
  label: string;
}

const FormDivider: React.FC<FormDividerProps> = ({ label }) => {
  return (
    <span className="my-4 border-b-2 border-neutral-700  pb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-400">
      {label}
    </span>
  );
};

export default FormDivider;
