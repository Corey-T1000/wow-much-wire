import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";
import type { DiagramData, ComponentNodeData, DiagramComponent, DiagramWire, JunctionNodeData } from "./types";
import type { Node, Edge } from "@xyflow/react";

const elk = new ELK();

// =============================================================================
// WIRE ENDPOINT HELPERS
// Handle wires that can connect to either pins or junctions
// =============================================================================

/**
 * Get the effective source pin ID for a wire.
 * For now, returns sourcePinId if present. Junction support will be added later.
 */
function getWireSourcePinId(wire: DiagramWire): string | undefined {
  return wire.sourcePinId;
}

/**
 * Get the effective target pin ID for a wire.
 * For now, returns targetPinId if present. Junction support will be added later.
 */
function getWireTargetPinId(wire: DiagramWire): string | undefined {
  return wire.targetPinId;
}

/**
 * Check if a wire connects to component pins (vs junctions).
 * Used to filter wires for component-only layout operations.
 */
function isComponentWire(wire: DiagramWire): boolean {
  return wire.sourcePinId !== undefined && wire.targetPinId !== undefined;
}

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
    const sourcePinId = getWireSourcePinId(wire);
    const targetPinId = getWireTargetPinId(wire);
    if ((sourcePinId && componentPins.has(sourcePinId)) || (targetPinId && componentPins.has(targetPinId))) {
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

// Return type for layout calculation
export interface LayoutResult {
  componentNodes: Node<ComponentNodeData>[];
  junctionNodes: Node<JunctionNodeData>[];
  edges: Edge[];
}

/**
 * Calculate automatic layout for the diagram using ELK
 * Optimized for schematic clarity: minimizes crossings and groups by circuit
 */
export async function calculateAutoLayout(
  data: DiagramData,
  existingNodes: Node<ComponentNodeData>[]
): Promise<{ nodes: Node<ComponentNodeData>[]; edges: Edge[]; junctionNodes: Node<JunctionNodeData>[] }> {
  // Filter to only component-to-component wires (not junction wires)
  // Junction wires will be handled separately once junction nodes are implemented
  const componentWires = data.wires.filter(isComponentWire) as Array<
    DiagramWire & { sourcePinId: string; targetPinId: string }
  >;

  // Get junctions (default to empty array if not present)
  const junctions = data.junctions || [];

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
  const sortedWires = [...componentWires].sort((a, b) => {
    const priorityA = a.circuitId ? (circuitPriority[a.circuitId] ?? 50) : 50;
    const priorityB = b.circuitId ? (circuitPriority[b.circuitId] ?? 50) : 50;
    return priorityA - priorityB;
  });

  // ELK edges for component-to-component wires
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

  // ==========================================================================
  // STEP 3.5: Add junction nodes and junction wire edges to ELK graph
  // ==========================================================================

  // Identify junction wires:
  // - Trunk wires: pin → junction (sourcePinId defined, targetJunctionId defined)
  // - Branch wires: junction → pin (sourceJunctionId defined, targetPinId defined)
  const trunkWires = data.wires.filter(
    (w) => w.sourcePinId !== undefined && w.targetJunctionId !== undefined
  );
  const branchWires = data.wires.filter(
    (w) => w.sourceJunctionId !== undefined && w.targetPinId !== undefined
  );

  // Add ELK edges for trunk wires (pin → junction)
  const trunkElkEdges: ElkExtendedEdge[] = trunkWires.map((wire) => {
    const sourceNode = findComponentIdForPin(data.components, wire.sourcePinId!);
    return {
      id: wire.id,
      sources: [sourceNode],
      targets: [wire.targetJunctionId!],
      layoutOptions: {
        "elk.priority": "50", // Lower priority than main wires
      },
    };
  });

  // Add ELK edges for branch wires (junction → pin)
  const branchElkEdges: ElkExtendedEdge[] = branchWires.map((wire) => {
    const targetNode = findComponentIdForPin(data.components, wire.targetPinId!);
    return {
      id: wire.id,
      sources: [wire.sourceJunctionId!],
      targets: [targetNode],
      layoutOptions: {
        "elk.priority": "50", // Lower priority than main wires
      },
    };
  });
  const junctionElkNodes: ElkNode[] = junctions.map((junction) => {
    // Junction nodes are small - just need space for the dog icon
    return {
      id: junction.id,
      width: 60,
      height: 60,
      // Junctions get ports for trunk (input) and branches (output)
      ports: [
        { id: `${junction.id}-trunk`, properties: { "port.side": "WEST" } },
        { id: `${junction.id}-branch-0`, properties: { "port.side": "EAST" } },
      ],
      layoutOptions: {
        // Place junctions in the middle layers
        "elk.position": "(0, 0)",
      },
    };
  });

  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions,
    children: [...elkNodes, ...junctionElkNodes],
    // Include all wire types: component-to-component, trunk, and branch
    edges: [...elkEdges, ...trunkElkEdges, ...branchElkEdges],
  };

  // Run ELK layout
  const layoutedGraph = await elk.layout(elkGraph);

  // Create circuit color map
  const circuitColorMap = new Map(data.circuits.map((c) => [c.id, c.color]));

  // Apply ELK positions to component nodes
  const layoutedComponentNodes: Node<ComponentNodeData>[] = (layoutedGraph.children || [])
    .filter((elkNode) => data.components.some((c) => c.id === elkNode.id))
    .map((elkNode) => {
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
    });

  // Apply ELK positions to junction nodes
  const layoutedJunctionNodes: Node<JunctionNodeData>[] = (layoutedGraph.children || [])
    .filter((elkNode) => junctions.some((j) => j.id === elkNode.id))
    .map((elkNode) => {
      const junction = junctions.find((j) => j.id === elkNode.id)!;

      // Count trunk and branch wires for this junction
      const trunkWires = data.wires.filter((w) => w.targetJunctionId === junction.id);
      const branchWires = data.wires.filter((w) => w.sourceJunctionId === junction.id);

      // Get circuit colors from connected wires
      const circuitColors = [...trunkWires, ...branchWires]
        .map((w) => w.circuitId ? circuitColorMap.get(w.circuitId) : null)
        .filter((c): c is string => c !== null);

      // Get thickest gauge from trunk wires
      const trunkGauge = trunkWires.reduce<string | undefined>((thickest, wire) => {
        if (!wire.gauge) return thickest;
        if (!thickest) return wire.gauge;
        const currentAwg = parseInt(wire.gauge);
        const thickestAwg = parseInt(thickest);
        return currentAwg < thickestAwg ? wire.gauge : thickest;
      }, undefined);

      return {
        id: elkNode.id,
        type: "junction",
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
        data: {
          junction,
          isSelected: false,
          trunkCount: trunkWires.length,
          branchCount: branchWires.length,
          // Only include trunkGauge if we found one (exactOptionalPropertyTypes compliance)
          ...(trunkGauge !== undefined && { trunkGauge }),
          circuitColors: [...new Set(circuitColors)],
        },
      };
    });

  // Combine component and junction nodes for backward compatibility
  // Note: This casts junction nodes to component nodes for the return type
  // A future update should change the return type to support both
  const layoutedNodes = layoutedComponentNodes as Node<ComponentNodeData>[];

  // Group wires by source pin to detect splices (wires sharing same source pin)
  const wiresBySourcePin = new Map<string, typeof componentWires>();
  for (const wire of componentWires) {
    const existing = wiresBySourcePin.get(wire.sourcePinId) || [];
    existing.push(wire);
    wiresBySourcePin.set(wire.sourcePinId, existing);
  }

  // Group wires by source COMPONENT for per-component spreading
  const wiresBySourceComponent = new Map<string, typeof componentWires>();
  for (const wire of componentWires) {
    const sourceNodeId = findComponentIdForPin(data.components, wire.sourcePinId);
    const existing = wiresBySourceComponent.get(sourceNodeId) || [];
    existing.push(wire);
    wiresBySourceComponent.set(sourceNodeId, existing);
  }

  // Group wires by target COMPONENT for target-side spreading
  // IMPORTANT: Sort wires within each group by target pin Y position
  // This ensures wires to higher pins (smaller Y) get smaller indices,
  // preventing horizontal segment crossings
  const wiresByTargetComponent = new Map<string, typeof componentWires>();
  for (const wire of componentWires) {
    const targetNodeId = findComponentIdForPin(data.components, wire.targetPinId);
    const existing = wiresByTargetComponent.get(targetNodeId) || [];
    existing.push(wire);
    wiresByTargetComponent.set(targetNodeId, existing);
  }

  // Sort wires within each target group by target pin position (Y coordinate)
  // This is crucial: wires to pins higher up (smaller Y) should have smaller indices
  // so they turn horizontal earlier, preventing crossings with wires going lower
  for (const [targetNodeId, wires] of wiresByTargetComponent) {
    wires.sort((a, b) => {
      const pinIndexA = findPinIndexInComponent(data.components, a.targetPinId);
      const pinIndexB = findPinIndexInComponent(data.components, b.targetPinId);
      return pinIndexA - pinIndexB;
    });
    wiresByTargetComponent.set(targetNodeId, wires);
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

  // Calculate target component totals for target-side spreading
  const targetComponentTotals = new Map<string, number>();
  for (const [targetNodeId, wires] of wiresByTargetComponent) {
    targetComponentTotals.set(targetNodeId, wires.length);
  }

  // Pre-calculate target pin indices based on sorted order
  // This ensures wires to pins higher up (smaller Y) get smaller indices
  const wireTargetPinIndex = new Map<string, number>();
  for (const [, wires] of wiresByTargetComponent) {
    wires.forEach((wire, index) => {
      wireTargetPinIndex.set(wire.id, index);
    });
  }

  // Track wire indices within groups for spreading
  const wireIndexInSplice = new Map<string, number>();
  const wireIndexInSourceComponent = new Map<string, number>();

  // Create edges with smart handle selection
  const layoutedEdges: Edge[] = componentWires.map((wire) => {
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

    // Get wire index within TARGET component (for target-side spreading)
    // Uses pre-calculated index based on target pin Y position (sorted order)
    // This ensures wires to pins higher up get smaller indices, preventing crossings
    const targetPinTotal = targetComponentTotals.get(targetNodeId) || 1;
    const targetPinIndex = wireTargetPinIndex.get(wire.id) || 0;

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
        // Target-side spreading (wires to same component get different corridors)
        targetPinIndex,
        targetPinTotal,
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

  // ==========================================================================
  // STEP 5: Create edges for junction wires (trunk and branch)
  // ==========================================================================

  // Trunk wire edges: component pin → junction
  const trunkWireEdges: Edge[] = trunkWires.map((wire) => {
    const sourceNodeId = findComponentIdForPin(data.components, wire.sourcePinId!);
    const sourceHandle = `${wire.sourcePinId}-out`;
    const targetHandle = `${wire.targetJunctionId}-trunk`;

    return {
      id: wire.id,
      type: "wire",
      source: sourceNodeId,
      target: wire.targetJunctionId!,
      sourceHandle,
      targetHandle,
      data: {
        spliceIndex: 0,
        spliceTotal: 1,
        sourceComponentIndex: 0,
        sourceComponentTotal: 1,
        targetPinIndex: 0,
        targetPinTotal: 1,
        isJunctionWire: true,
        isTrunk: true,
      },
      style: {
        stroke: wire.circuitId
          ? circuitColorMap.get(wire.circuitId) || "#6b7280"
          : "#6b7280",
        strokeWidth: getStrokeWidth(wire.gauge),
      },
      markerEnd: {
        type: "arrowclosed" as const,
        width: 12,
        height: 12,
      },
    };
  });

  // Branch wire edges: junction → component pin
  const branchWireEdges: Edge[] = branchWires.map((wire, index) => {
    const targetNodeId = findComponentIdForPin(data.components, wire.targetPinId!);
    // Each branch gets its own handle on the junction
    const sourceHandle = `${wire.sourceJunctionId}-branch-${index}`;
    // React Flow expects null for missing handles, not undefined
    const targetHandle = wire.targetPinId ?? null;

    return {
      id: wire.id,
      type: "wire",
      source: wire.sourceJunctionId!,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      data: {
        spliceIndex: 0,
        spliceTotal: 1,
        sourceComponentIndex: index,
        sourceComponentTotal: branchWires.filter((w) => w.sourceJunctionId === wire.sourceJunctionId).length,
        targetPinIndex: 0,
        targetPinTotal: 1,
        isJunctionWire: true,
        isBranch: true,
      },
      style: {
        stroke: wire.circuitId
          ? circuitColorMap.get(wire.circuitId) || "#6b7280"
          : "#6b7280",
        strokeWidth: getStrokeWidth(wire.gauge),
      },
      markerEnd: {
        type: "arrowclosed" as const,
        width: 12,
        height: 12,
      },
    };
  });

  // Combine all edge types
  const allEdges = [...layoutedEdges, ...trunkWireEdges, ...branchWireEdges];

  return {
    nodes: layoutedNodes,
    edges: allEdges,
    // Also export junction nodes for consumers that need them
    junctionNodes: layoutedJunctionNodes,
  };
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

/**
 * Find the index of a pin within its component (across all connectors).
 * This represents the pin's vertical position - lower index = higher on screen.
 * Used for sorting wires by target pin position to prevent crossings.
 */
function findPinIndexInComponent(
  components: DiagramComponent[],
  pinId: string
): number {
  for (const component of components) {
    let pinIndex = 0;
    for (const connector of component.connectors) {
      for (const pin of connector.pins) {
        if (pin.id === pinId) {
          return pinIndex;
        }
        pinIndex++;
      }
    }
  }
  return 0;
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

// =============================================================================
// HARNESS BUNDLING
// Groups wires between component pairs into single "harness" edges
// =============================================================================

export interface HarnessBundleInfo {
  id: string;
  sourceComponentId: string;
  targetComponentId: string;
  wireIds: string[];
  wireCount: number;
  circuitColors: string[];
}

/**
 * Create harness bundle edges from individual wire data.
 * Groups wires by source-target component pair.
 * Returns both harness edges (for bundled view) and the mapping of which wires are in which bundle.
 */
export function createHarnessBundles(
  data: DiagramData,
  existingEdges: Edge[],
  expandedBundles: Set<string> = new Set()
): { edges: Edge[]; bundles: HarnessBundleInfo[] } {
  // Filter to only component-to-component wires (not junction wires)
  const componentWires = data.wires.filter(isComponentWire) as Array<
    DiagramWire & { sourcePinId: string; targetPinId: string }
  >;

  // Create circuit color map
  const circuitColorMap = new Map(data.circuits.map((c) => [c.id, c.color]));

  // Group wires by source-target component pair
  const bundleMap = new Map<string, typeof componentWires>();

  for (const wire of componentWires) {
    const sourceComponentId = findComponentIdForPin(data.components, wire.sourcePinId);
    const targetComponentId = findComponentIdForPin(data.components, wire.targetPinId);

    // Create a consistent key regardless of direction
    // Always use alphabetically first component as the "source" for the key
    const [comp1, comp2] = [sourceComponentId, targetComponentId].sort();
    const bundleKey = `${comp1}--${comp2}`;

    const existing = bundleMap.get(bundleKey) || [];
    existing.push(wire);
    bundleMap.set(bundleKey, existing);
  }

  // Build bundle info and decide which edges to show
  const bundles: HarnessBundleInfo[] = [];
  const resultEdges: Edge[] = [];

  for (const [bundleKey, wires] of bundleMap) {
    const [comp1, comp2] = bundleKey.split("--");
    if (!comp1 || !comp2) continue;

    // Get circuit colors for this bundle
    const colors = wires
      .map((w) => (w.circuitId ? circuitColorMap.get(w.circuitId) : null))
      .filter((c): c is string => c !== null && c !== undefined);

    const bundleId = `harness-${bundleKey}`;
    const wireIds = wires.map((w) => w.id);

    bundles.push({
      id: bundleId,
      sourceComponentId: comp1,
      targetComponentId: comp2,
      wireIds,
      wireCount: wires.length,
      circuitColors: colors,
    });

    // Check if this bundle is expanded
    const isExpanded = expandedBundles.has(bundleId);

    if (isExpanded || wires.length === 1) {
      // Show individual wires - find them in existing edges
      for (const wire of wires) {
        const existingEdge = existingEdges.find((e) => e.id === wire.id);
        if (existingEdge) {
          resultEdges.push(existingEdge);
        }
      }
    } else {
      // Show bundled harness edge
      // Determine actual source/target based on first wire's direction
      const firstWire = wires[0];
      if (!firstWire) continue;

      const actualSource = findComponentIdForPin(data.components, firstWire.sourcePinId);
      const actualTarget = findComponentIdForPin(data.components, firstWire.targetPinId);

      resultEdges.push({
        id: bundleId,
        type: "harness",
        source: actualSource,
        target: actualTarget,
        data: {
          wireCount: wires.length,
          wireIds,
          circuitColors: colors,
        },
      });
    }
  }

  return { edges: resultEdges, bundles };
}
