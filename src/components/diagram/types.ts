/**
 * Types for the wiring diagram visualization
 */

export interface DiagramPin {
  id: string;
  position: string;
  label: string | null;
  function: string | null;
  wireGauge: string | null;
  fuseRating: string | null;
  isUsed: boolean;
  circuitColor?: string;
}

export interface DiagramConnector {
  id: string;
  name: string;
  type: string | null;
  pinCount: number;
  pinLayout: { rows: string[][] } | null;
  pins: DiagramPin[];
}

export interface DiagramComponent {
  id: string;
  name: string;
  type: ComponentType;
  manufacturer: string | null;
  partNumber: string | null;
  notes: string | null;
  connectors: DiagramConnector[];
}

export type ComponentType =
  | "pdu"
  | "ecu"
  | "relay"
  | "fuse"
  | "light"
  | "motor"
  | "sensor"
  | "switch"
  | "ground"
  | "power"
  | "generic";

export interface DiagramCircuit {
  id: string;
  name: string;
  color: string;
  category: string;
}

/**
 * Junction types for wire splices and distribution points
 */
export type JunctionType = "splice" | "distribution" | "tap" | "ground-bus";

/**
 * A junction represents a physical splice or distribution point where
 * multiple wires connect. The trunk wire carries the combined load,
 * and branch wires split off to individual destinations.
 */
export interface DiagramJunction {
  id: string;
  type: JunctionType;
  /** Human-readable label (e.g., "Headlight splice", "Main ground bus") */
  label?: string;
  /** Position on canvas (can be auto-positioned if not set) */
  position?: { x: number; y: number };
  /** Whether this splice has been physically installed */
  isInstalled: boolean;
  /** Notes for the builder */
  notes?: string;
}

export interface DiagramWire {
  id: string;
  /** Source can be a component pin OR a junction */
  sourcePinId?: string;
  sourceJunctionId?: string;
  /** Target can be a component pin OR a junction */
  targetPinId?: string;
  targetJunctionId?: string;
  color: string | null;
  gauge: string | null;
  circuitId: string | null;
  isInstalled: boolean;
}

export interface DiagramPosition {
  x: number;
  y: number;
}

/**
 * Attachment types for notes and photos
 */
export type AttachmentEntityType = "component" | "connector" | "wire" | "pin";

export interface DiagramAttachment {
  id: string;
  entityType: AttachmentEntityType;
  entityId: string;
  type: "note" | "photo";
  content: string; // Text for notes, data URL for photos
  caption?: string | undefined; // Optional caption for photos
  createdAt: string; // ISO date string
}

export interface DiagramData {
  components: DiagramComponent[];
  circuits: DiagramCircuit[];
  wires: DiagramWire[];
  /** Wire junctions (splices, distribution points) */
  junctions?: DiagramJunction[];
  /** Component positions on the canvas, keyed by component ID */
  positions?: Record<string, DiagramPosition>;
  /** Attachments (notes and photos) for diagram entities */
  attachments?: DiagramAttachment[];
}

// Node data types for React Flow
// Using Record<string, unknown> compatible interface for React Flow
export interface ComponentNodeData extends Record<string, unknown> {
  component: DiagramComponent;
  isSelected: boolean;
  isDimmed?: boolean;
  onPinClick?: ((pinId: string) => void) | undefined;
}

// Junction node data for React Flow
export interface JunctionNodeData extends Record<string, unknown> {
  junction: DiagramJunction;
  isSelected: boolean;
  isDimmed?: boolean;
  /** Number of wires entering this junction (trunk side) */
  trunkCount: number;
  /** Number of wires leaving this junction (branch side) */
  branchCount: number;
  /** Thickest gauge entering (for visual sizing) */
  trunkGauge?: string;
  /** Circuit colors passing through this junction */
  circuitColors: string[];
}

// Component type styling configuration
// Light mode: white/near-white backgrounds with colored borders for distinction
// Dark mode: deep saturated backgrounds for visibility on dark canvas
export const COMPONENT_STYLES: Record<
  ComponentType,
  { bg: string; border: string; icon: string }
> = {
  pdu: { bg: "bg-white dark:bg-blue-950", border: "border-blue-500", icon: "⚡" },
  ecu: { bg: "bg-white dark:bg-red-950", border: "border-red-500", icon: "🧠" },
  relay: { bg: "bg-white dark:bg-amber-950", border: "border-amber-500", icon: "🔌" },
  fuse: { bg: "bg-white dark:bg-yellow-950", border: "border-yellow-500", icon: "⚠️" },
  light: { bg: "bg-white dark:bg-cyan-950", border: "border-cyan-500", icon: "💡" },
  motor: { bg: "bg-white dark:bg-green-950", border: "border-green-500", icon: "⚙️" },
  sensor: { bg: "bg-white dark:bg-purple-950", border: "border-purple-500", icon: "📡" },
  switch: { bg: "bg-white dark:bg-orange-950", border: "border-orange-500", icon: "🎚️" },
  ground: { bg: "bg-white dark:bg-neutral-900", border: "border-neutral-500", icon: "⏚" },
  power: { bg: "bg-white dark:bg-rose-950", border: "border-rose-500", icon: "🔋" },
  generic: { bg: "bg-white dark:bg-slate-900", border: "border-slate-500", icon: "📦" },
};

// Wire color to CSS color mapping
export const WIRE_COLORS: Record<string, string> = {
  RD: "#ef4444", // Red
  BK: "#1f2937", // Black
  WH: "#f9fafb", // White
  GN: "#22c55e", // Green
  BU: "#3b82f6", // Blue
  YE: "#eab308", // Yellow
  OG: "#f97316", // Orange
  VT: "#8b5cf6", // Violet
  PK: "#ec4899", // Pink
  BN: "#92400e", // Brown
  GY: "#6b7280", // Gray
  TQ: "#14b8a6", // Turquoise
  // Striped wires
  "BK/WH": "repeating-linear-gradient(90deg, #1f2937 0px, #1f2937 4px, #f9fafb 4px, #f9fafb 8px)",
  "RD/BK": "repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 4px, #1f2937 4px, #1f2937 8px)",
  "GN/WH": "repeating-linear-gradient(90deg, #22c55e 0px, #22c55e 4px, #f9fafb 4px, #f9fafb 8px)",
};
