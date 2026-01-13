/**
 * Migration utility for converting implicit splices to explicit junctions.
 *
 * Implicit splices are detected when multiple wires share the same sourcePinId.
 * This migration creates explicit DiagramJunction entities and rewires the connections
 * so that:
 *   - One "trunk" wire goes from the source pin to the junction
 *   - Multiple "branch" wires go from the junction to each destination
 */

import type { DiagramData, DiagramWire, DiagramJunction } from "@/components/diagram/types";

interface SpliceGroup {
  sourcePinId: string;
  wires: DiagramWire[];
}

/**
 * Detect implicit splices in the diagram data.
 * An implicit splice exists when multiple wires share the same sourcePinId.
 */
export function detectImplicitSplices(data: DiagramData): SpliceGroup[] {
  const wiresBySourcePin = new Map<string, DiagramWire[]>();

  for (const wire of data.wires) {
    // Only consider wires with component pin sources (not junction sources)
    if (!wire.sourcePinId) continue;

    const existing = wiresBySourcePin.get(wire.sourcePinId) || [];
    existing.push(wire);
    wiresBySourcePin.set(wire.sourcePinId, existing);
  }

  // Filter to only pins with multiple wires (implicit splices)
  const splices: SpliceGroup[] = [];
  for (const [sourcePinId, wires] of wiresBySourcePin) {
    if (wires.length > 1) {
      splices.push({ sourcePinId, wires });
    }
  }

  return splices;
}

/**
 * Get the thickest gauge from a list of wires.
 * Lower AWG numbers = thicker wire.
 */
function getThickestGauge(wires: DiagramWire[]): string | null {
  let thickest: string | null = null;
  let thickestAwg = Infinity;

  for (const wire of wires) {
    if (wire.gauge) {
      const awg = parseInt(wire.gauge);
      if (!isNaN(awg) && awg < thickestAwg) {
        thickestAwg = awg;
        thickest = wire.gauge;
      }
    }
  }

  return thickest;
}

/**
 * Migrate implicit splices to explicit junction entities.
 *
 * For each implicit splice (multiple wires from same source pin):
 * 1. Create a new DiagramJunction
 * 2. Create a trunk wire from the source pin to the junction
 * 3. Update the original wires to go from the junction to their destinations
 *
 * Returns a new DiagramData with junctions added and wires updated.
 */
export function migrateImplicitSplices(data: DiagramData): DiagramData {
  const splices = detectImplicitSplices(data);

  if (splices.length === 0) {
    // No splices to migrate, return data with empty junctions array if not present
    return {
      ...data,
      junctions: data.junctions || [],
    };
  }

  const newJunctions: DiagramJunction[] = [...(data.junctions || [])];
  const newWires: DiagramWire[] = [];
  const processedWireIds = new Set<string>();

  // Process each splice group
  for (const splice of splices) {
    const { sourcePinId, wires } = splice;

    // Create junction ID based on source pin
    const junctionId = `junction-${sourcePinId}`;

    // Skip if junction already exists (already migrated)
    if (newJunctions.some((j) => j.id === junctionId)) {
      // Mark these wires as processed so we don't double-add them
      for (const wire of wires) {
        processedWireIds.add(wire.id);
      }
      continue;
    }

    // Determine junction type based on wire characteristics
    const isGroundSplice = wires.some((w) => w.circuitId === "circuit-ground");
    const junctionType = isGroundSplice ? "ground-bus" : "splice";

    // Create the junction
    const junction: DiagramJunction = {
      id: junctionId,
      type: junctionType,
      label: `Splice from ${sourcePinId}`,
      isInstalled: false,
    };
    newJunctions.push(junction);

    // Create trunk wire from source pin to junction
    // Use the thickest gauge from the original wires
    const trunkGauge = getThickestGauge(wires);
    const firstWire = wires[0];

    const trunkWire: DiagramWire = {
      id: `trunk-${junctionId}`,
      sourcePinId: sourcePinId,
      targetJunctionId: junctionId,
      color: firstWire?.color || null,
      gauge: trunkGauge,
      circuitId: firstWire?.circuitId || null,
      isInstalled: false,
    };
    newWires.push(trunkWire);

    // Update original wires to go from junction to their destinations
    for (const wire of wires) {
      processedWireIds.add(wire.id);

      // Create branch wire - source is now the junction, not the original pin
      // We omit sourcePinId and set sourceJunctionId instead
      // Handle optional properties carefully due to exactOptionalPropertyTypes
      const branchWire: DiagramWire = {
        id: wire.id,
        sourceJunctionId: junctionId,
        ...(wire.targetPinId !== undefined && { targetPinId: wire.targetPinId }),
        ...(wire.targetJunctionId !== undefined && { targetJunctionId: wire.targetJunctionId }),
        color: wire.color,
        gauge: wire.gauge,
        circuitId: wire.circuitId,
        isInstalled: wire.isInstalled,
      };
      newWires.push(branchWire);
    }
  }

  // Add all non-splice wires that weren't processed
  for (const wire of data.wires) {
    if (!processedWireIds.has(wire.id)) {
      newWires.push(wire);
    }
  }

  return {
    ...data,
    junctions: newJunctions,
    wires: newWires,
  };
}

/**
 * Check if the diagram data needs migration.
 * Returns true if there are implicit splices that haven't been migrated.
 */
export function needsMigration(data: DiagramData): boolean {
  const splices = detectImplicitSplices(data);
  return splices.length > 0;
}
