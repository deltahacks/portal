import RoleSchema, {
  RoleType,
} from "../../prisma/zod/inputTypeSchemas/RoleSchema";

import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

const roleTypes = Object.keys(RoleSchema.Enum);

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
  roles: string[],
  requiredRoles: RoleType[]
) => {
  let hasAtLeastOneRequiredRole = false;
  roles.forEach((role) => {
    hasAtLeastOneRequiredRole ||=
      roleTypes.includes(role) && requiredRoles.includes(role as RoleType);
  });
  assertWithTRPCError(hasAtLeastOneRequiredRole, "UNAUTHORIZED");
};
