import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { Role, EquipmentType, EquipmentAction, Prisma } from "@prisma/client";
import { z } from "zod";

export const equipmentRouter = router({});
