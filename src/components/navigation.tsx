import React from "react";

const NavBar = () => {
  return (
    <div className="mx-9 mt-5 flex flex-row items-center justify-between md:mx-10 md:mt-8">
      <div className="flex flex-row items-center justify-between">
        <a className="mr-5" href="#">
          <picture>
            <img
              className="inline-block h-10 w-12 md:h-16 md:w-20"
              src="logo.svg"
              alt="logo"
            />
          </picture>
        </a>

        <div className="font-main hidden md:inline-block">
          <h1 className="text-2xl">
            <strong>Delta</strong>Hacks <strong>IX</strong>
          </h1>
          <p className="text-xs">January 13-15 | McMaster University</p>
        </div>

        <div className="font-sub ml-5 hidden md:flex">
          <a className="mx-2 text-base font-bold" href="#">
            Dashboard
          </a>

          <a className="mx-2 text-base font-bold" href="#">
            Calendar
          </a>
        </div>
      </div>

      <div className="flex items-center">
        <button className="mx-2">
          <picture>
            <img
              className="hidden h-5 w-5 md:inline-block"
              src="dark-toggle.svg"
              alt="dark"
            />
          </picture>
        </button>

        <a className="font-sub mx-2 mr-8 text-sm md:hidden" href="#">
          <strong className="font-bold"> Home</strong>
        </a>

        <a className="font-sub mx-2 hidden text-sm lg:inline-block">
          Logged in as <strong className="font-bold"> Username</strong>
        </a>

        <button className="font-sub mx-2 rounded bg-[#4F14EE] py-2.5 px-5 text-sm font-bold md:px-7">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default NavBar;
