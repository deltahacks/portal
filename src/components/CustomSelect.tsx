import Select, {
  MultiValue,
  SingleValue,
  ActionMeta,
  ControlProps,
  GroupBase,
} from "react-select";

interface SelectChoice {
  value: string;
  label: string;
}
interface CustomSelectProps {
  options: SelectChoice[];
  onChange: (...events: any[]) => void;
  value?: SelectChoice[] | SelectChoice;
  isMulti?: boolean;
  defaultInputValue?: string;
}

// '((newValue: MultiValue<SelectChoice> | SingleValue<SelectChoice>, actionMeta: ActionMeta<SelectChoice>) => void) | undefined'.

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  onChange,
  value,
  isMulti,
}) => {
  return (
    <Select
      options={options}
      unstyled={true}
      onChange={onChange}
      value={value}
      isMulti={isMulti}
      // placeholder="Please select one"
      classNames={{
        control: (
          state: ControlProps<SelectChoice, boolean, GroupBase<SelectChoice>>,
        ) => {
          return state.menuIsOpen
            ? "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border"
            : "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border";
        },
        menu: () => {
          return "dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border -mt-1 rounded-b-lg overflow-hidden";
        },
        option: () => {
          return "p-2 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-900";
        },
        valueContainer: () => {
          return "dark:text-neutral-500 text-neutral-700 gap-2";
        },
        singleValue: () => {
          return "dark:text-white text-black";
        },
        multiValue: () => {
          return "dark:bg-white bg-neutral-700 dark:text-black text-white p-2 mr-2 rounded-md";
        },
        multiValueRemove: () => {
          return "ml-5";
        },
      }}
    />
  );
};

export default CustomSelect;
