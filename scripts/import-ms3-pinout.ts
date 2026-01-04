/**
 * Import script for MS3Pro Mini ECU pinout from WireViz YAML
 *
 * Reads the ms3pro_mini_corrected.yml and adds it to an existing project.
 *
 * Usage:
 *   pnpm tsx scripts/import-ms3-pinout.ts <path-to-yaml> <project-id>
 */

import { randomUUID } from "crypto";
import * as fs from "fs";
import * as yaml from "yaml";

interface Ms3YamlConnector {
  type: string;
  subtype?: string;
  pincount?: number;
  pinlabels?: string[];
  pins?: Record<number, { name: string }>;
}

interface Ms3Yaml {
  metadata: { title: string; source: string };
  connectors: {
    ECU: Ms3YamlConnector;
  };
}

interface ComponentData {
  id: string;
  projectId: string;
  name: string;
  type: string;
  manufacturer: string;
  partNumber: string;
  positionX: number;
  positionY: number;
  notes: string | null;
}

interface ConnectorData {
  id: string;
  componentId: string;
  name: string;
  type: string;
  pinCount: number;
  pinLayout: null;
  notes: string | null;
}

interface PinData {
  id: string;
  connectorId: string;
  position: string;
  label: string;
  function: string;
  wireGauge: string | null;
  fuseRating: string | null;
  isUsed: boolean;
  notes: string | null;
}

// MS3Pro Mini pin categories for circuit assignment
const PIN_CATEGORIES: Record<string, { gauge: string; category: string }> = {
  "12V": { gauge: "18 AWG", category: "power" },
  VREF: { gauge: "22 AWG", category: "sensor" },
  PWM: { gauge: "20 AWG", category: "output" },
  "Fuel pump": { gauge: "20 AWG", category: "output" },
  Injector: { gauge: "18 AWG", category: "fuel" },
  Analog: { gauge: "22 AWG", category: "sensor" },
  Spark: { gauge: "18 AWG", category: "ignition" },
  GND: { gauge: "14 AWG", category: "ground" },
  CAN: { gauge: "22 AWG", category: "communication" },
  CLT: { gauge: "22 AWG", category: "sensor" },
  IAT: { gauge: "22 AWG", category: "sensor" },
  TPS: { gauge: "22 AWG", category: "sensor" },
  CKP: { gauge: "22 AWG", category: "sensor" },
  CMP: { gauge: "22 AWG", category: "sensor" },
  Digital: { gauge: "22 AWG", category: "input" },
};

function getWireGauge(pinLabel: string): string {
  for (const [key, value] of Object.entries(PIN_CATEGORIES)) {
    if (pinLabel.includes(key)) return value.gauge;
  }
  return "22 AWG"; // Default for sensors/signals
}

export function parseMs3Pinout(
  yamlPath: string,
  projectId: string
): {
  component: ComponentData;
  connector: ConnectorData;
  pins: PinData[];
} {
  const raw = fs.readFileSync(yamlPath, "utf-8");
  const data: Ms3Yaml = yaml.parse(raw);

  const ecu = data.connectors.ECU;
  const componentId = randomUUID();
  const connectorId = randomUUID();

  // Get pin labels - support both formats
  let pinLabels: string[] = [];
  if (ecu.pinlabels) {
    pinLabels = ecu.pinlabels;
  } else if (ecu.pins) {
    const maxPin = Math.max(...Object.keys(ecu.pins).map(Number));
    for (let i = 1; i <= maxPin; i++) {
      pinLabels.push(ecu.pins[i]?.name || `Pin ${i}`);
    }
  }

  const component: ComponentData = {
    id: componentId,
    projectId,
    name: "MS3Pro Mini ECU",
    type: "ecu",
    manufacturer: "AMPEFI",
    partNumber: "MS3Pro Mini",
    positionX: 100,
    positionY: 300,
    notes: `${ecu.subtype || "AMPSEAL 35"} connector. Flying lead harness.`,
  };

  const connector: ConnectorData = {
    id: connectorId,
    componentId,
    name: ecu.subtype || "AMPSEAL 35",
    type: "male",
    pinCount: pinLabels.length,
    pinLayout: null,
    notes: `Source: ${data.metadata.source}`,
  };

  const pins: PinData[] = pinLabels.map((label, index) => ({
    id: randomUUID(),
    connectorId,
    position: String(index + 1),
    label: `Pin ${index + 1}`,
    function: label,
    wireGauge: getWireGauge(label),
    fuseRating: null,
    isUsed: !label.toLowerCase().includes("not used"),
    notes: null,
  }));

  return { component, connector, pins };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: pnpm tsx scripts/import-ms3-pinout.ts <yaml-path> <project-id>");
    process.exit(1);
  }

  const yamlPath = args[0] as string;
  const projectId = args[1] as string;

  if (!fs.existsSync(yamlPath)) {
    console.error(`Error: File not found: ${yamlPath}`);
    process.exit(1);
  }

  console.log(`Parsing MS3Pro Mini pinout from: ${yamlPath}`);
  const result = parseMs3Pinout(yamlPath, projectId);

  console.log("\n=== MS3Pro Mini Import Summary ===");
  console.log(`Component: ${result.component.name}`);
  console.log(`  Manufacturer: ${result.component.manufacturer}`);
  console.log(`  Part Number: ${result.component.partNumber}`);
  console.log(`Connector: ${result.connector.name} (${result.connector.pinCount} pins)`);
  console.log(`Pins by category:`);

  const categories = new Map<string, number>();
  for (const pin of result.pins) {
    for (const [key, value] of Object.entries(PIN_CATEGORIES)) {
      if (pin.function.includes(key)) {
        categories.set(value.category, (categories.get(value.category) || 0) + 1);
        break;
      }
    }
  }
  for (const [cat, count] of categories) {
    console.log(`  - ${cat}: ${count}`);
  }

  // Output JSON
  const outputPath = yamlPath.replace(/\.(yaml|yml)$/, "_import.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nPreview written to: ${outputPath}`);
}
