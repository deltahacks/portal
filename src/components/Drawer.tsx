import ThemeToggle from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import Background from "./Background";
import { useRef } from "react";
import { useRouter } from "next/router";
import NavBar from "./NavBar";
import Link from "next/link";
import posthog from "posthog-js";

interface PageTab {
  pageName: string;
  link: string;
}

export const Drawer = ({
  children,
  pageTabs,
}: {
  children: React.ReactNode;
  pageTabs?: PageTab[];
}) => {
  const { data: session } = useSession();
  const router = useRouter();

  const drawer = useRef<HTMLInputElement>(null);

  return (
    <>
      <Background />
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input
          id="my-drawer-3"
          type="checkbox"
          className="drawer-toggle"
          ref={drawer}
        />

        <div className="drawer-content w-screen flex flex-col">
          <NavBar />
          {children}
        </div>

        <div className="drawer-side md:hidden z-50 ">
          <label
            htmlFor="my-drawer-3"
            className="drawer-overlay md:hidden"
          ></label>

          <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
            <ul className="w-full">
              <button
                className="btn btn-square btn-ghost drawer-button"
                onClick={() => {
                  if (drawer.current) {
                    drawer.current.checked = false;
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="m6.5 17.5l8.25-5.5L6.5 6.5l1-1.5L18 12L7.5 19z"
                  />
                </svg>
              </button>
              {pageTabs?.map(({ pageName, link }, i) => (
                <li key={i}>
                  <Link className="mx-2 my-2 text-base font-bold" href={link}>
                    {pageName}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mx-1 mb-2 flex w-full items-center justify-between ">
              <ThemeToggle />
              {session ? (
                <div>
                  <a className="font-sub mx-2.5 text-sm">
                    Hi,{" "}
                    <strong className="font-bold">{session?.user?.name}</strong>
                  </a>
                  <button
                    onClick={() => {
                      posthog.reset();
                      signOut();
                    }}
                    className="font-sub rounded bg-primary px-2.5 py-2.5 text-sm font-bold text-white dark:text-gray-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary text-white"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
