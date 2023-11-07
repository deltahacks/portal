import { UseFormRegister } from "react-hook-form";

import { InputsType } from "../pages/apply";

interface FormTextInputProps {
  register: UseFormRegister<InputsType>;
  question: string;
  inputType: any; //please someone fix this if they know how
}

const FormTextInput: React.FC<FormTextInputProps> = ({
  register,
  question,
  inputType,
}) => {
  return (
    <>
      <label className="label">
        <span className="label-text">{question}</span>
      </label>
      <input
        {...register(inputType)}
        className="input input-bordered w-full max-w-xs"
        placeholder="John Doe"
      />
    </>
  );
};

export default FormTextInput;
