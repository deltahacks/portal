import { EquipmentAction, Prisma } from "@prisma/client";
import { z } from "zod";

export const hardwareItemSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  freeText: z.boolean().optional(),
});
export type HardwareItem = z.infer<typeof hardwareItemSchema>;

// Shape stored in EquipmentLog.items for HARDWARE logs
export const hardwareLogItemsSchema = z.object({
  items: z.array(hardwareItemSchema),
  idCollected: z.boolean().optional(),
});

export const parseHardwareLogItems = (items: Prisma.JsonValue) =>
  hardwareLogItemsSchema.parse(items);

export type OutstandingHardware = {
  items: { name: string; quantity: number; freeText: boolean }[];
  idHeld: boolean;
};

// Logs must be ordered oldest first. ID is considered held from the first
// "ID collected" sign-out until everything outstanding has been returned.
export const getOutstandingHardware = (
  logs: { action: EquipmentAction; items: Prisma.JsonValue }[],
): OutstandingHardware => {
  const outstanding = new Map<
    string,
    { quantity: number; freeText: boolean }
  >();
  let idHeld = false;

  for (const log of logs) {
    const { items, idCollected } = parseHardwareLogItems(log.items);
    const sign = log.action === EquipmentAction.CHECK_OUT ? 1 : -1;
    for (const item of items) {
      const prev = outstanding.get(item.name);
      const quantity = (prev?.quantity ?? 0) + sign * item.quantity;
      if (quantity > 0) {
        outstanding.set(item.name, {
          quantity,
          freeText: item.freeText ?? prev?.freeText ?? false,
        });
      } else {
        outstanding.delete(item.name);
      }
    }
    if (outstanding.size === 0) idHeld = false;
    else if (idCollected) idHeld = true;
  }

  return {
    items: Array.from(outstanding, ([name, value]) => ({ name, ...value })),
    idHeld,
  };
};
