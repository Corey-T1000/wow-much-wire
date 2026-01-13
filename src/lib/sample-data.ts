/**
 * 1993 NA Miata Full Rewire - Actual Project Data
 * Based on documented PDM plan and master wiring diagram
 */

import type { DiagramData } from "@/components/diagram/types";

export const sampleDiagramData: DiagramData = {
  circuits: [
    { id: "circuit-highbeam", name: "High Beam", color: "#f59e0b", category: "lighting" },
    { id: "circuit-lowbeam", name: "Low Beam", color: "#d97706", category: "lighting" }, // Darker amber for contrast
    { id: "circuit-acc", name: "Accessory", color: "#8b5cf6", category: "accessories" },
    { id: "circuit-cooling", name: "Cooling System", color: "#3b82f6", category: "cooling" },
    { id: "circuit-fuel", name: "Fuel System", color: "#22c55e", category: "fuel" },
    { id: "circuit-engine", name: "Engine Management", color: "#ef4444", category: "engine" },
    { id: "circuit-tail", name: "Tail/Markers", color: "#ec4899", category: "lighting" },
    { id: "circuit-hazard", name: "Hazard/Turn", color: "#f97316", category: "lighting" },
    { id: "circuit-ground", name: "Power Grounds", color: "#6b7280", category: "ground" },
    { id: "circuit-sensor-ground", name: "Sensor Grounds", color: "#059669", category: "ground" },
    { id: "circuit-5v-ref", name: "5V Reference", color: "#a855f7", category: "reference" },
    { id: "circuit-reverse", name: "Reverse Lights", color: "#c4b5fd", category: "lighting" }, // Light violet (visible on light/dark)
    { id: "circuit-brake", name: "Brake Lights", color: "#dc2626", category: "lighting" },
    { id: "circuit-marker", name: "Side Markers", color: "#ca8a04", category: "lighting" }, // Darker amber/gold
    { id: "circuit-interior", name: "Interior Lights", color: "#78716c", category: "lighting" }, // Warmer stone grey
    { id: "circuit-start", name: "Starting", color: "#7c3aed", category: "engine" },
    { id: "circuit-charge", name: "Charging", color: "#0ea5e9", category: "engine" },
    { id: "circuit-wiper", name: "Wipers", color: "#14b8a6", category: "accessories" },
    { id: "circuit-ac", name: "A/C System", color: "#06b6d4", category: "accessories" },
    { id: "circuit-horn", name: "Horn", color: "#f43f5e", category: "accessories" },
    { id: "circuit-window", name: "Power Windows", color: "#8b5cf6", category: "accessories" },
    { id: "circuit-radio", name: "Radio/Audio", color: "#d946ef", category: "accessories" },
    { id: "circuit-gauge", name: "Gauges/Cluster", color: "#84cc16", category: "accessories" },
  ],
  components: [
    // ===========================================
    // PDM - MAIN POWER DISTRIBUTION
    // ===========================================
    {
      id: "pdm-main",
      name: "Bussmann PDM",
      type: "pdu",
      manufacturer: "Eaton/Bussmann",
      partNumber: "31S-001-0",
      notes: "Main power distribution module with 6 onboard relays (R1-LOW, R2-HIGH, R3-ACC, R4-ECU, R5-FANS, R6-FUEL). Lid orientation: top row D-C-B-A, bottom row E-F-G-H.",
      connectors: [
        {
          id: "pdm-black",
          name: "BLACK",
          type: "female",
          pinCount: 8,
          pinLayout: { rows: [["D", "C", "B", "A"], ["E", "F", "G", "H"]] },
          pins: [
            { id: "black-a", position: "A", label: "R2-87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "black-b", position: "B", label: "R1-87", function: "(leave empty) - internal LOW bus", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "black-c", position: "C", label: "R1-86", function: "Column LOW +12", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "black-d", position: "D", label: "R1-87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "black-e", position: "E", label: "R3-86", function: "Key ACC +12", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "black-f", position: "F", label: "R3-87", function: "ACC sub-fuse block feed", wireGauge: "12-16 AWG", fuseRating: null, isUsed: true },
            { id: "black-g", position: "G", label: "R2-86", function: "Column HIGH/Flash +12", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "black-h", position: "H", label: "R2-87", function: "(leave empty) - internal HIGH bus", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
        {
          id: "pdm-grey",
          name: "GREY",
          type: "female",
          pinCount: 8,
          pinLayout: { rows: [["D", "C", "B", "A"], ["E", "F", "G", "H"]] },
          pins: [
            { id: "grey-a", position: "A", label: "—", function: "(spare)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "grey-b", position: "B", label: "Fan fuse", function: "Fan 2 +", wireGauge: "12-14 AWG", fuseRating: "25-30A", isUsed: true },
            { id: "grey-c", position: "C", label: "R5-87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "grey-d", position: "D", label: "Fan fuse", function: "Fan 1 +", wireGauge: "12-14 AWG", fuseRating: "25-30A", isUsed: true },
            { id: "grey-e", position: "E", label: "R5-86", function: "From Fan inverter relay 87 (+12)", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "grey-f", position: "F", label: "—", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "grey-g", position: "G", label: "R6-86", function: "From Fuel inverter relay 87 (+12)", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "grey-h", position: "H", label: "R6-87", function: "Fuel pump + at tank", wireGauge: "14 AWG", fuseRating: "15-20A", isUsed: true },
          ],
        },
        {
          id: "pdm-blue",
          name: "BLUE",
          type: "female",
          pinCount: 8,
          pinLayout: { rows: [["D", "C", "B", "A"], ["E", "F", "G", "H"]] },
          pins: [
            { id: "blue-a", position: "A", label: "ACC fuse", function: "Radio ACC", wireGauge: "18-16 AWG", fuseRating: "10A", isUsed: true },
            { id: "blue-b", position: "B", label: "ACC fuse", function: "Power windows", wireGauge: "14-16 AWG", fuseRating: "15-25A", isUsed: true },
            { id: "blue-c", position: "C", label: "RX-85", function: "Engine block star ground", wireGauge: "14-16 AWG", fuseRating: null, isUsed: true },
            { id: "blue-d", position: "D", label: "B+ fuse", function: "External TAIL relay pin 30", wireGauge: "16-18 AWG", fuseRating: "15A", isUsed: true },
            { id: "blue-e", position: "E", label: "B+ fuse", function: "Hazard flasher B+", wireGauge: "18-16 AWG", fuseRating: "10A", isUsed: true },
            { id: "blue-f", position: "F", label: "LOW fuse L", function: "Left headlight LOW", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "blue-g", position: "G", label: "LOW fuse R", function: "Right headlight LOW", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "blue-h", position: "H", label: "IGN fuse", function: "Turn flasher IGN feed (unused - simplified circuit uses single B+ feed via blue-e)", wireGauge: "18-16 AWG", fuseRating: "10A", isUsed: false },
          ],
        },
        {
          id: "pdm-green",
          name: "GREEN",
          type: "female",
          pinCount: 8,
          pinLayout: { rows: [["D", "C", "B", "A"], ["E", "F", "G", "H"]] },
          pins: [
            { id: "green-a", position: "A", label: "ECU fuse", function: "MS3Pro Mini +12 main", wireGauge: "18 AWG", fuseRating: "7.5-10A", isUsed: true },
            { id: "green-b", position: "B", label: "ECU fuse", function: "Injectors +12 common", wireGauge: "16-14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "green-c", position: "C", label: "R4-87", function: "(leave empty) - internal bus", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "green-d", position: "D", label: "ECU/B+ fuse", function: "Wideband/O2 heater OR Coils +12", wireGauge: "14-16 AWG", fuseRating: "5-20A", isUsed: true },
            { id: "green-e", position: "E", label: "R4-86", function: "Key IGN-RUN +12", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "green-f", position: "F", label: "R4-87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
            { id: "green-g", position: "G", label: "HIGH fuse L", function: "Left headlight HIGH", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "green-h", position: "H", label: "HIGH fuse R", function: "Right headlight HIGH", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // ECU - MS3PRO MINI
    // ===========================================
    {
      id: "ecu-ms3",
      name: "MS3Pro Mini ECU",
      type: "ecu",
      manufacturer: "AMPEFI",
      partNumber: "MS3Pro Mini",
      notes: "35-pin AMPSEAL connector. Low-side outputs need inverter relays for PDM integration.",
      connectors: [
        {
          id: "ms3-main",
          name: "AMPSEAL 35",
          type: "male",
          pinCount: 35,
          pinLayout: null,
          pins: [
            { id: "ms3-1", position: "1", label: "Pin 1", function: "12V+ switched in", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-2", position: "2", label: "Pin 2", function: "Power Ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-3", position: "3", label: "Pin 3", function: "Sensor Ground (SGND)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-4", position: "4", label: "Pin 4", function: "Fuel pump output (low-side)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-5", position: "5", label: "Pin 5", function: "Injector 1", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-6", position: "6", label: "Pin 6", function: "Injector 2", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-7", position: "7", label: "Pin 7", function: "Injector 3", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-8", position: "8", label: "Pin 8", function: "Injector 4", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-9", position: "9", label: "Pin 9", function: "Fan output (low-side)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-17", position: "17", label: "Pin 17", function: "Spark A (Coil 1)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-18", position: "18", label: "Pin 18", function: "Spark B (Coil 2)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-21", position: "21", label: "Pin 21", function: "Internal MAP sensor (onboard 1-bar, no external wiring needed)", wireGauge: null, fuseRating: null, isUsed: true },
            { id: "ms3-22", position: "22", label: "Pin 22", function: "TPS input", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-23", position: "23", label: "Pin 23", function: "CLT sensor", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-24", position: "24", label: "Pin 24", function: "IAT sensor", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-25", position: "25", label: "Pin 25", function: "O2 sensor input", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-10", position: "10", label: "Pin 10", function: "Tach output", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-11", position: "11", label: "Pin 11", function: "Idle Air Control", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-26", position: "26", label: "Pin 26", function: "VR1+/Crank signal", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-27", position: "27", label: "Pin 27", function: "VR1-/Crank return", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-28", position: "28", label: "Pin 28", function: "CAM signal (unused - 4-cyl NA engine uses crank sensor only for wasted-spark)", wireGauge: "20 AWG", fuseRating: null, isUsed: false },
            { id: "ms3-35", position: "35", label: "Pin 35", function: "5V sensor supply", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-12", position: "12", label: "Pin 12", function: "Boost control output (PWM)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ms3-29", position: "29", label: "Pin 29", function: "Digital input (Clutch switch)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
        {
          id: "ms3-case",
          name: "Case Ground",
          type: "ring",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "ms3-case-gnd", position: "CASE", label: "Case Ground", function: "ECU case/shield to star ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // INVERTER RELAYS (Low-side to High-side conversion)
    // ===========================================
    {
      id: "relay-fan-inv",
      name: "Fan Inverter Relay",
      type: "relay",
      manufacturer: null,
      partNumber: "Standard SPDT",
      notes: "Converts MS3 low-side output to +12V for PDM R5. Mount near PDM.",
      connectors: [
        {
          id: "fan-inv-conn",
          name: "Relay Pins",
          type: "relay",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "fan-inv-30", position: "30", label: "30", function: "IGN +12V (common)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "fan-inv-85", position: "85", label: "85", function: "MS3 Fan low-side (Pin 9)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "fan-inv-86", position: "86", label: "86", function: "IGN +12V (fused 1-3A)", wireGauge: "20 AWG", fuseRating: "1-3A", isUsed: true },
            { id: "fan-inv-87", position: "87", label: "87", function: "To PDM GREY-E (R5 coil)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "fan-inv-87a", position: "87a", label: "87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },
    {
      id: "relay-fuel-inv",
      name: "Fuel Inverter Relay",
      type: "relay",
      manufacturer: null,
      partNumber: "Standard SPDT",
      notes: "Converts MS3 low-side output to +12V for PDM R6. Mount near PDM.",
      connectors: [
        {
          id: "fuel-inv-conn",
          name: "Relay Pins",
          type: "relay",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "fuel-inv-30", position: "30", label: "30", function: "IGN +12V (common)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "fuel-inv-85", position: "85", label: "85", function: "MS3 Fuel low-side (Pin 4)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "fuel-inv-86", position: "86", label: "86", function: "IGN +12V (fused 1-3A)", wireGauge: "20 AWG", fuseRating: "1-3A", isUsed: true },
            { id: "fuel-inv-87", position: "87", label: "87", function: "To PDM GREY-G (R6 coil)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "fuel-inv-87a", position: "87a", label: "87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },

    // ===========================================
    // EXTERNAL TAIL/MARKER RELAY
    // ===========================================
    {
      id: "relay-tail",
      name: "External TAIL Relay",
      type: "relay",
      manufacturer: null,
      partNumber: "Standard SPDT",
      notes: "R3 is ACC, so TAIL/markers use external relay. Powered from BLUE-D.",
      connectors: [
        {
          id: "tail-relay-conn",
          name: "Relay Pins",
          type: "relay",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "tail-30", position: "30", label: "30", function: "From PDM BLUE-D (B+ fused 15A)", wireGauge: "16-18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-85", position: "85", label: "85", function: "Chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-86", position: "86", label: "86", function: "Column PARK/HEAD +12", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-87", position: "87", label: "87", function: "To marker fuses (front + rear)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "tail-87a", position: "87a", label: "87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },

    // ===========================================
    // FLASHER MODULE
    // ===========================================
    {
      id: "flasher",
      name: "Turn/Hazard Flasher",
      type: "generic",
      manufacturer: null,
      partNumber: "EP34 / CF13",
      notes: "3-pin electronic flasher. B/49=power, L/49a=output to stalk, E/31=ground",
      connectors: [
        {
          id: "flasher-conn",
          name: "Flasher Pins",
          type: "male",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "flasher-b", position: "B/49", label: "B/49", function: "Power in (hazard or turn)", wireGauge: "16-18 AWG", fuseRating: null, isUsed: true },
            { id: "flasher-l", position: "L/49a", label: "L/49a", function: "Output to turn stalk", wireGauge: "16-18 AWG", fuseRating: null, isUsed: true },
            { id: "flasher-e", position: "E/31", label: "E/31", function: "Ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // COOLING SYSTEM - FANS
    // ===========================================
    {
      id: "fan-1",
      name: "Cooling Fan 1",
      type: "motor",
      manufacturer: "OEM/Aftermarket",
      partNumber: null,
      notes: "Primary radiator fan. High current - requires 12-14 AWG, 25-30A fuse.",
      connectors: [
        {
          id: "fan1-conn",
          name: "Fan 1 Power",
          type: "male",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "fan1-pos", position: "+", label: "+", function: "From PDM GREY-D", wireGauge: "12-14 AWG", fuseRating: "25-30A", isUsed: true },
            { id: "fan1-neg", position: "-", label: "-", function: "Chassis ground (front)", wireGauge: "12-14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "fan-2",
      name: "Cooling Fan 2",
      type: "motor",
      manufacturer: "OEM/Aftermarket",
      partNumber: null,
      notes: "Secondary/aux fan. Same ratings as Fan 1. Both run together via R5.",
      connectors: [
        {
          id: "fan2-conn",
          name: "Fan 2 Power",
          type: "male",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "fan2-pos", position: "+", label: "+", function: "From PDM GREY-B", wireGauge: "12-14 AWG", fuseRating: "25-30A", isUsed: true },
            { id: "fan2-neg", position: "-", label: "-", function: "Chassis ground (front)", wireGauge: "12-14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // FUEL SYSTEM
    // ===========================================
    {
      id: "fuel-pump",
      name: "Fuel Pump",
      type: "motor",
      manufacturer: "Walbro/AEM",
      partNumber: null,
      notes: "High-pressure fuel pump in tank. 15-20A draw. Ground at rear chassis.",
      connectors: [
        {
          id: "fuel-pump-conn",
          name: "Pump Power",
          type: "male",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "pump-pos", position: "+", label: "+", function: "From PDM GREY-H", wireGauge: "14 AWG", fuseRating: "15-20A", isUsed: true },
            { id: "pump-neg", position: "-", label: "-", function: "Chassis ground (trunk)", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // HEADLIGHTS
    // ===========================================
    {
      id: "headlight-left",
      name: "Left Headlight",
      type: "light",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Dual-beam headlight with separate LOW and HIGH filaments",
      connectors: [
        {
          id: "headlight-l-conn",
          name: "H4 Connector",
          type: "female",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "hl-l-low", position: "LOW", label: "Low Beam", function: "From PDM BLUE-F", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "hl-l-high", position: "HIGH", label: "High Beam", function: "From PDM GREEN-G", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "hl-l-gnd", position: "GND", label: "Ground", function: "Chassis ground (front)", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "headlight-right",
      name: "Right Headlight",
      type: "light",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Dual-beam headlight with separate LOW and HIGH filaments",
      connectors: [
        {
          id: "headlight-r-conn",
          name: "H4 Connector",
          type: "female",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "hl-r-low", position: "LOW", label: "Low Beam", function: "From PDM BLUE-G", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "hl-r-high", position: "HIGH", label: "High Beam", function: "From PDM GREEN-H", wireGauge: "14 AWG", fuseRating: "10-15A", isUsed: true },
            { id: "hl-r-gnd", position: "GND", label: "Ground", function: "Chassis ground (front)", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // COLUMN SWITCHES (INPUTS TO PDM)
    // ===========================================
    {
      id: "column-switch",
      name: "Column Switches",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Combined headlight/turn signal stalk. Provides trigger signals to PDM.",
      connectors: [
        {
          id: "column-conn",
          name: "Column Outputs",
          type: "male",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "col-low", position: "LOW", label: "Low Beam", function: "To PDM BLACK-C (R1-86)", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "col-high", position: "HIGH", label: "High/Flash", function: "To PDM BLACK-G (R2-86)", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "col-park", position: "PARK", label: "Park/Head", function: "To TAIL relay 86", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "col-turn-l", position: "TURN-L", label: "Left Turn", function: "From flasher L/49a", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "col-turn-r", position: "TURN-R", label: "Right Turn", function: "From flasher L/49a", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // IGNITION SWITCH
    // ===========================================
    {
      id: "ign-switch",
      name: "Ignition Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "4-position switch: OFF, ACC, IGN-RUN, START",
      connectors: [
        {
          id: "ign-conn",
          name: "Switch Outputs",
          type: "male",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "ign-batt", position: "BATT", label: "Battery +", function: "Constant 12V input", wireGauge: "12 AWG", fuseRating: null, isUsed: true },
            { id: "ign-acc", position: "ACC", label: "Accessory", function: "To PDM BLACK-E (R3-86)", wireGauge: "20-22 AWG", fuseRating: null, isUsed: true },
            { id: "ign-run", position: "RUN", label: "IGN-RUN", function: "To PDM GREEN-E (R4-86) + inverter coils", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ign-start", position: "START", label: "Start", function: "To starter solenoid", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // IGNITION COILS
    // ===========================================
    {
      id: "coil-pack",
      name: "Ignition Coils",
      type: "generic",
      manufacturer: "MSD/OEM",
      partNumber: null,
      notes: "Wasted spark coil pack. Two coils fire simultaneously (1-4 and 2-3). Needs 12V+ and ECU trigger.",
      connectors: [
        {
          id: "coil-conn",
          name: "Coil Wiring",
          type: "male",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "coil-1-sig", position: "1", label: "Coil 1 Signal", function: "From MS3 Pin 17 (Spark A)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "coil-2-sig", position: "2", label: "Coil 2 Signal", function: "From MS3 Pin 18 (Spark B)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "coil-12v", position: "+", label: "12V+", function: "From PDM GREEN-D (fused)", wireGauge: "14-16 AWG", fuseRating: "15-20A", isUsed: true },
            { id: "coil-gnd", position: "GND", label: "Ground", function: "Engine block ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // INJECTORS
    // ===========================================
    {
      id: "injector-1",
      name: "Injector #1",
      type: "generic",
      manufacturer: null,
      partNumber: null,
      notes: "Cylinder 1 fuel injector. High-impedance, fired by ECU low-side driver.",
      connectors: [
        {
          id: "inj1-conn",
          name: "Injector Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "inj1-sig", position: "SIG", label: "Signal", function: "From MS3 Pin 5", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "inj1-12v", position: "+", label: "12V+", function: "From PDM GREEN-B (injector rail)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "injector-2",
      name: "Injector #2",
      type: "generic",
      manufacturer: null,
      partNumber: null,
      notes: "Cylinder 2 fuel injector",
      connectors: [
        {
          id: "inj2-conn",
          name: "Injector Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "inj2-sig", position: "SIG", label: "Signal", function: "From MS3 Pin 6", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "inj2-12v", position: "+", label: "12V+", function: "From PDM GREEN-B (injector rail)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "injector-3",
      name: "Injector #3",
      type: "generic",
      manufacturer: null,
      partNumber: null,
      notes: "Cylinder 3 fuel injector",
      connectors: [
        {
          id: "inj3-conn",
          name: "Injector Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "inj3-sig", position: "SIG", label: "Signal", function: "From MS3 Pin 7", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "inj3-12v", position: "+", label: "12V+", function: "From PDM GREEN-B (injector rail)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "injector-4",
      name: "Injector #4",
      type: "generic",
      manufacturer: null,
      partNumber: null,
      notes: "Cylinder 4 fuel injector",
      connectors: [
        {
          id: "inj4-conn",
          name: "Injector Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "inj4-sig", position: "SIG", label: "Signal", function: "From MS3 Pin 8", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "inj4-12v", position: "+", label: "12V+", function: "From PDM GREEN-B (injector rail)", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // ENGINE SENSORS
    // ===========================================
    {
      id: "sensor-clt",
      name: "CLT Sensor",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Coolant temperature sensor. 2-wire thermistor, needs sensor ground return.",
      connectors: [
        {
          id: "clt-conn",
          name: "CLT Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "clt-sig", position: "SIG", label: "Signal", function: "To MS3 Pin 23", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "clt-gnd", position: "GND", label: "Sensor Ground", function: "To MS3 Pin 3 (SGND)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "sensor-iat",
      name: "IAT Sensor",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Intake air temperature sensor. 2-wire thermistor in intake manifold.",
      connectors: [
        {
          id: "iat-conn",
          name: "IAT Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "iat-sig", position: "SIG", label: "Signal", function: "To MS3 Pin 24", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "iat-gnd", position: "GND", label: "Sensor Ground", function: "To MS3 Pin 3 (SGND)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "sensor-tps",
      name: "TPS Sensor",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Throttle position sensor. 3-wire potentiometer on throttle body.",
      connectors: [
        {
          id: "tps-conn",
          name: "TPS Connector",
          type: "female",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "tps-5v", position: "5V", label: "5V Reference", function: "From MS3 Pin 35", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "tps-sig", position: "SIG", label: "Signal", function: "To MS3 Pin 22", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "tps-gnd", position: "GND", label: "Sensor Ground", function: "To MS3 Pin 3 (SGND)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "sensor-crank",
      name: "Crank Position Sensor",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "VR (variable reluctance) crank angle sensor. 2-wire, generates AC signal from flywheel teeth.",
      connectors: [
        {
          id: "crank-conn",
          name: "CAS Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "crank-pos", position: "+", label: "VR+", function: "To MS3 Pin 26 (VR1+)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "crank-neg", position: "-", label: "VR-", function: "To MS3 Pin 27 (VR1-)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "gauge-tach",
      name: "Tachometer",
      type: "generic",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Dashboard tachometer. Receives square wave tach signal from ECU.",
      connectors: [
        {
          id: "tach-conn",
          name: "Tach Input",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "tach-sig", position: "SIG", label: "Tach Signal", function: "From MS3 Pin 10", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "tach-gnd", position: "GND", label: "Ground", function: "Dash ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // STAR GROUND
    // ===========================================
    {
      id: "star-ground",
      name: "Engine Block Star Ground",
      type: "ground",
      manufacturer: null,
      partNumber: null,
      notes: "CRITICAL: Single point ground for all engine/ECU/PDM grounds. Same stud for MS3 power ground, PDM coil ground (BLUE-C), battery negative.",
      connectors: [
        {
          id: "star-gnd-conn",
          name: "Star Ground Stud",
          type: "ring",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "star-batt", position: "1", label: "Battery -", function: "Main battery ground cable", wireGauge: "4 AWG", fuseRating: null, isUsed: true },
            { id: "star-pdm", position: "2", label: "PDM BLUE-C", function: "All PDM relay coil grounds", wireGauge: "14-16 AWG", fuseRating: null, isUsed: true },
            { id: "star-ms3-pwr", position: "3", label: "MS3 PGND", function: "ECU power ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "star-ms3-case", position: "4", label: "MS3 Case", function: "ECU case/shield ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "star-alt", position: "5", label: "Alternator", function: "Alternator case ground", wireGauge: "10 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // REAR LIGHTING - LED TAIL LIGHTS
    // ===========================================
    {
      id: "tail-left",
      name: "Left Tail Light Assembly",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED tail light - lower current than stock. Contains tail, brake, and turn functions.",
      connectors: [
        {
          id: "tail-l-conn",
          name: "Left Tail Connector",
          type: "female",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "tail-l-tail", position: "TAIL", label: "Tail/Running", function: "From TAIL relay output (via fuse)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "tail-l-brake", position: "BRAKE", label: "Brake", function: "From brake switch", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-l-turn", position: "TURN", label: "Turn Signal", function: "From turn stalk L", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-l-gnd", position: "GND", label: "Ground", function: "Rear chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "tail-right",
      name: "Right Tail Light Assembly",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED tail light - lower current than stock. Contains tail, brake, and turn functions.",
      connectors: [
        {
          id: "tail-r-conn",
          name: "Right Tail Connector",
          type: "female",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "tail-r-tail", position: "TAIL", label: "Tail/Running", function: "From TAIL relay output (via fuse)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "tail-r-brake", position: "BRAKE", label: "Brake", function: "From brake switch", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-r-turn", position: "TURN", label: "Turn Signal", function: "From turn stalk R", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "tail-r-gnd", position: "GND", label: "Ground", function: "Rear chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // FRONT TURN SIGNALS (LED)
    // ===========================================
    {
      id: "turn-front-left",
      name: "Left Front Turn Signal",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED front turn signal in bumper/corner. Lower current draw.",
      connectors: [
        {
          id: "turn-fl-conn",
          name: "Turn Signal Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "turn-fl-sig", position: "+", label: "Signal", function: "From turn stalk L", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "turn-fl-gnd", position: "-", label: "Ground", function: "Front chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "turn-front-right",
      name: "Right Front Turn Signal",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED front turn signal in bumper/corner. Lower current draw.",
      connectors: [
        {
          id: "turn-fr-conn",
          name: "Turn Signal Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "turn-fr-sig", position: "+", label: "Signal", function: "From turn stalk R", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "turn-fr-gnd", position: "-", label: "Ground", function: "Front chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // REVERSE LIGHTS (LED)
    // ===========================================
    {
      id: "reverse-left",
      name: "Left Reverse Light",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED reverse light in tail housing. Triggered by reverse switch on transmission.",
      connectors: [
        {
          id: "rev-l-conn",
          name: "Reverse Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "rev-l-pos", position: "+", label: "Power", function: "From reverse switch", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "rev-l-gnd", position: "-", label: "Ground", function: "Rear chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "reverse-right",
      name: "Right Reverse Light",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED reverse light in tail housing.",
      connectors: [
        {
          id: "rev-r-conn",
          name: "Reverse Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "rev-r-pos", position: "+", label: "Power", function: "From reverse switch (spliced)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "rev-r-gnd", position: "-", label: "Ground", function: "Rear chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // SIDE MARKERS (LED)
    // ===========================================
    {
      id: "marker-front-left",
      name: "Left Front Side Marker",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED side marker in front fender. Runs with parking lights.",
      connectors: [
        {
          id: "marker-fl-conn",
          name: "Marker Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "marker-fl-pos", position: "+", label: "Power", function: "From TAIL relay (via fuse)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "marker-fl-gnd", position: "-", label: "Ground", function: "Front chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "marker-front-right",
      name: "Right Front Side Marker",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED side marker in front fender.",
      connectors: [
        {
          id: "marker-fr-conn",
          name: "Marker Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "marker-fr-pos", position: "+", label: "Power", function: "From TAIL relay (via fuse)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "marker-fr-gnd", position: "-", label: "Ground", function: "Front chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // LICENSE PLATE LIGHT (LED)
    // ===========================================
    {
      id: "plate-light",
      name: "License Plate Light",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED license plate illumination. Runs with parking lights.",
      connectors: [
        {
          id: "plate-conn",
          name: "Plate Light Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "plate-pos", position: "+", label: "Power", function: "From TAIL relay (via fuse)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "plate-gnd", position: "-", label: "Ground", function: "Rear chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // INTERIOR LIGHTING (LED)
    // ===========================================
    {
      id: "dome-light",
      name: "Dome Light",
      type: "light",
      manufacturer: "LED Conversion",
      partNumber: null,
      notes: "LED dome light. Triggered by door switches or manual switch.",
      connectors: [
        {
          id: "dome-conn",
          name: "Dome Light Connector",
          type: "female",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "dome-pos", position: "+", label: "B+ Power", function: "Constant 12V (fused)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "dome-door", position: "DOOR", label: "Door Switch", function: "Ground when door opens", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "dome-gnd", position: "GND", label: "Ground", function: "Dash ground (manual on)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "map-lights",
      name: "LED Map Lights",
      type: "light",
      manufacturer: "LED",
      partNumber: null,
      notes: "Additional LED map lights (aftermarket addition). Individual switches.",
      connectors: [
        {
          id: "map-conn",
          name: "Map Light Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "maplight-pos", position: "+", label: "Switched Power", function: "From ACC or B+ (fused)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "maplight-gnd", position: "-", label: "Ground", function: "Dash ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // BRAKE LIGHT SWITCH
    // ===========================================
    {
      id: "brake-switch",
      name: "Brake Light Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Switch on brake pedal. Closes circuit when pedal is pressed.",
      connectors: [
        {
          id: "brake-sw-conn",
          name: "Brake Switch Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "brake-sw-in", position: "IN", label: "Power In", function: "Constant 12V (fused 15A)", wireGauge: "16 AWG", fuseRating: "15A", isUsed: true },
            { id: "brake-sw-out", position: "OUT", label: "To Brake Lights", function: "To rear brake lights", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // REVERSE SWITCH (TRANSMISSION)
    // ===========================================
    {
      id: "reverse-switch",
      name: "Reverse Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Switch on transmission. Closes when in reverse gear.",
      connectors: [
        {
          id: "rev-sw-conn",
          name: "Reverse Switch Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "rev-sw-in", position: "IN", label: "Power In", function: "From IGN (fused 10A)", wireGauge: "18 AWG", fuseRating: "10A", isUsed: true },
            { id: "rev-sw-out", position: "OUT", label: "To Reverse Lights", function: "To reverse lights", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // DOOR SWITCHES (FOR DOME LIGHT)
    // ===========================================
    {
      id: "door-switch-left",
      name: "Left Door Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Jamb switch - grounds dome light circuit when door opens.",
      connectors: [
        {
          id: "door-l-conn",
          name: "Door Switch",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "door-l-sw", position: "SW", label: "Switch", function: "Grounds when open", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "door-switch-right",
      name: "Right Door Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Jamb switch - grounds dome light circuit when door opens.",
      connectors: [
        {
          id: "door-r-conn",
          name: "Door Switch",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "door-r-sw", position: "SW", label: "Switch", function: "Grounds when open", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // BATTERY
    // ===========================================
    {
      id: "battery",
      name: "Battery",
      type: "power",
      manufacturer: null,
      partNumber: null,
      notes: "Main 12V battery. Stock location in trunk or relocated to front.",
      connectors: [
        {
          id: "batt-conn",
          name: "Battery Terminals",
          type: "ring",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "batt-pos", position: "+", label: "Positive", function: "Main power distribution", wireGauge: "4 AWG", fuseRating: null, isUsed: true },
            { id: "batt-neg", position: "-", label: "Negative", function: "To star ground on engine block", wireGauge: "4 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // STARTER MOTOR
    // ===========================================
    {
      id: "starter",
      name: "Starter Motor",
      type: "motor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Stock gear-reduction starter on fenderwell. High current - uses main battery cable.",
      connectors: [
        {
          id: "starter-conn",
          name: "Starter Terminals",
          type: "ring",
          pinCount: 3,
          pinLayout: null,
          pins: [
            { id: "starter-batt", position: "B", label: "Battery", function: "Main power from battery +", wireGauge: "4 AWG", fuseRating: null, isUsed: true },
            { id: "starter-sol", position: "S", label: "Solenoid", function: "From ignition START position", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "starter-gnd", position: "GND", label: "Ground", function: "Case grounded to block via mounting bolts (implicit - no wire needed)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },

    // ===========================================
    // ALTERNATOR
    // ===========================================
    {
      id: "alternator",
      name: "Alternator",
      type: "power",
      manufacturer: "OEM",
      partNumber: "65A Stock",
      notes: "Stock 65A alternator. Charges battery and powers electrical system when running.",
      connectors: [
        {
          id: "alt-conn",
          name: "Alternator Terminals",
          type: "ring",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "alt-batt", position: "B+", label: "Battery", function: "Charge output to battery +", wireGauge: "8 AWG", fuseRating: "80A", isUsed: true },
            { id: "alt-sense", position: "S", label: "Sense", function: "Voltage sense (some alternators)", wireGauge: "18 AWG", fuseRating: null, isUsed: false },
            { id: "alt-ig", position: "IG", label: "Ignition", function: "Exciter/field from IGN", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "alt-l", position: "L", label: "Lamp", function: "Charge indicator light", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "alt-case-gnd", position: "CASE", label: "Case Ground", function: "Alternator case to star ground", wireGauge: "10 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // CLUTCH SAFETY SWITCH
    // ===========================================
    {
      id: "clutch-safety",
      name: "Clutch Safety Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Switch on clutch pedal. Must be pressed to allow starter engagement. Wired in series with starter solenoid.",
      connectors: [
        {
          id: "clutch-safe-conn",
          name: "Clutch Safety Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "clutch-safe-in", position: "IN", label: "From IGN START", function: "From ignition switch START", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "clutch-safe-out", position: "OUT", label: "To Starter Sol", function: "To starter solenoid S terminal", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // CLUTCH SWITCH (FLAT-FOOT SHIFTING / 2-STEP)
    // ===========================================
    {
      id: "clutch-ecu-switch",
      name: "Clutch ECU Switch",
      type: "switch",
      manufacturer: "Guitar Pedal Momentary",
      partNumber: null,
      notes: "Momentary switch on clutch pedal for MS3 input. Used for flat-foot shifting, 2-step, and anti-lag launch control. Closes when clutch is pressed.",
      connectors: [
        {
          id: "clutch-ecu-conn",
          name: "Clutch ECU Switch",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "clutch-ecu-sig", position: "SIG", label: "Signal", function: "To MS3 digital input", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "clutch-ecu-gnd", position: "GND", label: "Ground", function: "Sensor ground", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // HORN
    // ===========================================
    {
      id: "horn",
      name: "Horn",
      type: "generic",
      manufacturer: null,
      partNumber: "Single Horn",
      notes: "Single horn (simplified from stock dual). Triggered by horn button in steering wheel.",
      connectors: [
        {
          id: "horn-conn",
          name: "Horn Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "horn-pos", position: "+", label: "Power", function: "From horn relay 87", wireGauge: "16 AWG", fuseRating: "15A", isUsed: true },
            { id: "horn-gnd", position: "-", label: "Ground", function: "Chassis ground", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // HORN RELAY
    // ===========================================
    {
      id: "horn-relay",
      name: "Horn Relay",
      type: "relay",
      manufacturer: null,
      partNumber: "Standard SPDT",
      notes: "Horn relay - horn button grounds coil to trigger relay.",
      connectors: [
        {
          id: "horn-relay-conn",
          name: "Relay Pins",
          type: "relay",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "horn-rel-30", position: "30", label: "30", function: "B+ from fuse", wireGauge: "16 AWG", fuseRating: "15A", isUsed: true },
            { id: "horn-rel-85", position: "85", label: "85", function: "From horn button (ground when pressed)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "horn-rel-86", position: "86", label: "86", function: "B+ (constant)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "horn-rel-87", position: "87", label: "87", function: "To horn +", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "horn-rel-87a", position: "87a", label: "87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },

    // ===========================================
    // POWER WINDOWS
    // ===========================================
    {
      id: "window-motor-left",
      name: "Left Window Motor",
      type: "motor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Power window motor in left door. Reversible motor controlled by door switch.",
      connectors: [
        {
          id: "window-l-conn",
          name: "Window Motor Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "window-l-1", position: "1", label: "Motor 1", function: "Polarity determines direction", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-l-2", position: "2", label: "Motor 2", function: "Polarity determines direction", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "window-motor-right",
      name: "Right Window Motor",
      type: "motor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Power window motor in right door.",
      connectors: [
        {
          id: "window-r-conn",
          name: "Window Motor Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "window-r-1", position: "1", label: "Motor 1", function: "Polarity determines direction", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-r-2", position: "2", label: "Motor 2", function: "Polarity determines direction", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "window-switch-master",
      name: "Master Window Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Driver door switch controls both windows. Has up/down for left and right.",
      connectors: [
        {
          id: "window-sw-m-conn",
          name: "Master Switch Connector",
          type: "female",
          pinCount: 7,
          pinLayout: null,
          pins: [
            { id: "window-sw-pwr", position: "PWR", label: "Power", function: "From PDM BLUE-B (ACC)", wireGauge: "14 AWG", fuseRating: "20A", isUsed: true },
            { id: "window-sw-gnd", position: "GND", label: "Ground", function: "Chassis ground", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-sw-l1", position: "L1", label: "Left Motor 1", function: "To left motor", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-sw-l2", position: "L2", label: "Left Motor 2", function: "To left motor", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-sw-r1", position: "R1", label: "Right Motor 1", function: "To right motor", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-sw-r2", position: "R2", label: "Right Motor 2", function: "To right motor", wireGauge: "14 AWG", fuseRating: null, isUsed: true },
            { id: "window-sw-ill", position: "ILL", label: "Illumination", function: "From parking light circuit", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // A/C SYSTEM
    // ===========================================
    {
      id: "ac-compressor",
      name: "A/C Compressor Clutch",
      type: "generic",
      manufacturer: "OEM",
      partNumber: null,
      notes: "A/C compressor electromagnetic clutch. Controlled by ECU or A/C switch with pressure switch safety.",
      connectors: [
        {
          id: "ac-comp-conn",
          name: "Compressor Clutch",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "ac-clutch", position: "+", label: "Clutch", function: "From A/C relay (grounded at compressor case)", wireGauge: "16 AWG", fuseRating: "10A", isUsed: true },
          ],
        },
      ],
    },
    {
      id: "ac-relay",
      name: "A/C Compressor Relay",
      type: "relay",
      manufacturer: null,
      partNumber: "Standard SPDT",
      notes: "A/C compressor relay. Triggered by A/C switch with pressure switch in series.",
      connectors: [
        {
          id: "ac-relay-conn",
          name: "Relay Pins",
          type: "relay",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "ac-rel-30", position: "30", label: "30", function: "From IGN (fused)", wireGauge: "16 AWG", fuseRating: "10A", isUsed: true },
            { id: "ac-rel-85", position: "85", label: "85", function: "Ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ac-rel-86", position: "86", label: "86", function: "From pressure switch (via A/C switch)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ac-rel-87", position: "87", label: "87", function: "To compressor clutch", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "ac-rel-87a", position: "87a", label: "87a", function: "(not used)", wireGauge: null, fuseRating: null, isUsed: false },
          ],
        },
      ],
    },
    {
      id: "ac-pressure-switch",
      name: "A/C Pressure Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Safety switch on A/C lines. Opens if pressure too low (leak) or too high.",
      connectors: [
        {
          id: "ac-press-conn",
          name: "Pressure Switch",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "ac-press-in", position: "IN", label: "From A/C Switch", function: "12V from A/C dashboard switch", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "ac-press-out", position: "OUT", label: "To Relay", function: "To A/C relay 86", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // RADIO / AUDIO
    // ===========================================
    {
      id: "radio",
      name: "Aftermarket Head Unit",
      type: "generic",
      manufacturer: "Aftermarket",
      partNumber: null,
      notes: "Aftermarket stereo head unit. Needs constant 12V (memory), ACC 12V (switched), ground, and speaker wires.",
      connectors: [
        {
          id: "radio-conn",
          name: "Radio Power Connector",
          type: "female",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "radio-batt", position: "BATT", label: "Constant 12V", function: "Memory keep-alive (from B+)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "radio-acc", position: "ACC", label: "Accessory", function: "Switched power from PDM BLUE-A", wireGauge: "18 AWG", fuseRating: "10A", isUsed: true },
            { id: "radio-gnd", position: "GND", label: "Ground", function: "Chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "radio-ill", position: "ILL", label: "Illumination", function: "Dims with dash (from parking)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // WIPERS & WASHER
    // ===========================================
    {
      id: "wiper-motor",
      name: "Wiper Motor",
      type: "motor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "2-speed wiper motor with park position switch. Low and high speed windings.",
      connectors: [
        {
          id: "wiper-motor-conn",
          name: "Wiper Motor Connector",
          type: "female",
          pinCount: 5,
          pinLayout: null,
          pins: [
            { id: "wiper-low", position: "LOW", label: "Low Speed", function: "From wiper switch LOW", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-high", position: "HIGH", label: "High Speed", function: "From wiper switch HIGH", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-park", position: "PARK", label: "Park Switch", function: "Internal park position feedback (internal to motor - no external wire)", wireGauge: "18 AWG", fuseRating: null, isUsed: false },
            { id: "wiper-pwr", position: "+", label: "Power", function: "B+ for park return", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-gnd", position: "GND", label: "Ground", function: "Chassis ground", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "washer-pump",
      name: "Washer Pump",
      type: "motor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Windshield washer pump in reservoir. Simple 12V motor.",
      connectors: [
        {
          id: "washer-conn",
          name: "Washer Pump Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "washer-pos", position: "+", label: "Power", function: "From washer switch", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
            { id: "washer-gnd", position: "-", label: "Ground", function: "Chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
    {
      id: "wiper-switch",
      name: "Wiper/Washer Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Column stalk switch for wipers (off/int/low/high) and washer (momentary).",
      connectors: [
        {
          id: "wiper-sw-conn",
          name: "Wiper Switch Connector",
          type: "female",
          pinCount: 6,
          pinLayout: null,
          pins: [
            { id: "wiper-sw-pwr", position: "PWR", label: "Power In", function: "From IGN (fused 20A)", wireGauge: "16 AWG", fuseRating: "20A", isUsed: true },
            { id: "wiper-sw-low", position: "LOW", label: "Low Output", function: "To motor LOW", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-sw-high", position: "HIGH", label: "High Output", function: "To motor HIGH", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-sw-int", position: "INT", label: "Intermittent", function: "To relay/timer module (stock relay is internal to switch - PDM can handle timing if needed)", wireGauge: "18 AWG", fuseRating: null, isUsed: false },
            { id: "wiper-sw-wash", position: "WASH", label: "Washer", function: "To washer pump", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "wiper-sw-gnd", position: "GND", label: "Ground", function: "Switch ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // INSTRUMENT CLUSTER
    // ===========================================
    {
      id: "cluster",
      name: "Instrument Cluster",
      type: "generic",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Stock gauge cluster - speedometer, tachometer (fed by ECU), fuel, temp, oil pressure, and warning lights.",
      connectors: [
        {
          id: "cluster-conn",
          name: "Cluster Connector",
          type: "female",
          pinCount: 12,
          pinLayout: null,
          pins: [
            { id: "cluster-ign", position: "IGN", label: "Ignition", function: "Switched power for gauges", wireGauge: "18 AWG", fuseRating: "10A", isUsed: true },
            { id: "cluster-ill", position: "ILL", label: "Illumination", function: "Backlight dimming", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-gnd", position: "GND", label: "Ground", function: "Cluster ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-tach", position: "TACH", label: "Tachometer", function: "From MS3 tach output", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-fuel", position: "FUEL", label: "Fuel Level", function: "From fuel sender", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-temp", position: "TEMP", label: "Coolant Temp", function: "From temp sender (cluster)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-oil", position: "OIL", label: "Oil Pressure", function: "From oil pressure sender", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-alt", position: "ALT", label: "Charge Light", function: "From alternator L terminal", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-brake", position: "BRAKE", label: "Brake Warning", function: "From brake fluid/park brake", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-high", position: "HIGH", label: "High Beam Ind", function: "From high beam circuit", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-turn-l", position: "TURN-L", label: "Left Turn Ind", function: "From left turn circuit", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "cluster-turn-r", position: "TURN-R", label: "Right Turn Ind", function: "From right turn circuit", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // AEM WIDEBAND CONTROLLER/GAUGE (INTEGRATED)
    // ===========================================
    {
      id: "afr-gauge",
      name: "AEM X-Series Wideband",
      type: "sensor",
      manufacturer: "AEM",
      partNumber: "30-0300",
      notes: "AEM X-Series integrated wideband controller + gauge. Bosch LSU 4.9 sensor plugs directly into gauge back. Outputs 0-5V analog signal to ECU (linear 8.5-18 AFR = 0-5V).",
      connectors: [
        {
          id: "afr-gauge-conn",
          name: "Wideband Harness",
          type: "female",
          pinCount: 4,
          pinLayout: null,
          pins: [
            { id: "afr-gauge-pwr", position: "+", label: "12V Power", function: "From IGN or PDM (fused 5A)", wireGauge: "16 AWG", fuseRating: "5A", isUsed: true },
            { id: "afr-gauge-gnd", position: "GND", label: "Power Ground", function: "Chassis ground", wireGauge: "16 AWG", fuseRating: null, isUsed: true },
            { id: "afr-gauge-sig", position: "SIG", label: "Analog Out", function: "0-5V to MS3 Pin 25", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
            { id: "afr-gauge-sgnd", position: "SGND", label: "Signal Ground", function: "To MS3 Pin 3 (SGND)", wireGauge: "20 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // FUEL LEVEL SENDER
    // ===========================================
    {
      id: "fuel-sender",
      name: "Fuel Level Sender",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Float-type fuel level sender in tank. Variable resistance to ground.",
      connectors: [
        {
          id: "fuel-send-conn",
          name: "Fuel Sender Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "fuel-send-sig", position: "SIG", label: "Signal", function: "To cluster fuel gauge", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "fuel-send-gnd", position: "GND", label: "Ground", function: "Tank/chassis ground", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // NB IDLE AIR CONTROL VALVE
    // ===========================================
    {
      id: "iacv",
      name: "Idle Air Control Valve (NB)",
      type: "generic",
      manufacturer: "Mazda NB",
      partNumber: null,
      notes: "NB-style IACV on intake manifold. 2-wire PWM controlled by ECU for idle speed control.",
      connectors: [
        {
          id: "iacv-conn",
          name: "IACV Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "iacv-sig", position: "SIG", label: "Control", function: "From MS3 Pin 11 (IAC)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "iacv-12v", position: "+", label: "12V", function: "From IGN (fused)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // BOOST SOLENOID
    // ===========================================
    {
      id: "boost-solenoid",
      name: "Boost Control Solenoid",
      type: "generic",
      manufacturer: null,
      partNumber: null,
      notes: "Electronic boost control solenoid for turbo/supercharger wastegate control. PWM controlled by ECU.",
      connectors: [
        {
          id: "boost-sol-conn",
          name: "Boost Solenoid Connector",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "boost-sol-sig", position: "SIG", label: "Control", function: "From MS3 Pin 12 (PWM boost control)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
            { id: "boost-sol-12v", position: "+", label: "12V", function: "From IGN (fused)", wireGauge: "18 AWG", fuseRating: "5A", isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // HORN BUTTON (STEERING WHEEL)
    // ===========================================
    {
      id: "horn-button",
      name: "Horn Button",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Horn button in steering wheel. Momentary switch that grounds horn relay coil when pressed.",
      connectors: [
        {
          id: "horn-btn-conn",
          name: "Horn Button",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "horn-btn-out", position: "OUT", label: "Output", function: "To horn relay 85 (grounds when pressed)", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // CLUSTER COOLANT TEMP SENDER
    // ===========================================
    {
      id: "cluster-temp-sender",
      name: "Cluster Temp Sender",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Separate coolant temp sender for gauge cluster. Variable resistance sender, different from ECU CLT sensor.",
      connectors: [
        {
          id: "cluster-temp-conn",
          name: "Temp Sender",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "cluster-temp-sig", position: "SIG", label: "Signal", function: "To cluster TEMP gauge", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // OIL PRESSURE SENDER
    // ===========================================
    {
      id: "oil-pressure-sender",
      name: "Oil Pressure Sender",
      type: "sensor",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Oil pressure sender for cluster gauge. Variable resistance or switch type depending on gauge.",
      connectors: [
        {
          id: "oil-press-conn",
          name: "Oil Pressure Sender",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "oil-press-sig", position: "SIG", label: "Signal", function: "To cluster OIL gauge/light", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // BRAKE WARNING SWITCH (PARKING BRAKE / FLUID)
    // ===========================================
    {
      id: "brake-warning-switch",
      name: "Brake Warning Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "Combined parking brake engaged / low brake fluid level warning switch. Grounds cluster warning light.",
      connectors: [
        {
          id: "brake-warn-conn",
          name: "Brake Warning Switch",
          type: "female",
          pinCount: 1,
          pinLayout: null,
          pins: [
            { id: "brake-warn-sig", position: "SIG", label: "Signal", function: "To cluster BRAKE warning", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },

    // ===========================================
    // A/C DASHBOARD SWITCH
    // ===========================================
    {
      id: "ac-switch",
      name: "A/C Dashboard Switch",
      type: "switch",
      manufacturer: "OEM",
      partNumber: null,
      notes: "A/C on/off switch on dashboard. Feeds A/C pressure switch when engaged.",
      connectors: [
        {
          id: "ac-sw-conn",
          name: "A/C Switch",
          type: "female",
          pinCount: 2,
          pinLayout: null,
          pins: [
            { id: "ac-sw-in", position: "IN", label: "Power In", function: "From IGN (fused)", wireGauge: "18 AWG", fuseRating: "10A", isUsed: true },
            { id: "ac-sw-out", position: "OUT", label: "To Pressure Switch", function: "To A/C pressure switch", wireGauge: "18 AWG", fuseRating: null, isUsed: true },
          ],
        },
      ],
    },
  ],

  wires: [
    // ===========================================
    // ECU POWER CIRCUIT
    // ===========================================
    { id: "wire-ign-ecu", sourcePinId: "ign-run", targetPinId: "green-e", color: "RD/BK", gauge: "20-22 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-ecu-main", sourcePinId: "green-a", targetPinId: "ms3-1", color: "RD", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-ms3-pgnd", sourcePinId: "ms3-2", targetPinId: "star-ms3-pwr", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // INVERTER RELAY CIRCUITS
    // ===========================================
    // Fan inverter
    { id: "wire-ms3-fan", sourcePinId: "ms3-9", targetPinId: "fan-inv-85", color: "GN/WH", gauge: "20 AWG", circuitId: "circuit-cooling", isInstalled: false },
    { id: "wire-fan-inv-out", sourcePinId: "fan-inv-87", targetPinId: "grey-e", color: "BU", gauge: "20 AWG", circuitId: "circuit-cooling", isInstalled: false },
    // Fuel inverter
    { id: "wire-ms3-fuel", sourcePinId: "ms3-4", targetPinId: "fuel-inv-85", color: "GN", gauge: "20 AWG", circuitId: "circuit-fuel", isInstalled: false },
    { id: "wire-fuel-inv-out", sourcePinId: "fuel-inv-87", targetPinId: "grey-g", color: "GN", gauge: "20 AWG", circuitId: "circuit-fuel", isInstalled: false },

    // ===========================================
    // COOLING FANS
    // ===========================================
    { id: "wire-fan1", sourcePinId: "grey-d", targetPinId: "fan1-pos", color: "BU", gauge: "12-14 AWG", circuitId: "circuit-cooling", isInstalled: false },
    { id: "wire-fan2", sourcePinId: "grey-b", targetPinId: "fan2-pos", color: "BU", gauge: "12-14 AWG", circuitId: "circuit-cooling", isInstalled: false },

    // ===========================================
    // FUEL PUMP
    // ===========================================
    { id: "wire-pump", sourcePinId: "grey-h", targetPinId: "pump-pos", color: "GN", gauge: "14 AWG", circuitId: "circuit-fuel", isInstalled: false },

    // ===========================================
    // HEADLIGHTS - LOW BEAM
    // ===========================================
    { id: "wire-col-low", sourcePinId: "col-low", targetPinId: "black-c", color: "YE", gauge: "20-22 AWG", circuitId: "circuit-lowbeam", isInstalled: false },
    { id: "wire-low-l", sourcePinId: "blue-f", targetPinId: "hl-l-low", color: "YE", gauge: "14 AWG", circuitId: "circuit-lowbeam", isInstalled: false },
    { id: "wire-low-r", sourcePinId: "blue-g", targetPinId: "hl-r-low", color: "YE", gauge: "14 AWG", circuitId: "circuit-lowbeam", isInstalled: false },

    // ===========================================
    // HEADLIGHTS - HIGH BEAM
    // ===========================================
    { id: "wire-col-high", sourcePinId: "col-high", targetPinId: "black-g", color: "BU/WH", gauge: "20-22 AWG", circuitId: "circuit-highbeam", isInstalled: false },
    { id: "wire-high-l", sourcePinId: "green-g", targetPinId: "hl-l-high", color: "BU", gauge: "14 AWG", circuitId: "circuit-highbeam", isInstalled: false },
    { id: "wire-high-r", sourcePinId: "green-h", targetPinId: "hl-r-high", color: "BU", gauge: "14 AWG", circuitId: "circuit-highbeam", isInstalled: false },

    // ===========================================
    // ACCESSORY CIRCUIT
    // ===========================================
    { id: "wire-ign-acc", sourcePinId: "ign-acc", targetPinId: "black-e", color: "VT", gauge: "20-22 AWG", circuitId: "circuit-acc", isInstalled: false },

    // ===========================================
    // TAIL/MARKER CIRCUIT
    // ===========================================
    { id: "wire-tail-pwr", sourcePinId: "blue-d", targetPinId: "tail-30", color: "PK", gauge: "16-18 AWG", circuitId: "circuit-tail", isInstalled: false },
    { id: "wire-col-park", sourcePinId: "col-park", targetPinId: "tail-86", color: "PK", gauge: "18 AWG", circuitId: "circuit-tail", isInstalled: false },

    // ===========================================
    // PDM COIL GROUND (CRITICAL)
    // ===========================================
    { id: "wire-pdm-gnd", sourcePinId: "blue-c", targetPinId: "star-pdm", color: "BK", gauge: "14-16 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // HAZARD/TURN CIRCUIT
    // ===========================================
    { id: "wire-hazard", sourcePinId: "blue-e", targetPinId: "flasher-b", color: "OG", gauge: "16-18 AWG", circuitId: "circuit-hazard", isInstalled: false },

    // ===========================================
    // IGNITION COILS
    // ===========================================
    { id: "wire-coil1-sig", sourcePinId: "ms3-17", targetPinId: "coil-1-sig", color: "WH/BK", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-coil2-sig", sourcePinId: "ms3-18", targetPinId: "coil-2-sig", color: "WH/RD", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-coil-pwr", sourcePinId: "green-d", targetPinId: "coil-12v", color: "RD", gauge: "14 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // INJECTOR CIRCUITS
    // ===========================================
    { id: "wire-inj1-sig", sourcePinId: "ms3-5", targetPinId: "inj1-sig", color: "GN/BK", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj2-sig", sourcePinId: "ms3-6", targetPinId: "inj2-sig", color: "GN/WH", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj3-sig", sourcePinId: "ms3-7", targetPinId: "inj3-sig", color: "GN/RD", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj4-sig", sourcePinId: "ms3-8", targetPinId: "inj4-sig", color: "GN/BU", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    // Injector power rail (spliced to common 12V+)
    { id: "wire-inj1-pwr", sourcePinId: "green-b", targetPinId: "inj1-12v", color: "RD/WH", gauge: "16 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj2-pwr", sourcePinId: "green-b", targetPinId: "inj2-12v", color: "RD/WH", gauge: "16 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj3-pwr", sourcePinId: "green-b", targetPinId: "inj3-12v", color: "RD/WH", gauge: "16 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-inj4-pwr", sourcePinId: "green-b", targetPinId: "inj4-12v", color: "RD/WH", gauge: "16 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // SENSOR CIRCUITS
    // ===========================================
    // CLT sensor
    { id: "wire-clt-sig", sourcePinId: "clt-sig", targetPinId: "ms3-23", color: "YE/GN", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-clt-gnd", sourcePinId: "clt-gnd", targetPinId: "ms3-3", color: "BK/WH", gauge: "20 AWG", circuitId: "circuit-sensor-ground", isInstalled: false },
    // IAT sensor
    { id: "wire-iat-sig", sourcePinId: "iat-sig", targetPinId: "ms3-24", color: "YE/BU", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-iat-gnd", sourcePinId: "iat-gnd", targetPinId: "ms3-3", color: "BK/WH", gauge: "20 AWG", circuitId: "circuit-sensor-ground", isInstalled: false },
    // TPS sensor
    { id: "wire-tps-5v", sourcePinId: "ms3-35", targetPinId: "tps-5v", color: "VT", gauge: "20 AWG", circuitId: "circuit-5v-ref", isInstalled: false },
    { id: "wire-tps-sig", sourcePinId: "tps-sig", targetPinId: "ms3-22", color: "YE/VT", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-tps-gnd", sourcePinId: "tps-gnd", targetPinId: "ms3-3", color: "BK/WH", gauge: "20 AWG", circuitId: "circuit-sensor-ground", isInstalled: false },
    // MAP sensor uses internal MS3Pro Mini onboard sensor (no external wiring)
    // Crank position sensor
    { id: "wire-crank-pos", sourcePinId: "crank-pos", targetPinId: "ms3-26", color: "WH/BU", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-crank-neg", sourcePinId: "crank-neg", targetPinId: "ms3-27", color: "WH/GN", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    // Wideband O2 sensor
    // Wideband wiring now goes through AEM gauge (integrated controller) - see wire-afr-* in gauges section
    // Tachometer
    { id: "wire-tach-sig", sourcePinId: "ms3-10", targetPinId: "tach-sig", color: "WH/BK", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // TAIL LIGHTS / BRAKE LIGHTS (LED)
    // ===========================================
    { id: "wire-tail-l", sourcePinId: "tail-87", targetPinId: "tail-l-tail", color: "PK", gauge: "18 AWG", circuitId: "circuit-tail", isInstalled: false },
    { id: "wire-tail-r", sourcePinId: "tail-87", targetPinId: "tail-r-tail", color: "PK", gauge: "18 AWG", circuitId: "circuit-tail", isInstalled: false },
    { id: "wire-brake-sw-l", sourcePinId: "brake-sw-out", targetPinId: "tail-l-brake", color: "RD/GN", gauge: "16 AWG", circuitId: "circuit-brake", isInstalled: false },
    { id: "wire-brake-sw-r", sourcePinId: "brake-sw-out", targetPinId: "tail-r-brake", color: "RD/GN", gauge: "16 AWG", circuitId: "circuit-brake", isInstalled: false },

    // ===========================================
    // TURN SIGNALS (LED)
    // ===========================================
    { id: "wire-turn-fl", sourcePinId: "col-turn-l", targetPinId: "turn-fl-sig", color: "GN", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },
    { id: "wire-turn-fr", sourcePinId: "col-turn-r", targetPinId: "turn-fr-sig", color: "GN/WH", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },
    { id: "wire-turn-rl", sourcePinId: "col-turn-l", targetPinId: "tail-l-turn", color: "GN", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },
    { id: "wire-turn-rr", sourcePinId: "col-turn-r", targetPinId: "tail-r-turn", color: "GN/WH", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },

    // ===========================================
    // REVERSE LIGHTS (LED)
    // ===========================================
    { id: "wire-rev-l", sourcePinId: "rev-sw-out", targetPinId: "rev-l-pos", color: "WH/BU", gauge: "18 AWG", circuitId: "circuit-reverse", isInstalled: false },
    { id: "wire-rev-r", sourcePinId: "rev-sw-out", targetPinId: "rev-r-pos", color: "WH/BU", gauge: "18 AWG", circuitId: "circuit-reverse", isInstalled: false },

    // ===========================================
    // SIDE MARKERS (LED)
    // ===========================================
    { id: "wire-marker-fl", sourcePinId: "tail-87", targetPinId: "marker-fl-pos", color: "PK", gauge: "18 AWG", circuitId: "circuit-marker", isInstalled: false },
    { id: "wire-marker-fr", sourcePinId: "tail-87", targetPinId: "marker-fr-pos", color: "PK", gauge: "18 AWG", circuitId: "circuit-marker", isInstalled: false },
    { id: "wire-plate", sourcePinId: "tail-87", targetPinId: "plate-pos", color: "PK", gauge: "18 AWG", circuitId: "circuit-marker", isInstalled: false },

    // ===========================================
    // INTERIOR LIGHTING (LED)
    // ===========================================
    { id: "wire-dome-door-l", sourcePinId: "door-l-sw", targetPinId: "dome-door", color: "GY", gauge: "18 AWG", circuitId: "circuit-interior", isInstalled: false },
    { id: "wire-dome-door-r", sourcePinId: "door-r-sw", targetPinId: "dome-door", color: "GY", gauge: "18 AWG", circuitId: "circuit-interior", isInstalled: false },

    // ===========================================
    // STARTING CIRCUIT
    // ===========================================
    { id: "wire-batt-starter", sourcePinId: "batt-pos", targetPinId: "starter-batt", color: "RD", gauge: "4 AWG", circuitId: "circuit-start", isInstalled: false },
    { id: "wire-batt-gnd", sourcePinId: "batt-neg", targetPinId: "star-batt", color: "BK", gauge: "4 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-ign-start", sourcePinId: "ign-start", targetPinId: "clutch-safe-in", color: "YE/RD", gauge: "14 AWG", circuitId: "circuit-start", isInstalled: false },
    { id: "wire-clutch-starter", sourcePinId: "clutch-safe-out", targetPinId: "starter-sol", color: "YE/RD", gauge: "14 AWG", circuitId: "circuit-start", isInstalled: false },

    // ===========================================
    // CHARGING CIRCUIT
    // ===========================================
    { id: "wire-alt-batt", sourcePinId: "alt-batt", targetPinId: "batt-pos", color: "RD", gauge: "8 AWG", circuitId: "circuit-charge", isInstalled: false },
    { id: "wire-alt-lamp", sourcePinId: "alt-l", targetPinId: "cluster-alt", color: "WH/RD", gauge: "18 AWG", circuitId: "circuit-charge", isInstalled: false },

    // ===========================================
    // HORN CIRCUIT
    // ===========================================
    { id: "wire-horn-relay-87", sourcePinId: "horn-rel-87", targetPinId: "horn-pos", color: "GN/BK", gauge: "16 AWG", circuitId: "circuit-horn", isInstalled: false },

    // ===========================================
    // POWER WINDOWS
    // ===========================================
    { id: "wire-window-pwr", sourcePinId: "blue-b", targetPinId: "window-sw-pwr", color: "VT", gauge: "14 AWG", circuitId: "circuit-window", isInstalled: false },
    { id: "wire-window-l1", sourcePinId: "window-sw-l1", targetPinId: "window-l-1", color: "BU", gauge: "14 AWG", circuitId: "circuit-window", isInstalled: false },
    { id: "wire-window-l2", sourcePinId: "window-sw-l2", targetPinId: "window-l-2", color: "BU/WH", gauge: "14 AWG", circuitId: "circuit-window", isInstalled: false },
    { id: "wire-window-r1", sourcePinId: "window-sw-r1", targetPinId: "window-r-1", color: "GN", gauge: "14 AWG", circuitId: "circuit-window", isInstalled: false },
    { id: "wire-window-r2", sourcePinId: "window-sw-r2", targetPinId: "window-r-2", color: "GN/WH", gauge: "14 AWG", circuitId: "circuit-window", isInstalled: false },

    // ===========================================
    // A/C SYSTEM
    // ===========================================
    { id: "wire-ac-press", sourcePinId: "ac-press-out", targetPinId: "ac-rel-86", color: "BU", gauge: "18 AWG", circuitId: "circuit-ac", isInstalled: false },
    { id: "wire-ac-clutch", sourcePinId: "ac-rel-87", targetPinId: "ac-clutch", color: "BU", gauge: "16 AWG", circuitId: "circuit-ac", isInstalled: false },

    // ===========================================
    // RADIO / AUDIO
    // ===========================================
    { id: "wire-radio-acc", sourcePinId: "blue-a", targetPinId: "radio-acc", color: "VT", gauge: "18 AWG", circuitId: "circuit-radio", isInstalled: false },

    // ===========================================
    // WIPERS
    // ===========================================
    { id: "wire-wiper-low", sourcePinId: "wiper-sw-low", targetPinId: "wiper-low", color: "BU", gauge: "16 AWG", circuitId: "circuit-wiper", isInstalled: false },
    { id: "wire-wiper-high", sourcePinId: "wiper-sw-high", targetPinId: "wiper-high", color: "BU/RD", gauge: "16 AWG", circuitId: "circuit-wiper", isInstalled: false },
    { id: "wire-washer", sourcePinId: "wiper-sw-wash", targetPinId: "washer-pos", color: "BU/WH", gauge: "18 AWG", circuitId: "circuit-wiper", isInstalled: false },

    // ===========================================
    // INSTRUMENT CLUSTER
    // ===========================================
    { id: "wire-cluster-tach", sourcePinId: "ms3-10", targetPinId: "cluster-tach", color: "WH/BK", gauge: "20 AWG", circuitId: "circuit-gauge", isInstalled: false },
    { id: "wire-cluster-fuel", sourcePinId: "fuel-send-sig", targetPinId: "cluster-fuel", color: "YE", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },

    // ===========================================
    // IACV
    // ===========================================
    { id: "wire-iacv-sig", sourcePinId: "ms3-11", targetPinId: "iacv-sig", color: "WH/BU", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // CLUTCH ECU SWITCH (Flat-foot / 2-step)
    // ===========================================
    { id: "wire-clutch-ecu", sourcePinId: "clutch-ecu-sig", targetPinId: "ms3-29", color: "GY/RD", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-clutch-ecu-gnd", sourcePinId: "clutch-ecu-gnd", targetPinId: "ms3-3", color: "BK/WH", gauge: "20 AWG", circuitId: "circuit-sensor-ground", isInstalled: false },

    // ===========================================
    // BOOST SOLENOID
    // ===========================================
    { id: "wire-boost-sig", sourcePinId: "ms3-12", targetPinId: "boost-sol-sig", color: "BU/BK", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-boost-pwr", sourcePinId: "ign-run", targetPinId: "boost-sol-12v", color: "RD", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // IACV POWER
    // ===========================================
    { id: "wire-iacv-pwr", sourcePinId: "ign-run", targetPinId: "iacv-12v", color: "RD", gauge: "18 AWG", circuitId: "circuit-engine", isInstalled: false },

    // ===========================================
    // INVERTER RELAY POWER (IGN for coil operation)
    // ===========================================
    { id: "wire-fan-inv-30", sourcePinId: "ign-run", targetPinId: "fan-inv-30", color: "RD", gauge: "16 AWG", circuitId: "circuit-cooling", isInstalled: false },
    { id: "wire-fan-inv-86", sourcePinId: "ign-run", targetPinId: "fan-inv-86", color: "RD", gauge: "20 AWG", circuitId: "circuit-cooling", isInstalled: false },
    { id: "wire-fuel-inv-30", sourcePinId: "ign-run", targetPinId: "fuel-inv-30", color: "RD", gauge: "16 AWG", circuitId: "circuit-fuel", isInstalled: false },
    { id: "wire-fuel-inv-86", sourcePinId: "ign-run", targetPinId: "fuel-inv-86", color: "RD", gauge: "20 AWG", circuitId: "circuit-fuel", isInstalled: false },

    // ===========================================
    // FLASHER CIRCUIT COMPLETION
    // ===========================================
    { id: "wire-flasher-to-col-l", sourcePinId: "flasher-l", targetPinId: "col-turn-l", color: "GN", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },
    { id: "wire-flasher-to-col-r", sourcePinId: "flasher-l", targetPinId: "col-turn-r", color: "GN", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },

    // ===========================================
    // IGNITION SWITCH BATTERY INPUT
    // ===========================================
    { id: "wire-batt-ign", sourcePinId: "batt-pos", targetPinId: "ign-batt", color: "RD", gauge: "12 AWG", circuitId: "circuit-start", isInstalled: false },

    // ===========================================
    // BRAKE SWITCH POWER
    // ===========================================
    { id: "wire-brake-sw-pwr", sourcePinId: "batt-pos", targetPinId: "brake-sw-in", color: "RD", gauge: "16 AWG", circuitId: "circuit-brake", isInstalled: false },

    // ===========================================
    // REVERSE SWITCH POWER
    // ===========================================
    { id: "wire-rev-sw-pwr", sourcePinId: "ign-run", targetPinId: "rev-sw-in", color: "RD", gauge: "18 AWG", circuitId: "circuit-reverse", isInstalled: false },

    // ===========================================
    // HORN RELAY CIRCUIT
    // ===========================================
    { id: "wire-horn-rel-30", sourcePinId: "batt-pos", targetPinId: "horn-rel-30", color: "RD", gauge: "16 AWG", circuitId: "circuit-horn", isInstalled: false },
    { id: "wire-horn-rel-86", sourcePinId: "batt-pos", targetPinId: "horn-rel-86", color: "RD", gauge: "18 AWG", circuitId: "circuit-horn", isInstalled: false },

    // ===========================================
    // A/C RELAY CIRCUIT
    // ===========================================
    { id: "wire-ac-rel-30", sourcePinId: "ign-run", targetPinId: "ac-rel-30", color: "BU", gauge: "16 AWG", circuitId: "circuit-ac", isInstalled: false },

    // ===========================================
    // RADIO POWER
    // ===========================================
    { id: "wire-radio-batt", sourcePinId: "batt-pos", targetPinId: "radio-batt", color: "YE", gauge: "18 AWG", circuitId: "circuit-radio", isInstalled: false },
    { id: "wire-radio-ill", sourcePinId: "tail-87", targetPinId: "radio-ill", color: "PK", gauge: "18 AWG", circuitId: "circuit-radio", isInstalled: false },

    // ===========================================
    // INTERIOR LIGHTS POWER
    // ===========================================
    { id: "wire-dome-pwr", sourcePinId: "batt-pos", targetPinId: "dome-pos", color: "RD", gauge: "18 AWG", circuitId: "circuit-interior", isInstalled: false },
    { id: "wire-maplight-pwr", sourcePinId: "black-f", targetPinId: "maplight-pos", color: "VT", gauge: "18 AWG", circuitId: "circuit-interior", isInstalled: false },

    // ===========================================
    // WIPER CIRCUIT POWER
    // ===========================================
    { id: "wire-wiper-sw-pwr", sourcePinId: "ign-run", targetPinId: "wiper-sw-pwr", color: "BU", gauge: "16 AWG", circuitId: "circuit-wiper", isInstalled: false },
    { id: "wire-wiper-park-pwr", sourcePinId: "batt-pos", targetPinId: "wiper-pwr", color: "RD", gauge: "16 AWG", circuitId: "circuit-wiper", isInstalled: false },

    // ===========================================
    // INSTRUMENT CLUSTER POWER & SIGNALS
    // ===========================================
    { id: "wire-cluster-ign", sourcePinId: "ign-run", targetPinId: "cluster-ign", color: "RD/WH", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },
    { id: "wire-cluster-ill", sourcePinId: "tail-87", targetPinId: "cluster-ill", color: "PK", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },
    { id: "wire-cluster-high", sourcePinId: "green-g", targetPinId: "cluster-high", color: "BU", gauge: "18 AWG", circuitId: "circuit-highbeam", isInstalled: false },
    { id: "wire-cluster-turn-l", sourcePinId: "col-turn-l", targetPinId: "cluster-turn-l", color: "GN", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },
    { id: "wire-cluster-turn-r", sourcePinId: "col-turn-r", targetPinId: "cluster-turn-r", color: "GN/WH", gauge: "18 AWG", circuitId: "circuit-hazard", isInstalled: false },

    // ===========================================
    // AEM WIDEBAND (integrated controller + gauge)
    // ===========================================
    { id: "wire-afr-pwr", sourcePinId: "green-d", targetPinId: "afr-gauge-pwr", color: "RD", gauge: "16 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-afr-sig", sourcePinId: "afr-gauge-sig", targetPinId: "ms3-25", color: "GY", gauge: "20 AWG", circuitId: "circuit-engine", isInstalled: false },
    { id: "wire-afr-sgnd", sourcePinId: "afr-gauge-sgnd", targetPinId: "ms3-3", color: "BK/WH", gauge: "20 AWG", circuitId: "circuit-sensor-ground", isInstalled: false },

    // ===========================================
    // ALTERNATOR EXCITER
    // ===========================================
    { id: "wire-alt-ig", sourcePinId: "ign-run", targetPinId: "alt-ig", color: "WH/RD", gauge: "18 AWG", circuitId: "circuit-charge", isInstalled: false },

    // ===========================================
    // WINDOW SWITCH ILLUMINATION
    // ===========================================
    { id: "wire-window-ill", sourcePinId: "tail-87", targetPinId: "window-sw-ill", color: "PK", gauge: "18 AWG", circuitId: "circuit-window", isInstalled: false },

    // ===========================================
    // GROUND WIRES - ENGINE BAY
    // ===========================================
    { id: "wire-coil-gnd", sourcePinId: "coil-gnd", targetPinId: "star-pdm", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-alt-gnd", sourcePinId: "alt-case-gnd", targetPinId: "star-alt", color: "BK", gauge: "10 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // GROUND WIRES - FRONT (to front chassis ground point)
    // ===========================================
    { id: "wire-fan1-gnd", sourcePinId: "fan1-neg", targetPinId: "star-pdm", color: "BK", gauge: "12-14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-fan2-gnd", sourcePinId: "fan2-neg", targetPinId: "star-pdm", color: "BK", gauge: "12-14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-hl-l-gnd", sourcePinId: "hl-l-gnd", targetPinId: "star-pdm", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-hl-r-gnd", sourcePinId: "hl-r-gnd", targetPinId: "star-pdm", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-turn-fl-gnd", sourcePinId: "turn-fl-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-turn-fr-gnd", sourcePinId: "turn-fr-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-marker-fl-gnd", sourcePinId: "marker-fl-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-marker-fr-gnd", sourcePinId: "marker-fr-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-horn-gnd", sourcePinId: "horn-gnd", targetPinId: "star-pdm", color: "BK", gauge: "16 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // GROUND WIRES - REAR (to rear chassis ground point)
    // ===========================================
    { id: "wire-pump-gnd", sourcePinId: "pump-neg", targetPinId: "batt-neg", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-tail-l-gnd", sourcePinId: "tail-l-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-tail-r-gnd", sourcePinId: "tail-r-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-rev-l-gnd", sourcePinId: "rev-l-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-rev-r-gnd", sourcePinId: "rev-r-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-plate-gnd", sourcePinId: "plate-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-fuel-send-gnd", sourcePinId: "fuel-send-gnd", targetPinId: "batt-neg", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // GROUND WIRES - INTERIOR/DASH
    // ===========================================
    { id: "wire-tach-gnd", sourcePinId: "tach-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-dome-gnd", sourcePinId: "dome-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-maplight-gnd", sourcePinId: "maplight-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-radio-gnd", sourcePinId: "radio-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-cluster-gnd", sourcePinId: "cluster-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-afr-gnd", sourcePinId: "afr-gauge-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-window-sw-gnd", sourcePinId: "window-sw-gnd", targetPinId: "star-pdm", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-wiper-gnd", sourcePinId: "wiper-gnd", targetPinId: "star-pdm", color: "BK", gauge: "16 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-washer-gnd", sourcePinId: "washer-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-wiper-sw-gnd", sourcePinId: "wiper-sw-gnd", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-ac-rel-gnd", sourcePinId: "ac-rel-85", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-tail-rel-gnd", sourcePinId: "tail-85", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },
    { id: "wire-flasher-gnd", sourcePinId: "flasher-e", targetPinId: "star-pdm", color: "BK", gauge: "18 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // ECU CASE/SHIELD GROUND
    // ===========================================
    { id: "wire-ms3-case-gnd", sourcePinId: "ms3-case-gnd", targetPinId: "star-ms3-case", color: "BK", gauge: "14 AWG", circuitId: "circuit-ground", isInstalled: false },

    // ===========================================
    // HORN BUTTON CIRCUIT
    // ===========================================
    { id: "wire-horn-btn", sourcePinId: "horn-btn-out", targetPinId: "horn-rel-85", color: "GN/BK", gauge: "18 AWG", circuitId: "circuit-horn", isInstalled: false },

    // ===========================================
    // CLUSTER GAUGE SENDERS
    // ===========================================
    { id: "wire-cluster-temp", sourcePinId: "cluster-temp-sig", targetPinId: "cluster-temp", color: "YE/GN", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },
    { id: "wire-cluster-oil", sourcePinId: "oil-press-sig", targetPinId: "cluster-oil", color: "YE/BK", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },
    { id: "wire-cluster-brake-warn", sourcePinId: "brake-warn-sig", targetPinId: "cluster-brake", color: "RD/WH", gauge: "18 AWG", circuitId: "circuit-gauge", isInstalled: false },

    // ===========================================
    // A/C SWITCH CIRCUIT
    // ===========================================
    { id: "wire-ac-sw-pwr", sourcePinId: "ign-run", targetPinId: "ac-sw-in", color: "BU", gauge: "18 AWG", circuitId: "circuit-ac", isInstalled: false },
    { id: "wire-ac-sw-to-press", sourcePinId: "ac-sw-out", targetPinId: "ac-press-in", color: "BU", gauge: "18 AWG", circuitId: "circuit-ac", isInstalled: false },
  ],

  // ===========================================
  // JUNCTIONS - Explicit wire splice/distribution points
  // ===========================================
  junctions: [
    // Example: Tail/marker distribution - one feed from relay splits to multiple lights
    // Note: Most junctions will be auto-generated via migration from implicit splices
    // This is a manual example for testing
    {
      id: "junction-tail-dist",
      type: "splice",
      label: "Tail Light Distribution",
      isInstalled: false,
      notes: "Distributes tail relay output to multiple tail/marker lights",
    },
  ],
};
