import { Role, User } from "@prisma/client";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiStopCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
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

const USERS_PER_PAGE = 10;

const Roles: NextPage = () => {
  const session = useSession();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [action, setAction] = useState<Action | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const nameSearchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced name search setter
  const debouncedSetNameSearch = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setNameSearch(value);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);
  }, []);

  // Count query to get total number of users for pagination
  const countQuery = trpc.user.countSearchUsersByNameAndRole.useQuery(
    {
      nameSearch,
      role: selectedRole,
    },
    {
      enabled: true,
      staleTime: 30000,
      onSuccess: (data: number) => {
        setTotalUsers(data);
      },
    }
  );

  // Use enabled option to prevent unnecessary queries
  const { data, isLoading, isError, refetch } =
    trpc.user.searchUsersByNameAndRole.useQuery(
      {
        nameSearch,
        role: selectedRole,
        skip: (currentPage - 1) * USERS_PER_PAGE,
        take: USERS_PER_PAGE,
      },
      {
        enabled: true,
        staleTime: 30000, // Consider data fresh for 30 seconds
        cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      }
    );

  // Reset to page 1 when search params change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, nameSearch]);

  // Calculate total pages
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE)),
    [totalUsers]
  );

  // Memoize role options to prevent recreation on each render
  const roleOptions = useMemo(() => Object.values(Role), []);

  // Setup mutations with callbacks
  const addRole = trpc.user.addRole.useMutation({
    onSuccess: () => {
      refetch();
      countQuery.refetch();
    },
  });

  const removeRole = trpc.user.removeRole.useMutation({
    onSuccess: () => {
      refetch();
      countQuery.refetch();
    },
  });

  const handleRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedRole(value === "" ? null : (value as Role));
    },
    []
  );

  const handleNameSearch = useCallback(() => {
    if (nameSearchInputRef.current) {
      setNameSearch(nameSearchInputRef.current.value);
      setCurrentPage(1);
    }
  }, []);

  const handleAddRoleClick = useCallback((user: User) => {
    setAction({
      actionType: ActionType.Add,
      user,
      role: undefined,
    });
  }, []);

  const handleRemoveRoleClick = useCallback(
    (user: User, roleToRemove: Role) => {
      setAction({
        actionType: ActionType.Remove,
        user,
        role: roleToRemove,
      });
    },
    []
  );

  const handleCancelAction = useCallback(() => {
    setAction(undefined);
  }, []);

  const handleAddRoleConfirm = useCallback(
    async (userId: string, roleToAdd: Role) => {
      await addRole.mutateAsync({
        id: userId,
        role: roleToAdd,
      });
      setAction(undefined);
    },
    [addRole]
  );

  const handleRemoveRoleConfirm = useCallback(
    async (userId: string, roleToRemove: Role) => {
      await removeRole.mutateAsync({
        id: userId,
        role: roleToRemove,
      });
      setAction(undefined);
    },
    [removeRole]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const clearFilters = useCallback(() => {
    setSelectedRole(null);
    setNameSearch("");
    if (nameSearchInputRef.current) {
      nameSearchInputRef.current.value = "";
    }
  }, []);

  return (
    <>
      <Head>
        <title>Role Management - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Role Management
          </h1>

          <div className="card bg-base-200 shadow-xl p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                {/* Role filter dropdown */}
                <div className="flex flex-col space-y-2">
                  <label className="label">
                    <span className="label-text">Filter by Role:</span>
                  </label>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    value={selectedRole || ""}
                    onChange={handleRoleChange}
                  >
                    <option value="">All Roles</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name search input */}
                <div className="flex flex-col space-y-2">
                  <label className="label">
                    <span className="label-text">Search by Name:</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      ref={nameSearchInputRef}
                      type="text"
                      placeholder="Search users..."
                      className="input input-bordered w-full max-w-xs"
                      defaultValue={nameSearch}
                      onChange={(e) => debouncedSetNameSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleNameSearch();
                        }
                      }}
                    />
                    <button
                      className="btn btn-square ml-2"
                      onClick={handleNameSearch}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </div>

                {/* Clear filters button */}
                <button
                  className="btn btn-outline mt-2 md:mt-0"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>

              {isError ? (
                <span className="text-error">Error loading users</span>
              ) : null}
              {isLoading || countQuery.isLoading ? (
                <progress className="progress" />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Roles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.users.map((user: User) => {
                          return (
                            <tr key={user.id}>
                              <td>
                                <div className="flex items-center space-x-3">
                                  <div className="avatar">
                                    <div className="mask mask-squircle h-12 w-12">
                                      <img
                                        src={user.image || ""}
                                        alt={user.name || ""}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div>{user.name}</div>
                                    {user.id === session.data?.user?.id ? (
                                      <div className="font-bold">(YOU)</div>
                                    ) : null}
                                  </div>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td className="flex-auto space-x-1">
                                {user.role.map((roleItem: Role) => {
                                  if (
                                    action?.actionType === ActionType.Remove &&
                                    action.user.id === user.id &&
                                    action.role === roleItem
                                  ) {
                                    return (
                                      <button
                                        className="btn btn-error btn-sm"
                                        key={roleItem}
                                        onClick={() =>
                                          handleRemoveRoleConfirm(
                                            user.id,
                                            roleItem
                                          )
                                        }
                                      >
                                        <FiXCircle /> &nbsp; Sure?
                                      </button>
                                    );
                                  } else {
                                    return (
                                      <button
                                        className="btn btn-sm"
                                        key={roleItem}
                                        onClick={() =>
                                          handleRemoveRoleClick(user, roleItem)
                                        }
                                      >
                                        <FiMinusCircle /> &nbsp; {roleItem}
                                      </button>
                                    );
                                  }
                                })}
                                {action?.actionType === ActionType.Add &&
                                action.user.id === user.id ? (
                                  <div className="dropdown">
                                    <label
                                      tabIndex={0}
                                      className="btn btn-sm m-1"
                                    >
                                      Roles
                                    </label>
                                    <ul
                                      tabIndex={0}
                                      className="menu dropdown-content w-52 rounded-box bg-base-100 p-2 shadow"
                                    >
                                      {roleOptions.map((roleOption, idx) => (
                                        <li key={idx}>
                                          <option
                                            onClick={() =>
                                              handleAddRoleConfirm(
                                                user.id,
                                                roleOption
                                              )
                                            }
                                            value={roleOption}
                                          >
                                            {roleOption}
                                          </option>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleAddRoleClick(user)}
                                  >
                                    <FiPlusCircle /> &nbsp; Add Role
                                  </button>
                                )}
                                {action ? (
                                  <button
                                    className="btn btn-info btn-sm"
                                    onClick={handleCancelAction}
                                  >
                                    <FiStopCircle /> &nbsp; Cancel
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm">
                      Showing{" "}
                      {totalUsers === 0
                        ? 0
                        : (currentPage - 1) * USERS_PER_PAGE + 1}{" "}
                      to {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} of{" "}
                      {totalUsers} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="btn btn-sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <FiChevronLeft />
                      </button>

                      {/* Page number buttons */}
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            // Show pages around current page
                            let pageToShow;
                            if (totalPages <= 5) {
                              pageToShow = i + 1;
                            } else if (currentPage <= 3) {
                              pageToShow = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageToShow = totalPages - 4 + i;
                            } else {
                              pageToShow = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageToShow}
                                className={`btn btn-sm ${
                                  currentPage === pageToShow ? "btn-active" : ""
                                }`}
                                onClick={() => handlePageChange(pageToShow)}
                              >
                                {pageToShow}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        className="btn btn-sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
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
