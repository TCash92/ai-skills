export interface ChecklistFormData {
  date: string;
  employeeName: string;
  employeeId: string;
  assetMake: string;
  assetId: string;
  hours: string;
  kilometers: string;
  itemsInspected: string[];
  itemsRequiringAttention: string[];
  equipmentCondition: "ok" | "requires_attention" | "";
  comments: string;
  actionTaken: "cleared" | "reported" | "";
}

export const INSPECTION_ITEMS = [
  {
    id: "engine_oil",
    label: "Engine Oil",
    description: "Check for proper level (between min/max marks), discoloration, contamination, leaks",
  },
  {
    id: "hydraulic_oil",
    label: "Hydraulic Oil",
    description: "Check for proper level in reservoir, clarity/color, leaks in lines/fittings/cylinders, unusual sounds during operation",
  },
  {
    id: "coolant_level",
    label: "Coolant Level",
    description: "Check for proper level in radiator/overflow tank, color/clarity, leaks, cooling system function",
  },
  {
    id: "chassis_rops",
    label: "Chassis ROPS",
    description: "Check for structural integrity, missing components, cracks, loose bolts, deformation. Examples: ROPS has visible crack at mounting point, missing bolt at ROPS connection, signs of previous damage/repair, loose attachment points, seatbelt anchor point damaged",
  },
  {
    id: "fire_extinguisher",
    label: "Fire Extinguisher",
    description: "Check for presence, accessibility, pressure gauge in green zone, seal intact, inspection date current",
  },
  {
    id: "horn",
    label: "Horn",
    description: "Check for function, audibility, control accessibility",
  },
  {
    id: "gauges",
    label: "Gauges",
    description: "Check for all gauges functional, proper readings, illumination if applicable. Examples: Fuel gauge not working, temperature gauge showing overheating, oil pressure gauge fluctuating, hour meter stuck/not advancing, warning lights staying illuminated after startup",
  },
  {
    id: "backup_alarm",
    label: "Backup Alarm",
    description: "Check for function, audibility, automatic activation when in reverse",
  },
  {
    id: "lights_markers_beacons",
    label: "Lights/Markers/Beacons",
    description: "Check for function of all lights (headlights, tail lights, turn signals, hazard lights, work lights, beacons)",
  },
  {
    id: "glass",
    label: "Glass",
    description: "Check for visibility, cracks, chips, proper mounting, function of wipers if applicable",
  },
  {
    id: "mirrors",
    label: "Mirrors",
    description: "Check for presence, secure mounting, adjustment capability, cleanliness, cracks. Examples: Right mirror missing, mirror bracket loose, mirror glass cracked, unable to properly adjust mirror, mirror vibrates excessively during operation, mirror doesn't provide adequate field of view",
  },
] as const;

export const EMPLOYEE_IDS = [
  { value: "01", label: "01" },
  { value: "02", label: "02" },
  { value: "03", label: "03" },
  { value: "04", label: "04" },
  { value: "05", label: "05" },
  { value: "06", label: "06" },
  { value: "07", label: "07" },
  { value: "08", label: "08" },
  { value: "09", label: "09" },
  { value: "10", label: "10" },
  { value: "unknown", label: "I Don't Know" },
] as const;

export type InspectionItemId = typeof INSPECTION_ITEMS[number]["id"];
