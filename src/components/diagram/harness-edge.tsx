"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "@xyflow/react";

// Edge data for harness bundles
export interface HarnessEdgeData {
  wireCount: number;
  wireIds: string[];
  circuitColors: string[];
  isExpanded?: boolean;
  onToggleExpand?: (wireIds: string[]) => void;
}

/**
 * HarnessEdge renders a bundled group of wires as a single thick "harness" line.
 *
 * Features:
 * - Thick neutral line representing the cable bundle
 * - Label showing wire count
 * - Color indicators for circuits in the bundle
 * - Click to expand and see individual wires
 */
function HarnessEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as HarnessEdgeData | undefined;
  const wireCount = edgeData?.wireCount || 1;
  const circuitColors = edgeData?.circuitColors || [];
  const wireIds = edgeData?.wireIds || [];
  const onToggleExpand = edgeData?.onToggleExpand;

  // Use bezier path for smooth curves
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  // Calculate stroke width based on wire count (min 4, max 16)
  const strokeWidth = Math.min(16, Math.max(4, 4 + wireCount * 0.8));

  // Get unique colors for the gradient/indicator
  const uniqueColors = [...new Set(circuitColors)].slice(0, 5);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand && wireIds.length > 0) {
      onToggleExpand(wireIds);
    }
  };

  return (
    <>
      {/* Main harness line - thick neutral with slight transparency */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "#6b7280",
          strokeWidth,
          strokeLinecap: "round",
          opacity: 0.8,
          cursor: onToggleExpand ? "pointer" : "default",
        }}
      />

      {/* Highlight on selection */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          opacity={0.3}
        />
      )}

      {/* Interactive click area (wider than visible line) */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={strokeWidth + 20}
        onClick={handleClick}
        style={{ cursor: onToggleExpand ? "pointer" : "default" }}
      />

      {/* Label with wire count and color indicators */}
      <EdgeLabelRenderer>
        <div
          onClick={handleClick}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            cursor: onToggleExpand ? "pointer" : "default",
          }}
          className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800/95 rounded-full border border-neutral-600 shadow-lg hover:bg-neutral-700/95 transition-colors"
        >
          {/* Circuit color dots */}
          {uniqueColors.length > 0 && (
            <div className="flex -space-x-1">
              {uniqueColors.map((color, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-900"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* Wire count */}
          <span className="text-xs font-medium text-neutral-200">
            {wireCount} wire{wireCount !== 1 ? "s" : ""}
          </span>

          {/* Expand indicator */}
          {onToggleExpand && (
            <svg
              className="w-3 h-3 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const HarnessEdge = memo(HarnessEdgeComponent);
