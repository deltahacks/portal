import { EquipmentAction, Role } from "@prisma/client";
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

type SleepingBagLogItem = {
  id: string;
  userId: string;
  timestamp: Date;
  action: EquipmentAction;
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
  admin: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    DH12Application: {
      firstName: string;
      lastName: string;
    } | null;
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
        "text-warning": color === "warning",
      })}
    >
      {value}
    </div>
  </div>
);

const getDisplayName = (user: {
  name: string | null;
  DH12Application: { firstName: string; lastName: string } | null;
}) => {
  if (user.DH12Application) {
    return `${user.DH12Application.firstName} ${user.DH12Application.lastName}`;
  }
  return user.name || "Unknown";
};

const SleepingBags: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"unreturned" | "activity">(
    "unreturned",
  );
  const [actionFilter, setActionFilter] = useState<EquipmentAction | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const { data: stats, isPending: statsLoading } =
    trpc.equipment.getSleepingBagStats.useQuery(undefined, {
      staleTime: 60 * 1000,
    });

  const { data: unreturnedBags, isPending: unreturnedLoading } =
    trpc.equipment.getUsersWithUnreturnedBags.useQuery(undefined, {
      staleTime: 60 * 1000,
    });

  const {
    data: logsData,
    isPending: logsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.equipment.getSleepingBagLogs.useInfiniteQuery(
    {
      limit: 50,
      action: actionFilter || undefined,
      search: debouncedSearch || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 60 * 1000,
    },
  );

  const logs = useMemo(
    () => logsData?.pages.flatMap((page) => page.items) ?? [],
    [logsData],
  );

  const columns = useMemo<ColumnDef<SleepingBagLogItem>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original.user;
          const displayName = getDisplayName(user);
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
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const action = row.original.action;
          const isCheckout = action === EquipmentAction.CHECK_OUT;
          return (
            <span
              className={`badge ${isCheckout ? "badge-warning" : "badge-success"}`}
            >
              {isCheckout ? "Checked Out" : "Returned"}
            </span>
          );
        },
      },
      {
        accessorKey: "admin",
        header: "Processed By",
        cell: ({ row }) => {
          const admin = row.original.admin;
          const displayName = getDisplayName(admin);
          return (
            <div className="flex items-center gap-3">
              {admin.image ? (
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={admin.image} alt={displayName} />
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
                <div className="font-medium">{displayName}</div>
                <div className="text-sm opacity-50">{admin.email}</div>
              </div>
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
    data: logs,
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
    setActionFilter("");
    setSearch("");
    setDebouncedSearch("");
  };

  const hasActiveFilters = actionFilter || debouncedSearch;

  return (
    <>
      <Head>
        <title>Sleeping Bags - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-4 py-8 sm:px-7 sm:py-16 lg:px-14 lg:pl-20 mx-auto max-w-6xl">
          <h1 className="mb-6 sm:mb-8 text-xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl text-center">
            Sleeping Bag Dashboard
          </h1>

          {/* Stats Section */}
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full mb-8 bg-base-200">
              <StatsCard
                title="Currently Checked Out"
                value={stats?.currentlyCheckedOut ?? 0}
                color="warning"
              />
              <StatsCard
                title="Total Checkouts"
                value={stats?.totalCheckouts ?? 0}
              />
              <StatsCard
                title="Total Returns"
                value={stats?.totalReturns ?? 0}
                color="success"
              />
            </div>
          )}

          {/* Tabs */}
          <div role="tablist" className="tabs tabs-boxed mb-4 sm:mb-6 flex">
            <button
              role="tab"
              className={clsx(
                "tab flex-1 sm:flex-none text-sm sm:text-base",
                activeTab === "unreturned" && "tab-active",
              )}
              onClick={() => setActiveTab("unreturned")}
            >
              <span className="hidden sm:inline">Unreturned Bags</span>
              <span className="sm:hidden">Unreturned</span>
              {unreturnedBags && unreturnedBags.length > 0 && (
                <span className="badge badge-warning badge-sm ml-1 sm:ml-2">
                  {unreturnedBags.length}
                </span>
              )}
            </button>
            <button
              role="tab"
              className={clsx(
                "tab flex-1 sm:flex-none text-sm sm:text-base",
                activeTab === "activity" && "tab-active",
              )}
              onClick={() => setActiveTab("activity")}
            >
              <span className="hidden sm:inline">Activity Log</span>
              <span className="sm:hidden">Activity</span>
            </button>
          </div>

          {/* Unreturned Bags Tab */}
          {activeTab === "unreturned" && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body p-4 sm:p-8">
                {unreturnedLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <progress className="progress progress-warning w-56"></progress>
                  </div>
                ) : unreturnedBags && unreturnedBags.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="flex flex-col gap-4 md:hidden overflow-hidden">
                      {unreturnedBags.map((item) => {
                        const displayName = getDisplayName(item.user);
                        const adminDisplayName = item.admin
                          ? getDisplayName(item.admin)
                          : "Unknown";
                        return (
                          <div
                            key={item.user.id}
                            className="card bg-base-100 shadow-sm overflow-hidden"
                          >
                            <div className="card-body p-4 gap-3">
                              {/* User */}
                              <div className="flex items-center gap-3">
                                {item.user.image ? (
                                  <div className="avatar">
                                    <div className="w-12 h-12 rounded-full">
                                      <img
                                        src={item.user.image}
                                        alt={displayName}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                                      <span>
                                        {displayName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold truncate">
                                    {displayName}
                                  </div>
                                  <div className="text-sm opacity-50 truncate max-w-[200px]">
                                    {item.user.email}
                                  </div>
                                </div>
                              </div>

                              <div className="divider my-0"></div>

                              {/* Admin & Time */}
                              <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="opacity-50">Given by:</span>
                                  {item.admin ? (
                                    <div className="flex items-center gap-2">
                                      {item.admin.image ? (
                                        <div className="avatar">
                                          <div className="w-6 h-6 rounded-full">
                                            <img
                                              src={item.admin.image}
                                              alt={adminDisplayName}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="avatar placeholder">
                                          <div className="bg-neutral text-neutral-content rounded-full w-6 h-6">
                                            <span className="text-xs">
                                              {adminDisplayName
                                                .charAt(0)
                                                .toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      <span className="font-medium">
                                        {adminDisplayName}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="opacity-50">Unknown</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="opacity-50">On:</span>
                                  {item.lastCheckout ? (
                                    <span>
                                      {new Date(
                                        item.lastCheckout,
                                      ).toLocaleDateString()}{" "}
                                      {new Date(
                                        item.lastCheckout,
                                      ).toLocaleTimeString()}
                                    </span>
                                  ) : (
                                    <span className="opacity-50">Unknown</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Given Out By</th>
                            <th>Checked Out</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unreturnedBags.map((item) => {
                            const displayName = getDisplayName(item.user);
                            const adminDisplayName = item.admin
                              ? getDisplayName(item.admin)
                              : "Unknown";
                            return (
                              <tr key={item.user.id}>
                                <td>
                                  <div className="flex items-center gap-3">
                                    {item.user.image ? (
                                      <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                          <img
                                            src={item.user.image}
                                            alt={displayName}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                                          <span className="text-sm">
                                            {displayName
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold">
                                        {displayName}
                                      </div>
                                      <div className="text-sm opacity-50">
                                        {item.user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {item.admin ? (
                                    <div className="flex items-center gap-3">
                                      {item.admin.image ? (
                                        <div className="avatar">
                                          <div className="w-10 h-10 rounded-full">
                                            <img
                                              src={item.admin.image}
                                              alt={adminDisplayName}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="avatar placeholder">
                                          <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                                            <span className="text-sm">
                                              {adminDisplayName
                                                .charAt(0)
                                                .toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium">
                                          {adminDisplayName}
                                        </div>
                                        <div className="text-sm opacity-50">
                                          {item.admin.email}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="opacity-50">Unknown</span>
                                  )}
                                </td>
                                <td>
                                  {item.lastCheckout ? (
                                    <div className="flex flex-col">
                                      <span>
                                        {new Date(
                                          item.lastCheckout,
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="text-sm opacity-50">
                                        {new Date(
                                          item.lastCheckout,
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="opacity-50">Unknown</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    All sleeping bags have been returned.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <>
              {/* Filters Section */}
              <div className="card bg-base-200 shadow-xl mb-4 sm:mb-6">
                <div className="card-body p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:items-end">
                    {/* Action Filter */}
                    <div className="form-control w-full sm:w-auto">
                      <label className="label">
                        <span className="label-text">Action</span>
                      </label>
                      <select
                        className="select select-bordered w-full sm:w-40"
                        value={actionFilter}
                        onChange={(e) =>
                          setActionFilter(
                            e.target.value as EquipmentAction | "",
                          )
                        }
                      >
                        <option value="">All Actions</option>
                        <option value={EquipmentAction.CHECK_OUT}>
                          Checked Out
                        </option>
                        <option value={EquipmentAction.RETURN}>Returned</option>
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

              {/* Logs */}
              {logsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <progress className="progress progress-primary w-56"></progress>
                </div>
              ) : (
                <>
                  {logs.length > 0 ? (
                    <>
                      {/* Mobile Card View */}
                      <div className="flex flex-col gap-4 md:hidden overflow-hidden">
                        {logs.map((log) => {
                          const displayName = getDisplayName(log.user);
                          const adminDisplayName = getDisplayName(log.admin);
                          const isCheckout =
                            log.action === EquipmentAction.CHECK_OUT;
                          return (
                            <div
                              key={log.id}
                              className="card bg-base-200 shadow-sm overflow-hidden"
                            >
                              <div className="card-body p-4 gap-3">
                                {/* User & Action Badge */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {log.user.image ? (
                                      <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                          <img
                                            src={log.user.image}
                                            alt={displayName}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                                          <span className="text-sm">
                                            {displayName
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold truncate">
                                        {displayName}
                                      </div>
                                      <div className="text-sm opacity-50 truncate max-w-[180px]">
                                        {log.user.email}
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    className={`badge shrink-0 ${isCheckout ? "badge-warning" : "badge-success"}`}
                                  >
                                    {isCheckout ? "Out" : "Returned"}
                                  </span>
                                </div>

                                <div className="divider my-0"></div>

                                {/* Admin & Time */}
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="opacity-50">By:</span>
                                    <div className="flex items-center gap-2">
                                      {log.admin.image ? (
                                        <div className="avatar">
                                          <div className="w-5 h-5 rounded-full">
                                            <img
                                              src={log.admin.image}
                                              alt={adminDisplayName}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="avatar placeholder">
                                          <div className="bg-neutral text-neutral-content rounded-full w-5 h-5">
                                            <span className="text-xs">
                                              {adminDisplayName
                                                .charAt(0)
                                                .toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                      <span className="font-medium">
                                        {adminDisplayName}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="opacity-50">On:</span>
                                    <span>
                                      {new Date(
                                        log.timestamp,
                                      ).toLocaleDateString()}{" "}
                                      {new Date(
                                        log.timestamp,
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block rounded-md border dark:border-zinc-700 overflow-x-auto">
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
                            {table.getRowModel().rows.map((row) => (
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
                            ))}
                          </TableBody>
                        </TableElement>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No sleeping bag logs found.
                    </div>
                  )}

                  {/* Load More */}
                  {hasNextPage && (
                    <div className="flex justify-center mt-4 sm:mt-6">
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
                  <div className="text-center text-sm text-gray-500 mt-3 sm:mt-4">
                    Showing {logs.length} log{logs.length !== 1 ? "s" : ""}
                    {hasNextPage && " (more available)"}
                  </div>
                </>
              )}
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

export default SleepingBags;
