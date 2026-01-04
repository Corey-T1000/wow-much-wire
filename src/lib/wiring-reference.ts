/**
 * Authoritative reference data for wiring verification
 *
 * This file contains ground truth data extracted from:
 * - Bussmann 31S-001-0 PDM datasheet
 * - MS3Pro Mini documentation
 * - SAE wire gauge standards
 * - Automotive electrical best practices
 */

// Wire gauge ampacity chart (max continuous current for chassis wiring)
// Based on SAE J1128 standards for automotive primary wire
export const WIRE_GAUGE_AMPACITY: Record<string, { ampacity: number; recommendedFuse: string }> = {
  "22 AWG": { ampacity: 5, recommendedFuse: "3-5A" },
  "20 AWG": { ampacity: 7.5, recommendedFuse: "5-7.5A" },
  "18 AWG": { ampacity: 10, recommendedFuse: "7.5-10A" },
  "16 AWG": { ampacity: 15, recommendedFuse: "10-15A" },
  "14 AWG": { ampacity: 20, recommendedFuse: "15-20A" },
  "12 AWG": { ampacity: 25, recommendedFuse: "20-25A" },
  "10 AWG": { ampacity: 35, recommendedFuse: "25-30A" },
  "8 AWG": { ampacity: 50, recommendedFuse: "40-50A" },
  "6 AWG": { ampacity: 70, recommendedFuse: "60-70A" },
  "4 AWG": { ampacity: 95, recommendedFuse: "80-90A" },
};

// Bussmann 31S-001-0 PDM specifications
export const PDM_SPECS = {
  partNumber: "31S-001-0",
  manufacturer: "Eaton/Bussmann",
  maxInputVoltage: 16, // Volts
  operatingVoltage: { min: 9, max: 16 }, // Volts
  totalOutputCurrent: 100, // Amps max combined
  relays: [
    {
      id: "R1",
      type: "SPDT",
      triggerPin: { connector: "BLACK", position: "C", name: "R1-86" },
      outputNO: { connector: "BLACK", position: "B", name: "R1-87" },
      outputNC: { connector: "BLACK", position: "D", name: "R1-87a" },
      maxCurrent: 20,
      description: "LOW beam bus relay",
      notes: "R1-87 internally connected to LOW output bus",
    },
    {
      id: "R2",
      type: "SPDT",
      triggerPin: { connector: "BLACK", position: "G", name: "R2-86" },
      outputNO: { connector: "BLACK", position: "H", name: "R2-87" },
      outputNC: { connector: "BLACK", position: "A", name: "R2-87a" },
      maxCurrent: 20,
      description: "HIGH beam bus relay",
      notes: "R2-87 internally connected to HIGH output bus",
    },
    {
      id: "R3",
      type: "SPST-NO",
      triggerPin: { connector: "BLACK", position: "E", name: "R3-86" },
      outputNO: { connector: "BLACK", position: "F", name: "R3-87" },
      maxCurrent: 20,
      description: "ACC (accessory) bus relay",
      notes: "For accessories that only run with key in ACC/RUN",
    },
    {
      id: "R4",
      type: "SPDT",
      triggerPin: { connector: "GREEN", position: "E", name: "R4-86" },
      outputNO: { connector: "GREEN", position: "C", name: "R4-87" },
      outputNC: { connector: "GREEN", position: "F", name: "R4-87a" },
      maxCurrent: 30,
      description: "IGN/RUN bus relay",
      notes: "Main ignition relay for ECU, coils, injectors",
    },
    {
      id: "R5",
      type: "SPST-NO",
      triggerPin: { connector: "GREY", position: "E", name: "R5-86" },
      outputNO: { connector: "GREY", position: "D", name: "R5-87", fusedAt: "grey-d" },
      outputNC: { connector: "GREY", position: "C", name: "R5-87a" },
      maxCurrent: 30,
      description: "Fan relay",
      notes: "High current for dual cooling fans. Outputs at GREY D and B (Fan 1 & Fan 2)",
    },
    {
      id: "R6",
      type: "SPST-NO",
      triggerPin: { connector: "GREY", position: "G", name: "R6-86" },
      outputNO: { connector: "GREY", position: "H", name: "R6-87" },
      maxCurrent: 20,
      description: "Fuel pump relay",
      notes: "Protected fuel pump circuit",
    },
  ],
  connectors: [
    {
      name: "BLACK",
      pins: ["A", "B", "C", "D", "E", "F", "G", "H"],
      functions: {
        A: "R2-87a (HIGH NC output)",
        B: "R1-87 (LOW bus - leave empty)",
        C: "R1-86 (LOW trigger input)",
        D: "R1-87a (LOW NC output)",
        E: "R3-86 (ACC trigger input)",
        F: "R3-87 (ACC output)",
        G: "R2-86 (HIGH trigger input)",
        H: "R2-87 (HIGH bus - leave empty)",
      },
    },
    {
      name: "GREY",
      pins: ["A", "B", "C", "D", "E", "F", "G", "H"],
      functions: {
        A: "Spare",
        B: "R5 Fan 2 fused output",
        C: "R5-87a (spare NC)",
        D: "R5 Fan 1 fused output",
        E: "R5-86 (Fan trigger input)",
        F: "Spare",
        G: "R6-86 (Fuel trigger input)",
        H: "R6-87 (Fuel pump output)",
      },
    },
    {
      name: "BLUE",
      pins: ["A", "B", "C", "D", "E", "F", "G", "H"],
      functions: {
        A: "ACC fused output 1",
        B: "ACC fused output 2",
        C: "Ground reference (RX-85)",
        D: "B+ fused output 1",
        E: "B+ fused output 2",
        F: "LOW fused output L",
        G: "LOW fused output R",
        H: "IGN fused output",
      },
    },
    {
      name: "GREEN",
      pins: ["A", "B", "C", "D", "E", "F", "G", "H"],
      functions: {
        A: "ECU fused output 1",
        B: "ECU fused output 2 (injectors)",
        C: "R4-87 (IGN bus - leave empty)",
        D: "ECU/B+ fused output",
        E: "R4-86 (IGN trigger input)",
        F: "R4-87a (spare NC)",
        G: "HIGH fused output L",
        H: "HIGH fused output R",
      },
    },
  ],
};

