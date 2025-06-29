import { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { trpc } from "../utils/trpc";
import Drawer from "../components/Drawer";
import Select from "react-select";

const TimeslotPage: NextPage = () => {
  const [selectedProject, setSelectedProject] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const { data: projects, isPending: projectsLoading } =
    trpc.project.getAllProjects.useQuery();
  const { data: timeSlots } = trpc.project.getProjectTimeSlots.useQuery(
    { projectId: selectedProject?.value ?? "" },
    { enabled: !!selectedProject },
  );
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.name,
    })) || [];

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Find Your Timeslot - DeltaHacks XI</title>
      </Head>
      <Drawer pageTabs={[{ pageName: "Timeslots", link: "/timeslot" }]}>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <h1 className="text-lg md:text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
                Find Your Presentation Time
              </h1>
              <span className="text-lg md:text-2xl text-gray-600 dark:text-gray-400">
                {currentTime?.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-normal dark:text-[#c1c1c1]">
              Select your project:
            </h2>
            <Select
              isClearable
              isDisabled={projectsLoading}
              isLoading={projectsLoading}
              onChange={setSelectedProject}
              options={projectOptions}
              value={selectedProject}
              classNames={{
                control: (state) =>
                  state.menuIsOpen
                    ? "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border"
                    : "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border",
                menu: () =>
                  "dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border -mt-1 rounded-b-lg overflow-hidden",
                option: () =>
                  "p-2 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-900",
                valueContainer: () =>
                  "dark:text-neutral-500 text-neutral-700 gap-2",
                placeholder: () => "dark:text-neutral-500 text-neutral-700",
                singleValue: () => "dark:text-neutral-500 text-neutral-700",
              }}
            />
          </div>

          {selectedProject && timeSlots && timeSlots.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-normal dark:text-[#c1c1c1]">
                Your presentation times:
              </h2>
              <div className="space-y-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 p-4 dark:bg-neutral-800"
                  >
                    <p className="text-lg font-semibold dark:text-white">
                      Table {slot.table.number} ({slot.table.track.name})
                    </p>
                    <p className="mt-2 dark:text-[#c1c1c1]">
                      {new Date(slot.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(slot.endTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedProject && timeSlots && timeSlots.length === 0 && (
            <div className="mt-8 text-xl font-normal dark:text-[#c1c1c1]">
              No presentation times found for this project.
            </div>
          )}
        </main>
      </Drawer>
    </>
  );
};

export default TimeslotPage;
