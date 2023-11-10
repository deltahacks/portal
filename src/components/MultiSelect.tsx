import Select from "react-select";

const MultiSelect = (props: any) => {
  return (
    <Select
      defaultValue={props.options[0]}
      isMulti
      name="colors"
      options={props.options}
      unstyled={true}
      classNames={{
        control: (state) => {
          return state.menuIsOpen
            ? "dark:bg-neutral-800 bg-neutral-400 border-2 border-transparent rounded-md dark:border-[#333537] p-2 border-[#C5C6C9]"
            : "dark:bg-neutral-800 bg-neutral-400 border-2 border-transparent rounded-md p-2";
        },
        menu: () => {
          return "dark:bg-neutral-800 bg-neutral-400 border-2 border-transparent rounded-md mt-2";
        },
        option: () => {
          return "dark:bg-neutral-800 bg-neutral-400 dark:text-white text-neutral-700 border-2 border-transparent dark:hover:bg-[#333537] hover:bg-neutral-500 rounded-md p-2";
        },
        valueContainer: () => {
          return "dark:text-neutral-500 text-neutral-700";
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

export default MultiSelect;
