import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";
import type { DiagramData, ComponentNodeData, DiagramComponent } from "./types";
import type { Node, Edge } from "@xyflow/react";

const elk = new ELK();

// =============================================================================
// COMPONENT ROLE CLASSIFICATION
// For wiring schematics, we organize by signal flow: Sources → Control → Hub → Consumers
// =============================================================================

type ComponentRole = "source" | "control" | "hub" | "consumer" | "ground";

/**
 * Classify a component by its role in the electrical system.
 * This determines its horizontal position (layer) in the schematic.
 */
function classifyComponentRole(component: DiagramComponent): ComponentRole {
  const type = component.type;
  const id = component.id.toLowerCase();
  const name = component.name.toLowerCase();

  // PDM is always the central hub
  if (type === "pdu" || id.includes("pdm")) {
    return "hub";
  }

  // Ground points go on the far right
  if (type === "ground" || id.includes("ground") || name.includes("ground")) {
    return "ground";
  }

  // Switches are control/input sources
  if (type === "switch" || id.includes("switch") || id.includes("ign-")) {
    return "source";
  }

  // ECU is a controller (between source and hub)
  if (type === "ecu") {
    return "control";
  }

  // Relays are control components
  if (type === "relay") {
    return "control";
  }

  // Everything else (motors, lights, sensors) are consumers
  return "consumer";
}

/**
 * Get the circuit category for vertical grouping.
 * Components in the same circuit category should be vertically close.
 */
function getCircuitPriority(component: DiagramComponent, data: DiagramData): number {
  // Find which circuits this component is involved in
  const componentPins = new Set<string>();
  for (const conn of component.connectors) {
    for (const pin of conn.pins) {
      componentPins.add(pin.id);
    }
  }

  // Check wires to find circuit involvement
  const involvedCircuits = new Set<string>();
  for (const wire of data.wires) {
    if (componentPins.has(wire.sourcePinId) || componentPins.has(wire.targetPinId)) {
      if (wire.circuitId) {
        involvedCircuits.add(wire.circuitId);
      }
    }
  }

  // Priority order for vertical positioning (lower = higher on screen)
  const circuitOrder: Record<string, number> = {
    "circuit-highbeam": 0,
    "circuit-lowbeam": 1,
    "circuit-tail": 2,
    "circuit-hazard": 3,
    "circuit-acc": 4,
    "circuit-engine": 5,
    "circuit-cooling": 6,
    "circuit-fuel": 7,
    "circuit-ground": 8,
  };

  // Return lowest priority (highest position) among involved circuits
  let minPriority = 100;
  for (const circuitId of involvedCircuits) {
    const priority = circuitOrder[circuitId] ?? 50;
    if (priority < minPriority) {
      minPriority = priority;
    }
  }

  return minPriority;
}

// Estimate node dimensions based on component structure
function estimateNodeSize(component: DiagramComponent): { width: number; height: number } {
  const width = 300; // Slightly wider for gauge/fuse info
  let height = 48; // Header

  for (const connector of component.connectors) {
    height += 28; // Connector section header
    // Single column layout - each pin is its own row (28px min-height + gap)
    height += connector.pins.length * 32;
  }

  if (component.notes) {
    height += 28;
  }

  height += 16; // Bottom padding
  return { width, height };
}

// =============================================================================
// ELK LAYOUT OPTIONS - Optimized for schematic clarity
// =============================================================================
const layoutOptions = {
  // Core algorithm - layered creates clear left-to-right flow
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",

  // PRIORITY: Crossing minimization over compactness
  // This is THE most important setting for readable schematics
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.crossingMinimization.greedySwitch.type": "TWO_SIDED",
  "elk.layered.crossingMinimization.semiInteractive": "true",

  // Thoroughness - higher = more iterations for better crossing reduction
  "elk.layered.thoroughness": "100",

  // Spacing - generous for wire clarity
  "elk.spacing.nodeNode": "120",
  "elk.layered.spacing.nodeNodeBetweenLayers": "250",
  "elk.spacing.edgeNode": "60",
  "elk.spacing.edgeEdge": "30",

  // Node placement - BRANDES_KOEPF works well with crossing minimization
  "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
  "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",

  // Edge routing - orthogonal for schematic clarity
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.unnecessaryBendpoints": "true",

  // Layering - use LONGEST_PATH for better hierarchical structure
  "elk.layered.layering.strategy": "LONGEST_PATH",

  // Respect the model order we provide (sorted by circuit priority)
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.layered.considerModelOrder.noModelOrder": "false",

  // Minimize edge length as secondary goal
  "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH",

  // Interactive mode - respects constraints we set
  "elk.layered.interactiveReferencePoint": "CENTER",
};

/**
 * Calculate automatic layout for the diagram using ELK
 * Optimized for schematic clarity: minimizes crossings and groups by circuit
 */
