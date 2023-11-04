import ThemeToggle from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react";

const GradingNavBar = () => {
  const {} = useSession();

  return (
    <div className="mx-9 mt-5 flex flex-row items-center justify-between dark:text-white md:mx-10 md:mt-8">
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
        <div className="hidden font-montserrat md:inline-block">
          <h1 className="text-2xl">
            <strong>Delta</strong>Hacks <strong>X</strong>
          </h1>
          <p className="text-xs">January 12-14 | McMaster University</p>
        </div>
      </div>
      <div className="hidden items-center md:flex">
        <ThemeToggle />
        <p className="mx-2 hidden font-inter text-sm lg:inline-block">
          {/* <Link href="/dashboard">
            <strong>Dashboard</strong>
          </Link> */}
          <button className="mx-2 rounded bg-zinc-700 px-5 py-2.5 font-inter text-sm font-bold text-white hover:bg-zinc-800 md:px-7">
            Dashboard
          </button>
        </p>
        <button
          onClick={() => signOut()}
          className="mx-2 rounded bg-primary px-5 py-2.5 font-inter text-sm font-bold text-white md:px-7"
        >
          Sign out
        </button>
      </div>
      {/* Hamburger Button */}
      <div className="md:hidden">
        <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-6 w-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
      </div>
    </div>
  );
};

export default GradingNavBar;
