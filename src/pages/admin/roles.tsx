import { Role, User } from "@prisma/client";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useEffect, useState } from "react";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiStopCircle,
  FiXCircle,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "../../components/Table";
import Head from "next/head";
import Drawer from "../../components/Drawer";

enum ActionType {
  Add,
  Remove,
}
type Action = {
  actionType: ActionType;
  user: User;
  role?: Role;
};

const Roles: NextPage = () => {
  const session = useSession();
  const [role, setRole] = useState("");
  const [action, setAction] = useState<Action | undefined>(undefined);

  // Pagination state
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isPending, isError, refetch } = trpc.user.byRole.useQuery({
    role: role ? (role.toUpperCase() as keyof typeof Role) : null,
    page: currentPage,
    limit: usersPerPage,
  });

  const roleOptions = Object.keys(Role);
  const utils = trpc.useUtils();
  const addRole = trpc.user.addRole.useMutation();
  const removeRole = trpc.user.removeRole.useMutation();

  // section for name email and role
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle h-12 w-12">
              <img
                src={row.original.image || ""}
                alt={row.original.name || ""}
              />
            </div>
          </div>
          <div>
            <div>{row.original.name}</div>
            {row.original.id === session.data?.user?.id ? (
              <div className="font-bold">(YOU)</div>
            ) : null}
          </div>
        </div>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="pl-4 py-2 lowercase">{row.original.email}</div>
      ),
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      accessorKey: "role",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex-auto space-x-1">
          {(row.original.role as Role[]).map((role: Role) => {
            if (
              action?.actionType === ActionType["Remove"] &&
              action.user === row.original &&
              action.role === role
            ) {
              return (
                <button
                  className="btn btn-error btn-sm"
                  key={role}
                  onClick={async () => {
                    // guard action.role against undefined
                    if (!action.role) return;

                    await removeRole.mutateAsync({
                      id: action.user.id,
                      role: action.role,
                    });
                    setAction(undefined);

                    // Invalidate and refetch the user.byRole query
                    await utils.user.byRole.invalidate({
                      role: role
                        ? (role.toUpperCase() as keyof typeof Role)
                        : null,
                      page: currentPage,
                      limit: usersPerPage,
                    });
                  }}
                >
                  <FiXCircle /> &nbsp; Sure?
                </button>
              );
            } else {
              return (
                <button
                  className="btn btn-sm"
                  key={role}
                  onClick={() => {
                    setAction({
                      actionType: ActionType["Remove"],
                      user: row.original,
                      role: role,
                    });
                  }}
                >
                  <FiMinusCircle /> &nbsp; {role}
                </button>
              );
            }
          })}
          {action?.actionType === ActionType["Add"] &&
          action.user === row.original ? (
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-sm m-1">
                Roles
              </label>
              <ul
                tabIndex={0}
                className="menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow z-50"
              >
                {roleOptions.map((role, idx) => {
                  return (
                    <li key={idx}>
                      <option
                        onClick={async (e) => {
                          console.log(e.currentTarget.value);
                          await addRole.mutateAsync({
                            id: row.original.id,
                            role: e.currentTarget.value.toUpperCase() as keyof typeof Role,
                          });
                          setAction(undefined);

                          // Invalidate and refetch the user.byRole query
                          await utils.user.byRole.invalidate({
                            role: role
                              ? (role.toUpperCase() as keyof typeof Role)
                              : null,
                            page: currentPage,
                            limit: usersPerPage,
                          });
                        }}
                        value={role}
                      >
                        {role}
                      </option>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                setAction({
                  actionType: ActionType["Add"],
                  user: row.original,
                  role: undefined,
                });
              }}
            >
              <FiPlusCircle /> &nbsp; Add Role
            </button>
          )}
          {action ? (
            <button
              className="btn btn-info btn-sm"
              onClick={() => {
                setAction(undefined);
              }}
            >
              <FiStopCircle /> &nbsp; Cancel
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const table = useReactTable<User>({
    data: data || [],
    columns: columns,
    pageCount: 6000, // Placeholder, will be updated
    state: {
      pagination: {
        pageIndex: currentPage - 1, // Convert 1-based page to 0-based pageIndex
        pageSize: usersPerPage,
      },
    },
    manualPagination: true, // Enable manual pagination
    manualFiltering: true, // allows for server-side filtering
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      const newPageIndex =
        typeof updater === "function"
          ? updater(table.getState().pagination).pageIndex
          : updater.pageIndex;
      setCurrentPage(newPageIndex + 1); // Convert 0-based pageIndex to 1-based page
    },
  });

  useEffect(() => {
    if (data && table.getState().pagination.pageIndex !== currentPage - 1) {
      table.setPageIndex(currentPage - 1); // Sync table's pageIndex with TRPC (convert to 0-based)
    }
  }, [data, currentPage, table]);

  useEffect(() => {
    if (
      table.getRowModel().rows.length === 0 &&
      table.getFilteredRowModel().rows.length !== 0
    ) {
      table.setPageIndex(0);
    }
  }, [
    table.getRowModel().rows.length,
    table.getFilteredRowModel().rows.length,
  ]);

  return (
    <>
      <Head>
        <title>Role Management - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 lg:pl-20 2xl:pt-20 mx-auto  w-full">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Role Management
          </h1>

          <div className="card bg-base-200 shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Filter by Role</h2>
            <div className="form-control">
              <span className="label-text pr-4">Enter role name:</span>
              <input
                type="text"
                name="role"
                placeholder="Type role name (e.g., ADMIN, REVIEWER)..."
                className="input input-bordered w-full max-w-md"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    roleOptions.includes(e.currentTarget.value.toUpperCase())
                  ) {
                    setRole(e.currentTarget.value);
                    setCurrentPage(1);
                  }
                }}
              />
              <div className="label-text-alt pt-4">
                <span className="block mb-1">
                  Available roles (click to fast select):
                </span>
                <div className="flex flex-wrap gap-1">
                  {roleOptions.map((role, index) => (
                    <button
                      key={`roleSelect-${role}`}
                      className="btn btn-xs btn-outline normal-case hover:btn-primary"
                      onClick={() => {
                        setRole(role);
                        setCurrentPage(1);
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <button
              className="btn btn-primary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span className="font-semibold text-lg">Page {currentPage}</span>
            <button
              className="btn btn-primary"
              disabled={
                !data || data.length < usersPerPage || !table.getCanNextPage()
              }
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
              }}
            >
              Next
            </button>
          </div>
          {isError ? (
            <div className="alert alert-error mb-6">
              <span>Role not found!</span>
            </div>
          ) : null}

          {isPending ? (
            <div className="flex justify-center items-center py-12">
              <progress className="progress progress-primary w-56"></progress>
            </div>
          ) : (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body p-0">
                <DataTable table={table} />
              </div>
            </div>
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
    output
  );
  return output;
}

export default Roles;
