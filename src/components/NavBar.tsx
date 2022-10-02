import React from 'react';

const NavBar = () => {
  return (
    <div className="flex flex-row justify-between mt-5 mx-9 md:mt-8 md:mx-10 items-center text-white">
      <div className="flex flex-row justify-between items-center">
        <a className="mr-5" href="#">
          <img className="inline-block w-12 h-10 md:w-20 md:h-16" src="logo.svg" />
        </a>
        <div className="hidden md:inline-block font-main">
          <h1 className="text-2xl">
            <strong>Delta</strong>Hacks <strong>IX</strong>
          </h1>
          <p className="text-xs">
            January 13-15 | McMaster University
          </p>
        </div>
        <div className="hidden ml-24 md:flex font-sub ml-5">
          <a className="text-base font-bold mx-2" href="#">Dashboard</a>
          <a className="text-base font-bold mx-2" href="#">Calendar</a>
        </div>
      </div>
      <div className="flex items-center">
        <button className="mx-2">
          <img className="hidden md:inline-block w-5 h-5" src="dark-toggle.svg" />
        </button>
        <a className="font-sub text-sm mr-8 mx-2 md:hidden" href="#">
          <strong className="font-bold"> Home</strong>
        </a>
        <a className="hidden lg:inline-block font-sub text-sm mx-2">
          Logged in as <strong className="font-bold"> Username</strong>
        </a>
        <button className="bg-[#4F14EE] py-2.5 px-5 md:px-7 rounded font-sub text-sm font-bold mx-2">
          Sign out
        </button>
      </div>
    </div>
  );
};

export default NavBar;