// MS3Pro Mini pinout (key pins for wiring verification)
export const MS3PRO_MINI_SPECS = {
  partNumber: "MS3Pro Mini",
  manufacturer: "AMPEFI",
  connector: "AMPSEAL 35-pin",
  pins: [
    { pin: 1, name: "12V Switched", type: "power", notes: "Main ECU power, fuse at 7.5-10A" },
    { pin: 2, name: "PGND", type: "ground", notes: "Power ground, run to block star ground" },
    { pin: 3, name: "PGND", type: "ground", notes: "Power ground, run to block star ground" },
    { pin: 4, name: "Fuel Pump", type: "low-side", notes: "Low-side output, needs inverter relay for PDM" },
    { pin: 5, name: "Inj A", type: "low-side", notes: "Injector bank A ground-side driver" },
    { pin: 6, name: "Inj B", type: "low-side", notes: "Injector bank B ground-side driver" },
    { pin: 7, name: "Inj C", type: "low-side", notes: "Injector bank C ground-side driver" },
    { pin: 8, name: "Inj D", type: "low-side", notes: "Injector bank D ground-side driver" },
    { pin: 9, name: "Inj E", type: "low-side", notes: "Injector bank E ground-side driver (V8/6cyl)" },
    { pin: 10, name: "Inj F", type: "low-side", notes: "Injector bank F ground-side driver (V8/6cyl)" },
    { pin: 11, name: "Inj G", type: "low-side", notes: "Injector bank G ground-side driver (V8)" },
    { pin: 12, name: "Inj H", type: "low-side", notes: "Injector bank H ground-side driver (V8)" },
    { pin: 13, name: "Tach Output", type: "output", notes: "12V square wave tach signal" },
    { pin: 14, name: "Idle Air", type: "low-side", notes: "IAC stepper or PWM valve" },
    { pin: 15, name: "Idle Air", type: "low-side", notes: "IAC stepper (2 of 4)" },
    { pin: 16, name: "Boost", type: "low-side", notes: "Boost control solenoid" },
    { pin: 17, name: "Spark A", type: "logic", notes: "Ignition coil driver A" },
    { pin: 18, name: "Spark B", type: "logic", notes: "Ignition coil driver B" },
    { pin: 19, name: "Spark C", type: "logic", notes: "Ignition coil driver C (4+ cyl)" },
    { pin: 20, name: "Spark D", type: "logic", notes: "Ignition coil driver D (4+ cyl)" },
    { pin: 21, name: "SGND", type: "ground", notes: "Sensor ground, separate from PGND at ECU" },
    { pin: 22, name: "PGND", type: "ground", notes: "Power ground" },
    { pin: 23, name: "5V Ref", type: "power", notes: "5V sensor reference (TPS, MAP)" },
    { pin: 24, name: "TPS", type: "analog", notes: "Throttle position sensor 0-5V" },
    { pin: 25, name: "MAP", type: "analog", notes: "Internal 4-bar MAP sensor" },
    { pin: 26, name: "MAT", type: "analog", notes: "Manifold air temp (pullup to 5V)" },
    { pin: 27, name: "CLT", type: "analog", notes: "Coolant temp sensor (pullup to 5V)" },
    { pin: 28, name: "O2", type: "analog", notes: "Wideband O2 input 0-5V" },
    { pin: 29, name: "EGO2", type: "analog", notes: "Secondary O2 or EGT" },
    { pin: 30, name: "Knock", type: "analog", notes: "Knock sensor input" },
    { pin: 31, name: "VR1+", type: "vr", notes: "Crank VR+ (or Hall)" },
    { pin: 32, name: "VR1-", type: "vr", notes: "Crank VR- (ground for Hall)" },
    { pin: 33, name: "VR2+", type: "vr", notes: "Cam VR+ (or Hall)" },
    { pin: 34, name: "VR2-", type: "vr", notes: "Cam VR- (ground for Hall)" },
    { pin: 35, name: "Fan Control", type: "low-side", notes: "Low-side output, needs inverter relay for PDM" },
  ],
  lowSideOutputs: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 35],
  notes: [
    "All outputs except Pin 13 (Tach) are low-side/ground-switching",
    "Fuel pump (Pin 4) and Fan (Pin 35) need inverter relays to trigger PDM relays",
    "SGND (sensor ground) must be kept separate from PGND (power ground) at the ECU",
    "Use star grounding at engine block for all grounds",
  ],
};

