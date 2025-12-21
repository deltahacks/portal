import { GlobeIcon } from "lucide-react";
import React from "react";
// import { Github, Linkedin, Instagram, Globe } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

type FormValues = {
  socialText: string[];
};

interface SocialLinksFormInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<FormValues>;
  watch: UseFormWatch<any>;
}

const socialPlatforms = [
  { icon: FaGithub, placeholder: "GitHub URL" },
  { icon: FaLinkedin, placeholder: "LinkedIn URL" },
  { icon: FaInstagram, placeholder: "Instagram URL" },
  {
    icon: GlobeIcon,
    placeholder: "Personal Website URL",
  },
];

const SocialLinksFormInput: React.FC<SocialLinksFormInputProps> = ({
  register,
  errors,
  watch,
}) => {
  const socialText = watch("socialText") || ["", "", "", ""];

  const updateSocialLink = (index: number, value: string): string[] => {
    const newSocialLinks = [...socialText];
    newSocialLinks[index] = value;
    return newSocialLinks;
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <label className="text-black dark:text-white" htmlFor="socialTextInput">
        Social Media Links{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          (Optional)
        </span>
      </label>

      {socialPlatforms.map((platform, index) => (
        <div className="flex flex-row gap-4 items-center " key={index}>
          <platform.icon className="h-8 w-8" />
          <input
            type="url"
            placeholder={platform.placeholder}
            {...register(`socialText.${index}` as const, {
              validate: (value: string) =>
                !value ||
                /^https?:\/\//.test(value) ||
                "Please enter a valid URL",
            })}
            className="flex-grow p-2 border text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
            onChange={(e) => {
              const value = updateSocialLink(index, e.target.value);
              register("socialText").onChange({
                target: { value, name: "socialText" },
              });
            }}
          />
        </div>
      ))}

      {errors.socialText && (
        <p className="text-red-500 text-sm">{errors.socialText?.message}</p>
      )}
    </div>
  );
};

export default SocialLinksFormInput;
