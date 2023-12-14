import { Role } from "@prisma/client";

import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

const roleTypes = Object.keys(Role);

export const hasRequiredRoles = (
  srcRoles?: string[],
  requiredRoles?: Role[]
) => {
  if (!srcRoles) {
    return false;
  }
  if (!requiredRoles) {
    return true;
  }

  let hasAtLeastOneRequiredRole = false;
  srcRoles.forEach((role) => {
    hasAtLeastOneRequiredRole ||=
      roleTypes.includes(role) && requiredRoles.includes(role as Role);
  });
  return hasAtLeastOneRequiredRole;
};

export const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    throw new Error(msg);
  }
};

export const assertWithTRPCError = (
  condition: boolean,
  msg: TRPC_ERROR_CODE_KEY
) => {
  if (!condition) {
    throw new TRPCError({ code: msg });
  }
};

export const assertHasRequiredRoles = (
  srcRoles?: string[],
  requiredRoles?: Role[]
) => {
  assertWithTRPCError(
    hasRequiredRoles(srcRoles, requiredRoles),
    "UNAUTHORIZED"
  );
};
