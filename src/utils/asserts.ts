import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

export function assert(condition: unknown, message = ""): asserts condition {
  if (!condition) throw Error(`Assert failed ${condition}: ${message}`);
}

export function trpcAssert(
  condition: unknown,
  code: TRPC_ERROR_CODE_KEY,
  message?: string
): asserts condition {
  if (!condition) throw new TRPCError({ code, message });
}