// Common automotive load current draws (for fuse sizing)
export const TYPICAL_LOADS: Record<string, { current: number; notes: string }> = {
  "headlight_halogen": { current: 5, notes: "55W H4 bulb at 12V" },
  "headlight_55w": { current: 5, notes: "Standard H7/H11 55W" },
  "headlight_100w": { current: 8.5, notes: "High-wattage halogen" },
  "fuel_pump_miata": { current: 5, notes: "Stock NA Miata fuel pump" },
  "fuel_pump_walbro_255": { current: 12, notes: "Walbro 255 high-flow pump" },
  "fuel_pump_walbro_450": { current: 18, notes: "Walbro 450 E85 pump" },
  "fan_oem_miata": { current: 15, notes: "Stock NA Miata electric fan" },
  "fan_spal_12in": { current: 18, notes: "SPAL 12\" high-flow fan" },
  "fan_spal_16in": { current: 25, notes: "SPAL 16\" high-flow fan" },
  "fan_dual_setup": { current: 40, notes: "Dual fans combined" },
  "injector_high_z": { current: 1, notes: "High impedance injector (12+ ohm)" },
  "injector_low_z": { current: 3, notes: "Low impedance injector (2-4 ohm)" },
  "coil_smart": { current: 5, notes: "Smart coil (built-in driver)" },
  "coil_dumb": { current: 8, notes: "Dumb coil needing ignitor" },
  "radio": { current: 5, notes: "Typical aftermarket head unit" },
  "amplifier_small": { current: 15, notes: "Small 2-channel amp" },
  "power_windows_per": { current: 15, notes: "Per window during operation" },
  "wideband_heater": { current: 3, notes: "O2 sensor heater circuit" },
};

// Inverter relay wiring guide
export const INVERTER_RELAY_WIRING = {
  purpose: "Convert ECU low-side outputs to +12V signals for PDM relay inputs",
  whenNeeded: [
    "MS3Pro fuel pump output (Pin 4) → PDM R6 trigger",
    "MS3Pro fan output (Pin 35) → PDM R5 trigger",
    "Any ECU output that switches to ground",
  ],
  wiring: {
    pin30: "+12V (fused, from IGN or B+)",
    pin85: "ECU low-side output (e.g., MS3 Pin 4)",
    pin86: "+12V (same fused source as pin 30)",
    pin87: "To PDM relay trigger input",
    pin87a: "Not used (NC output)",
  },
  operation: "When ECU output is OFF (open), relay is energized and pin 87 has 12V. When ECU turns ON (grounds pin 85), relay de-energizes and pin 87 goes open. This inverts the signal.",
  notes: [
    "Use a small fuse (3-5A) for the 12V supply",
    "Relay coil draws ~100mA",
    "Place inverter relays close to PDM to minimize wire runs",
  ],
};