export async function calculateAutoLayout(
  data: DiagramData,
  existingNodes: Node<ComponentNodeData>[]
): Promise<{ nodes: Node<ComponentNodeData>[]; edges: Edge[] }> {
  // ==========================================================================
  // STEP 1: Classify and sort components for optimal layout
  // ==========================================================================

  // Map role to layer constraint (horizontal position)
  const roleToLayer: Record<ComponentRole, number> = {
    source: 0,   // Far left: power sources, switches
    control: 1,  // Left-center: ECU, inverter relays
    hub: 2,      // Center: PDM (main distribution)
    consumer: 3, // Right: lights, fans, motors
    ground: 4,   // Far right: ground points
  };

  // Sort components: first by role (layer), then by circuit priority (vertical)
  const sortedComponents = [...data.components].sort((a, b) => {
    const roleA = classifyComponentRole(a);
    const roleB = classifyComponentRole(b);
    const layerDiff = roleToLayer[roleA] - roleToLayer[roleB];
    if (layerDiff !== 0) return layerDiff;

    // Within same layer, sort by circuit priority for vertical grouping
    return getCircuitPriority(a, data) - getCircuitPriority(b, data);
  });

  // ==========================================================================
  // STEP 2: Build ELK graph with layer constraints
  // ==========================================================================

  const elkNodes: ElkNode[] = sortedComponents.map((component, index) => {
    const size = estimateNodeSize(component);
    const role = classifyComponentRole(component);
    const circuitPriority = getCircuitPriority(component, data);

    // Create ports for each pin - all on left side for consistent wire routing
    const ports: { id: string; properties?: Record<string, string> }[] = [];
    for (const connector of component.connectors) {
      for (const pin of connector.pins) {
        ports.push({
          id: `${pin.id}-port`,
          properties: { "port.side": "WEST" },
        });
      }
    }

    return {
      id: component.id,
      width: size.width,
      height: size.height,
      ports,
      // Use layout options to hint at layer and position
      layoutOptions: {
        // Layer constraint based on role (0=leftmost, 4=rightmost)
        "elk.layered.layering.layerConstraint": role === "hub" ? "NONE" : "NONE",
        // Position hint within layer based on circuit priority
        "elk.position": `(0, ${circuitPriority * 100})`,
        // Priority for this node (higher = processed first)
        "elk.priority": String(100 - index),
      },
      properties: {
        "portConstraints": "FIXED_SIDE",
      },
    };
  });

  // ==========================================================================
  // STEP 3: Build edges sorted by circuit for better grouping
  // ==========================================================================

  // Circuit priority for edge ordering (wires of same circuit should be adjacent)
  const circuitPriority: Record<string, number> = {
    "circuit-highbeam": 0,
    "circuit-lowbeam": 1,
    "circuit-tail": 2,
    "circuit-hazard": 3,
    "circuit-acc": 4,
    "circuit-engine": 5,
    "circuit-cooling": 6,
    "circuit-fuel": 7,
    "circuit-ground": 8,
  };

  // Sort wires by circuit so same-colored wires are routed together
  const sortedWires = [...data.wires].sort((a, b) => {
    const priorityA = a.circuitId ? (circuitPriority[a.circuitId] ?? 50) : 50;
    const priorityB = b.circuitId ? (circuitPriority[b.circuitId] ?? 50) : 50;
    return priorityA - priorityB;
  });

  const elkEdges: ElkExtendedEdge[] = sortedWires.map((wire, index) => {
    const sourceNode = findComponentIdForPin(data.components, wire.sourcePinId);
    const targetNode = findComponentIdForPin(data.components, wire.targetPinId);
    return {
      id: wire.id,
      sources: [sourceNode],
      targets: [targetNode],
      // Priority hint - earlier in sorted order = higher priority
      layoutOptions: {
        "elk.priority": String(100 - index),
      },
    };
  });

  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions,
    children: elkNodes,
    edges: elkEdges,
  };

  // Run ELK layout
  const layoutedGraph = await elk.layout(elkGraph);

  // Create circuit color map
  const circuitColorMap = new Map(data.circuits.map((c) => [c.id, c.color]));

  // Apply ELK positions to nodes
  const layoutedNodes: Node<ComponentNodeData>[] = (layoutedGraph.children || []).map(
    (elkNode) => {
      const existingNode = existingNodes.find((n) => n.id === elkNode.id);
      const component = data.components.find((c) => c.id === elkNode.id);
      return {
        id: elkNode.id,
        type: "component",
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
        data: existingNode?.data || {
          component: component!,
          isSelected: false,
        },
      };
    }
  );

  // Group wires by source pin to detect splices (wires sharing same source pin)
  const wiresBySourcePin = new Map<string, typeof data.wires>();
  for (const wire of data.wires) {
    const existing = wiresBySourcePin.get(wire.sourcePinId) || [];
    existing.push(wire);
    wiresBySourcePin.set(wire.sourcePinId, existing);
  }

  // Group wires by source COMPONENT for per-component spreading
  const wiresBySourceComponent = new Map<string, typeof data.wires>();
  for (const wire of data.wires) {
    const sourceNodeId = findComponentIdForPin(data.components, wire.sourcePinId);
    const existing = wiresBySourceComponent.get(sourceNodeId) || [];
    existing.push(wire);
    wiresBySourceComponent.set(sourceNodeId, existing);
  }

  // Calculate splice info for pins with multiple outgoing wires
  const spliceTotals = new Map<string, number>();
  for (const [sourcePinId, wires] of wiresBySourcePin) {
    if (wires.length > 1) {
      spliceTotals.set(sourcePinId, wires.length);
    }
  }

  // Calculate source component totals for per-component spreading
  const sourceComponentTotals = new Map<string, number>();
  for (const [sourceNodeId, wires] of wiresBySourceComponent) {
    sourceComponentTotals.set(sourceNodeId, wires.length);
  }

  // Track wire indices within groups for spreading
  const wireIndexInSplice = new Map<string, number>();
  const wireIndexInSourceComponent = new Map<string, number>();

  // Create edges with smart handle selection
  const layoutedEdges: Edge[] = data.wires.map((wire) => {
    const sourceNodeId = findComponentIdForPin(data.components, wire.sourcePinId);
    const targetNodeId = findComponentIdForPin(data.components, wire.targetPinId);

    // All handles are on the left side for clean routing
    const sourceHandle = `${wire.sourcePinId}-out`;
    const targetHandle = wire.targetPinId;

    // Check if this wire is part of a splice (multiple wires from same source pin)
    const spliceTotal = spliceTotals.get(wire.sourcePinId) || 1;
    let spliceIndex = 0;

    if (spliceTotal > 1) {
      // Get and increment the index for this splice group
      spliceIndex = wireIndexInSplice.get(wire.sourcePinId) || 0;
      wireIndexInSplice.set(wire.sourcePinId, spliceIndex + 1);
    }

    // Get wire index within SOURCE component (for per-component spreading)
    const sourceComponentTotal = sourceComponentTotals.get(sourceNodeId) || 1;
    const sourceComponentIndex = wireIndexInSourceComponent.get(sourceNodeId) || 0;
    wireIndexInSourceComponent.set(sourceNodeId, sourceComponentIndex + 1);

    // Determine if this is a signal ground (dotted dark grey style)
    const signalGround = isSignalGround(wire);

    return {
      id: wire.id,
      type: "wire",  // Custom edge with consistent exit distances
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      data: {
        // Splice information (wires from same source pin)
        spliceIndex,
        spliceTotal,
        // Per-component spreading (each component starts from base offset)
        sourceComponentIndex,
        sourceComponentTotal,
      },
      style: {
        stroke: signalGround
          ? "#4b5563" // Dark grey for signal grounds
          : wire.circuitId
            ? circuitColorMap.get(wire.circuitId) || "#6b7280"
            : "#6b7280",
        strokeWidth: getStrokeWidth(wire.gauge),
        // Dotted pattern for signal grounds
        ...(signalGround && { strokeDasharray: "4 3" }),
      },
      markerEnd: {
        type: "arrowclosed" as const,
        width: 12,
        height: 12,
      },
      // Wire gauge is now shown in the component pin display, not on the wire
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

function findComponentIdForPin(
  components: DiagramComponent[],
  pinId: string
): string {
  for (const component of components) {
    for (const connector of component.connectors) {
      if (connector.pins.some((p) => p.id === pinId)) {
        return component.id;
      }
    }
  }
  return "";
}

function getStrokeWidth(gauge: string | null): number {
  if (!gauge) return 2;
  const awg = parseInt(gauge);
  if (isNaN(awg)) return 2;
  if (awg <= 10) return 5;  // Heavy power cables (battery, alternator)
  if (awg <= 14) return 4;  // Power distribution
  if (awg <= 18) return 3;  // Standard circuits
  return 2;                  // Signal wires (min 2px for visibility)
}

/**
 * Check if a wire is a signal ground (small gauge ground going to ECU sensor ground pin)
 * Signal grounds are distinct from power grounds - they carry sensor reference signals
 */
function isSignalGround(wire: DiagramData["wires"][0]): boolean {
  // Signal grounds go to the ECU sensor ground pin (ms3-3)
  // They're typically 18-20 AWG for sensor return paths
  const isEcuSensorGround = wire.targetPinId === "ms3-3";
  const isGroundCircuit = wire.circuitId === "circuit-ground";
  const isSmallGauge = wire.gauge?.includes("20") ?? false;

  return isEcuSensorGround || (isGroundCircuit && isSmallGauge);
}
