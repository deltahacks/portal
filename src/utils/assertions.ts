import RoleSchema, {
  RoleType,
} from "../../prisma/zod/inputTypeSchemas/RoleSchema";

import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

const roleTypes = Object.keys(RoleSchema.Enum);

export const hasRequiredRoles = (
  srcRoles?: string[],
  requiredRoles?: RoleType[]
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
      roleTypes.includes(role) && requiredRoles.includes(role as RoleType);
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
  requiredRoles?: RoleType[]
) => {
  assertWithTRPCError(
    hasRequiredRoles(srcRoles, requiredRoles),
    "UNAUTHORIZED"
  );
};