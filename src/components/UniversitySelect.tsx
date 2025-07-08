import React, { useState } from "react";

import makeAnimated from "react-select/animated";
import AsyncSelect from "react-select/async";
import { z } from "zod";

const universitiesSchema = z.array(
  z.object({
    domains: z.array(z.string()),
    alpha_two_code: z.string(),
    country: z.string(),
    name: z.string(),
    web_pages: z.array(z.string()),
    "state-province": z.string().nullable(),
  }),
);

const universitySchema = z.object({
  domains: z.array(z.string()),
  alpha_two_code: z.string(),
  country: z.string(),
  name: z.string(),
  web_pages: z.array(z.string()),
  "state-province": z.string().nullable(),
});

const schema = z.object({
  // value: z.object({
  //   name: z.string(),
  //   location: z.string(),
  // }),
  value: z.string(),
  label: z.string(),
});

type ApplicantUniversity = z.infer<typeof schema>;
type University = z.infer<typeof universitySchema>;

const animatedComponents = makeAnimated();

function getOptions(query: string) {
  return new Promise<ApplicantUniversity[]>((resolve, reject) => {
    fetch(
      //   `https://corsproxy.io/?http://universities.hipolabs.com/search?name=${query}&limit=5`
      `http://universities.hipolabs.com/search?name=${query}&limit=5`,
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedData = universitiesSchema.parse(data);
        const universities: ApplicantUniversity[] = parsedData.map(
          (university: University) => ({
            // value: university["state-province"]
            //   ? {
            //       name: university.name,
            //       location:
            //         university["state-province"] + ", " + university.country,
            //     }
            //   : { name: university.name, location: university.country },
            value: university.name,
            label: university.name,
          }),
        );
        resolve(universities);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
const UniversitySelect = (props: any) => {
  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-full">
          <AsyncSelect
            {...props}
            cacheOptions={true}
            defaultOptions={true}
            loadOptions={getOptions}
            placeholder="Search for a university..."
            className="w-full"
            components={animatedComponents}
            unstyled={true}
            classNames={{
              control: (state) => {
                return state.menuIsOpen
                  ? "dark:bg-neutral-800 bg-neutral-400 border-2 border-transparent rounded-md p-2 dark:border-[#333537] border-[#C5C6C9]"
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
            }}
          />
        </div>
      </div>
    </>
  );
};
export default UniversitySelect;
