import { EquipmentAction, Role } from "@prisma/client";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useState, useMemo } from "react";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { RouterOutputs, trpc } from "../../utils/trpc";
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

type HardwareLogItem =
  RouterOutputs["equipment"]["getHardwareLogs"]["items"][number];

type HardwareUser = {
  name: string | null;
  email: string | null;
  image: string | null;
  DH13Application: { firstName: string; lastName: string } | null;
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
  DH13Application: { firstName: string; lastName: string } | null;
}) => {
  if (user.DH13Application) {
    return `${user.DH13Application.firstName} ${user.DH13Application.lastName}`;
  }
  return user.name || "Unknown";
};

const UserCell: React.FC<{ user: HardwareUser; size?: "sm" | "md" }> = ({
  user,
  size = "md",
}) => {
  const displayName = getDisplayName(user);
  const avatarSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";
  return (
    <div className="flex items-center gap-3 min-w-0">
      {user.image ? (
        <div className="avatar">
          <div className={clsx(avatarSize, "rounded-full")}>
            <img src={user.image} alt={displayName} />
          </div>
        </div>
      ) : (
        <div className="avatar placeholder">
          <div
            className={clsx(
              avatarSize,
              "bg-neutral text-neutral-content rounded-full",
            )}
          >
            <span className={size === "sm" ? "text-xs" : "text-sm"}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      <div className="min-w-0">
        <div className="font-bold truncate">{displayName}</div>
        {size === "md" && (
          <div className="text-sm opacity-50 truncate">{user.email}</div>
        )}
      </div>
    </div>
  );
};

const ItemList: React.FC<{
  items: { name: string; quantity: number; freeText?: boolean }[];
}> = ({ items }) => (
  <div className="flex flex-wrap gap-1">
    {items.map((item) => (
      <span
        key={item.name}
        className={clsx(
          "badge badge-outline whitespace-nowrap",
          item.freeText && "border-dashed italic",
        )}
        title={
          item.freeText ? "Free text (not on the hardware list)" : undefined
        }
      >
        {item.quantity} x {item.name}
      </span>
    ))}
  </div>
);

const IdBadge: React.FC<{ held: boolean }> = ({ held }) =>
  held ? (
    <span className="badge badge-warning">ID held</span>
  ) : (
    <span className="opacity-50">No</span>
  );

const formatTimestamp = (timestamp: Date | string) =>
  `${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`;

const Hardware: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"outstanding" | "activity">(
    "outstanding",
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
    trpc.equipment.getHardwareStats.useQuery(undefined, {
      staleTime: 60 * 1000,
    });

  const { data: outstanding, isPending: outstandingLoading } =
    trpc.equipment.getUsersWithOutstandingHardware.useQuery(undefined, {
      staleTime: 60 * 1000,
    });

  const {
    data: logsData,
    isPending: logsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.equipment.getHardwareLogs.useInfiniteQuery(
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

  const columns = useMemo<ColumnDef<HardwareLogItem>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => <UserCell user={row.original.user} />,
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const isCheckout = row.original.action === EquipmentAction.CHECK_OUT;
          return (
            <span
              className={`badge whitespace-nowrap ${isCheckout ? "badge-warning" : "badge-success"}`}
            >
              {isCheckout ? "Sign out" : "Return"}
            </span>
          );
        },
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => <ItemList items={row.original.items} />,
      },
      {
        accessorKey: "idCollected",
        header: "ID Collected",
        cell: ({ row }) =>
          row.original.action === EquipmentAction.CHECK_OUT ? (
            row.original.idCollected ? (
              "Yes"
            ) : (
              <span className="opacity-50">No</span>
            )
          ) : null,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.notes}</span>
        ),
      },
      {
        accessorKey: "admin",
        header: "Processed By",
        cell: ({ row }) => <UserCell user={row.original.admin} />,
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
        <title>Hardware - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-4 py-8 sm:px-7 sm:py-16 lg:px-14 lg:pl-20 mx-auto max-w-6xl">
          <h1 className="mb-6 sm:mb-8 text-xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl text-center">
            Hardware Dashboard
          </h1>

          {/* Stats Section */}
          {statsLoading ? (
            <div className="flex justify-center items-center py-8">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full mb-8 bg-base-200">
              <StatsCard
                title="Hackers With Hardware"
                value={stats?.hackersWithOutstanding ?? 0}
                color="warning"
              />
              <StatsCard
                title="Items Outstanding"
                value={stats?.unitsOutstanding ?? 0}
                color="warning"
              />
              <StatsCard
                title="Total Sign Outs"
                value={stats?.totalSignOuts ?? 0}
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
                activeTab === "outstanding" && "tab-active",
              )}
              onClick={() => setActiveTab("outstanding")}
            >
              Outstanding
              {outstanding && outstanding.length > 0 && (
                <span className="badge badge-warning badge-sm ml-1 sm:ml-2">
                  {outstanding.length}
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

          {/* Outstanding Tab */}
          {activeTab === "outstanding" && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body p-4 sm:p-8">
                {outstandingLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <progress className="progress progress-warning w-56"></progress>
                  </div>
                ) : outstanding && outstanding.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="flex flex-col gap-4 md:hidden overflow-hidden">
                      {outstanding.map((row) => (
                        <div
                          key={row.user.id}
                          className="card bg-base-100 shadow-sm overflow-hidden"
                        >
                          <div className="card-body p-4 gap-3">
                            <div className="flex items-center justify-between gap-3">
                              <UserCell user={row.user} />
                              {row.idHeld && <IdBadge held />}
                            </div>
                            <ItemList items={row.items} />

                            <div className="divider my-0"></div>

                            <div className="flex flex-col gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="opacity-50">Given by:</span>
                                {row.admin ? (
                                  <UserCell user={row.admin} size="sm" />
                                ) : (
                                  <span className="opacity-50">Unknown</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="opacity-50">On:</span>
                                {row.lastCheckout ? (
                                  <span>
                                    {formatTimestamp(row.lastCheckout)}
                                  </span>
                                ) : (
                                  <span className="opacity-50">Unknown</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Outstanding</th>
                            <th>ID</th>
                            <th>Last Signed Out By</th>
                            <th>Last Sign Out</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outstanding.map((row) => (
                            <tr key={row.user.id}>
                              <td>
                                <UserCell user={row.user} />
                              </td>
                              <td>
                                <ItemList items={row.items} />
                              </td>
                              <td>
                                <IdBadge held={row.idHeld} />
                              </td>
                              <td>
                                {row.admin ? (
                                  <UserCell user={row.admin} />
                                ) : (
                                  <span className="opacity-50">Unknown</span>
                                )}
                              </td>
                              <td>
                                {row.lastCheckout ? (
                                  <div className="flex flex-col">
                                    <span>
                                      {new Date(
                                        row.lastCheckout,
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm opacity-50">
                                      {new Date(
                                        row.lastCheckout,
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="opacity-50">Unknown</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    All hardware has been returned.
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
                          Sign out
                        </option>
                        <option value={EquipmentAction.RETURN}>Return</option>
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
                          const isCheckout =
                            log.action === EquipmentAction.CHECK_OUT;
                          return (
                            <div
                              key={log.id}
                              className="card bg-base-200 shadow-sm overflow-hidden"
                            >
                              <div className="card-body p-4 gap-3">
                                <div className="flex items-center justify-between gap-3">
                                  <UserCell user={log.user} />
                                  <span
                                    className={`badge shrink-0 ${isCheckout ? "badge-warning" : "badge-success"}`}
                                  >
                                    {isCheckout ? "Sign out" : "Return"}
                                  </span>
                                </div>
                                <ItemList items={log.items} />
                                {isCheckout && log.idCollected && (
                                  <span className="text-sm">ID collected</span>
                                )}
                                {log.notes && (
                                  <p className="text-sm opacity-70">
                                    {log.notes}
                                  </p>
                                )}

                                <div className="divider my-0"></div>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="opacity-50">By:</span>
                                    <UserCell user={log.admin} size="sm" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="opacity-50">On:</span>
                                    <span>
                                      {formatTimestamp(log.timestamp)}
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
                      No hardware logs found.
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
    [Role.ADMIN, Role.GENERAL_SCANNER],
    undefined,
    output,
  );
  return output;
}

export default Hardware;
