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
    trpc.equipment.getSleepingBagStats.useQuery();

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
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="text-sm opacity-50">{admin.email}</div>
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
        <main className="px-7 py-16 sm:px-14 lg:pl-20 mx-auto max-w-6xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
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

          {/* Filters Section */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Action Filter */}
                <div className="form-control w-full sm:w-auto">
                  <label className="label">
                    <span className="label-text">Action</span>
                  </label>
                  <select
                    className="select select-bordered w-full sm:w-40"
                    value={actionFilter}
                    onChange={(e) =>
                      setActionFilter(e.target.value as EquipmentAction | "")
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

          {/* Logs Table */}
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
                          No sleeping bag logs found.
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
                Showing {logs.length} log{logs.length !== 1 ? "s" : ""}
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

export default SleepingBags;
