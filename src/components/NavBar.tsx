import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Background from "./Background";

export const NavBar = ({ session }: { session: Session | null }) => {
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

export const Drawer = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const { data: session } = useSession();

  return (
    <>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content">
          <Background />
          <NavBar session={session} />
          {children}
        </div>
        <div className="drawer-side md:hidden">
          <label
            htmlFor="my-drawer-3"
            className="drawer-overlay md:hidden"
          ></label>
          <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
            <ul className="w-full">
              <li>Your application has not been received.</li>
              {/* <!-- Sidebar content here --> */}
              {/* <li>
                <a className="mx-2 my-2 text-base font-bold" href="#">
                  Dashboard
                </a>
              </li>
              <li>
                <a className="mx-2 my-2 text-base font-bold" href="#">
                  Calendar
                </a>
              </li> */}
            </ul>

            <div className="mx-1 mb-2 flex w-full items-center justify-between">
              <ThemeToggle />
              <div>
                <a className="font-sub mx-2.5 text-sm">
                  Hi,{" "}
                  <strong className="font-bold">{session?.user?.name}</strong>
                </a>
                <button
                  onClick={() => signOut()}
                  className="font-sub rounded bg-[#4F14EE] py-2.5 px-2.5 text-sm font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
