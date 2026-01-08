import { Role } from "@prisma/client";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useState, useMemo } from "react";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import { FiSearch, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import {
  TableElement,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/Table";

type EventLogItem = {
  id: string;
  userId: string;
  timestamp: Date;
  stationId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    DH12Application: {
      firstName: string;
      lastName: string;
    } | null;
  };
  station: {
    id: string;
    name: string;
    option: string;
  };
};

const StatsCard: React.FC<{
  title: string;
  value: number;
  color?: string;
}> = ({ title, value, color = "primary" }) => (
  <div className="stat bg-base-200 rounded-lg">
    <div className="stat-title">{title}</div>
    <div
      className={clsx("stat-value", {
        "text-primary": color === "primary",
        "text-success": color === "success",
        "text-info": color === "info",
      })}
    >
      {value}
    </div>
  </div>
);

const ScannerEvents: NextPage = () => {
  const [stationType, setStationType] = useState<"food" | "events" | "">("");
  const [stationId, setStationId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  // Fetch stats
  const { data: stats, isPending: statsLoading } =
    trpc.scanner.getEventLogStats.useQuery();

  // Fetch stations for filter dropdown
  const { data: stations } = trpc.scanner.listStations.useQuery();

  // Fetch event logs with infinite scroll
  const {
    data: eventLogsData,
    isPending: logsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.scanner.getEventLogs.useInfiniteQuery(
    {
      limit: 50,
      stationType: stationType || undefined,
      stationId: stationId || undefined,
      search: debouncedSearch || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Flatten paginated data
  const eventLogs = useMemo(
    () => eventLogsData?.pages.flatMap((page) => page.items) ?? [],
    [eventLogsData],
  );

  // Get station options based on selected type
  const stationOptions = useMemo(() => {
    if (!stationType || !stations) return [];
    return stations[stationType] || [];
  }, [stationType, stations]);

  // Table columns
  const columns = useMemo<ColumnDef<EventLogItem>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original.user;
          const displayName = user.DH12Application
            ? `${user.DH12Application.firstName} ${user.DH12Application.lastName}`
            : user.name || "Unknown";
          return (
            <div className="flex items-center gap-3">
              {user.image ? (
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={user.image} alt={displayName} />
                  </div>
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                    <span className="text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <div className="font-bold">{displayName}</div>
                <div className="text-sm opacity-50">{user.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "station",
        header: "Station",
        cell: ({ row }) => {
          const station = row.original.station;
          const typeColor =
            station.name === "food" ? "badge-success" : "badge-info";
          return (
            <div className="flex flex-col gap-1">
              <span className={`badge ${typeColor} badge-sm`}>
                {station.name.charAt(0).toUpperCase() + station.name.slice(1)}
              </span>
              <span className="text-sm font-medium">{station.option}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Timestamp
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="w-4 h-4" />
            ) : column.getIsSorted() === "desc" ? (
              <FiChevronDown className="w-4 h-4" />
            ) : null}
          </button>
        ),
        cell: ({ row }) => {
          const timestamp = new Date(row.original.timestamp);
          return (
            <div className="flex flex-col">
              <span>{timestamp.toLocaleDateString()}</span>
              <span className="text-sm opacity-50">
                {timestamp.toLocaleTimeString()}
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: eventLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const clearFilters = () => {
    setStationType("");
    setStationId("");
    setSearch("");
    setDebouncedSearch("");
  };

  const hasActiveFilters = stationType || stationId || debouncedSearch;

  return (
    <>
      <Head>
        <title>Scanner Events Log - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 lg:pl-20 mx-auto max-w-6xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Scanner Events Log
          </h1>

          {/* Stats Section */}
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full mb-8 bg-base-200">
              <StatsCard title="Total Scans" value={stats?.totalLogs ?? 0} />
              <StatsCard
                title="Food Scans"
                value={stats?.foodLogs ?? 0}
                color="success"
              />
              <StatsCard
                title="Event Scans"
                value={stats?.eventLogs ?? 0}
                color="info"
              />
            </div>
          )}

          {/* Station Breakdown */}
          {stats?.stationCounts && stats.stationCounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Station Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.stationCounts.map((station) => (
                  <div
                    key={station.id}
                    className="card bg-base-200 p-3 text-center"
                  >
                    <span
                      className={`badge ${station.name === "food" ? "badge-success" : "badge-info"} badge-sm mb-1`}
                    >
                      {station.name}
                    </span>
                    <div className="text-sm font-medium">{station.option}</div>
                    <div className="text-2xl font-bold">
                      {station._count.eventLogs}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Station Type Filter */}
                <div className="form-control w-full sm:w-auto">
                  <label className="label">
                    <span className="label-text">Station Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full sm:w-40"
                    value={stationType}
                    onChange={(e) => {
                      setStationType(e.target.value as "food" | "events" | "");
                      setStationId("");
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="food">Food</option>
                    <option value="events">Events</option>
                  </select>
                </div>

                {/* Station Option Filter */}
                <div className="form-control w-full sm:w-auto">
                  <label className="label">
                    <span className="label-text">Station Option</span>
                  </label>
                  <select
                    className="select select-bordered w-full sm:w-48"
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    disabled={!stationType}
                  >
                    <option value="">All Options</option>
                    {stationOptions.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="form-control w-full sm:flex-1 sm:min-w-[200px]">
                  <label className="label">
                    <span className="label-text">Search User</span>
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="input input-bordered w-full pl-10"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    className="btn btn-ghost btn-sm gap-1"
                    onClick={clearFilters}
                  >
                    <FiX className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event Logs Table */}
          {logsLoading ? (
            <div className="flex justify-center items-center py-12">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <>
              <div className="rounded-md border dark:border-zinc-700 overflow-x-auto">
                <TableElement>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No event logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableElement>
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="flex justify-center mt-6">
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}

              {/* Results count */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Showing {eventLogs.length} event
                {eventLogs.length !== 1 ? "s" : ""}
                {hasNextPage && " (more available)"}
              </div>
            </>
          )}
        </main>
      </Drawer>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output,
  );
  return output;
}

export default ScannerEvents;
