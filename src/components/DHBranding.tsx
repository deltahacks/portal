import React from "react";
import Image from "next/image";
import logo from "../../public/images/DH9.svg";

const DHBranding = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="md:w-30 hidden aspect-square w-20 md:block">
        <Image
          src={logo}
          alt="DeltaHacks logo"
          layout="responsive"
        ></Image>
      </div>
      <div className="text-white">
        <h1 className="whitespace-nowrap font-montserrat text-4xl font-bold md:text-4xl lg:text-5xl">
          Delta<span className="mr-2 font-normal">Hacks</span>IX
        </h1>
        <h2 className="md:text-md font-montserrat text-sm lg:text-lg">
          January 13-15 | McMaster University
        </h2>
      </div>
    </div>
  );
};

export default DHBranding;
