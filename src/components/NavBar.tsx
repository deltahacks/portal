import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react";

const NavBar = () => {
  const { data: session } = useSession();

  return (
    <div className="mx-9 mt-5 flex flex-row items-center justify-between dark:text-white md:mx-10 md:mt-8">
      <div className="flex flex-row items-center justify-between">
        <Link href="/welcome">
          <button className="mr-5">
            <picture>
              <img
                className="inline-block h-10 w-12 md:h-16 md:w-20"
                src="logo.svg"
                alt="logo"
              />
            </picture>
          </button>
        </Link>
        <div className="hidden font-montserrat md:inline-block">
          <h1 className="text-2xl">
            <strong>Delta</strong>Hacks <strong>IX</strong>
          </h1>
          <p className="text-xs">January 13-15 | McMaster University</p>
        </div>
      </div>
      <div className="hidden items-center md:flex">
        <ThemeToggle />
        <p className="mx-2 hidden font-inter text-sm lg:inline-block">
          Logged in as{" "}
          <strong className="font-bold">{session?.user?.name}</strong>
        </p>
        <button
          onClick={() => signOut()}
          className="mx-2 rounded bg-primary py-2.5 px-5 font-inter text-sm font-bold text-white md:px-7"
        >
          Sign out
        </button>
      </div>
      {/* Hamburger Button */}
      <div className="md:hidden">
        <label htmlFor="my-drawer-3" className="btn btn-ghost btn-square">
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

export default NavBar;
