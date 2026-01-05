import { z } from "zod";

// =============================================================================
// Station
// =============================================================================

export const stationNameSchema = z.enum(["checkIn", "food", "events"]);
export type StationName = z.infer<typeof stationNameSchema>;

export const stationLabels: Record<StationName, string> = {
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

export const selectedStationSchema = z.object({
  name: stationNameSchema,
  stationId: z.string().nullable(), // null for checkIn, station ID for food/events
  optionLabel: z.string().nullable(), // display label for the selected option
});
export type SelectedStation = z.infer<typeof selectedStationSchema>;

export const wizardStateSchema = z.object({
  step: wizardStepSchema,
  station: selectedStationSchema.nullable(),
});
export type WizardState = z.infer<typeof wizardStateSchema>;

export const wizardActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SELECT_STATION"),
    stationName: stationNameSchema,
  }),
  z.object({
    type: z.literal("SELECT_OPTION"),
    stationId: z.string(),
    optionLabel: z.string(),
  }),
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
  error: z.string().optional(),
});
export type ScanState = z.infer<typeof scanStateSchema>;

export const scannerQueueItemSchema = z.object({
  id: z.string(),
  stationId: z.string(), // "checkIn" or the station record ID
});
export type ScannerQueueItem = z.infer<typeof scannerQueueItemSchema>;
