"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DiagramConnector, DiagramData } from "./types";

interface PinDiagramProps {
  connector: DiagramConnector;
  data: DiagramData;
  /** Size of each pin cell */
  cellSize?: number;
  /** Highlighted pin ID */
  highlightedPin?: string;
  /** Callback when pin is clicked */
  onPinClick?: (pinId: string) => void;
}

/**
 * Visual connector pin diagram showing pin layout with wire status
 *
 * Renders pins in a grid layout based on connector.pinLayout or defaults to
 * a single column. Shows which pins are connected with color coding.
 */
export function PinDiagram({
  connector,
  data,
  cellSize = 32,
  highlightedPin,
  onPinClick,
}: PinDiagramProps) {
  // Build a map of pin connections
  const pinConnections = useMemo(() => {
    const connections = new Map<string, {
      connected: boolean;
      circuitColor?: string | undefined;
      circuitName?: string | undefined;
      targetName?: string | undefined;
      gauge?: string | undefined;
    }>();

    for (const pin of connector.pins) {
      // Find wires connected to this pin
      const wire = data.wires.find(
        (w) => w.sourcePinId === pin.id || w.targetPinId === pin.id
      );

      if (wire) {
        const circuit = wire.circuitId
          ? data.circuits.find((c) => c.id === wire.circuitId)
          : null;

        // Find the other end of the wire
        const otherPinId = wire.sourcePinId === pin.id ? wire.targetPinId : wire.sourcePinId;
        const otherComponent = findComponentForPin(data.components, otherPinId);

        connections.set(pin.id, {
          connected: true,
          circuitColor: circuit?.color,
          circuitName: circuit?.name,
          targetName: otherComponent?.name,
          gauge: wire.gauge || undefined,
        });
      } else {
        connections.set(pin.id, { connected: false });
      }
    }

    return connections;
  }, [connector.pins, data]);

  // Parse pin layout or create default single column
  const layout = useMemo(() => {
    // Check if connector has a defined layout
    if (connector.pinLayout && typeof connector.pinLayout === "object") {
      const layoutData = connector.pinLayout as { rows?: string[][] };
      if (layoutData.rows && Array.isArray(layoutData.rows)) {
        return layoutData.rows;
      }
    }

    // Default: single column with all pins
    return [connector.pins.map((p) => p.position)];
  }, [connector]);

  // Create a map from position to pin for quick lookup
  const pinByPosition = useMemo(() => {
    const map = new Map<string, typeof connector.pins[0]>();
    for (const pin of connector.pins) {
      map.set(pin.position, pin);
    }
    return map;
  }, [connector]);

  const numCols = Math.max(...layout.map((row) => row.length));
  const numRows = layout.length;

  return (
    <div className="inline-block">
      {/* Connector housing outline */}
      <div
        className="relative bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 border-2 border-neutral-300 dark:border-neutral-600"
        style={{
          width: numCols * cellSize + 16,
        }}
      >
        {/* Connector name */}
        <div className="text-[10px] font-semibold text-center text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wider">
          {connector.name}
        </div>

        {/* Pin grid */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${numCols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${numRows}, ${cellSize}px)`,
          }}
        >
          {layout.map((row, rowIndex) =>
            row.map((position, colIndex) => {
              const pin = pinByPosition.get(position);
              if (!pin) {
                // Empty cell
                return (
                  <div
                    key={`empty-${rowIndex}-${colIndex}`}
                    className="bg-neutral-200 dark:bg-neutral-700 rounded-sm opacity-30"
                  />
                );
              }

              const connection = pinConnections.get(pin.id);
              const isHighlighted = highlightedPin === pin.id;
              const isConnected = connection?.connected;

              return (
                <button
                  key={pin.id}
                  onClick={() => onPinClick?.(pin.id)}
                  className={cn(
                    "relative rounded-sm border-2 transition-all text-[10px] font-mono font-bold",
                    "flex items-center justify-center",
                    "hover:scale-105 hover:z-10",
                    isHighlighted
                      ? "ring-2 ring-amber-500 ring-offset-1"
                      : "",
                    isConnected
                      ? "bg-white dark:bg-neutral-900 border-neutral-400 dark:border-neutral-500"
                      : "bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 opacity-50"
                  )}
                  style={{
                    backgroundColor: isConnected && connection?.circuitColor
                      ? `${connection.circuitColor}20`
                      : undefined,
                    borderColor: isConnected && connection?.circuitColor
                      ? connection.circuitColor
                      : undefined,
                  }}
                  title={
                    connection?.connected
                      ? `${pin.label || pin.position}: ${connection.targetName || "Connected"}${
                          connection.gauge ? ` (${connection.gauge})` : ""
                        }`
                      : `${pin.label || pin.position}: Not connected`
                  }
                >
                  {pin.position}
                  {/* Connection indicator dot */}
                  {isConnected && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: connection?.circuitColor || "#10b981" }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Pin count */}
        <div className="text-[9px] text-center text-neutral-400 dark:text-neutral-500 mt-1">
          {connector.pins.filter((p) => pinConnections.get(p.id)?.connected).length}/{connector.pinCount} connected
        </div>
      </div>
    </div>
  );
}

// Helper to find which component contains a pin
function findComponentForPin(
  components: { id: string; name: string; connectors: { pins: { id: string }[] }[] }[],
  pinId: string
) {
  for (const component of components) {
    for (const connector of component.connectors) {
      if (connector.pins.some((p) => p.id === pinId)) {
        return component;
      }
    }
  }
  return undefined;
}
