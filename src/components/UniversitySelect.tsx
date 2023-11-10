import React, { useState } from "react";

import { StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import AsyncCreatableSelect from "react-select/async-creatable";
import { NextPage } from "next";
import { z } from "zod";

const universitiesSchema = z.array(
  z.object({
    domains: z.array(z.string()),
    alpha_two_code: z.string(),
    country: z.string(),
    name: z.string(),
    web_pages: z.array(z.string()),
    "state-province": z.string().nullable(),
  })
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
  value: z.object({
    name: z.string(),
    location: z.string(),
  }),
  label: z.string(),
});

type ApplicantUniversity = z.infer<typeof schema>;
type University = z.infer<typeof universitySchema>;

const animatedComponents = makeAnimated();

function getOptions(query: string) {
  return new Promise<ApplicantUniversity[]>((resolve, reject) => {
    fetch(
      //   `https://corsproxy.io/?http://universities.hipolabs.com/search?name=${query}&limit=5`
      `http://universities.hipolabs.com/search?name=${query}&limit=5`
    )
      .then((response) => response.json())
      .then((data) => {
        const parsedData = universitiesSchema.parse(data);
        const universities: ApplicantUniversity[] = parsedData.map(
          (university: University) => ({
            value: university["state-province"]
              ? {
                  name: university.name,
                  location:
                    university["state-province"] + ", " + university.country,
                }
              : { name: university.name, location: university.country },
            label: university.name,
          })
        );
        resolve(universities);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

const colourStyles: StylesConfig = {
  control: (styles, { menuIsOpen }) => ({
    ...styles,
    backgroundColor: "#262626",
    // borderColor: menuIsOpen ? "#333537" : "transparent",
    border: menuIsOpen ? "2px solid #333537" : "1px solid transparent",
    borderRadius: "0.5rem",
    ":hover": {
      // borderColor: menuIsOpen ? "#333537" : "transparent",
      border: menuIsOpen ? "2px solid #333537" : "1px solid transparent",
    },
    boxShadow: "none",
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: "0.5rem",
    text: "#ffffff",
  }),
  input: (styles) => ({ ...styles, color: "#fff" }),
  menu: (styles) => ({ ...styles, backgroundColor: "#262626" }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isFocused ? "#333537" : "#262626",
    color: "#fff",
    cursor: isDisabled ? "not-allowed" : "default",
    ":active": {
      ...styles[":active"],
      backgroundColor: "#333537",
    },
  }),
  singleValue: (styles) => ({ ...styles, color: "#fff" }),
};

const UniversitySelect = (props: any) => {
  const [value, setValue] = useState(null);
  return (
    <>
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full">
          <AsyncCreatableSelect
            {...props}
            cacheOptions={true}
            defaultOptions={true}
            loadOptions={getOptions}
            styles={colourStyles}
            className="w-full"
            components={animatedComponents}
          />
        </div>
      </div>
    </>
  );
};
export default UniversitySelect;
