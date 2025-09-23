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
  const usersPerPage = 2;
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
      <label className="label p-4">
        <span>Role:</span>
      </label>
      <input
        type="text"
        name="role"
        className="input input-bordered w-full max-w-xs"
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
      <br />
      <div className="flex justify-between items-center m-4">
        <button
          className="btn btn-sm btn-error"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span className="font-bold">Page {currentPage}</span>
        <button
          className="btn btn-sm btn-success"
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
      {/* {JSON.stringify(data)} */}
      {isError ? <span className="text-error">Role not found!</span> : null}
      {isPending ? (
        <progress className="progress" />
      ) : (
        <div className="h-full w-full">
          <DataTable table={table} />
        </div>
      )}
      {/* <div className="flex justify-between items-center mt-4">
        <button
          className="btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {pageTotal}
        </span>
        <button
          className="btn btn-sm"
          disabled={currentPage === pageTotal}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, pageTotal))
          }
        >
          Next
        </button>
      </div> */}
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
