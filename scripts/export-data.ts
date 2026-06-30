/**
 * Export script — dumps wiring data from src/lib/*.ts to portable JSON.
 *
 * Reads sample-data.ts and wiring-reference.ts exports and writes them to
 * data-export/ as plain JSON, so the data can be consumed without the app.
 *
 * Usage:
 *   npx tsx scripts/export-data.ts
 */

import * as fs from "fs";
import * as path from "path";
import { sampleDiagramData } from "../src/lib/sample-data";
import {
  WIRE_GAUGE_AMPACITY,
  PDM_SPECS,
  MS3PRO_MINI_SPECS,
  TYPICAL_LOADS,
  INVERTER_RELAY_WIRING,
  GROUNDING_BEST_PRACTICES,
  VALIDATION_RULES,
} from "../src/lib/wiring-reference";

const outDir = path.join(__dirname, "..", "data-export");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sampleDataOutput = {
  sampleDiagramData,
};

const wiringReferenceOutput = {
  WIRE_GAUGE_AMPACITY,
  PDM_SPECS,
  MS3PRO_MINI_SPECS,
  TYPICAL_LOADS,
  INVERTER_RELAY_WIRING,
  GROUNDING_BEST_PRACTICES,
  VALIDATION_RULES,
};

const sampleDataPath = path.join(outDir, "sample-data.json");
const wiringReferencePath = path.join(outDir, "wiring-reference.json");

fs.writeFileSync(sampleDataPath, JSON.stringify(sampleDataOutput, null, 2));
fs.writeFileSync(wiringReferencePath, JSON.stringify(wiringReferenceOutput, null, 2));

console.log(`Wrote ${sampleDataPath}`);
console.log(`Wrote ${wiringReferencePath}`);
