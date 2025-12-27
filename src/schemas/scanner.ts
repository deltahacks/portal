import { z } from "zod";

// =============================================================================
// Station
// =============================================================================

export const stationSchema = z.enum(["checkIn", "food", "events"]);
export type Station = z.infer<typeof stationSchema>;

export const foodOptions = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "drink",
] as const;

export const eventOptions = [
  "workshop1",
  "workshop2",
  "workshop3",
  "workshop4",
  "workshop5",
  "workshop6",
  "workshop7",
  "workshop8",
  "workshop9",
] as const;

export const foodOptionSchema = z.enum(foodOptions);
export const eventOptionSchema = z.enum(eventOptions);
export const stationOptionsSchema = z.union([
  foodOptionSchema,
  eventOptionSchema,
]);
export type StationOptions = z.infer<typeof stationOptionsSchema>;

export const stationConfigSchema = z.object({
  name: stationSchema,
  type: z.string(),
});
export type StationConfig = z.infer<typeof stationConfigSchema>;

export const stationOptionsMap: Record<Station, readonly string[]> = {
  checkIn: [],
  events: eventOptions,
  food: foodOptions,
};

export const stationLabels: Record<Station, string> = {
  checkIn: "Check In",
  food: "Food",
  events: "Events",
};

// =============================================================================
// Wizard
// =============================================================================

export const wizardStepSchema = z.enum([
  "selectingStation",
  "selectingOption",
  "ready",
]);
export type WizardStep = z.infer<typeof wizardStepSchema>;

export const wizardStateSchema = z.object({
  step: wizardStepSchema,
  station: stationConfigSchema.nullable(),
});
export type WizardState = z.infer<typeof wizardStateSchema>;

export const wizardActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SELECT_STATION"), station: stationSchema }),
  z.object({ type: z.literal("SELECT_OPTION"), option: z.string() }),
  z.object({ type: z.literal("RESET") }),
]);
export type WizardAction = z.infer<typeof wizardActionSchema>;

export const initialWizardState: WizardState = {
  step: "selectingStation",
  station: null,
};

// =============================================================================
// Scanner
// =============================================================================

export const scanStatusSchema = z.enum(["idle", "success", "error"]);
export type ScanStatus = z.infer<typeof scanStatusSchema>;

export const scanStateSchema = z.object({
  status: scanStatusSchema,
  message: z.string().optional(),
});
export type ScanState = z.infer<typeof scanStateSchema>;

export const scannerQueueItemSchema = z.object({
  id: z.string(),
  station: stationConfigSchema,
});
export type ScannerQueueItem = z.infer<typeof scannerQueueItemSchema>;
