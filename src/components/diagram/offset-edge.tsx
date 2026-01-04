"use client";

import { type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

interface OffsetEdgeData {
  offset?: number;
  label?: string;
}

/**
 * Custom edge that supports perpendicular offsets for parallel wires.
 * Uses a bezier curve with offset control points so the endpoints stay
 * connected to the actual pins while the middle of the wire is offset.
 */
export function OffsetEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const edgeData = data as OffsetEdgeData | undefined;
  const offset = edgeData?.offset ?? 0;
  const label = edgeData?.label;

  // Calculate the perpendicular offset direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular unit vector (rotated 90 degrees)
  const perpX = length > 0 ? -dy / length : 0;
  const perpY = length > 0 ? dx / length : 0;

  // Midpoint of the straight line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Offset the control point perpendicular to the line
  const controlX = midX + perpX * offset;
  const controlY = midY + perpY * offset;

  // Create a quadratic bezier curve: endpoints stay at pins, middle bows out
  const edgePath = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;

  // Label position at the offset midpoint
  const labelX = controlX;
  const labelY = controlY;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        {...(markerEnd ? { markerEnd } : {})}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="px-1.5 py-0.5 bg-neutral-800/90 text-[10px] text-neutral-400 rounded border border-neutral-700 whitespace-nowrap"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
