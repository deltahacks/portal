import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface PageTab {
  pageName: string;
  link: string;
}

/**
 * Custom hook to generate role-based navigation tabs
 * Returns appropriate page tabs based on user roles
 */
export const useRoleBasedTabs = (): PageTab[] => {
  const { data: session } = useSession();

  const userRoles = session?.user?.role || [];

  const baseTabs: PageTab[] = [{ pageName: "Dashboard", link: "/dashboard" }];

  const roleBasedTabs: PageTab[] = [];

  // Add scanner tab for scanner roles
  if (
    userRoles.includes(Role.ADMIN) ||
    userRoles.includes(Role.GENERAL_SCANNER) ||
    userRoles.includes(Role.FOOD_MANAGER) ||
    userRoles.includes(Role.EVENT_MANAGER)
  ) {
    roleBasedTabs.push({ pageName: "Scanner", link: "/scanner" });
  }

  // Add admin tabs for admin roles
  if (userRoles.includes(Role.ADMIN)) {
    roleBasedTabs.push(
      { pageName: "Admin", link: "/admin" },
      { pageName: "Roles", link: "/admin/roles" },
      { pageName: "Timeslots", link: "/admin/timeslot" },
      { pageName: "Grading", link: "/admin/grade" },
      { pageName: "Judging", link: "/admin/judging" },
    );
  }

  return [...baseTabs, ...roleBasedTabs];
};
