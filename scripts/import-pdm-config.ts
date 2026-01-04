/**
 * Import script for Bussmann PDM configuration
 *
 * Reads the existing miata_pdm_plan.json and converts it to our database schema.
 * Can be run standalone or used as a module.
 *
 * Usage:
 *   pnpm tsx scripts/import-pdm-config.ts <path-to-json> <user-id>
 */

import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// Types for the existing PDM JSON format
interface PdmPinConfig {
  label: string;
  connect_to: string;
  note?: string;
  fuse?: string;
  wire?: string;
}

interface PdmConnectorConfig {
  [pin: string]: PdmPinConfig;
}

interface PdmInverterRelay {
  to_pdm: string;
  "85": string;
  "86": string;
  "30": string;
  "87": string;
}

interface PdmJson {
  board: string;
  orientation: {
    top_row: string[];
    bottom_row: string[];
  };
  decisions: Record<string, string>;
  connectors: {
    BLACK: PdmConnectorConfig;
    GREY: PdmConnectorConfig;
    BLUE: PdmConnectorConfig;
    GREEN: PdmConnectorConfig;
  };
  inverter_relays: {
    fan: PdmInverterRelay;
    fuel: PdmInverterRelay;
  };
  tail_relay: Record<string, string | string[]>;
  flasher: Record<string, unknown>;
}

// Output format matching our database schema
interface ProjectData {
  id: string;
  name: string;
  description: string;
  year: number;
  make: string;
  model: string;
  status: string;
}

interface ComponentData {
  id: string;
  projectId: string;
  name: string;
  type: string;
  manufacturer: string | null;
  partNumber: string | null;
  positionX: number;
  positionY: number;
  notes: string | null;
}

interface ConnectorData {
  id: string;
  componentId: string;
  name: string;
  type: string | null;
  pinCount: number;
  pinLayout: { rows: string[][] } | null;
  notes: string | null;
}

interface PinData {
  id: string;
  connectorId: string;
  position: string;
  label: string | null;
  function: string | null;
  wireGauge: string | null;
  fuseRating: string | null;
  isUsed: boolean;
  notes: string | null;
}

interface CircuitData {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  color: string;
  category: string;
}

interface ImportResult {
  project: ProjectData;
  circuits: CircuitData[];
  components: ComponentData[];
  connectors: ConnectorData[];
  pins: PinData[];
}

// Circuit color mapping
const CIRCUIT_COLORS: Record<string, { color: string; category: string }> = {
  "Low Beam": { color: "#fbbf24", category: "lighting" }, // amber
  "High Beam": { color: "#f59e0b", category: "lighting" }, // orange
  Accessory: { color: "#8b5cf6", category: "accessories" }, // purple
  "Engine Management": { color: "#ef4444", category: "engine" }, // red
  "Cooling System": { color: "#3b82f6", category: "cooling" }, // blue
  "Fuel System": { color: "#22c55e", category: "fuel" }, // green
  "Tail/Markers": { color: "#ec4899", category: "lighting" }, // pink
  "Hazard/Turn": { color: "#f97316", category: "lighting" }, // orange
  Ground: { color: "#1f2937", category: "power" }, // dark gray
  Power: { color: "#dc2626", category: "power" }, // red
};

// Helper to get circuit info - non-null assertion is safe because we use keyof typeof
function getCircuitInfo(name: keyof typeof CIRCUIT_COLORS): { name: string; color: string; category: string } {
  const info = CIRCUIT_COLORS[name]!;
  return { name, color: info.color, category: info.category };
}

// Determine circuit from pin function
function inferCircuit(
  connectTo: string,
  label: string
): { name: string; color: string; category: string } | null {
  const text = `${connectTo} ${label}`.toLowerCase();

  // Headlight circuits - check for various patterns
  if (
    (text.includes("low") && (text.includes("beam") || text.includes("headlight"))) ||
    text.includes("low fuse")
  ) {
    return getCircuitInfo("Low Beam");
  }
  if (
    (text.includes("high") && (text.includes("beam") || text.includes("headlight"))) ||
    text.includes("high fuse") ||
    text.includes("high/flash")
  ) {
    return getCircuitInfo("High Beam");
  }
  if (text.includes("acc") || text.includes("radio") || text.includes("window")) {
    return getCircuitInfo("Accessory");
  }
  if (
    text.includes("ecu") ||
    text.includes("ms3") ||
    text.includes("injector") ||
    text.includes("coil") ||
    text.includes("o2")
  ) {
    return getCircuitInfo("Engine Management");
  }
  if (text.includes("fan") || text.includes("cool")) {
    return getCircuitInfo("Cooling System");
  }
  if (text.includes("fuel") || text.includes("pump")) {
    return getCircuitInfo("Fuel System");
  }
  if (text.includes("tail") || text.includes("marker") || text.includes("license")) {
    return getCircuitInfo("Tail/Markers");
  }
  if (text.includes("hazard") || text.includes("turn") || text.includes("flasher")) {
    return getCircuitInfo("Hazard/Turn");
  }
  if (text.includes("ground") || text.includes("gnd")) {
    return getCircuitInfo("Ground");
  }

  return null;
}