// Ground strategy recommendations
export const GROUNDING_BEST_PRACTICES = {
  starGround: {
    location: "Engine block, dedicated bolt/stud",
    connections: [
      "Battery negative cable",
      "ECU power grounds (PGND)",
      "Engine block to chassis strap",
      "PDM ground reference",
    ],
    notes: "All power grounds meet at one point to prevent ground loops",
  },
  sensorGround: {
    location: "ECU sensor ground pin (SGND)",
    connections: [
      "TPS ground",
      "MAP sensor ground",
      "CLT sensor ground",
      "MAT sensor ground",
      "O2 sensor ground (if applicable)",
    ],
    notes: "Keep sensor grounds separate from power grounds at ECU. They can share the star ground at the block.",
  },
  chassisGrounds: {
    location: "Various body/chassis points",
    connections: [
      "Headlights",
      "Taillights",
      "Interior lights",
      "Radio",
    ],
    notes: "OK for low-current lighting/accessories. Use dedicated ground wires, not body metal.",
  },
  commonMistakes: [
    "Daisy-chaining grounds (series ground loop)",
    "Using body metal as the only ground path",
    "Mixing sensor grounds with high-current power grounds",
    "Undersized ground wires for high-current loads",
  ],
};

// Validation rules for the AI to check against
export const VALIDATION_RULES = {
  fuseWireMatch: "Fuse rating should never exceed wire ampacity (80% rule ideal)",
  groundSeparation: "SGND and PGND must not be directly connected except at star ground",
  inverterRelayRequired: "MS3 low-side outputs need inverter relays to trigger PDM relays",
  fuseBeforeLoad: "Every powered circuit must have fuse protection at the power source",
  wireGaugeByLength: "Voltage drop increases with length - upsize for runs over 10ft",
  canTermination: "CAN bus requires 120Ω termination at each end of the bus",
};

// Helper function to validate wire gauge for a given load
export function validateWireGauge(
  gauge: string,
  loadAmps: number,
  fuseRating?: string
): { valid: boolean; message: string } {
  const spec = WIRE_GAUGE_AMPACITY[gauge];
  if (!spec) {
    return { valid: false, message: `Unknown wire gauge: ${gauge}` };
  }

  if (loadAmps > spec.ampacity) {
    return {
      valid: false,
      message: `${gauge} rated for ${spec.ampacity}A but load draws ${loadAmps}A. Use thicker wire.`,
    };
  }

  if (fuseRating) {
    const fuseAmps = parseInt(fuseRating);
    if (!isNaN(fuseAmps) && fuseAmps > spec.ampacity) {
      return {
        valid: false,
        message: `${fuseRating} fuse exceeds ${gauge} ampacity (${spec.ampacity}A). Wire could burn before fuse blows.`,
      };
    }
  }

  return { valid: true, message: `${gauge} is adequate for ${loadAmps}A load.` };
}

// Helper to find PDM pin by function
export function findPdmPin(functionSearch: string): {
  connector: string;
  position: string;
  function: string;
} | null {
  for (const connector of PDM_SPECS.connectors) {
    for (const [position, func] of Object.entries(connector.functions)) {
      if (func.toLowerCase().includes(functionSearch.toLowerCase())) {
        return { connector: connector.name, position, function: func };
      }
    }
  }
  return null;
}

// Helper to find MS3 pin by function
export function findMs3Pin(functionSearch: string): typeof MS3PRO_MINI_SPECS.pins[0] | null {
  return (
    MS3PRO_MINI_SPECS.pins.find(
      (p) =>
        p.name.toLowerCase().includes(functionSearch.toLowerCase()) ||
        p.notes.toLowerCase().includes(functionSearch.toLowerCase())
    ) || null
  );
}

// Export all specs as a single object for easy access
export const WIRING_REFERENCE = {
  wireGauge: WIRE_GAUGE_AMPACITY,
  pdm: PDM_SPECS,
  ms3: MS3PRO_MINI_SPECS,
  loads: TYPICAL_LOADS,
  inverterRelay: INVERTER_RELAY_WIRING,
  grounding: GROUNDING_BEST_PRACTICES,
  rules: VALIDATION_RULES,
};
