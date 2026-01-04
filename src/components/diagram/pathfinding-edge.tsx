"use client";

import { type EdgeProps, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

export interface PathfindingEdgeData {
  path?: string;
  label?: string;
  labelPosition?: { x: number; y: number };
}

/**
 * Custom edge that renders a pre-calculated pathfinding route.
 * The path is calculated in the parent component using A* pathfinding
 * to avoid node obstacles.
 */
export function PathfindingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const edgeData = data as PathfindingEdgeData | undefined;

  // If we have a pre-calculated path, use it
  // Otherwise fall back to a simple straight line
  const path = edgeData?.path || `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  const label = edgeData?.label;

  // Label position - use provided position or calculate midpoint
  const labelX = edgeData?.labelPosition?.x ?? (sourceX + targetX) / 2;
  const labelY = edgeData?.labelPosition?.y ?? (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
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