export function parsePdmConfig(jsonPath: string, _userId: string): ImportResult {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const pdm: PdmJson = JSON.parse(raw);

  // Generate IDs
  const projectId = randomUUID();
  const pdmComponentId = randomUUID();

  // Create project
  const project: ProjectData = {
    id: projectId,
    name: "1993 NA Miata Full Rewire",
    description: `Full rewire with ${pdm.board} PDM and MS3Pro Mini ECU. Future-proofed for Volvo B5 swap.`,
    year: 1993,
    make: "Mazda",
    model: "Miata (NA)",
    status: "active",
  };

  // Track circuits we create
  const circuitMap = new Map<string, CircuitData>();
  const circuits: CircuitData[] = [];

  // Create PDM component
  const components: ComponentData[] = [
    {
      id: pdmComponentId,
      projectId,
      name: "Bussmann PDM",
      type: "pdu",
      manufacturer: "Eaton/Bussmann",
      partNumber: pdm.board,
      positionX: 400,
      positionY: 300,
      notes: `R3=${pdm.decisions.R3}, Fans=${pdm.decisions.fans}`,
    },
  ];

  const connectors: ConnectorData[] = [];
  const pins: PinData[] = [];

  // Process each connector (BLACK, GREY, BLUE, GREEN)
  const connectorColors = ["BLACK", "GREY", "BLUE", "GREEN"] as const;
  // Connector positions for future diagram layout
  const _connectorPositions = {
    BLACK: { x: 200, y: 100 },
    GREY: { x: 600, y: 100 },
    BLUE: { x: 200, y: 500 },
    GREEN: { x: 600, y: 500 },
  };
  void _connectorPositions; // Mark as intentionally unused for now

  for (const color of connectorColors) {
    const connectorData = pdm.connectors[color];
    const pinPositions = Object.keys(connectorData);
    const connectorId = randomUUID();

    // Connector with layout based on PDM orientation
    connectors.push({
      id: connectorId,
      componentId: pdmComponentId,
      name: color,
      type: "female",
      pinCount: pinPositions.length,
      pinLayout: {
        rows: [pdm.orientation.top_row, pdm.orientation.bottom_row],
      },
      notes: null,
    });

    // Create pins for this connector
    for (const [position, config] of Object.entries(connectorData)) {
      const isUsed = !config.connect_to.includes("not used") &&
                     !config.connect_to.includes("leave empty") &&
                     !config.connect_to.includes("spare");

      // Infer circuit from pin function
      const circuitInfo = inferCircuit(config.connect_to, config.label);
      if (circuitInfo && !circuitMap.has(circuitInfo.name)) {
        const circuitId = randomUUID();
        const circuit: CircuitData = {
          id: circuitId,
          projectId,
          name: circuitInfo.name,
          description: null,
          color: circuitInfo.color,
          category: circuitInfo.category,
        };
        circuits.push(circuit);
        circuitMap.set(circuitInfo.name, circuit);
      }

      pins.push({
        id: randomUUID(),
        connectorId,
        position,
        label: config.label,
        function: config.connect_to,
        wireGauge: config.wire || null,
        fuseRating: config.fuse || null,
        isUsed,
        notes: config.note || null,
      });
    }
  }

  // Add inverter relays as separate components
  const fanInverterId = randomUUID();
  const fuelInverterId = randomUUID();

  components.push(
    {
      id: fanInverterId,
      projectId,
      name: "Fan Inverter Relay",
      type: "relay",
      manufacturer: null,
      partNumber: null,
      positionX: 500,
      positionY: 200,
      notes: `Converts MS3 low-side fan output to +12V for PDM R5. Output to ${pdm.inverter_relays.fan.to_pdm}`,
    },
    {
      id: fuelInverterId,
      projectId,
      name: "Fuel Inverter Relay",
      type: "relay",
      manufacturer: null,
      partNumber: null,
      positionX: 500,
      positionY: 400,
      notes: `Converts MS3 low-side fuel output to +12V for PDM R6. Output to ${pdm.inverter_relays.fuel.to_pdm}`,
    }
  );

  // Add inverter relay connectors and pins
  for (const [name, config, componentId] of [
    ["Fan Inverter", pdm.inverter_relays.fan, fanInverterId],
    ["Fuel Inverter", pdm.inverter_relays.fuel, fuelInverterId],
  ] as const) {
    const connId = randomUUID();
    connectors.push({
      id: connId,
      componentId: componentId as string,
      name: `${name} Pins`,
      type: "relay",
      pinCount: 5,
      pinLayout: null,
      notes: null,
    });

    // Standard relay pinout
    const relayPins = [
      { pos: "85", func: config["85"] },
      { pos: "86", func: config["86"] },
      { pos: "30", func: config["30"] },
      { pos: "87", func: config["87"] },
      { pos: "87a", func: "(not used)" },
    ];

    for (const rp of relayPins) {
      pins.push({
        id: randomUUID(),
        connectorId: connId,
        position: rp.pos,
        label: rp.pos,
        function: rp.func,
        wireGauge: rp.pos === "87a" ? null : "20-22 AWG",
        fuseRating: rp.pos === "86" ? "1-3A" : null,
        isUsed: !rp.func.includes("not used"),
        notes: null,
      });
    }
  }

  // Add external tail relay
  const tailRelayId = randomUUID();
  components.push({
    id: tailRelayId,
    projectId,
    name: "External Tail Relay",
    type: "relay",
    manufacturer: null,
    partNumber: null,
    positionX: 300,
    positionY: 600,
    notes: "Controls tail lights, markers, and license plate lights. Required since R3 is used for ACC.",
  });

  const tailConnId = randomUUID();
  connectors.push({
    id: tailConnId,
    componentId: tailRelayId,
    name: "Tail Relay Pins",
    type: "relay",
    pinCount: 5,
    pinLayout: null,
    notes: null,
  });

  const tailPins = [
    { pos: "30", func: pdm.tail_relay["30"] as string },
    { pos: "85", func: pdm.tail_relay["85"] as string },
    { pos: "86", func: pdm.tail_relay["86"] as string },
    { pos: "87", func: (pdm.tail_relay["87"] as string[]).join(", ") },
    { pos: "87a", func: "(not used)" },
  ];

  for (const tp of tailPins) {
    pins.push({
      id: randomUUID(),
      connectorId: tailConnId,
      position: tp.pos,
      label: tp.pos,
      function: tp.func,
      wireGauge: tp.pos === "87a" ? null : "16-18 AWG",
      fuseRating: tp.pos === "87" ? "7.5-10A each branch" : null,
      isUsed: !tp.func.includes("not used"),
      notes: null,
    });
  }

  return {
    project,
    circuits,
    components,
    connectors,
    pins,
  };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: pnpm tsx scripts/import-pdm-config.ts <json-path> <user-id>");
    console.log("");
    console.log("Example:");
    console.log(
      '  pnpm tsx scripts/import-pdm-config.ts "/path/to/miata_pdm_plan.json" "user_123"'
    );
    process.exit(1);
  }

  const jsonPath = args[0] as string;
  const userId = args[1] as string;

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`Parsing PDM config from: ${jsonPath}`);
  const result = parsePdmConfig(jsonPath, userId);

  console.log("\n=== Import Summary ===");
  console.log(`Project: ${result.project.name}`);
  console.log(`  Year/Make/Model: ${result.project.year} ${result.project.make} ${result.project.model}`);
  console.log(`Circuits: ${result.circuits.length}`);
  result.circuits.forEach((c) => console.log(`  - ${c.name} (${c.category})`));
  console.log(`Components: ${result.components.length}`);
  result.components.forEach((c) => console.log(`  - ${c.name} [${c.type}]`));
  console.log(`Connectors: ${result.connectors.length}`);
  result.connectors.forEach((c) => console.log(`  - ${c.name} (${c.pinCount} pins)`));
  console.log(`Pins: ${result.pins.length}`);
  console.log(`  Used: ${result.pins.filter((p) => p.isUsed).length}`);
  console.log(`  Unused: ${result.pins.filter((p) => !p.isUsed).length}`);

  // Write output to JSON for inspection
  const outputPath = path.join(path.dirname(jsonPath), "import_preview.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nPreview written to: ${outputPath}`);
}
